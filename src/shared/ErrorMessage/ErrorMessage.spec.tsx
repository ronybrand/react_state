import { render, screen } from '@testing-library/react';
import { ErrorMsg } from './ErrorMsg';

describe('ErrorMsg', () => {
  it('não renderiza nada quando não há erro', () => {
    const { container } = render(<ErrorMsg error={null} requestId={null} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('renderiza a mensagem em role="alert" com aria-live assertive', () => {
    render(<ErrorMsg error="Falha ao buscar estados." requestId={null} />);

    const alerta = screen.getByRole('alert');
    expect(alerta).toHaveTextContent('Falha ao buscar estados.');
    expect(alerta).toHaveAttribute('aria-live', 'assertive');
  });

  it('mostra o ID de referência quando informado', () => {
    render(<ErrorMsg error="Falha ao buscar estados." requestId="abc-123" />);

    expect(screen.getByText(/ID de referência: abc-123/)).toBeInTheDocument();
  });

  it('não mostra ID de referência quando ausente', () => {
    render(<ErrorMsg error="Falha ao buscar estados." requestId={null} />);

    expect(screen.queryByText(/ID de referência/)).not.toBeInTheDocument();
  });
});
