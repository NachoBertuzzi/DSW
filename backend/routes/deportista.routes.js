const { Router } = require('express');
const ctrl = require('../controllers/deportista.controller.js');
const { verificarToken } = require('../middlewares/auth.middleware.js');

const router = Router();

router.get('/', ctrl.findAll);
router.get('/:dni', ctrl.findOne);
router.post('/', ctrl.sanitizeDeportistaInput, ctrl.add);
router.post('/login', ctrl.login);
router.put('/:dni', verificarToken, ctrl.sanitizeDeportistaInput, ctrl.update);
router.delete('/:dni', verificarToken, ctrl.remove);
router.post('/eliminar', verificarToken, ctrl.remove);       
router.post('/asignarEjercicio', verificarToken, ctrl.asignarEjercicio);

module.exports = router;
