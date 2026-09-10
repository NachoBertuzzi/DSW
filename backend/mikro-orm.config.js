require('dotenv/config');
const { SqlHighlighter } = require('@mikro-orm/sql-highlighter');

module.exports = {
  entities: ['./entities/*.js'],
  type: 'mysql',
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'dsw',
  password: process.env.DB_PASSWORD || 'dsw123',
  dbName: process.env.DB_NAME || 'entrenamiento_db',
  driverOptions: process.env.DB_SSL_MODE === 'REQUIRED'
    ? { connection: { ssl: { rejectUnauthorized: false } } }
    : undefined,

  highlighter: new SqlHighlighter(),
  debug: true,
};