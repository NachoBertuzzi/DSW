const connection = require('../config/db'); // Asegurate de tener la conexión hecha

const verificarCredenciales = async (usuario, contraseña) => {
  const [rows] = await connection.query(
    'SELECT * FROM usuarios WHERE usuario = ? AND contraseña = ?',
    [usuario, contraseña]
  );
  return rows[0]; // Si no hay resultado, devuelve undefined
};

module.exports = { verificarCredenciales };
