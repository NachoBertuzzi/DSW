const { localidades, getNextId } = require('../models/localidad.model');

function getAll() {
    return localidades;
}

function getById(id) {
    return localidades.find(l => l.id === id);
}

function create(data) {
    const nueva = {
        id: getNextId(),
        nombre: data.nombre,
        provincia: data.provincia
    };
    localidades.push(nueva);
    return nueva;
}

function update(id, data) {
    const index = localidades.findIndex(l => l.id === id);
    if (index !== -1) {
        localidades[index] = { ...localidades[index], ...data };
        return localidades[index];
    }
    return null;
}

function remove(id) {
    const index = localidades.findIndex(l => l.id === id);
    if (index !== -1) {
        localidades.splice(index, 1);
        return true;
    }
    return false;
}

module.exports = { getAll, getById, create, update, remove };
