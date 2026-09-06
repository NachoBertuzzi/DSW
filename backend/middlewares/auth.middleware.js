const jwt = require('jsonwebtoken');

function verificarToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(403).json({ mensaje: 'Acceso denegado: Token requerido' });
  }

  jwt.verify(token, 'secreto_super_seguro', (err, decoded) => {
    if (err) {
      return res.status(401).json({ mensaje: 'Token inválido o expirado' });
    }
    req.user = decoded;
    next();
  });
}

module.exports = { verificarToken };