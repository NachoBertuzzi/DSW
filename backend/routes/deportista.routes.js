const { Router } = require('express');
const ctrl = require('../controllers/deportista.controller');

const router = Router();

// PK = dni
router.get('/', ctrl.findAll);
router.get('/:dni', ctrl.findOne);
router.post('/', ctrl.sanitizeDeportistaInput, ctrl.add);
router.put('/:dni', ctrl.sanitizeDeportistaInput, ctrl.update);
router.delete('/:dni', ctrl.remove);

// ====== LOGIN (nuevo) ======
router.post('/login', ctrl.login);

router.post('/eliminar', ctrl.remove); 

router.post('/asignarEjercicio', ctrl.asignarEjercicio);


module.exports = router;
