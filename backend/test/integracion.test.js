import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { app, initialize } from '../server.js';

const suffix = Date.now().toString();
const entrenador = {
  dni: `TEST-INT-ENT-${suffix}`,
  nombre: 'Entrenador',
  apellido: 'Integracion',
  usuario: `integracion.entrenador.${suffix}`,
  email: `integracion.entrenador.${suffix}@example.com`,
  contrasena: 'test-pass-123',
};
const deportista = {
  dni: `TEST-INT-DEP-${suffix}`,
  nombre: 'Deportista',
  apellido: 'Integracion',
  usuario: `integracion.deportista.${suffix}`,
  email: `integracion.deportista.${suffix}@example.com`,
  contrasena: 'test-pass-123',
};

let entrenamientoId;
let asignacionId;
let deportistaToken;
let entrenadorToken;

async function eliminarEntrenamiento() {
  if (!entrenamientoId) return;
  await request(app)
    .delete(`/api/entrenamientos/${entrenamientoId}`)
    .set('Authorization', `Bearer ${entrenadorToken}`);
  entrenamientoId = undefined;
}

async function eliminarDeportista() {
  if (!deportistaToken) return;
  await request(app)
    .delete(`/api/deportistas/${deportista.dni}`)
    .set('Authorization', `Bearer ${deportistaToken}`)
    .send({ dni: deportista.dni, contrasena: deportista.contrasena });
  deportistaToken = undefined;
}

async function eliminarEntrenador() {
  await request(app)
    .delete(`/api/entrenadores/${entrenador.dni}`)
    .set('Authorization', `Bearer ${entrenadorToken}`)
    .send({ contrasena: entrenador.contrasena });
}

describe('Integración del flujo de asignaciones de entrenamiento', () => {
  beforeAll(async () => {
    await initialize();
  });

  afterAll(async () => {
    if (asignacionId) {
      await request(app).delete(`/api/asignaciones-entrenamientos/${asignacionId}`);
      asignacionId = undefined;
    }
    await eliminarEntrenamiento();
    await eliminarDeportista();
    await eliminarEntrenador();
  });

  it('crea, consulta, completa y elimina una asignación relacionada', async () => {
    const entrenadorRes = await request(app)
      .post('/api/entrenadores')
      .send(entrenador);

    expect(entrenadorRes.status).toBe(201);
    expect(entrenadorRes.body).toHaveProperty('data.dni', entrenador.dni);

    const entrenadorLoginRes = await request(app)
      .post('/login')
      .send({ usuario: entrenador.usuario, contrasena: entrenador.contrasena });
    expect(entrenadorLoginRes.status).toBe(200);
    entrenadorToken = entrenadorLoginRes.body.token;

    const deportistaRes = await request(app)
      .post('/api/deportistas')
      .send(deportista);

    expect(deportistaRes.status).toBe(201);
    expect(deportistaRes.body).toHaveProperty('data.dni', deportista.dni);

    const loginRes = await request(app)
      .post('/login')
      .send({ usuario: deportista.usuario, contrasena: deportista.contrasena });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body).toHaveProperty('token');
    deportistaToken = loginRes.body.token;

    const entrenamientoRes = await request(app)
      .post('/api/entrenamientos')
      .set('Authorization', `Bearer ${deportistaToken}`)
      .send({
        fechaEntrenamiento: '2026-09-09',
        horaEntrenamiento: '08:30',
        deportista: { dni: deportista.dni },
        entrenador: { dni: entrenador.dni },
      });

    expect(entrenamientoRes.status).toBe(201);
    expect(entrenamientoRes.body).toHaveProperty('data.id');
    entrenamientoId = entrenamientoRes.body.data.id;

    const asignacionRes = await request(app)
      .post('/api/asignaciones-entrenamientos')
      .set('Authorization', `Bearer ${entrenadorToken}`)
      .send({
        entrenadorDni: entrenador.dni,
        deportistaDni: deportista.dni,
        entrenamientoId,
        notas: 'Asignación de integración',
      });

    expect(asignacionRes.status).toBe(201);
    expect(asignacionRes.body).toHaveProperty('data.id');
    expect(asignacionRes.body.data).toHaveProperty('notas', 'Asignación de integración');
    expect(asignacionRes.body.data).toHaveProperty('estado', 'pendiente');
    asignacionId = asignacionRes.body.data.id;

    const listadoRes = await request(app)
      .get(`/api/asignaciones-entrenamientos/deportistas/${deportista.dni}`)
      .set('Authorization', `Bearer ${deportistaToken}`);

    expect(listadoRes.status).toBe(200);
    expect(Array.isArray(listadoRes.body.data)).toBe(true);
    expect(listadoRes.body.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: asignacionId,
          notas: 'Asignación de integración',
          estado: 'pendiente',
        }),
      ])
    );

    const estadoRes = await request(app)
      .patch(`/api/asignaciones-entrenamientos/${asignacionId}/estado`)
      .set('Authorization', `Bearer ${deportistaToken}`)
      .send({ estado: 'completado' });

    expect(estadoRes.status).toBe(200);
    expect(estadoRes.body).toHaveProperty('data.id', asignacionId);
    expect(estadoRes.body.data).toHaveProperty('estado', 'completado');

    const listadoActualizadoRes = await request(app)
      .get(`/api/asignaciones-entrenamientos/deportistas/${deportista.dni}`)
      .set('Authorization', `Bearer ${deportistaToken}`);

    expect(listadoActualizadoRes.status).toBe(200);
    expect(listadoActualizadoRes.body.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: asignacionId, estado: 'completado' }),
      ])
    );

    const eliminarRes = await request(app)
      .delete(`/api/asignaciones-entrenamientos/${asignacionId}`)
      .set('Authorization', `Bearer ${entrenadorToken}`);

    expect(eliminarRes.status).toBe(204);
    asignacionId = undefined;

    const listadoFinalRes = await request(app)
      .get(`/api/asignaciones-entrenamientos/deportistas/${deportista.dni}`)
      .set('Authorization', `Bearer ${deportistaToken}`);

    expect(listadoFinalRes.status).toBe(200);
    expect(listadoFinalRes.body.data).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ id: asignacionRes.body.data.id })])
    );
  });
});
