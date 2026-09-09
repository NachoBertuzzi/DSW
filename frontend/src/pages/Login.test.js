import { render, screen, fireEvent } from '@testing-library/react';
import LoginPage from './Login';

describe('LoginPage', () => {

  test('muestra los campos de email, contraseña y el botón Entrar', () => {
    render(<LoginPage />);

    expect(screen.getByText('Iniciar Sesión')).toBeInTheDocument();

    expect(
      screen.getByRole('textbox')
    ).toBeInTheDocument();

    expect(
      screen.getByText('Contraseña:')
    ).toBeInTheDocument();

    expect(
      screen.getByRole('button', { name: 'Entrar' })
    ).toBeInTheDocument();
  });

  test('permite escribir email y contraseña', () => {
    render(<LoginPage />);

    const emailInput = screen.getByRole('textbox');

    const passwordInput = document.querySelector(
      'input[type="password"]'
    );

    fireEvent.change(emailInput, {
      target: { value: 'test@test.com' }
    });

    fireEvent.change(passwordInput, {
      target: { value: '123456' }
    });

    expect(emailInput.value).toBe('test@test.com');
    expect(passwordInput.value).toBe('123456');
  });

});