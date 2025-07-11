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

exports.create = ({ nombre, especialidad }) => {
  return new Promise((resolve, reject) => {
    db.query(
      'INSERT INTO entrenador (nombre, especialidad) VALUES (?, ?)',
      [nombre, especialidad],
      (err, result) => {
        if (err) return reject(err);
        resolve({ id: result.insertId, nombre, especialidad });
      }
    );
  });
};

exports.update = (id, { nombre, especialidad }) => {
  return new Promise((resolve, reject) => {
    db.query(
      'UPDATE entrenador SET nombre = ?, especialidad = ? WHERE id = ?',
      [nombre, especialidad, id],
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
