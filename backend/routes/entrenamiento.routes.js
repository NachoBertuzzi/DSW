const { Router } = require('express');
const ctrl = require('../controllers/entrenamiento.controller');
const router = Router();

router.get('/', ctrl.findAll);
router.get('/:id', ctrl.findOne);
router.post('/', ctrl.sanitizeEntrenamientoInput, ctrl.add);
router.put('/:id', ctrl.sanitizeEntrenamientoInput, ctrl.update);
router.patch('/:id', ctrl.sanitizeEntrenamientoInput, ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;