const { SqlHighlighter } = require('@mikro-orm/sql-highlighter');

module.exports = {
  entities: ['./entities/*.js'], 
  dbName: 'entrenamiento_db',
  type: 'mysql',
  clientUrl: 'mysql://dsw:dsw123@127.0.0.1:3306/entrenamiento_db',

  highlighter: new SqlHighlighter(),
  debug: true,
};