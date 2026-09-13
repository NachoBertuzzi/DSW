require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');

const isBcrypt = (value) => typeof value === 'string' && /^\$2[aby]\$/.test(value);

async function migrate() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'dsw',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'entrenamiento_db',
  });

  try {
    await connection.beginTransaction();
    const [entrenadores] = await connection.query(
      'SELECT dni, contrasena FROM entrenadores FOR UPDATE'
    );
    let migrated = 0;

    for (const entrenador of entrenadores) {
      if (isBcrypt(entrenador.contrasena)) continue;

      const hash = await bcrypt.hash(String(entrenador.contrasena), 10);
      await connection.execute(
        'UPDATE entrenadores SET contrasena = ? WHERE dni = ?',
        [hash, entrenador.dni]
      );
      migrated += 1;
    }

    await connection.commit();
    console.log(`Contraseñas migradas: ${migrated}`);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    await connection.end();
  }
}

migrate().catch((error) => {
  console.error('Migración fallida:', error.message);
  process.exitCode = 1;
});
