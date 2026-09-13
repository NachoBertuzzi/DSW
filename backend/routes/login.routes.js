const { Router } = require('express');
const deportistaService = require('../services/deportistaService');
const entrenadorService = require('../services/entrenadorService');
const { createToken } = require('../middlewares/auth.middleware');

const router = Router();

router.post('/', async (req, res) => {
  try {
    const {
      usuario,
      email,
      mail,
      contrasena,
      contraseña,
      password,
    } = req.body || {};

    const userOrEmail = usuario ?? email ?? mail;
    const pass = contrasena ?? contraseña ?? password;

    if (!userOrEmail || !pass) {
      return res.status(400).json({
        mensaje: 'Faltan credenciales',
      });
    }

    let usuarioEncontrado = await deportistaService.login(userOrEmail, pass);
    let rol = 'deportista';

    if (!usuarioEncontrado) {
      usuarioEncontrado = await entrenadorService.login(userOrEmail, pass);
      rol = 'entrenador';
    }

    if (!usuarioEncontrado) {
      return res.status(401).json({
        mensaje: 'Credenciales incorrectas',
      });
    }

    const token = createToken(usuarioEncontrado, rol);

    return res.json({ token });
  } catch (error) {
    console.error('Login:', error);

    return res.status(500).json({
      mensaje: 'Error del servidor',
    });
  }
});

module.exports = router;