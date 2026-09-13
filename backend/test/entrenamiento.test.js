import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { app, initialize } from '../server.js';

const suffix = Date.now().toString();
const deportista = {
  dni: `TEST-DEP-ENT-${suffix}`,
  nombre: 'Deportista',
  apellido: 'Funcional',
  usuario: `deportista.entrenamiento.${suffix}`,
  email: `deportista.entrenamiento.${suffix}@example.com`,
  contrasena: 'test-pass-123',
};
const entrenador = {
  dni: `TEST-COACH-ENT-${suffix}`,
  nombre: 'Entrenador',
  apellido: 'Funcional',
  usuario: `coach.entrenamiento.${suffix}`,
  email: `coach.entrenamiento.${suffix}@example.com`,
  contrasena: 'test-pass-123',
};
const otroDeportista = {
  dni: `TEST-DEP-OTRO-${suffix}`,
  nombre: 'Otro deportista',
  apellido: 'Funcional',
  usuario: `otro.deportista.entrenamiento.${suffix}`,
  email: `otro.deportista.entrenamiento.${suffix}@example.com`,
  contrasena: 'test-pass-123',
};

let entrenamientoId;
let otroEntrenamientoId;
let deportistaToken;
let otroDeportistaToken;
let entrenadorToken;

describe('Peticiones funcionales de entrenamientos', () => {
  beforeAll(async () => {
    await initialize();

    const deportistaRes = await request(app)
      .post('/api/deportistas')
      .send(deportista);
    expect(deportistaRes.status).toBe(201);

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ usuario: deportista.usuario, contrasena: deportista.contrasena });
    expect(loginRes.status).toBe(200);
    deportistaToken = loginRes.body.token;

    const entrenadorRes = await request(app)
      .post('/api/entrenadores')
      .send(entrenador);
    expect(entrenadorRes.status).toBe(201);

    const entrenadorLoginRes = await request(app)
      .post('/api/auth/login')
      .send({ usuario: entrenador.usuario, contrasena: entrenador.contrasena });
    expect(entrenadorLoginRes.status).toBe(200);
    entrenadorToken = entrenadorLoginRes.body.token;

    const otroDeportistaRes = await request(app)
      .post('/api/deportistas')
      .send(otroDeportista);
    expect(otroDeportistaRes.status).toBe(201);

    const otroLoginRes = await request(app)
      .post('/api/auth/login')
      .send({ usuario: otroDeportista.usuario, contrasena: otroDeportista.contrasena });
    expect(otroLoginRes.status).toBe(200);
    otroDeportistaToken = otroLoginRes.body.token;

    const vincularRes = await request(app)
      .put(`/api/deportistas/${deportista.dni}/entrenador`)
      .set('Authorization', `Bearer ${deportistaToken}`)
      .send({ entrenadorDni: entrenador.dni });
    expect(vincularRes.status).toBe(200);
  });

  afterAll(async () => {
    if (entrenamientoId) {
      await request(app)
        .delete(`/api/entrenamientos/${entrenamientoId}`)
        .set('Authorization', `Bearer ${entrenadorToken}`);
    }
    if (otroEntrenamientoId) {
      await request(app)
        .delete(`/api/entrenamientos/${otroEntrenamientoId}`)
        .set('Authorization', `Bearer ${otroDeportistaToken}`);
    }
    await request(app)
      .delete(`/api/deportistas/${deportista.dni}`)
      .set('Authorization', `Bearer ${deportistaToken}`)
      .send({ dni: deportista.dni, contrasena: deportista.contrasena });
    await request(app)
      .delete(`/api/entrenadores/${entrenador.dni}`)
      .set('Authorization', `Bearer ${entrenadorToken}`)
      .send({ contrasena: entrenador.contrasena });
    await request(app)
      .delete(`/api/deportistas/${otroDeportista.dni}`)
      .set('Authorization', `Bearer ${otroDeportistaToken}`)
      .send({ dni: otroDeportista.dni, contrasena: otroDeportista.contrasena });
  });

  it('GET /api/entrenamientos devuelve una colección', async () => {
    const res = await request(app)
      .get('/api/entrenamientos')
      .set('Authorization', `Bearer ${deportistaToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('POST /api/entrenamientos crea un entrenamiento relacionado', async () => {
    const res = await request(app)
      .post('/api/entrenamientos')
      .set('Authorization', `Bearer ${deportistaToken}`)
      .send({
        fechaEntrenamiento: '2026-09-09',
        horaEntrenamiento: '08:30',
        deportista: { dni: deportista.dni },
        entrenador: { dni: entrenador.dni },
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('data.id');
    expect(res.body.data).toHaveProperty('fechaEntrenamiento');
    entrenamientoId = res.body.data.id;
  });

  it('GET /api/entrenamientos/:id devuelve el entrenamiento creado', async () => {
    const res = await request(app)
      .get(`/api/entrenamientos/${entrenamientoId}`)
      .set('Authorization', `Bearer ${deportistaToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data.id', entrenamientoId);
    expect(res.body.data.deportista).toHaveProperty('dni', deportista.dni);
    expect(res.body.data.entrenador).toHaveProperty('dni', entrenador.dni);
  });

  it('rechaza el acceso de un deportista al entrenamiento de otro', async () => {
    const createRes = await request(app)
      .post('/api/entrenamientos')
      .set('Authorization', `Bearer ${otroDeportistaToken}`)
      .send({
        fechaEntrenamiento: '2026-09-10',
        horaEntrenamiento: '10:00',
      });

    expect(createRes.status).toBe(201);
    otroEntrenamientoId = createRes.body.data.id;

    const getRes = await request(app)
      .get(`/api/entrenamientos/${otroEntrenamientoId}`)
      .set('Authorization', `Bearer ${deportistaToken}`);
    expect(getRes.status).toBe(403);

    const updateRes = await request(app)
      .patch(`/api/entrenamientos/${otroEntrenamientoId}`)
      .set('Authorization', `Bearer ${deportistaToken}`)
      .send({ horaEntrenamiento: '11:00' });
    expect(updateRes.status).toBe(403);

    const deleteRes = await request(app)
      .delete(`/api/entrenamientos/${otroEntrenamientoId}`)
      .set('Authorization', `Bearer ${deportistaToken}`);
    expect(deleteRes.status).toBe(403);
  });

  it('PUT /api/entrenamientos/:id actualiza el horario', async () => {
    const res = await request(app)
      .put(`/api/entrenamientos/${entrenamientoId}`)
      .set('Authorization', `Bearer ${deportistaToken}`)
      .send({ horaEntrenamiento: '09:45' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data.id', entrenamientoId);
    expect(res.body.data).toHaveProperty('horaEntrenamiento', '09:45');
  });

  it('DELETE /api/entrenamientos/:id elimina el entrenamiento', async () => {
    const res = await request(app)
      .delete(`/api/entrenamientos/${entrenamientoId}`)
      .set('Authorization', `Bearer ${deportistaToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message', 'Entrenamiento eliminado');
    entrenamientoId = undefined;
  });
});
