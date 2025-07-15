const db = require('../db');

exports.getAll = () => {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM entrenamiento', (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

exports.getById = (id) => {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM entrenamiento WHERE id = ?', [id], (err, results) => {
      if (err) return reject(err);
      resolve(results[0]);
    });
  });
};

exports.create = ({ fecha, duracion, deportista_id, entrenador_id }) => {
  const fechaDate = new Date(fecha); // 👈 convierte el string a tipo Date
  return new Promise((resolve, reject) => {
   
   console.log("VALORES PARA INSERT:", fecha, duracion, deportista_id, entrenador_id);
   db.query(
      'INSERT INTO entrenamiento (fecha, duracion, deportista_id, entrenador_id) VALUES (?, ?, ?, ?)',
      [fechaDate, duracion, deportista_id, entrenador_id],
      (err, result) => {
        if (err) return reject(err);
        resolve({ id: result.insertId, fecha, duracion, deportista_id, entrenador_id });
      }
    );
  });
};


exports.update = (id, { fecha, duracion, deportista_id, entrenador_id }) => {
  return new Promise((resolve, reject) => {
    db.query(
      'UPDATE entrenamiento SET fecha = ?, duracion = ?, deportista_id = ?, entrenador_id = ? WHERE id = ?',
      [fecha, duracion, deportista_id, entrenador_id, id],
      (err, result) => {
        if (err) return reject(err);
        resolve(result.affectedRows > 0);
      }
    );
  });
};

exports.delete = (id) => {
  return new Promise((resolve, reject) => {
    db.query('DELETE FROM entrenamiento WHERE id = ?', [id], (err, result) => {
      if (err) return reject(err);
      resolve(result.affectedRows > 0);
    });
  });
};
