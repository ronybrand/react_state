import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Login from './page';
import { authService } from '../../services/authService';
import { renderWithProviders } from '../../testUtils';

vi.mock('../../services/authService', () => ({
  authService: {
    login: vi.fn(),
  },
}));

// Deviation from the Vite original: that version mocked react-router's
// useNavigate(). This mocks next/navigation's useRouter() instead, since
// Login.tsx now calls router.push() rather than navigate().
const mockPush = vi.hoisted(() => vi.fn());
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe('Login', () => {
  beforeEach(() => {
    vi.mocked(authService.login).mockReset();
    mockPush.mockReset();
  });

  it('logs in and navigates to the list', async () => {
    vi.mocked(authService.login).mockResolvedValue({ token: 'token', expiresInSeconds: 3600 });
    const user = userEvent.setup();

    renderWithProviders(<Login />);

    await user.type(screen.getByLabelText('Username'), 'admin');
    await user.type(screen.getByLabelText('Password'), 'senha');
    await user.tab();
    await user.click(screen.getByRole('button', { name: 'Log in' }));

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/'));
    expect(authService.login).toHaveBeenCalledWith(
      { username: 'admin', password: 'senha' },
      expect.anything(),
    );
  });

  it('shows the public demo credentials', () => {
    renderWithProviders(<Login />);

    const hint = screen.getByTestId('demo-credentials');

    expect(hint).toHaveTextContent('admin');
    expect(hint).toHaveTextContent('Estado-Demo-2026');
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
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/'));
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
    expect(mockPush).not.toHaveBeenCalled();
  });
});
