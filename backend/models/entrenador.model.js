let entrenadores = [];
let idCounter = 1;

module.exports = {
    entrenadores,
    getNextId: () => idCounter++,
};
// Este módulo exporta un array de entrenadores y una función para obtener el siguiente ID único.