
require('dotenv').config();
require('reflect-metadata'); 
const express = require('express');
const cors = require('cors');
const { RequestContext } = require('@mikro-orm/core');

const app = express();
const PORT = process.env.PORT || 3000;
let initialized = false;
let initialization;

const allowedOrigins = [
  'http://localhost:3001',
  'http://127.0.0.1:3001',
  'https://dsw-rho.vercel.app',
  ...(process.env.FRONTEND_URL || '')
    .split(',')
    .map((origin) => origin.trim().replace(/\/$/, ''))
    .filter(Boolean),
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json());

async function start() {
  await initialize();

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);

  });
}

async function initialize() {
  if (initialized) return app;
  if (initialization) return initialization;

  initialization = (async () => {
    const { orm, syncSchema } = await import('./db/orm.mjs');

 
    app.use((req, res, next) => RequestContext.create(orm.em, next));

  
    app.use('/api/localidades', require('./routes/localidad.routes'));
    app.use('/api/entrenadores', require('./routes/entrenador.routes'));
    app.use('/api/deportistas', require('./routes/deportista.routes'));
    app.use('/api/entrenamientos', require('./routes/entrenamiento.routes'));
    app.use('/login', require('./routes/login.routes'));
    app.use('/api/asignaciones-entrenamientos', require('./routes/asignacionEntrenamiento.routes'));
    app.use('/api', require('./routes/asignaciones.routes'));
    app.use('/api/notas', require('./routes/nota.routes'));
    app.use('/api/ia', require('./routes/ia.routes'));


  
    app.get('/test', (_req, res) => res.send('Funciona el servidor!'));


    app.use((_, res) => res.status(404).send({ message: 'Resource not found' }));

    await syncSchema();
    initialized = true;
    return app;
  })();

  return initialization;
}

if (require.main === module) {
  start().catch(err => {
    console.error('Error al iniciar:', err);
    process.exit(1);
  });
}

module.exports = { app, initialize, start };