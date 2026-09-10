const { EntitySchema } = require('@mikro-orm/core');

const Nota = new EntitySchema({
  name: 'Nota',
  tableName: 'notas',
  properties: {
    id: { type: 'number', primary: true, autoincrement: true },
    texto: { type: 'string', length: 1000 },
    fecha: { type: 'datetime', onCreate: () => new Date() },
    deportista: { kind: 'm:1', entity: 'Deportista', nullable: false },
    entrenador: { kind: 'm:1', entity: 'Entrenador', nullable: false },
  },
});

module.exports = { Nota };
