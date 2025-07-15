const localidadService = require('../services/localidadService');

function validarLocalidad(data) {
  const { nombre, provincia_id } = data;

  if (
    typeof nombre !== 'string' ||
    nombre.trim() === '' ||
    nombre.length > 100
  ) {
    return { ok: false, mensaje: 'Nombre de localidad inválido (vacío o muy largo)' };
  }

  if (
    typeof provincia_id !== 'number' ||
    !Number.isInteger(provincia_id)
  ) {
    return { ok: false, mensaje: 'ID de provincia inválido (debe ser un número entero)' };
  }

  return { ok: true };
}

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
    if (!localidad) {
      return res.status(404).json({ error: 'Localidad no encontrada' });
    }
    res.json(localidad);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener la localidad' });
  }
};

exports.create = async (req, res) => {
  const validacion = validarLocalidad(req.body);
  if (!validacion.ok) {
    return res.status(400).json({ error: validacion.mensaje });
  }

  try {
    const newLocalidad = await localidadService.create(req.body);
    res.status(201).json(newLocalidad);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear la localidad' });
  }
};

exports.update = async (req, res) => {
  const validacion = validarLocalidad(req.body);
  if (!validacion.ok) {
    return res.status(400).json({ error: validacion.mensaje });
  }

  try {
    const updated = await localidadService.update(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Localidad no encontrada' });
    }
    res.json({ mensaje: 'Localidad actualizada correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar la localidad' });
  }
};

exports.delete = async (req, res) => {
  try {
    const deleted = await localidadService.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Localidad no encontrada' });
    }
    res.json({ mensaje: 'Localidad eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar la localidad' });
  }
};
