import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormEstado } from './FormEstado';

describe('FormEstado', () => {
  it('mantém o botão de salvar desabilitado enquanto o form é inválido', () => {
    render(<FormEstado onEnviar={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'Salvar' })).toBeDisabled();
  });

  it('habilita o botão de salvar quando sigla e nome são válidos', async () => {
    const user = userEvent.setup();
    render(<FormEstado onEnviar={vi.fn()} />);

    await user.type(screen.getByLabelText('Sigla'), 'SP');
    await user.type(screen.getByLabelText('Nome'), 'São Paulo');
    await user.tab();

    expect(screen.getByRole('button', { name: 'Salvar' })).toBeEnabled();
  });

  it('marca a sigla como inválida e associa a mensagem de erro via aria-describedby', async () => {
    const user = userEvent.setup();
    render(<FormEstado onEnviar={vi.fn()} />);

    const sigla = screen.getByLabelText('Sigla');
    await user.click(sigla);
    await user.tab();

    expect(sigla).toHaveAttribute('aria-invalid', 'true');
    expect(sigla).toHaveAttribute('aria-describedby', 'sigla-erro');
    expect(screen.getByText('Digite a sigla do estado.')).toBeInTheDocument();
  });

  it('mantém o botão desabilitado quando a prop desabilitado é true, mesmo com o form válido', async () => {
    const user = userEvent.setup();
    render(
      <FormEstado
        valoresIniciais={{ sigla: 'SP', nome: 'São Paulo' }}
        desabilitado
        onEnviar={vi.fn()}
      />,
    );

    await user.click(screen.getByLabelText('Nome'));
    await user.tab();

    expect(screen.getByRole('button', { name: 'Salvar' })).toBeDisabled();
  });

  it('chama onEnviar com os dados do form ao submeter', async () => {
    const user = userEvent.setup();
    const onEnviar = vi.fn();
    render(<FormEstado onEnviar={onEnviar} />);

    await user.type(screen.getByLabelText('Sigla'), 'RJ');
    await user.type(screen.getByLabelText('Nome'), 'Rio de Janeiro');
    await user.tab();
    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(onEnviar).toHaveBeenCalledWith(
      { sigla: 'RJ', nome: 'Rio de Janeiro' },
      expect.anything(),
    );
  });
});
