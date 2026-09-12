import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import CoachChat from './CoachChat';

beforeEach(() => {
  window.matchMedia = () => ({ matches: false });
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ respuesta: 'Probá una rutina de fuerza progresiva.' }),
  });
});

afterEach(() => {
  jest.restoreAllMocks();
});

test('permite enviar una consulta y muestra la respuesta del asistente', async () => {
  render(<CoachChat />);

  fireEvent.click(screen.getByRole('button', { name: 'Abrir asistente' }));
  fireEvent.change(screen.getByLabelText('Consulta para el asistente'), {
    target: { value: '¿Qué ejercicios sirven para fuerza?' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Enviar consulta' }));

  await waitFor(() => {
    expect(screen.getByText('Probá una rutina de fuerza progresiva.')).toBeInTheDocument();
  });
  expect(global.fetch).toHaveBeenCalledWith(
    expect.stringContaining('/ia/chat'),
    expect.objectContaining({ method: 'POST' }),
  );
});
