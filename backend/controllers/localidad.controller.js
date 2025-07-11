const localidadService = require('../services/localidadService');

exports.getAll = async (req, res) => {
  try {
    const localidades = await localidadService.getAll();
    res.json(localidades);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las localidades' });
  }
};

exports.getById = async (req, res) => {
  try {
    const localidad = await localidadService.getById(req.params.id);
    if (localidad) {
      res.json(localidad);
    } else {
      res.status(404).json({ error: 'Localidad no encontrada' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener la localidad' });
  }
};

exports.create = async (req, res) => {
  try {
    const { nombre, provincia_id } = req.body;
    const newLocalidad = await localidadService.create({ nombre, provincia_id });
    res.status(201).json(newLocalidad);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear la localidad' });
  }
};

exports.update = async (req, res) => {
  try {
    const { nombre, provincia_id } = req.body;
    const updated = await localidadService.update(req.params.id, { nombre, provincia_id });
    if (updated) {
      res.json({ message: 'Localidad actualizada correctamente' });
    } else {
      res.status(404).json({ error: 'Localidad no encontrada' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar la localidad' });
  }
};

exports.delete = async (req, res) => {
  try {
    const deleted = await localidadService.delete(req.params.id);
    if (deleted) {
      res.json({ message: 'Localidad eliminada correctamente' });
    } else {
      res.status(404).json({ error: 'Localidad no encontrada' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar la localidad' });
  }
};