import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Login } from './Login';
import { authService } from '../../services/authService';
import { renderWithProviders } from '../../testUtils';

vi.mock('../../services/authService', () => ({
  authService: {
    login: vi.fn(),
  },
}));

const mockNavigate = vi.hoisted(() => vi.fn());
vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

describe('Login', () => {
  beforeEach(() => {
    vi.mocked(authService.login).mockReset();
    mockNavigate.mockReset();
  });

  it('logs in and navigates to the list', async () => {
    vi.mocked(authService.login).mockResolvedValue({ token: 'token', expiresInSeconds: 3600 });
    const user = userEvent.setup();

    renderWithProviders(<Login />);

    await user.type(screen.getByLabelText('Username'), 'admin');
    await user.type(screen.getByLabelText('Password'), 'senha');
    await user.tab();
    await user.click(screen.getByRole('button', { name: 'Log in' }));

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/'));
    expect(authService.login).toHaveBeenCalledWith(
      { username: 'admin', password: 'senha' },
      expect.anything(),
    );
  });

  it('enables the submit button without requiring a blur first', async () => {
    vi.mocked(authService.login).mockResolvedValue({ token: 'token', expiresInSeconds: 3600 });
    const user = userEvent.setup();

    renderWithProviders(<Login />);

    await user.type(screen.getByLabelText('Username'), 'admin');
    await user.type(screen.getByLabelText('Password'), 'senha');

    expect(screen.getByRole('button', { name: 'Log in' })).toBeEnabled();
  });

  it('ignores a second submit fired before the pending state is committed', async () => {
    let resolveLogin!: (value: { token: string; expiresInSeconds: number }) => void;
    vi.mocked(authService.login).mockReturnValue(
      new Promise((resolve) => {
        resolveLogin = resolve;
      }),
    );
    const user = userEvent.setup();

    renderWithProviders(<Login />);

    await user.type(screen.getByLabelText('Username'), 'admin');
    await user.type(screen.getByLabelText('Password'), 'senha');
    const submitButton = screen.getByRole('button', { name: 'Log in' });

    fireEvent.click(submitButton);
    fireEvent.click(submitButton);

    await waitFor(() => expect(authService.login).toHaveBeenCalledTimes(1));

    resolveLogin({ token: 'token', expiresInSeconds: 3600 });
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/'));
  });

  it('shows the backend error message when login fails', async () => {
    vi.mocked(authService.login).mockRejectedValue(new Error('failed'));
    const user = userEvent.setup();

    renderWithProviders(<Login />);

    await user.type(screen.getByLabelText('Username'), 'admin');
    await user.type(screen.getByLabelText('Password'), 'errada');
    await user.tab();
    await user.click(screen.getByRole('button', { name: 'Log in' }));

    expect(await screen.findByText('Invalid username or password.')).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
