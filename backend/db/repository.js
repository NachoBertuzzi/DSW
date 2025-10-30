class Repository {
  /**
   * 
   * @returns {Promise<Array|undefined>}
   
 
  
   * @param {{ id: string }} item
   * @returns {Promise<Object|undefined>}
   */
  async findOne(item) {
    throw new Error("El método findOne() debe ser implementado en la subclase");
  }

  /**
   * @param {Object} item
   * @returns {Promise<Object|undefined>}
   */
  async add(item) {
    throw new Error("El método add() debe ser implementado en la subclase");
  }

  /**
   * @param {string} id
   * @param {Object} item
   * @returns {Promise<Object|undefined>}
   */
  async update(id, item) {
    throw new Error("El método update() debe ser implementado en la subclase");
  }

  /**
   * @param {{ id: string }} item
   * @returns {Promise<Object|undefined>}
   */
  async delete(item) {
    throw new Error("El método delete() debe ser implementado en la subclase");
  }
}

module.exports = Repository;
