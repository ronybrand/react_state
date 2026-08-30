import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { RotaErro } from './RotaErro';

function ComponenteComErro(): never {
  throw new Error('falha de renderização');
}

describe('RotaErro', () => {
  it('mostra mensagem de erro e link para o início quando a rota lança um erro', async () => {
    const router = createMemoryRouter(
      [{ path: '/', element: <ComponenteComErro />, errorElement: <RotaErro /> }],
      { initialEntries: ['/'] },
    );

    render(<RouterProvider router={router} />);

    expect(await screen.findByRole('alert')).toHaveTextContent('Algo deu errado');
    expect(screen.getByRole('link', { name: 'Voltar para o início' })).toHaveAttribute('href', '/');
  });
});
