import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../server.js'; // importa servidor Express

describe('CRUD Deportistas', () => {

  let nuevoId;

  it('GET /deportistas debe devolver un array', async () => {
    const res = await request(app).get('/deportistas');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST /deportistas debe crear un nuevo deportista', async () => {
    const nuevo = {
      dni: 12345678,
      nombre: "Juan",
      apellido: "Pérez",
      usuario: "juanp",
      email: "juan@example.com",
      contraseña: "12345678",
      fecha_nacimiento: "2000-01-01",
      altura: 180,
      peso: 75,
      localidad_nombre: "Rosario"
    };

    const res = await request(app).post('/deportistas').send(nuevo);
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('dni', nuevo.dni);
    nuevoId = res.body.id; 
  });

  it('GET /deportistas/:id debe devolver el deportista creado', async () => {
    const res = await request(app).get(`/deportistas/${nuevoId}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('dni', 12345678);
  });

  it('PUT /deportistas/:id debe actualizar el deportista', async () => {
    const cambios = {
      dni: 12345678,
      nombre: "Juan",
      apellido: "Actualizado",
      usuario: "juanp",
      contraseña: "12345678",
      altura: 182,
      peso: 80
    };
    const res = await request(app).put(`/deportistas/${nuevoId}`).send(cambios);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
  });

  it('DELETE /deportistas/:id debe eliminar el deportista', async () => {
    
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
  });

});