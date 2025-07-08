const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

const localidadRoutes = require('./routes/localidad.routes');
app.use(express.json());
app.use('/api/localidades', localidadRoutes);

const entrenadorRoutes = require('./routes/entrenador.routes');
app.use('/api/entrenadores', entrenadorRoutes);

const deportistaRoutes = require('./routes/deportista.routes');
app.use('/api/deportistas', deportistaRoutes);

const entrenamientoRoutes = require('./routes/entrenamiento.routes');
app.use('/api/entrenamientos', entrenamientoRoutes);

// ✅ PRUEBA
app.get('/test', (req, res) => {
  res.send('Funciona el servidor!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
