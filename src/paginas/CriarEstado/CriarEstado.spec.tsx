import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CriarEstado } from './CriarEstado';
import { estadoService } from '../../services/estadoService';
import { renderComProviders } from '../../testUtils';

vi.mock('../../services/estadoService', () => ({
  estadoService: {
    criar: vi.fn(),
  },
}));

const mockNavigate = vi.hoisted(() => vi.fn());
vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

describe('CriarEstado', () => {
  beforeEach(() => {
    vi.mocked(estadoService.criar).mockReset();
    mockNavigate.mockReset();
  });

  it('cria o estado e navega para a lista', async () => {
    vi.mocked(estadoService.criar).mockResolvedValue({
      id: 1,
      sigla: 'RJ',
      nome: 'Rio de Janeiro',
      dataHoraCadastro: '2024-01-01T10:00:00Z',
      dataHoraUltimaAtualizacao: '2024-01-01T10:00:00Z',
    });
    const user = userEvent.setup();

    renderComProviders(<CriarEstado />);

    await user.type(screen.getByLabelText('Sigla'), 'RJ');
    await user.type(screen.getByLabelText('Nome'), 'Rio de Janeiro');
    await user.tab();
    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/'));
    expect(estadoService.criar).toHaveBeenCalledWith(
      { sigla: 'RJ', nome: 'Rio de Janeiro' },
      expect.anything(),
    );
  });

  it('mostra a mensagem de erro do backend quando a criação falha', async () => {
    vi.mocked(estadoService.criar).mockRejectedValue(new Error('falhou'));
    const user = userEvent.setup();

    renderComProviders(<CriarEstado />);

    await user.type(screen.getByLabelText('Sigla'), 'RJ');
    await user.type(screen.getByLabelText('Nome'), 'Rio de Janeiro');
    await user.tab();
    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(await screen.findByText('Falha ao criar estado.')).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
