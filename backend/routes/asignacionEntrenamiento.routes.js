// backend/routes/asignacionEntrenamiento.routes.js
const express = require('express');
const ctrl = require('../controllers/asignacionEntrenamiento.controller');

const router = express.Router();

router.post('/', ctrl.crearAsignacion);
router.get('/entrenadores/:dni', ctrl.listarPorEntrenador);
router.get('/deportistas/:dni', ctrl.listarPorDeportista);
router.get('/:id', ctrl.obtenerPorId);
router.patch('/:id/estado', ctrl.actualizarEstado);
router.delete('/:id', ctrl.eliminarAsignacion);

module.exports = router;
