const { Router } = require('express');
const ctrl = require('../controllers/localidad.controller');

const router = Router();

// PK = codPostal
router.get('/', ctrl.findAll);
router.get('/:codPostal', ctrl.findOne);
router.post('/', ctrl.sanitizeLocalidadInput, ctrl.add);
router.put('/:codPostal', ctrl.sanitizeLocalidadInput, ctrl.update);
router.patch('/:codPostal', ctrl.sanitizeLocalidadInput, ctrl.update);
router.delete('/:codPostal', ctrl.remove);

module.exports = router;
