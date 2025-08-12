const { Router } = require('express');
const ctrl = require('../controllers/deportista.controller');

const router = Router();

// PK = dni (string/num). Ajustá si preferís /:id.
router.get('/', ctrl.findAll);
router.get('/:dni', ctrl.findOne);
router.post('/', ctrl.sanitizeDeportistaInput, ctrl.add);
router.put('/:dni', ctrl.sanitizeDeportistaInput, ctrl.update);
router.delete('/:dni', ctrl.remove);

module.exports = router;
