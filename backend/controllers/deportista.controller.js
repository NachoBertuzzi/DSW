const service = require('../services/deportistaService.js');


function sanitizeDeportistaInput(req, _res, next) {
  const {
    dni,
    nombre,
    apellido,
    usuario,
    email,
    contrasena, 
    altura,
    peso,
    telefono,
  } = req.body;

  req.body.sanitizedInput = {
    dni,
    nombre,
    apellido,
    usuario,
    email,
    contrasena,
    altura,
    peso,
    telefono,
  };

 
  Object.keys(req.body.sanitizedInput).forEach((k) => {
    if (req.body.sanitizedInput[k] === undefined) delete req.body.sanitizedInput[k];
  });

  next();
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

async function add(req, res) {
  
  const created = await service.create(req.body.sanitizedInput);
  return res.status(201).send({ message: 'Deportista creado', data: created });
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



// === LOGIN (nuevo) ===
async function login(req, res) {
  try {
    const { usuario, contraseña, contrasena } = req.body;
    const pass = contraseña ?? contrasena;

    if (!usuario || !pass) {
      return res.status(400).json({ mensaje: 'Faltan credenciales' });
    }

    const deportista = await service.login(usuario, pass);
    if (!deportista) {
      return res.status(401).json({ mensaje: 'Credenciales incorrectas' });
    }

    // devolvemos el objeto sin contraseña (el service ya la quita)
    return res.json({ deportista });
  } catch (e) {
    console.error('Login deportista:', e);
    return res.status(500).json({ mensaje: 'Error del servidor' });
  }
}


module.exports = { sanitizeDeportistaInput, findAll, findOne, add, update, remove, login };