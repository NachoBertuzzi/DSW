const model = require('../models/entrenamiento.model');

exports.getAll = (req, res) => res.json(model.getAll());

exports.getById = (req, res) => {
  const found = model.getById(parseInt(req.params.id));
  if (found) res.json(found);
  else res.status(404).json({ mensaje: 'Entrenamiento no encontrado' });
};

exports.create = (req, res) => {
  const nuevo = model.create(req.body);
  res.status(201).json(nuevo);
};

exports.update = (req, res) => {
  const actualizado = model.update(parseInt(req.params.id), req.body);
  if (actualizado) res.json(actualizado);
  else res.status(404).json({ mensaje: 'Entrenamiento no encontrado' });
};

exports.delete = (req, res) => {
  const eliminado = model.delete(parseInt(req.params.id));
  if (eliminado) res.status(204).send();
  else res.status(404).json({ mensaje: 'Entrenamiento no encontrado' });
};
// Este controlador maneja las operaciones CRUD para los entrenamientos.