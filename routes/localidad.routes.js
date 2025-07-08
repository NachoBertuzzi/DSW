// routes/localidad.routes.js
const express = require('express');
const router = express.Router();
const localidadController = require('../controllers/localidad.controller');

router.get('/', localidadController.getAll);
router.post('/', localidadController.create);
router.get('/:id', localidadController.getById);
router.put('/:id', localidadController.update);
router.delete('/:id', localidadController.delete);

module.exports = router;
// Este archivo define las rutas para las operaciones CRUD de localidades.