// models/localidad.model.js
class Localidad {
  constructor(id, nombre, provincia) {
      this.id = id;
      this.nombre = nombre;
      this.provincia = provincia;
  }
}

module.exports = Localidad;
// Este modelo define la estructura de una localidad con sus propiedades: id, nombre y provincia.