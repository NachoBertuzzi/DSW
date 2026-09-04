
const { RequestContext, wrap } = require('@mikro-orm/core');
const { Deportista } = require('../entities/deportista.entity');
const bcrypt = require('bcrypt');

function em() {
  const _em = RequestContext.getEntityManager();
  if (!_em) throw new Error('No hay RequestContext activo');
  return _em;
}


const isBcrypt = (s) => typeof s === 'string' && /^\$2[aby]\$/.test(s);

module.exports = {
  async getAll() {
    return em().find(Deportista, {});
  },

  async getById({ dni }) {
    return em().findOne(Deportista, { dni });
  },

  async create(data) {
    const _em = em();

    if (data.contrasena && !isBcrypt(data.contrasena)) {
      data.contrasena = await bcrypt.hash(String(data.contrasena), 10);
    }

    const deportista = _em.create(Deportista, data);
    await _em.persistAndFlush(deportista);
    return deportista;
  },

  async update(dni, data) {
    const _em = em();
    const deportista = await _em.findOne(Deportista, { dni });
    if (!deportista) return null;

    if (data.contrasena && !isBcrypt(data.contrasena)) {
      data.contrasena = await bcrypt.hash(String(data.contrasena), 10);
    }

    _em.assign(deportista, data);
    await _em.persistAndFlush(deportista);
    return deportista;
  },

  async remove({ dni }) {
    const _em = em();
    const deportista = await _em.findOne(Deportista, { dni });
    if (!deportista) return null;

    // 1. Limpiamos TODAS las dependencias en orden para evitar que MySQL bloquee la acción
    await _em.getConnection().execute('DELETE FROM asignaciones WHERE deportista_dni = ?', [dni]);
    await _em.getConnection().execute('DELETE FROM entrenamientos WHERE deportista_dni = ?', [dni]);

    // 2. Ahora eliminamos al deportista
    await _em.removeAndFlush(deportista);
    
    return deportista;
  },

  async login(usuarioOrEmail, passPlano) {
    const needle = String(usuarioOrEmail).trim();

    const d = await em().findOne(
      Deportista,
      { $or: [{ usuario: needle }, { email: needle }] }
    );
    if (!d) return null;

    const guardada = d.contrasena;
    if (!guardada) return null;

    const ok = isBcrypt(guardada)
      ? await bcrypt.compare(String(passPlano), guardada)
      : String(passPlano) === String(guardada);

    if (!ok) return null;

    const plano = wrap(d).toObject();
    delete plano.contrasena;
    return plano;
  },

  async getByUsuario(usuario) {
    return em().findOne(Deportista, { usuario });
  },
};
