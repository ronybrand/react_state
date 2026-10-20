import { SessionExpiredListener } from './SessionExpiredListener';
import { notifySessionExpired } from '../../lib/sessionExpired';
import { renderWithProviders } from '../../testUtils';

const replace = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
  redirect: vi.fn(),
  permanentRedirect: vi.fn(),
}));

describe('SessionExpiredListener', () => {
  beforeEach(() => {
    replace.mockClear();
  });

  it('navigates to /login when the session expires', () => {
    renderWithProviders(<SessionExpiredListener />);

    notifySessionExpired();

    expect(replace).toHaveBeenCalledWith('/en/login');
  });

  it('stops navigating after being unmounted', () => {
    const { unmount } = renderWithProviders(<SessionExpiredListener />);

    unmount();
    notifySessionExpired();

    expect(replace).not.toHaveBeenCalled();
  });

  it('renders nothing', () => {
    const { container } = renderWithProviders(<SessionExpiredListener />);

    expect(container).toBeEmptyDOMElement();
  });
});
