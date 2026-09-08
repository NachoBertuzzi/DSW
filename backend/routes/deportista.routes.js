const { Router } = require('express');
const ctrl = require('../controllers/deportista.controller.js');
const { requireJwt } = require('../middleware/auth.js');

const router = Router();

router.get('/', ctrl.findAll);
router.get('/:dni', ctrl.findOne);
router.post('/', ctrl.sanitizeDeportistaInput, ctrl.add);
router.post('/login', ctrl.login);
router.put('/:dni', requireJwt, ctrl.sanitizeDeportistaInput, ctrl.update);
router.delete('/:dni', requireJwt, ctrl.remove);
router.post('/eliminar', requireJwt, ctrl.remove);       
router.post('/asignarEjercicio', requireJwt, ctrl.asignarEjercicio);

module.exports = router;
