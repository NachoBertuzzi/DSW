const { Router } = require('express');
const ctrl = require('../controllers/entrenador.controller');
const { verificarToken, requerirRol, requerirPropioDni } = require('../middlewares/auth.middleware.js');

const router = Router();

router.get('/', verificarToken, requerirRol('deportista', 'entrenador'), ctrl.findAll);
router.get('/:dni', verificarToken, requerirRol('deportista', 'entrenador'), ctrl.findOne);
router.post('/', ctrl.sanitizeEntrenadorInput, ctrl.add);
router.put('/:dni', verificarToken, requerirRol('entrenador'), requerirPropioDni, ctrl.sanitizeEntrenadorInput, ctrl.update);
router.patch('/:dni', verificarToken, requerirRol('entrenador'), requerirPropioDni, ctrl.sanitizeEntrenadorInput, ctrl.update);
router.delete('/:dni', verificarToken, requerirRol('entrenador'), requerirPropioDni, ctrl.remove);

module.exports = router;
