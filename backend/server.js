const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
const PORT = process.env.PORT || 3000;
//para el front 
const { RequestContext } = require('@mikro-orm/core');
const { orm, syncSchema } = require('./db/orm.js'); // Importa tu configuración de Mikro

const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));



app.use(express.json());

//luego de los middlewares base 

app.use(req, res, next => {
    RequestContext.create(orm.em, next);  //em, entity manager de mikro orm, es una abstraccion que permite
    //  manejar todas las entidades que vamos a definir en orm y permite manejarla de manera uniforme
    //  y desde u unico punto. Tambien cuenta con repositorios. 
});

//antes de las rutas y middleware de nuestro negocio 


// Rutas
app.use('/api/localidades', require('./routes/localidad.routes'));
app.use('/api/entrenadores', require('./routes/entrenador.routes'));
app.use('/api/deportistas', require('./routes/deportista.routes'));
app.use('/api/entrenamientos', require('./routes/entrenamiento.routes'));
const loginRoutes = require('./routes/login.routes');
app.use('/login', loginRoutes);


// Ruta de prueba
app.get('/test', (req, res) => {
  res.send('Funciona el servidor!');
});

await syncSchema(); // Sincroniza el esquema de la base de datos

// Inicio del servidor
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
