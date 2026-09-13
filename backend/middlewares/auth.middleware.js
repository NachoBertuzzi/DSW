const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'secreto_super_seguro';
const TOKEN_OPTIONS = { expiresIn: '2h' };

function createToken(user, rol) {
  return jwt.sign(
    {
      ...user,
      sub: String(user.dni),
      dni: String(user.dni),
      rol,
    },
    JWT_SECRET,
    TOKEN_OPTIONS,
  );
}

function verificarToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const [scheme, token] = (authHeader || '').split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ mensaje: 'Token requerido' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded.sub || !decoded.rol || !decoded.dni) {
      return res.status(401).json({ mensaje: 'Token inválido o expirado' });
    }
    req.user = decoded;
    return next();
  } catch (_error) {
    return res.status(401).json({ mensaje: 'Token inválido o expirado' });
  }
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

module.exports = { createToken, verificarToken, requerirRol, requerirPropioDni };