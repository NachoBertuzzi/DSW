const connection = require('../config/db'); 

const verificarCredenciales = async (usuario, contraseña) => {
  const [rows] = await connection.query(
    'SELECT * FROM usuarios WHERE usuario = ? AND contraseña = ?',
    [usuario, contraseña]
  );
  return rows[0]; 
};

module.exports = { verificarCredenciales };
