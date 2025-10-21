const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/asignaciones.controller');
router.put('/deportistas/:dni/entrenador', ctrl.putEntrenadorDeportista);
router.get('/entrenadores/:dni/deportistas', ctrl.getDeportistasDeEntrenador);

module.exports = router;
