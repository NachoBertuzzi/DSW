let localidades = [];
let idCounter = 1;

module.exports = {
    localidades,
    getNextId: () => idCounter++
};
