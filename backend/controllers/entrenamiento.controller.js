const service = require('../services/entrenamientoService');

function validarEntrenamiento(data) {
  const { fechaentrenamiento, horaentrenamiento, duracion, deportista_id } = data;

  // Validación de fecha
  if (!fechaentrenamiento || typeof fechaentrenamiento !== 'string') {
    return { ok: false, mensaje: 'Fecha de entrenamiento inválida (vacía o no string)' };
  }
  const fecha = new Date(fechaentrenamiento);
  if (isNaN(fecha.getTime())) {
    return { ok: false, mensaje: 'Fecha de entrenamiento no es una fecha válida' };
  }

  // Validación de duración
  if (duracion === undefined || typeof duracion !== 'number' || duracion <= 0) {
    return { ok: false, mensaje: 'Duración inválida (debe ser un número positivo)' };
  }

  // Validación de deportista
  if (deportista_id === undefined || typeof deportista_id !== 'number') {
    return { ok: false, mensaje: 'deportista_id es obligatorio y debe ser un número' };
  }

  // Validación opcional de hora
  if (horaentrenamiento !== undefined && horaentrenamiento !== null) {
    if (
      typeof horaentrenamiento !== 'string' ||
      !/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/.test(horaentrenamiento)
    ) {
      return { ok: false, mensaje: 'Hora de entrenamiento inválida (formato esperado HH:mm o HH:mm:ss)' };
    }
  }

  return { ok: true };
}

exports.getAll = async (req, res) => {
  try {
    const data = await service.getAll();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener entrenamientos' });
  }
};

exports.getById = async (req, res) => {
  try {
    const data = await service.getById(req.params.id);
    if (!data) return res.status(404).json({ error: 'Entrenamiento no encontrado' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener entrenamiento' });
  }
};

exports.create = async (req, res) => {
  const validacion = validarEntrenamiento(req.body);
  if (!validacion.ok) {
    return res.status(400).json({ error: validacion.mensaje });
  }

  try {
    console.log("Body recibido:", req.body);

       const datos = {
      fecha: req.body.fechaentrenamiento,
      duracion: req.body.duracion,
      entrenador_id: req.body.entrenador_id,
      deportista_id: req.body.deportista_id
    };
    console.log("Datos a guardar:", datos);

    const nuevo = await service.create(datos); 
    res.status(201).json(nuevo);
  } catch (err) {
    console.error("Error en create entrenamiento:", err);
    res.status(500).json({ error: 'Error al crear entrenamiento' });
  }
};

exports.update = async (req, res) => {
  const validacion = validarEntrenamiento(req.body);
  if (!validacion.ok) {
    return res.status(400).json({ error: validacion.mensaje });
  }

  try {
    const datos = {
      fecha: req.body.fechaentrenamiento,
      duracion: req.body.duracion,
      entrenador_id: req.body.entrenador_id,
      deportista_id: req.body.deportista_id
    };

    console.log("Datos para actualizar:", datos);

    const updated = await service.update(req.params.id, datos);
    if (!updated) return res.status(404).json({ error: 'Entrenamiento no encontrado' });
    res.json({ mensaje: 'Entrenamiento actualizado correctamente' });
  } catch (err) {
    console.error("Error en update entrenamiento:", err);
    res.status(500).json({ error: 'Error al actualizar entrenamiento' });
  }
};

exports.delete = async (req, res) => {
  try {
    const deleted = await service.delete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Entrenamiento no encontrado' });
    res.json({ mensaje: 'Entrenamiento eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar entrenamiento' });
  }
};