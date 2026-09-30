import { notifySessionExpired, onSessionExpired } from './sessionExpired';

describe('sessionExpired', () => {
  it('calls a subscribed listener when notified', () => {
    const listener = vi.fn();
    onSessionExpired(listener);

    notifySessionExpired();

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('calls every subscribed listener', () => {
    const first = vi.fn();
    const second = vi.fn();
    onSessionExpired(first);
    onSessionExpired(second);

    notifySessionExpired();

    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(1);
  });

  it('stops calling a listener once unsubscribed', () => {
    const listener = vi.fn();
    const unsubscribe = onSessionExpired(listener);

    unsubscribe();
    notifySessionExpired();

    expect(listener).not.toHaveBeenCalled();
  });

  it('does nothing when notified with no listeners subscribed', () => {
    expect(() => notifySessionExpired()).not.toThrow();
  });
});
