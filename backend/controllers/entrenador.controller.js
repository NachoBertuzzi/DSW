const service = require('../services/entrenadorService.js');

function sanitizeEntrenadorInput(req, _res, next) {
  const {
    dni, nombre, apellido, usuario,
    contrasena, especialidad, mail, tel,
  } = req.body;

  req.body.sanitizedInput = {
    dni, nombre, apellido, usuario,
    contrasena, especialidad, mail, tel,
  };

  Object.keys(req.body.sanitizedInput).forEach((k) => {
    if (req.body.sanitizedInput[k] === undefined) delete req.body.sanitizedInput[k];
  });

  next();
}

async function findAll(_req, res) {
  res.json({ data: await service.getAll() });
}

async function findOne(req, res) {
  const dni = req.params.dni;
  const item = await service.getById({ dni });
  if (!item) return res.status(404).send({ message: 'Entrenador no encontrado' });
  res.json({ data: item });
}

async function add(req, res) {
  const created = await service.create(req.body.sanitizedInput);
  res.status(201).send({ message: 'Entrenador creado', data: created });
}

async function update(req, res) {
  const updated = await service.update(req.params.dni, req.body.sanitizedInput);
  if (!updated) return res.status(404).send({ message: 'Entrenador no encontrado' });
  res.status(200).send({ message: 'Entrenador actualizado', data: updated });
}

async function remove(req, res) {
  const deleted = await service.remove({ dni: req.params.dni });
  if (!deleted) return res.status(404).send({ message: 'Entrenador no encontrado' });
  res.status(200).send({ message: 'Entrenador eliminado' });
}

// === LOGIN (nuevo) ===
async function login(req, res) {
  try {
    const {
      usuario,
      email,   // por si te llega como email
      mail,    // por si te llega como mail
      contraseña,
      contrasena,
    } = req.body;

    const userOrEmail = usuario ?? email ?? mail;
    const pass = contraseña ?? contrasena;

    if (!userOrEmail || !pass) {
      return res.status(400).json({ mensaje: 'Faltan credenciales' });
    }

    const entrenador = await service.login(userOrEmail, pass);
    if (!entrenador) {
      return res.status(401).json({ mensaje: 'Credenciales incorrectas' });
    }

    return res.json({ entrenador });
  } catch (e) {
    console.error('Login entrenador:', e);
    return res.status(500).json({ mensaje: 'Error del servidor' });
  }
}


module.exports = { sanitizeEntrenadorInput, findAll, findOne, add, update, remove , login };
