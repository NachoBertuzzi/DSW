const { EntitySchema } = require('@mikro-orm/core');

const Localidad = new EntitySchema({
  name: 'Localidad',
  tableName: 'localidades',
  properties: {
    codPostal: { type: 'string', primary: true },
    nombre: { type: 'string' },
    provincia: { type: 'string' },
  },
});

module.exports = { Localidad };
