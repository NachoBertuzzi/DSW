// Exponer el ORM a los services que hacen: const { orm } = require('../db')
module.exports = {
  get orm() {
    return global.orm; // lo setea server.js al iniciar
  },
};
