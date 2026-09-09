
const express = require('express');
const ctrl = require('../controllers/asignacionEntrenamiento.controller');
const { verificarToken, requerirRol } = require('../middlewares/auth.middleware.js');

const router = express.Router();

router.post('/', verificarToken, requerirRol('entrenador'), ctrl.crearAsignacion);
router.get('/entrenadores/:dni', verificarToken, requerirRol('entrenador'), ctrl.listarPorEntrenador);
router.get('/deportistas/:dni', verificarToken, requerirRol('deportista', 'entrenador'), ctrl.listarPorDeportista);
router.get('/:id', verificarToken, requerirRol('deportista', 'entrenador'), ctrl.obtenerPorId);
router.patch('/:id/estado', verificarToken, requerirRol('deportista', 'entrenador'), ctrl.actualizarEstado);
router.delete('/:id', verificarToken, requerirRol('entrenador'), ctrl.eliminarAsignacion);

module.exports = router;
