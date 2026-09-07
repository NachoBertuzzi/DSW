const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

function requireJwt(req, res, next) {
  if (!JWT_SECRET) {
    return res.status(500).json({ mensaje: 'JWT_SECRET no está configurado' });
  }

  const header = req.get('authorization') || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ mensaje: 'Token requerido' });
  }

  try {
    req.auth = jwt.verify(token, JWT_SECRET);
    return next();
  } catch (_error) {
    return res.status(401).json({ mensaje: 'Token inválido o expirado' });
  }
}

function createToken(user, tipo) {
  if (!JWT_SECRET) throw new Error('JWT_SECRET no está configurado');

  return jwt.sign(
    { sub: String(user.dni), tipo },
    JWT_SECRET,
    { expiresIn: '15m' }
  );
}

module.exports = { requireJwt, createToken };
