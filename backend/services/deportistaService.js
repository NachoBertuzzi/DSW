const { RequestContext } = require('@mikro-orm/core');
const { Deportista } = require('../entities/deportista.entity');
const { Localidad } = require('../entities/localidad.entity'); // 👈

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

    // 🔑 convierte string a referencia de Localidad
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

    // 🔑 idem en update
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
};
