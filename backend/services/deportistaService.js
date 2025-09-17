const { RequestContext, wrap } = require('@mikro-orm/core');
const { Deportista } = require('../entities/deportista.entity');
const { Localidad } = require('../entities/localidad.entity');

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

    // si viene string, lo convertimos a referencia
    if (data.localidad && typeof data.localidad === 'string') {
      data.localidad = _em.getReference(Localidad, data.localidad);
    }

    const exists = await _em.findOne(Deportista, { dni: data.dni });
    if (exists) return exists;

    const d = _em.create(Deportista, data);
    await _em.persistAndFlush(d);
    return d;
  },

  async update(dni, data) {
    const _em = em();
    const d = await _em.findOne(Deportista, { dni });
    if (!d) return undefined;

    if (data.localidad && typeof data.localidad === 'string') {
      data.localidad = _em.getReference(Localidad, data.localidad);
    }

    _em.assign(d, data);
    await _em.persistAndFlush(d);
    return d;
  },

  async remove({ dni }) {
    const _em = em();
    const d = await _em.findOne(Deportista, { dni });
    if (!d) return undefined;
    await _em.removeAndFlush(d);
    return d;
  },

  // ====== LOGIN (nuevo) ======
  async login(usuarioOrEmail, contraseñaPlano) {
    // permitimos usuario o email
    const d = await em().findOne(
      Deportista,
      { $or: [{ usuario: usuarioOrEmail }, { email: usuarioOrEmail }] },
      { populate: ['localidad'] }
    );
    if (!d) return null;

    // el campo puede llamarse contrasena o "contraseña"
    const guardado = d.contrasena ?? d['contraseña'];
    const ok = contraseñaPlano === guardado; // si usás bcrypt, cambiá por bcrypt.compare

    if (!ok) return null;

    const plano = wrap(d).toObject();
    delete plano.contrasena;
    delete plano['contraseña'];
    return plano;
  },
};
