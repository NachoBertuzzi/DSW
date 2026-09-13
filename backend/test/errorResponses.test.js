import { afterEach, describe, expect, it, vi } from 'vitest';
import entrenadorService from '../services/entrenadorService.js';
import entrenadorController from '../controllers/entrenador.controller.js';

describe('Respuestas de errores internos', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('no expone detalles internos al eliminar un entrenador', async () => {
    vi.spyOn(entrenadorService, 'getById').mockResolvedValue({ dni: 'ENT-ERROR' });
    vi.spyOn(entrenadorService, 'verifyPassword').mockResolvedValue(true);
    vi.spyOn(entrenadorService, 'remove').mockRejectedValue(
      new Error('Unknown table entrenadores or SQL connection detail')
    );
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const response = {
      status: vi.fn(),
      json: vi.fn(),
    };
    response.status.mockReturnValue(response);

    await entrenadorController.remove(
      {
        params: { dni: 'ENT-ERROR' },
        body: { contrasena: 'password' },
      },
      response,
    );

    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.json).toHaveBeenCalledWith({ mensaje: 'Error interno del servidor' });
    expect(response.json.mock.calls[0][0]).not.toHaveProperty('detalle');
    expect(response.json.mock.calls[0][0]).not.toHaveProperty('stack');
  });
});
