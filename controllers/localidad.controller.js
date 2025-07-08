// controllers/localidad.controller.js
let localidades = [];
let idCounter = 1;

exports.getAll = (req, res) => {
    res.json(localidades);
};

exports.create = (req, res) => {
    const nuevaLocalidad = {
        id: idCounter++,
        nombre: req.body.nombre,
        provincia: req.body.provincia
    };
    localidades.push(nuevaLocalidad);
    res.status(201).json(nuevaLocalidad);
};

exports.getById = (req, res) => {
    const id = parseInt(req.params.id);
    const localidad = localidades.find(l => l.id === id);
    if (localidad) {
        res.json(localidad);
    } else {
        res.status(404).json({ mensaje: 'Localidad no encontrada' });
    }
};

exports.update = (req, res) => {
    const id = parseInt(req.params.id);
    const index = localidades.findIndex(l => l.id === id);
    if (index !== -1) {
        if (req.body.nombre) localidades[index].nombre = req.body.nombre;
        if (req.body.provincia) localidades[index].provincia = req.body.provincia;
        res.json(localidades[index]);
    } else {
        res.status(404).json({ mensaje: 'Localidad no encontrada' });
    }
};

exports.delete = (req, res) => {
    const id = parseInt(req.params.id);
    localidades = localidades.filter(l => l.id !== id);
    res.status(204).send();
};
// Este controlador maneja las operaciones CRUD para localidades.