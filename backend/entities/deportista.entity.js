const { EntitySchema } = require('@mikro-orm/core');

const Deportista = new EntitySchema({
  name: 'Deportista',
  tableName: 'deportistas',
  properties: {
    dni: { type: 'string', primary: true },           
    nombre: { type: 'string' },
    apellido: { type: 'string' },
    usuario: { type: 'string' },
    email: { type: 'string' },
    contrasena: { type: 'string' },
    fecha_nacimiento: { type: 'date', nullable: true },
    altura: { type: 'number', nullable: true },
    peso: { type: 'float', nullable: true },
    telefono: { type: 'string', nullable: true },

    localidad: {
      kind: 'm:1',
      entity: 'Localidad',
      nullable: true,
    },

    entrenamientos: {
      kind: '1:m',
      entity: 'Entrenamiento',
      mappedBy: 'deportista',
      nullable: true,
      cascade: ['all'], 
    },
  },
});

module.exports = { Deportista };