
const { EntitySchema } = require('@mikro-orm/core');

const Entrenador = new EntitySchema({
  name: 'Entrenador',
  tableName: 'entrenadores',
  properties: {
    dni: { type: 'string', primary: true },
    nombre: { type: 'string' },
    apellido: { type: 'string' },
    usuario: { type: 'string' },
    email: { type: 'string' },
    contrasena: { type: 'string' },
    tel: { type: 'string', nullable: true },
    especialidad: { type: 'string', nullable: true },

    entrenamientos: {
      kind: '1:m',
      entity: 'Entrenamiento',
      mappedBy: 'entrenador',
      nullable: true,
    },
  },
});

module.exports = { Entrenador };
