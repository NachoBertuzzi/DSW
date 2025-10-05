const service = require('../services/deportistaService.js');
const localidadService = require('../services/localidadService.js');

function sanitizeDeportistaInput(req, _res, next) {
  const {
    dni,
    nombre,
    apellido,
    usuario,
    email,
    // Se usa siempre "contrasena" sin ñ
    contrasena,
    fecha_nacimiento,
    altura,
    peso,
    telefono,
    // Campos para localidad
    localidadCodPostal,
    localidadNombre,
    localidadProvincia,
  } = req.body;

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

  Object.keys(req.body.sanitizedInput).forEach((k) => {
    if (req.body.sanitizedInput[k] === undefined) delete req.body.sanitizedInput[k];
  });
  next();
}

// ...existing code...
async function add(req, res) {
  const data = req.body.sanitizedInput;

  // Validación de email y usuario duplicado ya realizadas...
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

  try {
    const created = await service.create(data);
    return res.status(201).send({ message: 'Deportista creado', data: created });
  } catch (error) {
    if (
      error.message &&
      error.message.includes('Duplicate entry') &&
      error.message.includes('deportistas.PRIMARY')
    ) {
      return res.status(400).send({ mensaje: 'El DNI ya existe.' });
    }
    console.error(error);
    return res.status(500).send({ mensaje: 'Error de conexión con el servidor' });
  }
}
// ...existing code...

async function findAll(_req, res) {
  const data = await service.getAll();
  res.json({ data });
}

async function findOne(req, res) {
  const dni = req.params.dni;
  const item = await service.getById({ dni });
  if (!item) return res.status(404).send({ message: 'Deportista no encontrado' });
  res.json({ data: item });
}

async function update(req, res) {
  const dni = req.params.dni;
  const updated = await service.update(dni, req.body.sanitizedInput);
  if (!updated) return res.status(404).send({ message: 'Deportista no encontrado' });
  return res.status(200).send({ message: 'Deportista actualizado', data: updated });
}

async function remove(req, res) {
  const { dni, contrasena } = req.body;

  if (!contrasena) return res.status(400).json({ mensaje: 'Se requiere contraseña' });

  const deportista = await service.getById({ dni });
  if (!deportista) return res.status(404).json({ mensaje: 'Deportista no encontrado' });

  const guardada = deportista.contrasena ?? deportista['contraseña'];
  if (String(contrasena) !== String(guardada))
    return res.status(401).json({ mensaje: 'Contraseña incorrecta' });

  await service.remove({ dni });
  return res.status(200).json({ mensaje: 'Cuenta eliminada correctamente' });
}


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

async function asignarEjercicio(req, res) {
  const { deportista, entrenador, fechaEntrenamiento, horaEntrenamiento, ejercicios } = req.body;
  
  if (!deportista || !ejercicios || ejercicios.length === 0) {
    return res.status(400).json({ mensaje: 'Faltan datos' });
  }

  try {
    // Tomamos al deportista
    const d = await service.getById({ dni: deportista });
    if (!d) return res.status(404).json({ mensaje: 'Deportista no encontrado' });

    // Guardamos los ejercicios asignados
    // Opción 1: reemplazar todos los ejercicios
    const actualizado = await service.update(deportista, { ejerciciosAsignados: ejercicios });

    // Opción 2: si querés mantener un historial, podés hacer push a un array en la base
    // await service.addEjercicios(deportista, ejercicios);

    return res.status(200).json({ mensaje: 'Ejercicios asignados', data: actualizado });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ mensaje: 'Error del servidor' });
  }
}


module.exports = { sanitizeDeportistaInput, findAll, findOne, add, update, remove, login, asignarEjercicio };