// entrenador.controller.js
const service = require('../services/entrenadorService');

exports.getAll = async (req, res) => {
  try {
    const entrenadores = await service.getAll();
    res.json(entrenadores);
  } catch (err) {
    console.error('Error al obtener entrenadores:', err);
    res.status(500).json({ error: 'Error interno al obtener entrenadores' });
  }
};

exports.getById = async (req, res) => {
  const { id } = req.params;
  if (!id || typeof id !== 'string' || id.trim() === '') {
    return res.status(400).json({ mensaje: 'ID inválido o vacío' });
  }
  try {
    const entrenador = await service.getById(id);
    if (!entrenador) {
      return res.status(404).json({ error: 'Entrenador no encontrado' });
    }
    res.json(entrenador);
  } catch (err) {
    console.error('Error al obtener entrenador:', err);
    res.status(500).json({ error: 'Error interno al obtener entrenador' });
  }
};

exports.create = async (req, res) => {
  const { dni, nombre, apellido, usuario, contraseña, especialidad } = req.body;

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
  if (!especialidad || typeof especialidad !== 'string' || especialidad.trim() === '' || especialidad.length > 100) {
    return res.status(400).json({ mensaje: 'Especialidad inválida' });
  }

  try {
    const nuevo = await service.create(req.body);
    res.status(201).json(nuevo);
  } catch (err) {
    console.error('Error al crear entrenador:', err);
    res.status(500).json({ error: 'Error al crear entrenador' });
  }
};

exports.update = async (req, res) => {
  const { dni, nombre, apellido, usuario, contraseña, especialidad } = req.body;

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
  if (!especialidad || typeof especialidad !== 'string' || especialidad.trim() === '' || especialidad.length > 100) {
    return res.status(400).json({ mensaje: 'Especialidad inválida' });
  }

  try {
    const actualizado = await service.update(req.params.id, req.body);
    if (!actualizado) {
      return res.status(404).json({ error: 'Entrenador no encontrado' });
    }
    res.json({ mensaje: 'Entrenador actualizado correctamente' });
  } catch (err) {
    console.error('Error al actualizar entrenador:', err);
    res.status(500).json({ error: 'Error al actualizar entrenador' });
  }
};

exports.delete = async (req, res) => {
  const { id } = req.params;
  if (!id || typeof id !== 'string' || id.trim() === '') {
    return res.status(400).json({ mensaje: 'ID inválido o vacío' });
  }
  try {
    const eliminado = await service.delete(id);
    if (!eliminado) {
      return res.status(404).json({ error: 'Entrenador no encontrado' });
    }
    res.json({ mensaje: 'Entrenador eliminado correctamente' });
  } catch (err) {
    console.error('Error al eliminar entrenador:', err);
    res.status(500).json({ error: 'Error al eliminar entrenador' });
  }
};
