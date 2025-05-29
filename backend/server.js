const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
let localidades = [];  //inicializar array localidades
let idCounter = 1; //contador para ids localidad



//app.get('/api/localidades', (req, res) => {
   // res.send('Juan puto');
//});

app.get('/api/localidades', (req, res) => {
    res.json(localidades);
}); //cuando yo llame a esto, me va a traer el array de localidades que esta en memoria temporal 


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
app.post('/api/localidades', (req, res) => {
    const nuevaLocalidad = {
        id: idCounter++,
        nombre: req.body.nombre,
        provincia: req.body.provincia

    };
    localidades.push(nuevaLocalidad);
    res.status(201).json(nuevaLocalidad);
});
//esto es como la plantilla de una localidad con id y nombre 

app.get('/api/localidades/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const localidad = localidades.find(l => l.id === id);
    if (localidad) {
        res.json(localidad);
    } else {
        res.status(404).json({ mensaje: 'Localidad no encontrada' });
    }
});
//busca ciudad por id, si no la encuentra errorr 404 sv no encontrado 

// ...existing code...
app.put('/api/localidades/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = localidades.findIndex(l => l.id === id);
    if (index !== -1) {
        console.log('¿Qué quiere actualizar? (nombre, provincia, ambos)');
        if (req.body.nombre && req.body.provincia) {
            localidades[index].nombre = req.body.nombre;
            localidades[index].provincia = req.body.provincia;
            console.log('Se actualizó nombre y provincia');
        } else if (req.body.nombre) {
            localidades[index].nombre = req.body.nombre;
            console.log('Se actualizó nombre');
        } else if (req.body.provincia) {
            localidades[index].provincia = req.body.provincia;
            console.log('Se actualizó provincia');
        } else {
            console.log('No se enviaron campos para actualizar');
            return res.status(400).json({ mensaje: 'No se enviaron campos para actualizar' });
        }
        res.json(localidades[index]);
    } else {
        res.status(404).json({ mensaje: 'Localidad no encontrada' });
    }
});
//actualiza localidad por id y pregunta que quiere actualizar 

app.delete('/api/localidades/:id', (req, res) => {
    const id = parseInt(req.params.id);
    localidades = localidades.filter(l => l.id !== id);
    res.status(204).send();
});
 //elimina por id 

