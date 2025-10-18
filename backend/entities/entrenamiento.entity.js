// backend/entities/entrenamiento.entity.js
// EntitySchema (CommonJS) con horaEntrenamiento OPCIONAL.

const { EntitySchema } = require('@mikro-orm/core');

const Entrenamiento = new EntitySchema({
  name: 'Entrenamiento',
  tableName: 'entrenamientos',
  properties: {
    id: { type: 'number', primary: true, autoincrement: true },

    // Requerida
    fechaEntrenamiento: { type: 'date', nullable: false },

    // OPCIONAL (antes era requerida). Formato "HH:mm"
    horaEntrenamiento: { type: 'string', length: 5, nullable: true },

    // Relación obligatoria al deportista
    deportista: { kind: 'm:1', entity: 'Deportista', nullable: false },

    // Relación al entrenador (puede ser null según tu modelo)
    entrenador: { kind: 'm:1', entity: 'Entrenador', nullable: true },
  },
});

module.exports = { Entrenamiento };
