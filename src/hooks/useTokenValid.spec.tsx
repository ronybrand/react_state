import { act, renderHook } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { useTokenValid } from './useTokenValid';
import { clearToken, setToken } from '../lib/tokenStorage';

function tokenWithExpiration(exp: number): string {
  const payload = btoa(JSON.stringify({ exp })).replace(/\+/g, '-').replace(/\//g, '_');
  return `header.${payload}.signature`;
}

describe('useTokenValid', () => {
  afterEach(() => {
    clearToken();
    vi.useRealTimers();
  });

  it('reflects the stored token on the client', () => {
    setToken(tokenWithExpiration(Math.floor(Date.now() / 1000) + 3600));
    const { result } = renderHook(() => useTokenValid());
    expect(result.current).toBe(true);
  });

  it('flips to false when the token expires, via polling', () => {
    vi.useFakeTimers();
    setToken(tokenWithExpiration(Math.floor(Date.now() / 1000) + 1));
    const { result } = renderHook(() => useTokenValid());
    expect(result.current).toBe(true);

    act(() => {
      vi.advanceTimersByTime(6000);
    });

    expect(result.current).toBe(false);
  });

  it('updates on a storage event from another tab', () => {
    const { result } = renderHook(() => useTokenValid());
    expect(result.current).toBe(false);

    setToken(tokenWithExpiration(Math.floor(Date.now() / 1000) + 3600));
    act(() => {
      window.dispatchEvent(new Event('storage'));
    });

    expect(result.current).toBe(true);
  });

  it('is null during server rendering, even with a token present', () => {
    setToken(tokenWithExpiration(Math.floor(Date.now() / 1000) + 3600));
    function Probe() {
      return <span>{String(useTokenValid())}</span>;
    }
    expect(renderToString(<Probe />)).toContain('null');
  });
});
