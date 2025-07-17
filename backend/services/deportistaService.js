const db = require('../db');

exports.getAll = () => {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM deportista', (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

exports.getById = (id) => {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM deportista WHERE id = ?', [id], (err, results) => {
      if (err) return reject(err);
      resolve(results[0]);
    });
  });
};

exports.create = ({ nombre, apellido, fecha_nacimiento, localidad_id }) => {
  return new Promise((resolve, reject) => {
    db.query(
      'INSERT INTO deportista (nombre, apellido, fecha_nacimiento, localidad_id) VALUES (?, ?, ?, ?)',
      [nombre, apellido, fecha_nacimiento, localidad_id],
      (err, result) => {
        if (err) return reject(err);
        resolve({ id: result.insertId, nombre, apellido, fecha_nacimiento, localidad_id });
      }
    );
  });
};

exports.update = (id, { nombre, apellido, fecha_nacimiento, localidad_id }) => {
  return new Promise((resolve, reject) => {
    db.query(
      'UPDATE deportista SET nombre = ?, apellido = ?, fecha_nacimiento = ?, localidad_id = ? WHERE id = ?',
      [nombre, apellido, fecha_nacimiento, localidad_id, id],
      (err, result) => {
        if (err) return reject(err);
        resolve(result.affectedRows > 0);
      }
    );
  });
};

exports.delete = (id) => {
  return new Promise((resolve, reject) => {
    db.query('DELETE FROM deportista WHERE id = ?', [id], (err, result) => {
      if (err) return reject(err);
      resolve(result.affectedRows > 0);
    });
  });
};

//login 
exports.getByUsuario = (usuario) => {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM deportista WHERE usuario = ? LIMIT 1', [usuario], (err, results) => {
      if (err) return reject(err);
      resolve(results[0] || null);
    });
  });
};
