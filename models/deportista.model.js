let deportistas = [];
let idCounter = 1;

module.exports = {
  getAll: () => deportistas,
  getById: (id) => deportistas.find(d => d.id === id),
  create: (data) => {
    const nuevo = { id: idCounter++, ...data };
    deportistas.push(nuevo);
    return nuevo;
  },
  update: (id, data) => {
    const index = deportistas.findIndex(d => d.id === id);
    if (index !== -1) {
      deportistas[index] = { ...deportistas[index], ...data };
      return deportistas[index];
    }
    return null;
  },
  delete: (id) => {
    const index = deportistas.findIndex(d => d.id === id);
    if (index !== -1) {
      deportistas.splice(index, 1);
      return true;
    }
    return false;
  }
};
// Este módulo exporta un array de deportistas y funciones para realizar operaciones CRUD sobre ellos.