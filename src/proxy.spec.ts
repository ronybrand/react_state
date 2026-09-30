import { NextRequest } from 'next/server';
import { proxy, config } from './proxy';

function run() {
  const response = proxy(new NextRequest('http://localhost:3000/'));
  return response.headers.get('Content-Security-Policy') ?? '';
}

describe('proxy (CSP)', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('sets a nonce + strict-dynamic script-src and no unsafe-inline for scripts', () => {
    const csp = run();
    const scriptSrc = csp.split('; ').find((d) => d.startsWith('script-src')) ?? '';

    expect(scriptSrc).toMatch(/'nonce-[A-Za-z0-9+/=]+'/);
    expect(scriptSrc).toContain("'strict-dynamic'");
    expect(scriptSrc).not.toContain("'unsafe-inline'");
    expect(scriptSrc).not.toContain("'unsafe-eval'");
  });

  it('uses a fresh nonce per request', () => {
    expect(run()).not.toEqual(run());
  });

  it('forwards the same nonce and CSP on the request headers Next reads while rendering', () => {
    const response = proxy(new NextRequest('http://localhost:3000/'));
    const csp = response.headers.get('Content-Security-Policy');
    const overridden = response.headers.get('x-middleware-override-headers') ?? '';

    expect(overridden).toContain('content-security-policy');
    expect(overridden).toContain('x-nonce');
    expect(response.headers.get('x-middleware-request-content-security-policy')).toBe(csp);
    const nonce = /'nonce-([^']+)'/.exec(csp ?? '')?.[1];
    expect(response.headers.get('x-middleware-request-x-nonce')).toBe(nonce);
  });

  it('allows unsafe-eval only in development', () => {
    vi.stubEnv('NODE_ENV', 'development');
    expect(run()).toContain("'unsafe-eval'");
  });

  it('exports a matcher that skips api, static assets and prefetches', () => {
    const [entry] = config.matcher as { source: string; missing: unknown[] }[];
    expect(entry.source).toContain('api');
    expect(entry.source).toContain('_next/static');
    expect(entry.missing).toHaveLength(2);
  });
});
