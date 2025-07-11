const service = require('../services/entrenadorService');

function getAll(req, res) {
    service.getAll((err, data) => {
        if (err) return res.status(500).json({ mensaje: 'Error al obtener entrenadores' });
        res.json(data);
    });
}

function getById(req, res) {
    const id = parseInt(req.params.id);
    service.getById(id, (err, entrenador) => {
        if (err) return res.status(500).json({ mensaje: 'Error al obtener el entrenador' });
        if (entrenador) res.json(entrenador);
        else res.status(404).json({ mensaje: 'Entrenador no encontrado' });
    });
}

function create(req, res) {
    service.create(req.body, (err, nuevo) => {
        if (err) return res.status(500).json({ mensaje: 'Error al crear el entrenador' });
        res.status(201).json(nuevo);
    });
}

function update(req, res) {
    const id = parseInt(req.params.id);
    service.update(id, req.body, (err, actualizado) => {
        if (err) return res.status(500).json({ mensaje: 'Error al actualizar' });
        if (actualizado) res.json(actualizado);
        else res.status(404).json({ mensaje: 'Entrenador no encontrado' });
    });
}

function remove(req, res) {
    const id = parseInt(req.params.id);
    service.remove(id, (err, eliminado) => {
        if (err) return res.status(500).json({ mensaje: 'Error al eliminar' });
        if (eliminado) res.status(204).send();
        else res.status(404).json({ mensaje: 'Entrenador no encontrado' });
    });
}

module.exports = { getAll, getById, create, update, remove };
