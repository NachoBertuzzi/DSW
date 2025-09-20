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

async function add(req, res) {
  const data = req.body.sanitizedInput;

  // Validación de formato del email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    return res.status(400).send({ mensaje: 'El email no tiene un formato válido.' });
  }

  // Validación para que no exista otro deportista con el mismo usuario
  const existingUser = await service.getByUsuario(data.usuario);
  if (existingUser) {
    return res.status(400).send({ mensaje: 'El usuario ya existe.' });
  }

  if (data.localidadCodPostal) {
    let localidadEntity = await localidadService.getById({ codPostal: data.localidadCodPostal.trim() });
    if (!localidadEntity) {
      // Se crea la localidad usando el código postal y asignándole el nombre y provincia recibidos
      localidadEntity = await localidadService.create({
        codPostal: data.localidadCodPostal.trim(),
        nombre: data.localidadNombre ? data.localidadNombre.trim() : '',
        provincia: data.localidadProvincia ? data.localidadProvincia.trim() : '',
      });
    }
    data.localidad = localidadEntity;
  }

  // Elimina los campos extra que solo se usaron para la localidad
  delete data.localidadCodPostal;
  delete data.localidadNombre;
  delete data.localidadProvincia;

  const created = await service.create(data);
  return res.status(201).send({ message: 'Deportista creado', data: created });
}

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
  const dni = req.params.dni;
  const deleted = await service.remove({ dni });
  if (!deleted) return res.status(404).send({ message: 'Deportista no encontrado' });
  res.status(200).send({ message: 'Deportista eliminado' });
}

async function login(req, res) {
  try {
    const { usuario, contrasena } = req.body;
    if (!usuario || !contrasena) return res.status(400).json({ mensaje: 'Faltan credenciales' });

    const deportista = await service.login(usuario, contrasena);
    if (!deportista) return res.status(401).json({ mensaje: 'Credenciales incorrectas' });

    return res.json({ deportista });
  } catch (e) {
    console.error('Login deportista:', e);
    return res.status(500).json({ mensaje: 'Error del servidor' });
  }
}

module.exports = { sanitizeDeportistaInput, findAll, findOne, add, update, remove, login };