import { render, screen } from '@testing-library/react';
import { Icon } from './Icon';
import { ICON_PATHS } from './iconPaths';

describe('Icon', () => {
  it('renderiza o path correspondente ao nome informado', () => {
    const { container } = render(<Icon name="trash" />);

    const path = container.querySelector('path');
    expect(path).toHaveAttribute('d', ICON_PATHS.trash);
  });

  it('usa tamanho padrão de 16 e é decorativo para leitores de tela', () => {
    render(<Icon name="plus" />);

    const svg = document.querySelector('svg');
    expect(svg).toHaveAttribute('width', '16');
    expect(svg).toHaveAttribute('height', '16');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });

  it('aplica size e className customizados', () => {
    render(<Icon name="check" size={24} className="icone-check" />);

    const svg = document.querySelector('svg');
    expect(svg).toHaveAttribute('width', '24');
    expect(svg).toHaveAttribute('height', '24');
    expect(svg).toHaveClass('icone-check');
  });

  it('não expõe texto acessível próprio (ícone é sempre decorativo)', () => {
    render(<Icon name="pencil" />);

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });
});
