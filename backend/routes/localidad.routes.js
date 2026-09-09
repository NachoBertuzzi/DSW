const { Router } = require('express');
const ctrl = require('../controllers/localidad.controller');
const { verificarToken, requerirRol } = require('../middlewares/auth.middleware.js');

const router = Router();

router.get('/', verificarToken, requerirRol('deportista', 'entrenador'), ctrl.findAll);
router.get('/:codPostal', verificarToken, requerirRol('deportista', 'entrenador'), ctrl.findOne);
router.post('/', verificarToken, requerirRol('entrenador'), ctrl.sanitizeLocalidadInput, ctrl.add);
router.put('/:codPostal', verificarToken, requerirRol('entrenador'), ctrl.sanitizeLocalidadInput, ctrl.update);
router.patch('/:codPostal', verificarToken, requerirRol('entrenador'), ctrl.sanitizeLocalidadInput, ctrl.update);
router.delete('/:codPostal', verificarToken, requerirRol('entrenador'), ctrl.remove);

module.exports = router;
