// backend/routes/deportista.routes.js
const { Router } = require('express');
const ctrl = require('../controllers/deportista.controller.js');

const router = Router();

/**
 * CRUD principal (PK = dni)
 */
router.get('/', ctrl.findAll);
router.get('/:dni', ctrl.findOne);
router.post('/', ctrl.sanitizeDeportistaInput, ctrl.add);
router.put('/:dni', ctrl.sanitizeDeportistaInput, ctrl.update);
router.delete('/:dni', ctrl.remove);

/**
 * Extras
 */
router.post('/login', ctrl.login);
router.post('/eliminar', ctrl.remove);          // modo seguro por body {dni, contrasena}
router.post('/asignarEjercicio', ctrl.asignarEjercicio);

module.exports = router;
