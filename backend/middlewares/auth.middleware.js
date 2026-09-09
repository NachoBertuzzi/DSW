const jwt = require('jsonwebtoken');

function verificarToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(403).json({ mensaje: 'Acceso denegado: Token requerido' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'secreto_super_seguro', (err, decoded) => {
    if (err) {
      return res.status(401).json({ mensaje: 'Token inválido o expirado' });
    }
    req.user = decoded;
    next();
  });
}

function requerirRol(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.rol)) {
      return res.status(403).json({ mensaje: 'No tenés permisos para realizar esta operación' });
    }
    next();
  };
}

function requerirPropioDni(req, res, next) {
  if (String(req.user?.dni) !== String(req.params.dni)) {
    return res.status(403).json({ mensaje: 'Solo podés modificar tu propia cuenta' });
  }
  next();
}

module.exports = { verificarToken, requerirRol, requerirPropioDni };