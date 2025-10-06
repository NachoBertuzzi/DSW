const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/asignaciones.controller');

// Asignar o quitar entrenador a un deportista
router.put('/deportistas/:dni/entrenador', ctrl.putEntrenadorDeportista);

// Listar deportistas de un entrenador
router.get('/entrenadores/:dni/deportistas', ctrl.getDeportistasDeEntrenador);

module.exports = router;
