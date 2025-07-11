const db = require('../db');

function getAll(callback) {
    db.query('SELECT * FROM entrenadores', (err, results) => {
        if (err) return callback(err);
        callback(null, results);
    });
}

function getById(id, callback) {
    db.query('SELECT * FROM entrenadores WHERE id = ?', [id], (err, results) => {
        if (err) return callback(err);
        callback(null, results[0]);
    });
}

function create(data, callback) {
    const { nombre, especialidad } = data;
    db.query(
        'INSERT INTO entrenadores (nombre, especialidad) VALUES (?, ?)',
        [nombre, especialidad],
        (err, result) => {
            if (err) return callback(err);
            const nuevo = { id: result.insertId, nombre, especialidad };
            callback(null, nuevo);
        }
    );
}

function update(id, data, callback) {
    const { nombre, especialidad } = data;
    db.query(
        'UPDATE entrenadores SET nombre = ?, especialidad = ? WHERE id = ?',
        [nombre, especialidad, id],
        (err, result) => {
            if (err) return callback(err);
            if (result.affectedRows === 0) return callback(null, null);
            callback(null, { id, nombre, especialidad });
        }
    );
}

function remove(id, callback) {
    db.query('DELETE FROM entrenadores WHERE id = ?', [id], (err, result) => {
        if (err) return callback(err);
        callback(null, result.affectedRows > 0);
    });
}

module.exports = { getAll, getById, create, update, remove };
