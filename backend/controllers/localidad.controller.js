const service = require('../services/localidad.service');

exports.getAll = (req, res) => {
    res.json(service.getAll());
};

exports.getById = (req, res) => {
    const id = parseInt(req.params.id);
    const localidad = service.getById(id);
    if (localidad) res.json(localidad);
    else res.status(404).json({ mensaje: 'Localidad no encontrada' });
};

exports.create = (req, res) => {
    const nueva = service.create(req.body);
    res.status(201).json(nueva);
};

exports.update = (req, res) => {
    const id = parseInt(req.params.id);
    const actualizada = service.update(id, req.body);
    if (actualizada) res.json(actualizada);
    else res.status(404).json({ mensaje: 'Localidad no encontrada' });
};

exports.delete = (req, res) => {
    const id = parseInt(req.params.id);
    const eliminada = service.remove(id);
    if (eliminada) res.status(204).send();
    else res.status(404).json({ mensaje: 'Localidad no encontrada' });
};
