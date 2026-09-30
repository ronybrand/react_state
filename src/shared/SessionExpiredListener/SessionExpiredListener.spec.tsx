import { render } from '@testing-library/react';
import { SessionExpiredListener } from './SessionExpiredListener';
import { notifySessionExpired } from '../../lib/sessionExpired';

const push = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}));

describe('SessionExpiredListener', () => {
  beforeEach(() => {
    push.mockClear();
  });

  it('navigates to /login when the session expires', () => {
    render(<SessionExpiredListener />);

    notifySessionExpired();

    expect(push).toHaveBeenCalledWith('/login');
  });

  it('stops navigating after being unmounted', () => {
    const { unmount } = render(<SessionExpiredListener />);

    unmount();
    notifySessionExpired();

    expect(push).not.toHaveBeenCalled();
  });

  it('renders nothing', () => {
    const { container } = render(<SessionExpiredListener />);

    expect(container).toBeEmptyDOMElement();
  });
});
