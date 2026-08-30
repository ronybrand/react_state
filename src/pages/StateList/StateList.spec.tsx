import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AxiosError, AxiosHeaders } from 'axios';
import { StateList } from './StateList';
import { stateService } from '../../services/stateService';
import { renderWithProviders } from '../../testUtils';
import type { State } from '../../interfaces/state';

vi.mock('../../services/stateService', () => ({
  stateService: {
    list: vi.fn(),
    delete: vi.fn(),
  },
}));

const states: State[] = [
  {
    id: 1,
    abbreviation: 'SP',
    name: 'São Paulo',
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-01T10:00:00Z',
  },
];

describe('StateList', () => {
  beforeEach(() => {
    vi.mocked(stateService.list).mockReset();
    vi.mocked(stateService.delete).mockReset();
  });

  it('shows the states as soon as the fetch resolves', async () => {
    vi.mocked(stateService.list).mockResolvedValue(states);

    renderWithProviders(<StateList />);

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(await screen.findByText('São Paulo')).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('shows the empty message when there are no states', async () => {
    vi.mocked(stateService.list).mockResolvedValue([]);

    renderWithProviders(<StateList />);

    expect(await screen.findByText('No states registered.')).toBeInTheDocument();
  });

  it('shows the backend error message when the fetch fails', async () => {
    vi.mocked(stateService.list).mockRejectedValue(new Error('failed'));

    renderWithProviders(<StateList />);

    expect(await screen.findByText('Failed to fetch states.')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('shows the request id when the fetch fails with a correlated backend error', async () => {
    const error = new AxiosError('error', undefined, undefined, undefined, {
      data: { requestId: '550e8400-e29b-41d4-a716-446655440000' },
      status: 500,
      statusText: 'Internal Server Error',
      headers: new AxiosHeaders(),
      config: { headers: new AxiosHeaders() },
    });
    vi.mocked(stateService.list).mockRejectedValue(error);

    renderWithProviders(<StateList />);

    expect(
      await screen.findByText('Reference ID: 550e8400-e29b-41d4-a716-446655440000'),
    ).toBeInTheDocument();
  });

  it('labels the row action buttons with the state abbreviation', async () => {
    vi.mocked(stateService.list).mockResolvedValue(states);

    renderWithProviders(<StateList />);

    expect(await screen.findByRole('link', { name: 'Edit SP' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete SP' })).toBeInTheDocument();
  });

  it('deletes a state after confirmation', async () => {
    vi.mocked(stateService.list).mockResolvedValue(states);
    vi.mocked(stateService.delete).mockResolvedValue(undefined);
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const user = userEvent.setup();

    renderWithProviders(<StateList />);

    await user.click(await screen.findByRole('button', { name: 'Delete SP' }));

    await waitFor(() => expect(stateService.delete).toHaveBeenCalledWith(1, expect.anything()));
  });

  it('does not delete when the confirmation is cancelled', async () => {
    vi.mocked(stateService.list).mockResolvedValue(states);
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    const user = userEvent.setup();

    renderWithProviders(<StateList />);

    await user.click(await screen.findByRole('button', { name: 'Delete SP' }));

    expect(stateService.delete).not.toHaveBeenCalled();
  });
});
