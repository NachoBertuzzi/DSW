// backend/routes/login.routes.js
const { Router } = require('express');
const router = Router();

// TODO: reemplazar por tu lógica real de login (consultar DB, comparar hash, etc.)
router.post('/', async (req, res) => {
  try {
    const { usuario, contrasena } = req.body;

    if (!usuario || !contrasena) {
      return res.status(400).json({ ok: false, message: 'Falta usuario o contraseña' });
    }

    // Ejemplo mínimo: responde OK sin validar (solo para que el server levante)
    return res.json({ ok: true, user: { usuario } });
  } catch (e) {
    console.error('login error:', e);
    return res.status(500).json({ ok: false, message: 'Error interno' });
  }
});

module.exports = router;
