import { act, renderHook } from '@testing-library/react';
import { useErrorMessage } from './useErrorMessage';

describe('useErrorMessage', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts with no error and no requestId', () => {
    const { result } = renderHook(() => useErrorMessage());

    expect(result.current.error).toBeNull();
    expect(result.current.requestId).toBeNull();
  });

  it('sets message and requestId when setError is called', () => {
    const { result } = renderHook(() => useErrorMessage());

    act(() => result.current.setError('Failed to save.', 'req-1'));

    expect(result.current.error).toBe('Failed to save.');
    expect(result.current.requestId).toBe('req-1');
  });

  it('clears the error automatically after the default 5s duration', () => {
    const { result } = renderHook(() => useErrorMessage());

    act(() => result.current.setError('Failed to save.'));
    act(() => vi.advanceTimersByTime(5000));

    expect(result.current.error).toBeNull();
    expect(result.current.requestId).toBeNull();
  });

  it('restarts the timeout when setError is called again before it expires', () => {
    const { result } = renderHook(() => useErrorMessage());

    act(() => result.current.setError('First error.'));
    act(() => vi.advanceTimersByTime(3000));
    act(() => result.current.setError('Second error.'));
    act(() => vi.advanceTimersByTime(3000));

    expect(result.current.error).toBe('Second error.');

    act(() => vi.advanceTimersByTime(2000));
    expect(result.current.error).toBeNull();
  });
});
