let entrenamientos = [];
let idCounter = 1;

module.exports = {
  getAll: () => entrenamientos,
  getById: (id) => entrenamientos.find(e => e.id === id),
  create: (data) => {
    const nuevo = { id: idCounter++, ...data };
    entrenamientos.push(nuevo);
    return nuevo;
  },
  update: (id, data) => {
    const index = entrenamientos.findIndex(e => e.id === id);
    if (index !== -1) {
      entrenamientos[index] = { ...entrenamientos[index], ...data };
      return entrenamientos[index];
    }
    return null;
  },
  delete: (id) => {
    const index = entrenamientos.findIndex(e => e.id === id);
    if (index !== -1) {
      entrenamientos.splice(index, 1);
      return true;
    }
    return false;
  }
};
// Este módulo exporta un array de entrenamientos y funciones para realizar operaciones CRUD sobre ellos.