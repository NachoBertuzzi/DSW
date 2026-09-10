const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/asignacionesController');
const { verificarToken, requerirRol } = require('../middlewares/auth.middleware.js');
router.put('/deportistas/:dni/entrenador', verificarToken, requerirRol('deportista', 'entrenador'), ctrl.putEntrenadorDeportista);
router.get('/deportistas/:dni/entrenador', verificarToken, requerirRol('deportista'), ctrl.getEntrenadorDeportista);
router.get('/entrenadores/:dni/deportistas', verificarToken, requerirRol('entrenador'), ctrl.getDeportistasDeEntrenador);

module.exports = router;
