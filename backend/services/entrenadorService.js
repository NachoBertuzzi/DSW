const { RequestContext, wrap } = require('@mikro-orm/core');
const { Entrenador } = require('../entities/entrenador.entity');
const { Entrenamiento } = require('../entities/entrenamiento.entity');
const { Asignacion } = require('../entities/asignacion.entity');

function em() {
  const _em = RequestContext.getEntityManager();
  if (!_em) throw new Error('No hay RequestContext activo');
  return _em;
}

module.exports = {
  async getAll() {
    return em().find(Entrenador, {}, {
      fields: ['dni', 'nombre', 'apellido', 'usuario', 'email', 'contrasena', 'tel', 'especialidad'],
      orderBy: { dni: 'asc' },
    });
  },

  async getById({ dni }) {
    return em().findOne(Entrenador, { dni });
  },

  async create(data) {
    const _em = em();
    const exists = await _em.findOne(Entrenador, { dni: data.dni });
    if (exists) return exists;
    const ent = _em.create(Entrenador, data);
    await _em.persistAndFlush(ent);
    return ent;
  },

  async update(dni, data) {
    const _em = em();
    const ent = await _em.findOne(Entrenador, { dni });
    if (!ent) return undefined;
    _em.assign(ent, data);
    await _em.persistAndFlush(ent);
    return ent;
  },

  async remove({ dni }) {
    const _em = em();
    const ent = await _em.findOne(Entrenador, { dni }, { populate: ['entrenamientos'] });
    if (!ent) return undefined;

    const entrenamientos = await _em.find(Entrenamiento, { entrenador: ent });
    for (const entrenamiento of entrenamientos) {
      entrenamiento.entrenador = null;
      _em.persist(entrenamiento);
    }

    await _em.nativeDelete(Asignacion, { entrenador_dni: dni });
    await _em.removeAndFlush(ent);
    return ent;
  },

  async login(usuarioOrEmail, contraseñaPlano) {
    const e = await em().findOne(
      Entrenador,
      { $or: [{ usuario: usuarioOrEmail }, { email: usuarioOrEmail }] }
    );
    if (!e) return null;

    const guardado = e.contrasena ?? e['contraseña'];
    const ok = contraseñaPlano === guardado; 

    if (!ok) return null;

    const plano = wrap(e).toObject();
    delete plano.contrasena;
    delete plano['contraseña'];
    return plano;
  },
};
