const service = require('../services/entrenadorService');

exports.getAll = async (req, res) => {
  const entrenadores = await service.getAll();
  if (!entrenadores) {
    return res.status(500).json({ error: 'Error al obtener entrenadores' });
  }
  res.json(entrenadores);
};

exports.getById = async (req, res) => {
  const { id } = req.params;
  if (!id || typeof id !== 'string' || id.trim() === '') {
    return res.status(400).json({ mensaje: 'ID inválido o vacío' });
  }
  const entrenador = await service.getById(id);
  if (!entrenador) {
    return res.status(404).json({ error: 'Entrenador no encontrado' });
  }
  res.json(entrenador);
};

exports.create = async (req, res) => {
  const { dni, nombre, apellido, usuario, contraseña } = req.body;

  if (dni === undefined || dni === null || typeof dni !== 'number') {
    return res.status(400).json({ mensaje: 'DNI inválido' });
  }
  if (!nombre || typeof nombre !== 'string' || nombre.trim() === '' || nombre.length > 50) {
    return res.status(400).json({ mensaje: 'Nombre inválido' });
  }
  if (!apellido || typeof apellido !== 'string' || apellido.trim() === '' || apellido.length > 50) {
    return res.status(400).json({ mensaje: 'Apellido inválido' });
  }
  if (!usuario || typeof usuario !== 'string' || usuario.trim() === '' || usuario.length > 20) {
    return res.status(400).json({ mensaje: 'Usuario inválido' });
  }
  if (!contraseña || typeof contraseña !== 'string' || contraseña.length < 8) {
    return res.status(400).json({ mensaje: 'Contraseña inválida (mínimo 8 caracteres)' });
  }

  const nuevo = await service.create(req.body);
  if (!nuevo) {
    return res.status(500).json({ error: 'Error al crear entrenador' });
  }
  res.status(201).json(nuevo);
};

exports.update = async (req, res) => {
  const { dni, nombre, apellido, usuario, contraseña } = req.body;

  if (dni === undefined || dni === null || typeof dni !== 'number') {
    return res.status(400).json({ mensaje: 'DNI inválido' });
  }
  if (!nombre || typeof nombre !== 'string' || nombre.trim() === '' || nombre.length > 50) {
    return res.status(400).json({ mensaje: 'Nombre inválido' });
  }
  if (!apellido || typeof apellido !== 'string' || apellido.trim() === '' || apellido.length > 50) {
    return res.status(400).json({ mensaje: 'Apellido inválido' });
  }
  if (!usuario || typeof usuario !== 'string' || usuario.trim() === '' || usuario.length > 20) {
    return res.status(400).json({ mensaje: 'Usuario inválido' });
  }
  if (!contraseña || typeof contraseña !== 'string' || contraseña.length < 8) {
    return res.status(400).json({ mensaje: 'Contraseña inválida (mínimo 8 caracteres)' });
  }

  const actualizado = await service.update(req.params.id, req.body);
  if (!actualizado) {
    return res.status(404).json({ error: 'Entrenador no encontrado' });
  }
  res.json({ mensaje: 'Entrenador actualizado correctamente' });
};

exports.delete = async (req, res) => {
  const { id } = req.params;
  if (!id || typeof id !== 'string' || id.trim() === '') {
    return res.status(400).json({ mensaje: 'ID inválido o vacío' });
  }
  const eliminado = await service.remove(id);
  if (!eliminado) {
    return res.status(404).json({ error: 'Entrenador no encontrado' });
  }
  res.json({ mensaje: 'Entrenador eliminado correctamente' });
};