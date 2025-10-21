const { Router } = require('express');
const ctrl = require('../controllers/entrenador.controller');

const router = Router();

router.get('/', ctrl.findAll);
router.get('/:dni', ctrl.findOne);
router.post('/', ctrl.sanitizeEntrenadorInput, ctrl.add);
router.put('/:dni', ctrl.sanitizeEntrenadorInput, ctrl.update);
router.patch('/:dni', ctrl.sanitizeEntrenadorInput, ctrl.update);
router.delete('/:dni', ctrl.remove);
router.post('/login', ctrl.login);

module.exports = router;
