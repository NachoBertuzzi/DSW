const Repository = require('../backend/repository');
const { pool } = require('../backend/db/conn.mysql');

class EntrenamientoRepository extends Repository {
  async findAll() {
    const [entrenamientos] = await pool.query('SELECT * FROM entrenamientos');
    return entrenamientos;
  }

  async findOne(item) {
    const id = Number.parseInt(item.id, 10);
    const [rows] = await pool.query('SELECT * FROM entrenamientos WHERE id = ?', [id]);
    if (rows.length === 0) return undefined;
    return rows[0];
  }

  async add(entrenamientoInput) {
    const [result] = await pool.query('INSERT INTO entrenamientos SET ?', [entrenamientoInput]);
    return { id: result.insertId, ...entrenamientoInput };
  }

  async update(id, entrenamientoInput) {
    const entrenamientoId = Number.parseInt(id, 10);
    await pool.query('UPDATE entrenamientos SET ? WHERE id = ?', [entrenamientoInput, entrenamientoId]);
    return await this.findOne({ id });
  }

  async delete(item) {
    try {
      const entrenamientoToDelete = await this.findOne(item);
      if (!entrenamientoToDelete) return undefined;
      const entrenamientoId = Number.parseInt(item.id, 10);
      await pool.query('DELETE FROM entrenamientos WHERE id = ?', [entrenamientoId]);
      return entrenamientoToDelete;
    } catch (err) {
      throw new Error('unable to delete entrenamiento');
    }
  }
}

module.exports = EntrenamientoRepository;
