const Repository = require('../backend/repository'); 
const { pool } = require('../backend/db/conn.mysql'); 

class DeportistaRepository extends Repository {
  async findAll() {
    const [deportistas] = await pool.query('SELECT * FROM deportistas');
    for (const deportista of deportistas) {
      const [items] = await pool.query(
        'SELECT itemName FROM deportistaItems WHERE deportistaId = ?',
        [deportista.id]
      );
      deportista.items = items.map((item) => item.itemName);
    }
    return deportistas;
  }

  async findOne(item) {
    const id = Number.parseInt(item.id, 10);
    const [rows] = await pool.query(
      'SELECT * FROM deportistas WHERE id = ?',
      [id]
    );
    if (rows.length === 0) return undefined;

    const deportista = rows[0];
    const [items] = await pool.query(
      'SELECT itemName FROM deportistaItems WHERE deportistaId = ?',
      [deportista.id]
    );
    deportista.items = items.map((i) => i.itemName);
    return deportista;
  }

  async add(deportistaInput) {
    const { id, items = [], ...deportistaRow } = deportistaInput;
    const [result] = await pool.query(
      'INSERT INTO deportistas SET ?',
      [deportistaRow]
    );
    const insertId = result.insertId;

    for (const item of items) {
      await pool.query('INSERT INTO deportistaItems SET ?', {
        deportistaId: insertId,
        itemName: item,
      });
    }

    return { id: insertId, ...deportistaRow, items };
  }

  async update(id, deportistaInput) {
    const deportistaId = Number.parseInt(id, 10);
    const { items = [], ...deportistaRow } = deportistaInput;

    await pool.query(
      'UPDATE deportistas SET ? WHERE id = ?',
      [deportistaRow, deportistaId]
    );

    await pool.query(
      'DELETE FROM deportistaItems WHERE deportistaId = ?',
      [deportistaId]
    );

    if (items.length > 0) {
      for (const itemName of items) {
        await pool.query('INSERT INTO deportistaItems SET ?', {
          deportistaId,
          itemName,
        });
      }
    }

    return await this.findOne({ id });
  }

  async delete(item) {
    try {
      const deportistaToDelete = await this.findOne(item);
      if (!deportistaToDelete) return undefined;

      const deportistaId = Number.parseInt(item.id, 10);
      await pool.query(
        'DELETE FROM deportistaItems WHERE deportistaId = ?',
        [deportistaId]
      );
      await pool.query(
        'DELETE FROM deportistas WHERE id = ?',
        [deportistaId]
      );

      return deportistaToDelete;
    } catch (err) {
      throw new Error('unable to delete deportista');
    }
  }
}

module.exports = DeportistaRepository;
// Si preferís exportar una instancia directamente:
// module.exports = new DeportistaRepository();
