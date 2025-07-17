const express = require('express');
const router = express.Router();
const controller = require('../controllers/deportista.controller');

router.post('/login', controller.login);
router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.post('/login', controller.login);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

module.exports = router;
// Este archivo define las rutas para las operaciones CRUD de deportistas.