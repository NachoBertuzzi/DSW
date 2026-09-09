const { Router } = require('express');
const ctrl = require('../controllers/deportista.controller.js');
const { verificarToken, requerirRol, requerirPropioDni } = require('../middlewares/auth.middleware.js');

const router = Router();

router.get('/', verificarToken, requerirRol('deportista', 'entrenador'), ctrl.findAll);
router.get('/:dni', verificarToken, requerirRol('deportista', 'entrenador'), ctrl.findOne);
router.post('/', ctrl.sanitizeDeportistaInput, ctrl.add);
router.post('/login', ctrl.login);
router.put('/:dni', verificarToken, requerirRol('deportista'), requerirPropioDni, ctrl.sanitizeDeportistaInput, ctrl.update);
router.delete('/:dni', verificarToken, requerirRol('deportista'), requerirPropioDni, ctrl.remove);
router.post('/eliminar', verificarToken, requerirRol('deportista'), ctrl.remove);
router.post('/asignarEjercicio', verificarToken, requerirRol('entrenador'), ctrl.asignarEjercicio);

module.exports = router;
