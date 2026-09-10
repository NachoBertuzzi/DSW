const express = require('express');
const ctrl = require('../controllers/nota.controller');
const { verificarToken, requerirRol } = require('../middlewares/auth.middleware.js');

const router = express.Router();
router.post('/', verificarToken, requerirRol('deportista'), ctrl.crear);
router.get('/deportistas/:dni', verificarToken, requerirRol('deportista'), ctrl.listarPorDeportista);
router.get('/entrenadores/:dni', verificarToken, requerirRol('entrenador'), ctrl.listarPorEntrenador);

module.exports = router;
