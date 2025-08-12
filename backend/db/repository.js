class Repository {
  /**
   * Devuelve todos los registros.
   * @returns {Promise<Array|undefined>}
   */
  async findAll() {
    throw new Error("El método findAll() debe ser implementado en la subclase");
  }

  /**
   * Devuelve un registro por su id.
   * @param {{ id: string }} item
   * @returns {Promise<Object|undefined>}
   */
  async findOne(item) {
    throw new Error("El método findOne() debe ser implementado en la subclase");
  }

  /**
   * Agrega un nuevo registro.
   * @param {Object} item
   * @returns {Promise<Object|undefined>}
   */
  async add(item) {
    throw new Error("El método add() debe ser implementado en la subclase");
  }

  /**
   * Actualiza un registro por id.
   * @param {string} id
   * @param {Object} item
   * @returns {Promise<Object|undefined>}
   */
  async update(id, item) {
    throw new Error("El método update() debe ser implementado en la subclase");
  }

  /**
   * Elimina un registro.
   * @param {{ id: string }} item
   * @returns {Promise<Object|undefined>}
   */
  async delete(item) {
    throw new Error("El método delete() debe ser implementado en la subclase");
  }
}

module.exports = Repository;
