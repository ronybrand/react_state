import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EditState } from './EditState';
import { stateService } from '../../services/stateService';
import { createQueryClient, renderWithProviders } from '../../testUtils';
import type { State } from '../../interfaces/state';

vi.mock('../../services/stateService', () => ({
  stateService: {
    get: vi.fn(),
    update: vi.fn(),
  },
}));

const mockNavigate = vi.hoisted(() => vi.fn());
const mockUseParams = vi.hoisted(() => vi.fn(() => ({ id: '1' })));
vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>();
  return { ...actual, useNavigate: () => mockNavigate, useParams: mockUseParams };
});

const state: State = {
  id: 1,
  abbreviation: 'SP',
  name: 'São Paulo',
  createdAt: '2024-01-01T10:00:00Z',
  updatedAt: '2024-01-01T10:00:00Z',
};

describe('EditState', () => {
  beforeEach(() => {
    vi.mocked(stateService.get).mockReset();
    vi.mocked(stateService.update).mockReset();
    mockNavigate.mockReset();
    mockUseParams.mockReturnValue({ id: '1' });
  });

  it('fills the form as soon as the state arrives asynchronously', async () => {
    vi.mocked(stateService.get).mockResolvedValue(state);

    renderWithProviders(<EditState />);

    expect(await screen.findByDisplayValue('São Paulo')).toBeInTheDocument();
    expect(screen.getByDisplayValue('SP')).toBeInTheDocument();
  });

  it('updates the state and navigates to the list', async () => {
    vi.mocked(stateService.get).mockResolvedValue(state);
    vi.mocked(stateService.update).mockResolvedValue(state);
    const user = userEvent.setup();

    renderWithProviders(<EditState />);

    await screen.findByDisplayValue('São Paulo');
    await user.clear(screen.getByLabelText('Name'));
    await user.type(screen.getByLabelText('Name'), 'São Paulo Updated');
    await user.tab();
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() =>
      expect(stateService.update).toHaveBeenCalledWith(
        { ...state, abbreviation: 'SP', name: 'São Paulo Updated' },
        expect.anything(),
      ),
    );
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('shows the backend error message when the fetch fails', async () => {
    vi.mocked(stateService.get).mockRejectedValue(new Error('failed'));

    renderWithProviders(<EditState />);

    expect(await screen.findByText('Failed to fetch state.')).toBeInTheDocument();
  });

  it('shows an error and does not fetch when the route id is invalid', async () => {
    mockUseParams.mockReturnValue({ id: 'abc' });

    renderWithProviders(<EditState />);

    expect(await screen.findByText('Invalid state.')).toBeInTheDocument();
    expect(stateService.get).not.toHaveBeenCalled();
  });

  it('clears a previous load error once the state loads successfully', async () => {
    vi.mocked(stateService.get).mockRejectedValueOnce(new Error('failed'));
    vi.mocked(stateService.get).mockResolvedValueOnce(state);
    const queryClient = createQueryClient();

    renderWithProviders(<EditState />, { queryClient });
    await screen.findByText('Failed to fetch state.');

    act(() => {
      queryClient.invalidateQueries({ queryKey: ['states', 1] });
    });

    await screen.findByDisplayValue('São Paulo');
    expect(screen.queryByText('Failed to fetch state.')).not.toBeInTheDocument();
  });
});
