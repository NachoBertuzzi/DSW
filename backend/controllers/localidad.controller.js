const service = require('../services/localidadService.js');

function sanitizeLocalidadInput(req, _res, next) {
  const { codPostal, nombre, provincia } = req.body;

  req.body.sanitizedInput = { codPostal, nombre, provincia };
  Object.keys(req.body.sanitizedInput).forEach((k) => {
    if (req.body.sanitizedInput[k] === undefined) delete req.body.sanitizedInput[k];
  });
  next();
}

async function findAll(_req, res) {
  res.json({ data: await service.getAll() });
}

async function findOne(req, res) {
  const codPostal = req.params.codPostal;
  const item = await service.getById({ codPostal });
  if (!item) return res.status(404).send({ message: 'Localidad no encontrada' });
  res.json({ data: item });
}

async function add(req, res) {
  const created = await service.create(req.body.sanitizedInput);
  res.status(201).send({ message: 'Localidad creada', data: created });
}

async function update(req, res) {
  const updated = await service.update(req.params.codPostal, req.body.sanitizedInput);
  if (!updated) return res.status(404).send({ message: 'Localidad no encontrada' });
  res.status(200).send({ message: 'Localidad actualizada', data: updated });
}

async function remove(req, res) {
  const deleted = await service.remove({ codPostal: req.params.codPostal });
  if (!deleted) return res.status(404).send({ message: 'Localidad no encontrada' });
  res.status(200).send({ message: 'Localidad eliminada' });
}

module.exports = { sanitizeLocalidadInput, findAll, findOne, add, update, remove };
