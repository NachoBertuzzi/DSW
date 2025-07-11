const db = require('../db');

exports.getAll = () => {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM entrenador', (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

exports.getById = (id) => {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM entrenador WHERE id = ?', [id], (err, results) => {
      if (err) return reject(err);
      resolve(results[0]);
    });
  });
};

exports.create = ({ nombre, apellido, email, telefono, especialidad }) => {
  return new Promise((resolve, reject) => {
    db.query(
      'INSERT INTO entrenador (nombre, apellido, email, telefono, especialidad) VALUES (?, ?, ?, ?, ?)',
      [nombre, apellido, email, telefono, especialidad],
      (err, result) => {
        if (err) return reject(err);
        resolve({ id: result.insertId, nombre, apellido, email, telefono, especialidad });
      }
    );
  });
};

exports.update = (id, { nombre, apellido, email, telefono, especialidad }) => {
  return new Promise((resolve, reject) => {
    db.query(
      'UPDATE entrenador SET nombre = ?, apellido = ?, email = ?, telefono = ?, especialidad = ? WHERE id = ?',
      [nombre, apellido, email, telefono, especialidad, id],
      (err, result) => {
        if (err) return reject(err);
        resolve(result.affectedRows > 0);
      }
    );
  });
};

exports.delete = (id) => {
  return new Promise((resolve, reject) => {
    db.query('DELETE FROM entrenador WHERE id = ?', [id], (err, result) => {
      if (err) return reject(err);
      resolve(result.affectedRows > 0);
    });
  });
};
