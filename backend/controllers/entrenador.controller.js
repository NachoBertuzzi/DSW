const service = require('../services/entrenadorService.js');

function sanitizeEntrenadorInput(req, _res, next) {
  const {
    dni,
    nombre,
    apellido,
    usuario,
    contrasena,
    especialidad,
    mail,     
    email,    
    tel,
  } = req.body;

  const normalizedEmail = email ?? mail;

  req.body.sanitizedInput = {
    dni,
    nombre,
    apellido,
    usuario,
    contrasena,
    especialidad,
    email: normalizedEmail, 
    tel,
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
  try {
    const { dni } = req.params;
    const { contrasena } = req.body;

    if (!contrasena) {
      return res.status(400).json({ mensaje: 'Se requiere la contraseña para eliminar la cuenta' });
    }

    const entrenador = await service.getById({ dni });
    if (!entrenador) {
      return res.status(404).json({ mensaje: 'Entrenador no encontrado' });
    }

    const guardada = entrenador.contrasena ?? entrenador['contraseña'];
    if (String(contrasena) !== String(guardada)) {
      return res.status(401).json({ mensaje: 'Contraseña incorrecta' });
    }

    await service.remove({ dni });
    return res.status(200).json({ mensaje: 'Cuenta eliminada correctamente' });
  } catch (err) {
    console.error('Error al eliminar cuenta:', err);
    return res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
}



async function login(req, res) {
  try {
    const {
      usuario,
      email,   
      mail,    
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

module.exports = { sanitizeEntrenadorInput, findAll, findOne, add, update, remove, login };
