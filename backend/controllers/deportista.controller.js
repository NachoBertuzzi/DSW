const service = require('../services/deportistaService');

exports.getAll = async (req, res) => {
  try {
    const data = await service.getAll();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener deportistas' });
  }
};

exports.getById = async (req, res) => {
  const { id } = req.params;
  if (!id || typeof id !== 'string' || id.trim() === '') {
    return res.status(400).json({ mensaje: 'ID inválido o vacío' });
  }
  try {
    const data = await service.getById(id);
    if (!data) return res.status(404).json({ error: 'No encontrado' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener el deportista' });
  }
};

exports.create = async (req, res) => {
  const { dni, nombre, apellido, usuario, contraseña, altura, peso } = req.body;

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
  if (altura === undefined || altura === null || typeof altura !== 'number' || altura < 10 || altura > 250) {
    return res.status(400).json({ mensaje: 'Altura inválida (debe ser entre 10 y 250)' });
  }
  if (peso === undefined || peso === null || typeof peso !== 'number' || peso <= 0) {
    return res.status(400).json({ mensaje: 'Peso inválido' });
  }

  try {
    const nuevo = await service.create(req.body);
    res.status(201).json(nuevo);
  } catch (err) {
    res.status(500).json({ error: 'Error al crear el deportista' });
  }
};

exports.update = async (req, res) => {
  const { dni, nombre, apellido, usuario, contraseña, altura, peso } = req.body;

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
  if (altura === undefined || altura === null || typeof altura !== 'number' || altura < 10 || altura > 250) {
    return res.status(400).json({ mensaje: 'Altura inválida (debe ser entre 10 y 250)' });
  }
  if (peso === undefined || peso === null || typeof peso !== 'number' || peso <= 0) {
    return res.status(400).json({ mensaje: 'Peso inválido' });
  }

  try {
    const updated = await service.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'No encontrado' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar' });
  }
};

exports.delete = async (req, res) => {
  const { id } = req.params;
  if (!id || typeof id !== 'string' || id.trim() === '') {
    return res.status(400).json({ mensaje: 'ID inválido o vacío' });
  }
  try {
    const deleted = await service.delete(id);
    if (!deleted) return res.status(404).json({ error: 'No encontrado' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar' });
  }
}
