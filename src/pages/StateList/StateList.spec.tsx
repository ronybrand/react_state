import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ListaEstado } from './ListaEstado';
import { estadoService } from '../../services/estadoService';
import { renderComProviders } from '../../testUtils';
import type { Estado } from '../../interfaces/estado';

vi.mock('../../services/estadoService', () => ({
  estadoService: {
    listar: vi.fn(),
    excluir: vi.fn(),
  },
}));

const estados: Estado[] = [
  {
    id: 1,
    sigla: 'SP',
    nome: 'São Paulo',
    dataHoraCadastro: '2024-01-01T10:00:00Z',
    dataHoraUltimaAtualizacao: '2024-01-01T10:00:00Z',
  },
];

describe('ListaEstado', () => {
  beforeEach(() => {
    vi.mocked(estadoService.listar).mockReset();
    vi.mocked(estadoService.excluir).mockReset();
  });

  it('mostra os estados assim que a busca resolve', async () => {
    vi.mocked(estadoService.listar).mockResolvedValue(estados);

    renderComProviders(<ListaEstado />);

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(await screen.findByText('São Paulo')).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('mostra a mensagem de vazio quando não há estados', async () => {
    vi.mocked(estadoService.listar).mockResolvedValue([]);

    renderComProviders(<ListaEstado />);

    expect(await screen.findByText('Nenhum estado cadastrado.')).toBeInTheDocument();
  });

  it('mostra a mensagem de erro do backend quando a busca falha', async () => {
    vi.mocked(estadoService.listar).mockRejectedValue(new Error('falhou'));

    renderComProviders(<ListaEstado />);

    expect(await screen.findByText('Falha ao buscar estados.')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('rotula os botões de ação da linha com a sigla do estado', async () => {
    vi.mocked(estadoService.listar).mockResolvedValue(estados);

    renderComProviders(<ListaEstado />);

    expect(await screen.findByRole('link', { name: 'Editar SP' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Excluir SP' })).toBeInTheDocument();
  });

  it('exclui um estado após confirmação', async () => {
    vi.mocked(estadoService.listar).mockResolvedValue(estados);
    vi.mocked(estadoService.excluir).mockResolvedValue(undefined);
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const user = userEvent.setup();

    renderComProviders(<ListaEstado />);

    await user.click(await screen.findByRole('button', { name: 'Excluir SP' }));

    await waitFor(() => expect(estadoService.excluir).toHaveBeenCalledWith(1, expect.anything()));
  });

  it('não exclui quando a confirmação é cancelada', async () => {
    vi.mocked(estadoService.listar).mockResolvedValue(estados);
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    const user = userEvent.setup();

    renderComProviders(<ListaEstado />);

    await user.click(await screen.findByRole('button', { name: 'Excluir SP' }));

    expect(estadoService.excluir).not.toHaveBeenCalled();
  });
});
