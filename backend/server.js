const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
//para el front 

const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:3001',
  credentials: true,
}));



app.use(express.json());

// Rutas
app.use('/api/localidades', require('./routes/localidad.routes'));
app.use('/api/entrenadores', require('./routes/entrenador.routes'));
app.use('/api/deportistas', require('./routes/deportista.routes'));
app.use('/api/entrenamientos', require('./routes/entrenamiento.routes'));

// Ruta de prueba
app.get('/test', (req, res) => {
  res.send('Funciona el servidor!');
});

// Inicio del servidor
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

