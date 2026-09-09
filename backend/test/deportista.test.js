import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { app, initialize } from '../server.js';

const suffix = Date.now().toString();
const deportista = {
  dni: `TEST-DEP-${suffix}`,
  nombre: 'Juan',
  apellido: 'Funcional',
  usuario: `deportista.test.${suffix}`,
  email: `deportista.test.${suffix}@example.com`,
  contrasena: 'test-pass-123',
  fecha_nacimiento: '2000-01-01',
  altura: 180,
  peso: 75,
};

let token;

describe('Peticiones funcionales de deportistas', () => {
  beforeAll(async () => {
    await initialize();

    const createRes = await request(app)
      .post('/api/deportistas')
      .send(deportista);
    expect(createRes.status).toBe(201);

    const loginRes = await request(app)
      .post('/api/deportistas/login')
      .send({ usuario: deportista.usuario, contrasena: deportista.contrasena });
    expect(loginRes.status).toBe(200);
    token = loginRes.body.token;
  });

  afterAll(async () => {
    if (token) {
      await request(app)
        .delete(`/api/deportistas/${deportista.dni}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ dni: deportista.dni, contrasena: deportista.contrasena });
    }
  });

  it('GET /api/deportistas devuelve una colección', async () => {
    const res = await request(app)
      .get('/api/deportistas')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('POST /api/deportistas rechaza un DNI duplicado', async () => {
    const res = await request(app)
      .post('/api/deportistas')
      .send(deportista);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('mensaje', 'El DNI ya existe.');
  });

  it('GET /api/deportistas/:dni devuelve el deportista creado', async () => {
    const res = await request(app)
      .get(`/api/deportistas/${deportista.dni}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data.dni', deportista.dni);
  });

  it('PUT /api/deportistas/:dni actualiza el deportista autenticado', async () => {
    const res = await request(app)
      .put(`/api/deportistas/${deportista.dni}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ apellido: 'Actualizado', altura: 182, peso: 80 });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data.apellido', 'Actualizado');
    expect(res.body.data).toHaveProperty('peso', 80);
  });

  it('DELETE /api/deportistas/:dni elimina el deportista autenticado', async () => {
    const res = await request(app)
      .delete(`/api/deportistas/${deportista.dni}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ dni: deportista.dni, contrasena: deportista.contrasena });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('mensaje', 'Cuenta eliminada correctamente');
    token = undefined;
  });
});
