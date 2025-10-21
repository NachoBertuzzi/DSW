const { EntitySchema } = require('@mikro-orm/core');

const Entrenamiento = new EntitySchema({
  name: 'Entrenamiento',
  tableName: 'entrenamientos',
  properties: {
    id: { type: 'number', primary: true, autoincrement: true },
    fechaEntrenamiento: { type: 'date', nullable: false },
    horaEntrenamiento: { type: 'string', length: 5, nullable: true },
    deportista: { kind: 'm:1', entity: 'Deportista', nullable: false },
    entrenador: { kind: 'm:1', entity: 'Entrenador', nullable: true },
  },
});

module.exports = { Entrenamiento };
