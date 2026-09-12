import { fireEvent, render, screen } from '@testing-library/react';
import Card from './Card';

test('Card muestra su contenido y ejecuta su acción', () => {
  const onClick = jest.fn();
  render(<Card title="Historial" desc="Ver entrenamientos" onClick={onClick} />);

  expect(screen.getByText('Historial')).toBeInTheDocument();
  expect(screen.getByText('Ver entrenamientos')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /Historial/ }));
  expect(onClick).toHaveBeenCalledTimes(1);
});