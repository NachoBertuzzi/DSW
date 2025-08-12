const Repository = require('../backend/repository');
const { pool } = require('../backend/db/conn.mysql');

class LocalidadRepository extends Repository {
  async findAll() {
    const [localidades] = await pool.query('SELECT * FROM localidades');
    return localidades;
  }

  async findOne(item) {
    const id = Number.parseInt(item.id, 10);
    const [rows] = await pool.query('SELECT * FROM localidades WHERE id = ?', [id]);
    if (rows.length === 0) return undefined;
    return rows[0];
  }

  async add(localidadInput) {
    const [result] = await pool.query('INSERT INTO localidades SET ?', [localidadInput]);
    return { id: result.insertId, ...localidadInput };
  }

  async update(id, localidadInput) {
    const localidadId = Number.parseInt(id, 10);
    await pool.query('UPDATE localidades SET ? WHERE id = ?', [localidadInput, localidadId]);
    return await this.findOne({ id });
  }

  async delete(item) {
    try {
      const localidadToDelete = await this.findOne(item);
      if (!localidadToDelete) return undefined;
      const localidadId = Number.parseInt(item.id, 10);
      await pool.query('DELETE FROM localidades WHERE id = ?', [localidadId]);
      return localidadToDelete;
    } catch (err) {
      throw new Error('unable to delete localidad');
    }
  }
}

module.exports = LocalidadRepository;
