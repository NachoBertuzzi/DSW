import { fireEvent, render, screen } from '@testing-library/react';
import Back from './Back';

test('Back ejecuta la acción al volver', () => {
  const onClick = jest.fn();
  render(<Back onClick={onClick} />);

  fireEvent.click(screen.getByRole('button', { name: /Volver/ }));
  expect(onClick).toHaveBeenCalledTimes(1);
});