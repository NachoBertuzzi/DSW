// services/entrenadorService.js
const { entrenadores, getNextId } = require('../models/entrenador.model');

function getAll() {
    return entrenadores;
}

function getById(id) {
    return entrenadores.find(e => e.id === id);
}

function create(data) {
    const nuevo = { id: getNextId(), ...data };
    entrenadores.push(nuevo);
    return nuevo;
}

function update(id, data) {
    const index = entrenadores.findIndex(e => e.id === id);
    if (index !== -1) {
        entrenadores[index] = { ...entrenadores[index], ...data };
        return entrenadores[index];
    }
    return null;
}

function remove(id) {
    const index = entrenadores.findIndex(e => e.id === id);
    if (index !== -1) {
        entrenadores.splice(index, 1);
        return true;
    }
    return false;
}

module.exports = { getAll, getById, create, update, remove };
// Este servicio maneja las operaciones CRUD para los entrenadores, interactuando con el modelo de datos de entrenadores.