import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { app, initialize } from '../server.js';

const suffix = Date.now().toString();
const entrenador = {
  dni: `TEST-ENT-${suffix}`,
  nombre: 'Entrenador',
  apellido: 'Funcional',
  usuario: `entrenador.test.${suffix}`,
  email: `entrenador.test.${suffix}@example.com`,
  contrasena: 'test-pass-123',
  especialidad: 'Fuerza',
  tel: '3415550000',
};
let token;

describe('Peticiones funcionales de entrenadores', () => {
  beforeAll(async () => {
    await initialize();

    const createRes = await request(app)
      .post('/api/entrenadores')
      .send(entrenador);
    expect(createRes.status).toBe(201);

    const loginRes = await request(app)
      .post('/api/entrenadores/login')
      .send({ usuario: entrenador.usuario, contrasena: entrenador.contrasena });
    expect(loginRes.status).toBe(200);
    token = loginRes.body.token;
  });

  afterAll(async () => {
    await request(app)
      .delete(`/api/entrenadores/${entrenador.dni}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ contrasena: entrenador.contrasena });
  });

  it('GET /api/entrenadores devuelve una colección', async () => {
    const res = await request(app)
      .get('/api/entrenadores')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('POST /api/entrenadores crea un entrenador', async () => {
    const res = await request(app)
      .post('/api/entrenadores')
      .send(entrenador);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('data.dni', entrenador.dni);
    expect(res.body.data).toHaveProperty('email', entrenador.email);
  });

  it('GET /api/entrenadores/:dni devuelve el entrenador creado', async () => {
    const res = await request(app)
      .get(`/api/entrenadores/${entrenador.dni}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data.dni', entrenador.dni);
  });

  it('PUT /api/entrenadores/:dni actualiza el entrenador', async () => {
    const res = await request(app)
      .put(`/api/entrenadores/${entrenador.dni}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        apellido: 'Actualizado',
        especialidad: 'Movilidad',
        contrasena: entrenador.contrasena,
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data.apellido', 'Actualizado');
    expect(res.body.data).toHaveProperty('especialidad', 'Movilidad');
  });

  it('DELETE /api/entrenadores/:dni elimina el entrenador con contraseña', async () => {
    const res = await request(app)
      .delete(`/api/entrenadores/${entrenador.dni}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ contrasena: entrenador.contrasena });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('mensaje', 'Cuenta eliminada correctamente');
  });
});
