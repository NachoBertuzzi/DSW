// backend/entities/localidad.entity.js
const { EntitySchema } = require('@mikro-orm/core');

const Localidad = new EntitySchema({
  name: 'Localidad',
  tableName: 'localidades',
  properties: {
    codPostal: { type: 'string', primary: true },
    nombre: { type: 'string' },
    provincia: { type: 'string' },
    // Podrías declarar el 1:m inverso, pero es opcional y para evitar ciclos lo dejo fuera.
    // deportistas: { kind: '1:m', entity: 'Deportista', mappedBy: 'localidad', nullable: true },
  },
});

module.exports = { Localidad };
