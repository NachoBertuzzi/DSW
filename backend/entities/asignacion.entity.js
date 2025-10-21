

const { EntitySchema } = require('@mikro-orm/core');
const { randomUUID } = require('crypto');

module.exports = {
  Asignacion: new EntitySchema({
    name: 'Asignacion',
    tableName: 'asignaciones',

    properties: {
      id: {
        type: 'string',
        length: 36,
        primary: true,
        nullable: false,
        onCreate: () => randomUUID(),
      },

      
      entrenador: {
        kind: 'm:1',             
        entity: 'Entrenador',
        nullable: false,
        index: true,
        fieldName: 'entrenador_dni',
      },

      deportista: {
        kind: 'm:1',
        entity: 'Deportista',
        nullable: false,
        index: true,
        fieldName: 'deportista_dni',
      },

      entrenamiento: {
        kind: 'm:1',
        entity: 'Entrenamiento',
        nullable: false,
        index: true,
        fieldName: 'entrenamiento_id',
       
      },

      
      fecha: { type: 'date', nullable: true },
      notas: { type: 'string', length: 1000, nullable: true },

      
      estado: {
        type: 'string',
        enum: true,
        items: ['pendiente', 'en_progreso', 'completado', 'cancelado'],
        default: 'pendiente',
        index: true,
      },

      
      createdAt: { type: 'datetime', onCreate: () => new Date(), nullable: false, index: true },
      updatedAt: { type: 'datetime', onCreate: () => new Date(), onUpdate: () => new Date(), nullable: false },
    },

    indexes: [
      { name: 'idx_asig_entrenador_created', properties: ['entrenador', 'createdAt'] },
      { name: 'idx_asig_deportista_created', properties: ['deportista', 'createdAt'] },
    ],
  }),
};
