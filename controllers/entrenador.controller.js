// controllers/entrenadorController.js
const service = require('../services/entrenadorService');

function getAll(req, res) {
    res.json(service.getAll());
}

function getById(req, res) {
    const id = parseInt(req.params.id);
    const entrenador = service.getById(id);
    if (entrenador) res.json(entrenador);
    else res.status(404).json({ mensaje: "Entrenador no encontrado" });
}

function create(req, res) {
    const nuevo = service.create(req.body);
    res.status(201).json(nuevo);
}

function update(req, res) {
    const id = parseInt(req.params.id);
    const updated = service.update(id, req.body);
    if (updated) res.json(updated);
    else res.status(404).json({ mensaje: "Entrenador no encontrado" });
}

function remove(req, res) {
    const id = parseInt(req.params.id);
    const ok = service.remove(id);
    if (ok) res.status(204).send();
    else res.status(404).json({ mensaje: "Entrenador no encontrado" });
}

module.exports = { getAll, getById, create, update, remove };
// Este controlador maneja las operaciones CRUD para los entrenadores.