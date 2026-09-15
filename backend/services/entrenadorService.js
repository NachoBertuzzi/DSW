const { RequestContext, wrap } = require('@mikro-orm/core');
const { Entrenador } = require('../entities/entrenador.entity');
const { Deportista } = require('../entities/deportista.entity');
const { Entrenamiento } = require('../entities/entrenamiento.entity');
const { Asignacion } = require('../entities/asignacion.entity');
const { Nota } = require('../entities/nota.entity');
const bcrypt = require('bcrypt');

const isBcrypt = (value) => typeof value === 'string' && /^\$2[aby]\$/.test(value);

function toPublic(entrenador) {
  if (!entrenador) return entrenador;
  const plain = wrap(entrenador).toObject();
  delete plain.contrasena;
  delete plain['contraseña'];
  return plain;
}

async function hashPassword(password) {
  if (!password || isBcrypt(password)) return password;
  return bcrypt.hash(String(password), 10);
}

function em() {
  const _em = RequestContext.getEntityManager();
  if (!_em) throw new Error('No hay RequestContext activo');
  return _em;
}

module.exports = {
  async getAll() {
    const entrenadores = await em().find(Entrenador, {}, {
      fields: ['dni', 'nombre', 'apellido', 'usuario', 'email', 'tel', 'especialidad'],
      orderBy: { dni: 'asc' },
    });
    return entrenadores.map(toPublic);
  },

  async getById({ dni }) {
    return toPublic(await em().findOne(Entrenador, { dni }, {
      fields: ['dni', 'nombre', 'apellido', 'usuario', 'email', 'tel', 'especialidad'],
    }));
  },

  async create(data) {
    const _em = em();
    const exists = await _em.findOne(Entrenador, { dni: data.dni });
    if (exists) return toPublic(exists);
    const input = { ...data };
    if (input.contrasena) input.contrasena = await hashPassword(input.contrasena);
    const ent = _em.create(Entrenador, input);
    await _em.persistAndFlush(ent);
    return toPublic(ent);
  },

  async update(dni, data) {
    const _em = em();
    const ent = await _em.findOne(Entrenador, { dni });
    if (!ent) return undefined;
    const input = { ...data };
    if (input.contrasena) input.contrasena = await hashPassword(input.contrasena);
    _em.assign(ent, input);
    await _em.persistAndFlush(ent);
    return toPublic(ent);
  },

  async remove({ dni }) {
    const _em = em();
    const ent = await _em.findOne(Entrenador, { dni }, { populate: ['entrenamientos'] });
    if (!ent) return undefined;

    const deportistas = await _em.find(Deportista, { entrenador: ent });
    for (const deportista of deportistas) {
      deportista.entrenador = null;
      _em.persist(deportista);
    }

    const entrenamientos = await _em.find(Entrenamiento, { entrenador: ent });
    for (const entrenamiento of entrenamientos) {
      entrenamiento.entrenador = null;
      _em.persist(entrenamiento);
    }

    await _em.nativeDelete(Asignacion, { entrenador_dni: dni });
  await _em.nativeDelete(Nota, { entrenador: dni });
    await _em.removeAndFlush(ent);
    return ent;
  },

  async login(usuarioOrEmail, contraseñaPlano) {
    const needle = String(usuarioOrEmail).trim();
    const e = await em().findOne(
      Entrenador,
      { $or: [{ usuario: needle }, { email: needle }] }
    );
    if (!e) return null;

    const guardado = e.contrasena ?? e['contraseña'];
    if (!guardado) return null;

    const password = String(contraseñaPlano);
    const ok = isBcrypt(guardado)
      ? await bcrypt.compare(password, guardado)
      : password === String(guardado);

    if (!ok) return null;

    if (!isBcrypt(guardado)) {
      e.contrasena = await bcrypt.hash(password, 10);
      await em().persistAndFlush(e);
    }

    return toPublic(e);
  },

  async verifyPassword(dni, password) {
    const entrenador = await em().findOne(Entrenador, { dni });
    const guardado = entrenador?.contrasena ?? entrenador?.['contraseña'];
    if (!guardado || !isBcrypt(guardado)) return false;
    return bcrypt.compare(String(password), guardado);
  },
};
