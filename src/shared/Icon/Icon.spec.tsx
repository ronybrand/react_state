import { render, screen } from '@testing-library/react';
import { Icon } from './Icon';
import { ICON_PATHS } from './iconPaths';

describe('Icon', () => {
  it('renders the path matching the given name', () => {
    const { container } = render(<Icon name="trash" />);

    const path = container.querySelector('path');
    expect(path).toHaveAttribute('d', ICON_PATHS.trash);
  });

  it('defaults to size 16 and is decorative for screen readers', () => {
    render(<Icon name="plus" />);

    const svg = document.querySelector('svg');
    expect(svg).toHaveAttribute('width', '16');
    expect(svg).toHaveAttribute('height', '16');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });

  it('applies a custom size and className', () => {
    render(<Icon name="check" size={24} className="check-icon" />);

    const svg = document.querySelector('svg');
    expect(svg).toHaveAttribute('width', '24');
    expect(svg).toHaveAttribute('height', '24');
    expect(svg).toHaveClass('check-icon');
  });

  it('exposes no accessible text of its own (icon is always decorative)', () => {
    render(<Icon name="pencil" />);

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });
});
