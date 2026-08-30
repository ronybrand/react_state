import { act, renderHook } from '@testing-library/react';
import { useErrorMsg } from './useErrorMsg';

describe('useErrorMsg', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('começa sem erro nem requestId', () => {
    const { result } = renderHook(() => useErrorMsg());

    expect(result.current.error).toBeNull();
    expect(result.current.requestId).toBeNull();
  });

  it('define mensagem e requestId ao chamar setError', () => {
    const { result } = renderHook(() => useErrorMsg());

    act(() => result.current.setError('Falha ao salvar.', 'req-1'));

    expect(result.current.error).toBe('Falha ao salvar.');
    expect(result.current.requestId).toBe('req-1');
  });

  it('limpa o erro automaticamente após a duração padrão de 5s', () => {
    const { result } = renderHook(() => useErrorMsg());

    act(() => result.current.setError('Falha ao salvar.'));
    act(() => vi.advanceTimersByTime(5000));

    expect(result.current.error).toBeNull();
    expect(result.current.requestId).toBeNull();
  });

  it('reinicia o timeout quando setError é chamado novamente antes de expirar', () => {
    const { result } = renderHook(() => useErrorMsg());

    act(() => result.current.setError('Primeiro erro.'));
    act(() => vi.advanceTimersByTime(3000));
    act(() => result.current.setError('Segundo erro.'));
    act(() => vi.advanceTimersByTime(3000));

    expect(result.current.error).toBe('Segundo erro.');

    act(() => vi.advanceTimersByTime(2000));
    expect(result.current.error).toBeNull();
  });
});
