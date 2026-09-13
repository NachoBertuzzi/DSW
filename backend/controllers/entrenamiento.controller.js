const service = require('../services/entrenamientoService.js');

function sanitizeEntrenamientoInput(req, _res, next) {
  const {
    fechaEntrenamiento,
    horaEntrenamiento,
    ejercicios,
    duracionSegundos,
    estado,
    deportista,   
    entrenador,  
  } = req.body;

  req.body.sanitizedInput = {
    fechaEntrenamiento,
    horaEntrenamiento,
    ejercicios,
    duracionSegundos,
    estado,
    deportista,
    entrenador,
  };

  Object.keys(req.body.sanitizedInput).forEach((k) => {
    if (req.body.sanitizedInput[k] === undefined) delete req.body.sanitizedInput[k];
  });

  next();
}

async function findAll(req, res) {
  res.json({ data: await service.getAll(req.user) });
}
async function findOne(req, res) {
  const id = req.params.id;
  const item = await service.getById({ id });
  if (!item) return res.status(404).send({ message: 'Entrenamiento no encontrado' });
  if (!(await service.canAccess(item, req.user))) {
    return res.status(403).send({ message: 'No tenés permisos sobre este entrenamiento' });
  }
  res.json({ data: item });
}
async function add(req, res) {
  const input = await service.prepareCreate(req.body.sanitizedInput, req.user);
  if (!input) {
    return res.status(403).send({ message: 'No tenés permisos para crear este entrenamiento' });
  }

  const created = await service.create(input);
  res.status(201).send({ message: 'Entrenamiento creado', data: created });
}
async function update(req, res) {
  const entrenamiento = await service.getById({ id: req.params.id });
  if (!entrenamiento) return res.status(404).send({ message: 'Entrenamiento no encontrado' });

  if (!(await service.canAccess(entrenamiento, req.user))) {
    return res.status(403).send({ message: 'No tenés permisos sobre este entrenamiento' });
  }

  const input = { ...req.body.sanitizedInput };
  delete input.deportista;
  delete input.entrenador;

  const updated = await service.update(req.params.id, input);
  res.status(200).send({ message: 'Entrenamiento actualizado', data: updated });
}
async function remove(req, res) {
  const entrenamiento = await service.getById({ id: req.params.id });
  if (!entrenamiento) return res.status(404).send({ message: 'Entrenamiento no encontrado' });
  if (!(await service.canAccess(entrenamiento, req.user))) {
    return res.status(403).send({ message: 'No tenés permisos sobre este entrenamiento' });
  }

  await service.remove({ id: req.params.id });
  res.status(200).send({ message: 'Entrenamiento eliminado' });
}

module.exports = { sanitizeEntrenamientoInput, findAll, findOne, add, update, remove };