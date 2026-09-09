const { Router } = require('express');
const ctrl = require('../controllers/entrenamiento.controller');
const { verificarToken, requerirRol } = require('../middlewares/auth.middleware.js');
const router = Router();

router.get('/', verificarToken, requerirRol('deportista', 'entrenador'), ctrl.findAll);
router.get('/:id', verificarToken, requerirRol('deportista', 'entrenador'), ctrl.findOne);
router.post('/', verificarToken, requerirRol('deportista', 'entrenador'), ctrl.sanitizeEntrenamientoInput, ctrl.add);
router.put('/:id', verificarToken, requerirRol('deportista', 'entrenador'), ctrl.sanitizeEntrenamientoInput, ctrl.update);
router.patch('/:id', verificarToken, requerirRol('deportista', 'entrenador'), ctrl.sanitizeEntrenamientoInput, ctrl.update);
router.delete('/:id', verificarToken, requerirRol('deportista', 'entrenador'), ctrl.remove);

module.exports = router;