const service = require('../services/entrenamientoService.js');

function sanitizeEntrenamientoInput(req, _res, next) {
  const {
    fechaEntrenamiento,
    horaEntrenamiento,
    deportista,   // <- puede venir como dni o { dni }
    entrenador,   // <- opcional en flujo “deportista”
  } = req.body;

  req.body.sanitizedInput = {
    fechaEntrenamiento,
    horaEntrenamiento,
    deportista,
    entrenador,
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
  const id = req.params.id;
  const item = await service.getById({ id });
  if (!item) return res.status(404).send({ message: 'Entrenamiento no encontrado' });
  res.json({ data: item });
}
async function add(req, res) {
  const created = await service.create(req.body.sanitizedInput);
  res.status(201).send({ message: 'Entrenamiento creado', data: created });
}
async function update(req, res) {
  const updated = await service.update(req.params.id, req.body.sanitizedInput);
  if (!updated) return res.status(404).send({ message: 'Entrenamiento no encontrado' });
  res.status(200).send({ message: 'Entrenamiento actualizado', data: updated });
}
async function remove(req, res) {
  const deleted = await service.remove({ id: req.params.id });
  if (!deleted) return res.status(404).send({ message: 'Entrenamiento no encontrado' });
  res.status(200).send({ message: 'Entrenamiento eliminado' });
}

module.exports = { sanitizeEntrenamientoInput, findAll, findOne, add, update, remove };