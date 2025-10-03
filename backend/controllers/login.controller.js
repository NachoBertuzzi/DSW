const loginService = require('../services/login.Service');

const loginUsuario = async (req, res) => {
  const { usuario, contraseña } = req.body;

  try {
    const user = await loginService.verificarCredenciales(usuario, contraseña);

    if (user) {
      res.status(200).json({ mensaje: 'Login exitoso', usuario: user });
    } else {
      res.status(401).json({ mensaje: 'Credenciales incorrectas' });
    }
  } catch (error) {
    console.error('Error al hacer login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = { loginUsuario };