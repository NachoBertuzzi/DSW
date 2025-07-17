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

// cambios recientes


exports.create = ({
  dni,
  nombre,
  apellido,
  usuario,
  email,
  contraseña,
  fecha_nacimiento,
  altura,
  peso,
  localidad_id,
}) => {
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO deportista 
      (dni, nombre, apellido, usuario, email, contraseña, fecha_nacimiento, altura, peso, localidad_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
      sql,
      [dni, nombre, apellido, usuario, email, contraseña, fecha_nacimiento, altura, peso, localidad_id],
      (err, result) => {
        if (err) return reject(err);
        resolve({
          id: result.insertId,
          dni,
          nombre,
          apellido,
          usuario,
          email,
          fecha_nacimiento,
          altura,
          peso,
          localidad_id,
        });
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
