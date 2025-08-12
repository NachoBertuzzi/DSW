const Repository = require('../backend/repository');
const { pool } = require('../backend/db/conn.mysql');

class EntrenadorRepository extends Repository {
  async findAll() {
    const [entrenadores] = await pool.query('SELECT * FROM entrenadores');
    return entrenadores;
  }

  async findOne(item) {
    const id = Number.parseInt(item.id, 10);
    const [rows] = await pool.query('SELECT * FROM entrenadores WHERE id = ?', [id]);
    if (rows.length === 0) return undefined;
    return rows[0];
  }

  async add(entrenadorInput) {
    const [result] = await pool.query('INSERT INTO entrenadores SET ?', [entrenadorInput]);
    return { id: result.insertId, ...entrenadorInput };
  }

  async update(id, entrenadorInput) {
    const entrenadorId = Number.parseInt(id, 10);
    await pool.query('UPDATE entrenadores SET ? WHERE id = ?', [entrenadorInput, entrenadorId]);
    return await this.findOne({ id });
  }

  async delete(item) {
    try {
      const entrenadorToDelete = await this.findOne(item);
      if (!entrenadorToDelete) return undefined;
      const entrenadorId = Number.parseInt(item.id, 10);
      await pool.query('DELETE FROM entrenadores WHERE id = ?', [entrenadorId]);
      return entrenadorToDelete;
    } catch (err) {
      throw new Error('unable to delete entrenador');
    }
  }
}

module.exports = EntrenadorRepository;
