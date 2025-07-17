const db = require('../db');

exports.getAll = () => {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM localidad', (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

exports.getById = (id) => {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM localidad WHERE id = ?', [id], (err, results) => {
      if (err) return reject(err);
      resolve(results[0]);
    });
  });
};

exports.getIdByName = (nombre) => {
  return new Promise((resolve, reject) => {
    db.query(
      'SELECT id FROM localidad WHERE nombre = ?',
      [nombre],
      (err, results) => {
        if (err) return reject(err);
        if (results.length === 0) return resolve(null);
        resolve(results[0].id);
      }
    );
  });
};


exports.create = ({ nombre, provincia_id }) => {
  return new Promise((resolve, reject) => {
    db.query(
      'INSERT INTO localidad (nombre, provincia_id) VALUES (?, ?)',
      [nombre, provincia_id],
      (err, result) => {
        if (err) return reject(err);
        resolve({ id: result.insertId, nombre, provincia_id });
      }
    );
  });
};

exports.update = (id, { nombre, provincia_id }) => {
  return new Promise((resolve, reject) => {
    db.query(
      'UPDATE localidad SET nombre = ?, provincia_id = ? WHERE id = ?',
      [nombre, provincia_id, id],
      (err, result) => {
        if (err) return reject(err);
        resolve(result.affectedRows > 0);
      }
    );
  });
};

exports.delete = (id) => {
  return new Promise((resolve, reject) => {
    db.query('DELETE FROM localidad WHERE id = ?', [id], (err, result) => {
      if (err) return reject(err);
      resolve(result.affectedRows > 0);
    });
  });
};
