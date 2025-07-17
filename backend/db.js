const mysql = require('mysql2');


const connection = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',          // ← tu usuario de MySQL
  password: 'zzxxccvv',          // ← tu contraseña, si tenés una
  database: 'entrenamiento_db',
  port: 3306,
});

connection.connect((err) => {
  if (err) {
    console.error('❌ Error al conectar a la base de datos:', err);
    return;
  }
  console.log('✅ Conectado a la base de datos MySQL.');
});

module.exports = connection;
