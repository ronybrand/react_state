import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CreateState } from './CreateState';
import { stateService } from '../../services/stateService';
import { renderWithProviders } from '../../testUtils';

vi.mock('../../services/stateService', () => ({
  stateService: {
    create: vi.fn(),
  },
}));

const mockNavigate = vi.hoisted(() => vi.fn());
vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

describe('CreateState', () => {
  beforeEach(() => {
    vi.mocked(stateService.create).mockReset();
    mockNavigate.mockReset();
  });

  it('creates the state and navigates to the list', async () => {
    vi.mocked(stateService.create).mockResolvedValue({
      id: 1,
      abbreviation: 'RJ',
      name: 'Rio de Janeiro',
      createdAt: '2024-01-01T10:00:00Z',
      updatedAt: '2024-01-01T10:00:00Z',
    });
    const user = userEvent.setup();

    renderWithProviders(<CreateState />);

    await user.type(screen.getByLabelText('Abbreviation'), 'RJ');
    await user.type(screen.getByLabelText('Name'), 'Rio de Janeiro');
    await user.tab();
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/'));
    expect(stateService.create).toHaveBeenCalledWith(
      { abbreviation: 'RJ', name: 'Rio de Janeiro' },
      expect.anything(),
    );
  });

  it('shows the backend error message when creation fails', async () => {
    vi.mocked(stateService.create).mockRejectedValue(new Error('failed'));
    const user = userEvent.setup();

    renderWithProviders(<CreateState />);

    await user.type(screen.getByLabelText('Abbreviation'), 'RJ');
    await user.type(screen.getByLabelText('Name'), 'Rio de Janeiro');
    await user.tab();
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(await screen.findByText('Failed to create state.')).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
