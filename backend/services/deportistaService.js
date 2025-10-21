const { RequestContext, wrap } = require('@mikro-orm/core');
const { Deportista } = require('../entities/deportista.entity');

function em() {
  const _em = RequestContext.getEntityManager();
  if (!_em) throw new Error('No hay RequestContext activo');
  return _em;
}

module.exports = {
  async getAll() {
    return em().find(Deportista, {});
  },

  async getById({ dni }) {
    return em().findOne(Deportista, { dni });
  },

  async create(data) {
    const _em = em();
    const deportista = _em.create(Deportista, data);
    await _em.persistAndFlush(deportista);
    return deportista;
  },

  async update(dni, data) {
    const _em = em();
    const deportista = await _em.findOne(Deportista, { dni });
    if (!deportista) return null;
    _em.assign(deportista, data);
    await _em.persistAndFlush(deportista);
    return deportista;
  },

  async remove({ dni }) {
    const _em = em();
    const deportista = await _em.findOne(Deportista, { dni });
    if (!deportista) return null;
    await _em.removeAndFlush(deportista);
    return deportista;
  },

  async login(usuarioOrEmail, passPlano) {
    const d = await em().findOne(
      Deportista,
      { $or: [{ usuario: usuarioOrEmail }, { email: usuarioOrEmail }] }
    );
    if (!d) return null;

    const guardada = d.contrasena ?? d['contraseña'];
    if (guardada == null) return null;

    const ok = String(passPlano) === String(guardada);
    if (!ok) return null;

    const plano = wrap(d).toObject();
    delete plano.contrasena;
    delete plano['contraseña'];
    return plano;
  },

  async getByUsuario(usuario) {
    return em().findOne(Deportista, { usuario });
  },
};
