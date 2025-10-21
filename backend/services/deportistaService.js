const { RequestContext, wrap } = require('@mikro-orm/core');
const { Deportista } = require('../entities/deportista.entity');
const bcrypt = require('bcrypt');

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
    if (data.contrasena) {
      data.contrasena = await bcrypt.hash(data.contrasena, 10);
    }
    const deportista = _em.create(Deportista, data);
    await _em.persistAndFlush(deportista);
    return deportista;
  },

  async update(dni, data) {
    const _em = em();
    const deportista = await _em.findOne(Deportista, { dni });
    if (!deportista) return null;
    if (data.contrasena) {
      data.contrasena = await bcrypt.hash(data.contrasena, 10);
    }
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

    if (!d.contrasena) return null;

    const ok = await bcrypt.compare(passPlano, d.contrasena);
    if (!ok) return null;

    const plano = wrap(d).toObject();
    delete plano.contrasena;
    return plano;
  },

  async getByUsuario(usuario) {
    return em().findOne(Deportista, { usuario });
  },
};
