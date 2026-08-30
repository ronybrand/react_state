import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EditarEstado } from './EditarEstado';
import { estadoService } from '../../services/estadoService';
import { renderComProviders } from '../../testUtils';
import type { Estado } from '../../interfaces/estado';

vi.mock('../../services/estadoService', () => ({
  estadoService: {
    buscar: vi.fn(),
    atualizar: vi.fn(),
  },
}));

const mockNavigate = vi.hoisted(() => vi.fn());
vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>();
  return { ...actual, useNavigate: () => mockNavigate, useParams: () => ({ id: '1' }) };
});

const estado: Estado = {
  id: 1,
  sigla: 'SP',
  nome: 'São Paulo',
  dataHoraCadastro: '2024-01-01T10:00:00Z',
  dataHoraUltimaAtualizacao: '2024-01-01T10:00:00Z',
};

describe('EditarEstado', () => {
  beforeEach(() => {
    vi.mocked(estadoService.buscar).mockReset();
    vi.mocked(estadoService.atualizar).mockReset();
    mockNavigate.mockReset();
  });

  it('preenche o form assim que o estado chega de forma assíncrona', async () => {
    vi.mocked(estadoService.buscar).mockResolvedValue(estado);

    renderComProviders(<EditarEstado />);

    expect(await screen.findByDisplayValue('São Paulo')).toBeInTheDocument();
    expect(screen.getByDisplayValue('SP')).toBeInTheDocument();
  });

  it('atualiza o estado e navega para a lista', async () => {
    vi.mocked(estadoService.buscar).mockResolvedValue(estado);
    vi.mocked(estadoService.atualizar).mockResolvedValue(estado);
    const user = userEvent.setup();

    renderComProviders(<EditarEstado />);

    await screen.findByDisplayValue('São Paulo');
    await user.clear(screen.getByLabelText('Nome'));
    await user.type(screen.getByLabelText('Nome'), 'São Paulo Editado');
    await user.tab();
    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    await waitFor(() =>
      expect(estadoService.atualizar).toHaveBeenCalledWith(
        { ...estado, sigla: 'SP', nome: 'São Paulo Editado' },
        expect.anything(),
      ),
    );
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('mostra a mensagem de erro do backend quando a busca falha', async () => {
    vi.mocked(estadoService.buscar).mockRejectedValue(new Error('falhou'));

    renderComProviders(<EditarEstado />);

    expect(await screen.findByText('Falha ao buscar estado.')).toBeInTheDocument();
  });
});
