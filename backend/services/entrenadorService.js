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

exports.create = ({ dni, nombre, apellido, usuario, contraseña, especialidad, email }) => {
  return new Promise((resolve, reject) => {
    db.query(
      'INSERT INTO entrenador (dni, nombre, apellido, usuario, contraseña, especialidad, email) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [dni, nombre, apellido, usuario, contraseña, especialidad, email],
      (err, result) => {
        if (err) return reject(err);
        resolve({ id: result.insertId, dni, nombre, apellido, usuario, especialidad, email });
      }
    );
  });
};


  exports.update = (id, { dni, nombre, apellido, usuario, contraseña, especialidad, email, telefono }) => {
    return new Promise((resolve, reject) => {
      db.query(
        'UPDATE entrenador SET dni = ?, nombre = ?, apellido = ?, usuario = ?, contraseña = ?, especialidad = ?, email = ?, telefono = ? WHERE id = ?',
        [dni, nombre, apellido, usuario, contraseña, especialidad, email, telefono, id],
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

  //login 
  exports.getByUsuario = (usuario) => {
    return new Promise((resolve, reject) => {
      db.query('SELECT * FROM entrenador WHERE usuario = ? LIMIT 1', [usuario], (err, results) => {
        if (err) return reject(err);
        resolve(results[0] || null);
      });
    });
  };