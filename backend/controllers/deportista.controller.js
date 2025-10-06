// controllers/deportistaController.js
const service = require('../services/deportistaService.js');
const localidadService = require('../services/localidadService.js');

/**
 * Normaliza y filtra la entrada del body.
 * Acordate: usamos "contrasena" sin ñ para evitar problemas de encoding.
 */
function sanitizeDeportistaInput(req, _res, next) {
  const {
    dni,
    nombre,
    apellido,
    usuario,
    email,
    contrasena, // <- siempre sin ñ
    fecha_nacimiento,
    altura,
    peso,
    telefono,
    // Campos de localidad opcionales
    localidadCodPostal,
    localidadNombre,
    localidadProvincia,
  } = req.body || {};

  req.body.sanitizedInput = {
    dni,
    nombre,
    apellido,
    usuario,
    email,
    contrasena,
    fecha_nacimiento,
    altura,
    peso,
    telefono,
    localidadCodPostal,
    localidadNombre,
    localidadProvincia,
  };

  // Remueve los undefined
  Object.keys(req.body.sanitizedInput).forEach((k) => {
    if (req.body.sanitizedInput[k] === undefined) delete req.body.sanitizedInput[k];
  });

  next();
}

/**
 * POST /deportistas
 * Crea deportista y, si corresponde, crea/relaciona localidad.
 */
async function add(req, res) {
  const data = req.body.sanitizedInput || {};

  try {
    if (data.localidadCodPostal) {
      let localidadEntity = await localidadService.getById({ codPostal: data.localidadCodPostal.trim() });
      if (!localidadEntity) {
        localidadEntity = await localidadService.create({
          codPostal: data.localidadCodPostal.trim(),
          nombre: data.localidadNombre ? data.localidadNombre.trim() : '',
          provincia: data.localidadProvincia ? data.localidadProvincia.trim() : '',
        });
      }
      data.localidad = localidadEntity;
    }

    delete data.localidadCodPostal;
    delete data.localidadNombre;
    delete data.localidadProvincia;

    const created = await service.create(data);
    return res.status(201).send({ message: 'Deportista creado', data: created });
  } catch (error) {
    // MySQL duplicate PK (dni)
    if (
      error?.message?.includes('Duplicate entry') &&
      error?.message?.includes('deportistas.PRIMARY')
    ) {
      return res.status(400).send({ mensaje: 'El DNI ya existe.' });
    }
    console.error('[deportista.add] ', error);
    return res.status(500).send({ mensaje: 'Error de conexión con el servidor' });
  }
}

/**
 * GET /deportistas
 */
async function findAll(_req, res) {
  const data = await service.getAll();
  res.json({ data });
}

/**
 * GET /deportistas/:dni
 */
async function findOne(req, res) {
  const dni = req.params.dni;
  const item = await service.getById({ dni });
  if (!item) return res.status(404).send({ message: 'Deportista no encontrado' });
  res.json({ data: item });
}

/**
 * PUT /deportistas/:dni
 */
async function update(req, res) {
  const dni = req.params.dni;
  const updated = await service.update(dni, req.body.sanitizedInput);
  if (!updated) return res.status(404).send({ message: 'Deportista no encontrado' });
  return res.status(200).send({ message: 'Deportista actualizado', data: updated });
}

/**
 * DELETE /deportistas  (seguro)  ó  /deportistas/:dni (compat)
 * - Modo seguro: requiere { dni, contrasena } en body.
 * - Compat: si viene :dni por params y NO hay contrasena -> 400 (forzamos seguridad).
 */
async function remove(req, res) {
  // Compatibilidad: permitimos dni por body o por params
  const dni = req.body?.dni ?? req.params?.dni;
  const { contrasena } = req.body || {};

  if (!dni) return res.status(400).json({ mensaje: 'Falta DNI' });

  // Exigimos contraseña (modo seguro). Si querés permitir sin contraseña, sacá este check.
  if (!contrasena) {
    return res.status(400).json({ mensaje: 'Se requiere contraseña' });
  }

  const deportista = await service.getById({ dni });
  if (!deportista) return res.status(404).json({ mensaje: 'Deportista no encontrado' });

  // Soporta ambos nombres por si en DB se guardó "contraseña"
  const guardada = deportista.contrasena ?? deportista['contraseña'];
  if (String(contrasena) !== String(guardada)) {
    return res.status(401).json({ mensaje: 'Contraseña incorrecta' });
  }

  await service.remove({ dni });
  return res.status(200).json({ mensaje: 'Cuenta eliminada correctamente' });
}

/**
 * POST /deportistas/login
 * Acepta { usuario | email | mail, contrasena | contraseña | password }
 */
async function login(req, res) {
  try {
    const { usuario, email, mail, contrasena, contraseña, password } = req.body || {};
    const userOrEmail = usuario ?? email ?? mail;
    const pass = contrasena ?? contraseña ?? password;

    if (!userOrEmail || !pass) {
      return res.status(400).json({ mensaje: 'Faltan credenciales' });
    }

    const deportista = await service.login(userOrEmail, pass);
    if (!deportista) {
      return res.status(401).json({ mensaje: 'Credenciales incorrectas' });
    }

    return res.json({ deportista });
  } catch (e) {
    console.error('Login deportista:', e);
    return res.status(500).json({ mensaje: 'Error del servidor' });
  }
}

/**
 * POST /deportistas/asignar-ejercicio
 * Body esperado:
 * {
 *   "deportista": "<dni>",
 *   "entrenador": "<dni/usuario> (opcional, por ahora no se usa acá)",
 *   "fechaEntrenamiento": "YYYY-MM-DD" (opcional),
 *   "horaEntrenamiento": "HH:mm" (opcional),
 *   "ejercicios": [ ... ] // requerido, no vacío
 * }
 *
 * Implementación simple: reemplaza los ejercicios actuales por los enviados.
 * Si querés historial, implementá en el service un addEjercicios() y reemplazá la línea marcada.
 */
async function asignarEjercicio(req, res) {
  const { deportista, entrenador, fechaEntrenamiento, horaEntrenamiento, ejercicios } = req.body || {};

  if (!deportista || !Array.isArray(ejercicios) || ejercicios.length === 0) {
    return res.status(400).json({ mensaje: 'Faltan datos' });
  }

  try {
    const d = await service.getById({ dni: deportista });
    if (!d) return res.status(404).json({ mensaje: 'Deportista no encontrado' });

    // Opción 1: reemplazar
    const payload = {
      ejerciciosAsignados: ejercicios,
      fechaUltimaAsignacion: fechaEntrenamiento ?? new Date(),
      horaUltimaAsignacion: horaEntrenamiento ?? null,
      ultimoEntrenadorAsignador: entrenador ?? null,
    };

    const actualizado = await service.update(deportista, payload);

    // Opción 2 (historial): si implementás en el service:
    // const actualizado = await service.addEjercicios(deportista, { ejercicios, fechaEntrenamiento, horaEntrenamiento, entrenador });

    return res.status(200).json({ mensaje: 'Ejercicios asignados', data: actualizado });
  } catch (err) {
    console.error('[deportista.asignarEjercicio] ', err);
    return res.status(500).json({ mensaje: 'Error del servidor' });
  }
}

module.exports = {
  sanitizeDeportistaInput,
  findAll,
  findOne,
  add,
  update,
  remove,
  login,
  asignarEjercicio,
};
