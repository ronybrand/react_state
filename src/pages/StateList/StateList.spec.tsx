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

  afterEach(() => {
    // Guards against fake timers leaking into the next test if a
    // fake-timer test fails before reaching its own vi.useRealTimers().
    vi.useRealTimers();
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

  it('shows the English fallback, not the backend message, when the backend fails', async () => {
    // The backend has no i18n - every message it sends is hardcoded
    // Portuguese (see CustomGlobalExceptionHandler.java in the estado
    // repo). This UI is English throughout, so showing that text verbatim
    // would mix languages on screen - the fallback string is always used
    // instead, the backend message is never rendered.
    const error = new AxiosError('error', undefined, undefined, undefined, {
      data: { message: 'Estado nao encontrado: id=999' },
      status: 404,
      statusText: 'Not Found',
      headers: new AxiosHeaders(),
      config: { headers: new AxiosHeaders() },
    });
    vi.mocked(stateService.list).mockRejectedValue(error);

    renderWithProviders(<StateList />);

    expect(await screen.findByText('Failed to fetch states.')).toBeInTheDocument();
    expect(screen.queryByText('Estado nao encontrado: id=999')).not.toBeInTheDocument();
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
    const user = userEvent.setup();

    renderWithProviders(<StateList />);

    await user.click(await screen.findByRole('button', { name: 'Delete SP' }));
    expect(screen.getByText('Are you sure you want to delete SP?')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Confirm' }));

    await waitFor(() => expect(stateService.delete).toHaveBeenCalledWith(1, expect.anything()));
  });

  it('shows an error message when deletion fails', async () => {
    vi.mocked(stateService.list).mockResolvedValue(states);
    vi.mocked(stateService.delete).mockRejectedValue(new Error('failed'));
    const user = userEvent.setup();

    renderWithProviders(<StateList />);

    await user.click(await screen.findByRole('button', { name: 'Delete SP' }));
    await user.click(screen.getByRole('button', { name: 'Confirm' }));

    expect(await screen.findByText('Failed to delete state.')).toBeInTheDocument();
  });

  it('does not delete when the confirmation is cancelled', async () => {
    vi.mocked(stateService.list).mockResolvedValue(states);
    const user = userEvent.setup();

    renderWithProviders(<StateList />);

    await user.click(await screen.findByRole('button', { name: 'Delete SP' }));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(stateService.delete).not.toHaveBeenCalled();
  });

  it('debounces the search box, calling list once with the latest value after 300ms', async () => {
    // Real timers here, not fake ones: userEvent.type's internal per-key
    // delay plus React Query's own scheduling made fake timers + act()
    // brittle (hangs) in this combination. The 300ms debounce is short
    // enough to just let it elapse for real.
    vi.mocked(stateService.list).mockResolvedValue(states);
    const user = userEvent.setup();

    renderWithProviders(<StateList />);
    await screen.findByText('São Paulo');
    vi.mocked(stateService.list).mockClear();

    const input = screen.getByPlaceholderText('Search by name or abbreviation...');
    await user.type(input, 'santa');

    expect(stateService.list).not.toHaveBeenCalled();
    await waitFor(() => expect(stateService.list).toHaveBeenCalledWith('santa', undefined), {
      timeout: 1000,
    });
  });

  it('sorts by abbreviation on first click, and toggles direction on the next click', async () => {
    vi.mocked(stateService.list).mockResolvedValue(states);
    const user = userEvent.setup();

    renderWithProviders(<StateList />);
    await screen.findByText('São Paulo');
    vi.mocked(stateService.list).mockClear();

    await user.click(screen.getByRole('button', { name: /Abbreviation/i }));
    await waitFor(() => expect(stateService.list).toHaveBeenCalledWith(undefined, 'sigla,asc'));

    await user.click(screen.getByRole('button', { name: /Abbreviation/i }));
    await waitFor(() => expect(stateService.list).toHaveBeenCalledWith(undefined, 'sigla,desc'));
  });

  it('sorts by name when the Name column header is clicked', async () => {
    vi.mocked(stateService.list).mockResolvedValue(states);
    const user = userEvent.setup();

    renderWithProviders(<StateList />);
    await screen.findByText('São Paulo');
    vi.mocked(stateService.list).mockClear();

    await user.click(screen.getByRole('button', { name: /^Name/i }));

    await waitFor(() => expect(stateService.list).toHaveBeenCalledWith(undefined, 'nome,asc'));
  });

  it('shows a sort indicator icon only on the active column', async () => {
    vi.mocked(stateService.list).mockResolvedValue(states);
    const user = userEvent.setup();

    renderWithProviders(<StateList />);
    await screen.findByText('São Paulo');

    // Sorting changes the TanStack Query key (it includes sort), so React
    // Query treats it as a brand-new query and the table unmounts behind
    // the spinner until it resolves - re-querying the DOM after each click
    // (instead of reusing button references captured before it) avoids
    // asserting against nodes React has already thrown away.
    await user.click(screen.getByRole('button', { name: /Abbreviation/i }));
    await screen.findByText('São Paulo');
    expect(screen.getByRole('button', { name: /Abbreviation/i }).querySelector('svg')).toBeTruthy();
    expect(screen.getByRole('button', { name: /^Name/i }).querySelector('svg')).toBeFalsy();

    await user.click(screen.getByRole('button', { name: /^Name/i }));
    await screen.findByText('São Paulo');
    expect(screen.getByRole('button', { name: /^Name/i }).querySelector('svg')).toBeTruthy();
    expect(screen.getByRole('button', { name: /Abbreviation/i }).querySelector('svg')).toBeFalsy();
  });

  it('exposes the sort state via aria-sort on the active column header', async () => {
    vi.mocked(stateService.list).mockResolvedValue(states);
    const user = userEvent.setup();

    renderWithProviders(<StateList />);
    await screen.findByText('São Paulo');

    expect(screen.getByRole('button', { name: /Abbreviation/i }).closest('th')).toHaveAttribute(
      'aria-sort',
      'none',
    );

    await user.click(screen.getByRole('button', { name: /Abbreviation/i }));
    await screen.findByText('São Paulo');
    expect(screen.getByRole('button', { name: /Abbreviation/i }).closest('th')).toHaveAttribute(
      'aria-sort',
      'ascending',
    );

    await user.click(screen.getByRole('button', { name: /Abbreviation/i }));
    await screen.findByText('São Paulo');
    expect(screen.getByRole('button', { name: /Abbreviation/i }).closest('th')).toHaveAttribute(
      'aria-sort',
      'descending',
    );
  });
});
