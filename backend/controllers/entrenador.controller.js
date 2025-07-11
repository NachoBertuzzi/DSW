const service = require('../services/entrenadorService');

exports.getAll = async (req, res) => {
  try {
    const entrenadores = await service.getAll();
    res.json(entrenadores);
  } catch (err) {
    console.error('Error al obtener entrenadores:', err);
    res.status(500).json({ error: 'Error al obtener entrenadores' });
  }
};

exports.getById = async (req, res) => {
  try {
    const entrenador = await service.getById(req.params.id);
    if (entrenador) {
      res.json(entrenador);
    } else {
      res.status(404).json({ error: 'Entrenador no encontrado' });
    }
  } catch (err) {
    console.error('Error al obtener entrenador por ID:', err);
    res.status(500).json({ error: 'Error al obtener entrenador' });
  }
};

exports.create = async (req, res) => {
  try {
    const nuevo = await service.create(req.body);
    res.status(201).json(nuevo);
  } catch (err) {
    console.error('Error al crear entrenador:', err);
    res.status(500).json({ error: 'Error al crear entrenador' });
  }
};

exports.update = async (req, res) => {
  try {
    const actualizado = await service.update(req.params.id, req.body);
    if (actualizado) {
      res.json({ mensaje: 'Entrenador actualizado correctamente' });
    } else {
      res.status(404).json({ error: 'Entrenador no encontrado' });
    }
  } catch (err) {
    console.error('Error al actualizar entrenador:', err);
    res.status(500).json({ error: 'Error al actualizar entrenador' });
  }
};

exports.delete = async (req, res) => {
  try {
    const eliminado = await service.remove(req.params.id);
    if (eliminado) {
      res.json({ mensaje: 'Entrenador eliminado correctamente' });
    } else {
      res.status(404).json({ error: 'Entrenador no encontrado' });
    }
  } catch (err) {
    console.error('Error al eliminar entrenador:', err);
    res.status(500).json({ error: 'Error al eliminar entrenador' });
  }
};
