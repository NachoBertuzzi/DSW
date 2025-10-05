const { EntitySchema } = require('@mikro-orm/core');

const Entrenamiento = new EntitySchema({
  name: 'Entrenamiento',
  tableName: 'entrenamientos',
  properties: {
    id: { type: 'number', primary: true, autoincrement: true },
    fechaEntrenamiento: { type: 'date' },
    horaEntrenamiento: { type: 'string' },
    deportista: { kind: 'm:1', entity: 'Deportista', nullable: false },
    entrenador: { kind: 'm:1', entity: 'Entrenador', nullable: true }, // <-- antes era false
  },
});

module.exports = { Entrenamiento };
