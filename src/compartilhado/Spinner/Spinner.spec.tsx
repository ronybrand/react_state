import { render, screen } from '@testing-library/react';
import { Spinner } from './Spinner';

describe('Spinner', () => {
  it('expõe role="status" para leitores de tela', () => {
    render(<Spinner />);

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('inclui texto "Carregando..." acessível apenas para leitores de tela', () => {
    render(<Spinner />);

    expect(screen.getByText('Carregando...')).toHaveClass('sr-only');
  });
});
