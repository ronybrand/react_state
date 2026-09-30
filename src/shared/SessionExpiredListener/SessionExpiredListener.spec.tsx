import { render } from '@testing-library/react';
import { SessionExpiredListener } from './SessionExpiredListener';
import { notifySessionExpired } from '../../lib/sessionExpired';

const replace = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
}));

describe('SessionExpiredListener', () => {
  beforeEach(() => {
    replace.mockClear();
  });

  it('navigates to /login when the session expires', () => {
    render(<SessionExpiredListener />);

    notifySessionExpired();

    expect(replace).toHaveBeenCalledWith('/login');
  });

  it('stops navigating after being unmounted', () => {
    const { unmount } = render(<SessionExpiredListener />);

    unmount();
    notifySessionExpired();

    expect(replace).not.toHaveBeenCalled();
  });

  it('renders nothing', () => {
    const { container } = render(<SessionExpiredListener />);

    expect(container).toBeEmptyDOMElement();
  });
});
