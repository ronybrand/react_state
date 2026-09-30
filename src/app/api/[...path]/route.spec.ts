import { NextRequest } from 'next/server';
import { GET, POST, PUT, DELETE } from './route';

const BACKEND_BASE_URL = 'http://backend.internal:8080';
const REQUEST_ID = '123e4567-e89b-12d3-a456-426614174000';

function jsonResponse(body: string, status: number, headers: Record<string, string> = {}) {
  return new Response(body, {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  });
}

function makeRequest(
  method: string,
  url: string,
  init?: { authorization?: string; body?: string },
): NextRequest {
  const headers = new Headers();
  if (init?.authorization) {
    headers.set('authorization', init.authorization);
  }
  return new NextRequest(url, { method, headers, body: init?.body });
}

describe('app/api/[...path] route (backend proxy)', () => {
  const originalEnv = process.env['BACKEND_API_URL'];
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    process.env['BACKEND_API_URL'] = BACKEND_BASE_URL;
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    process.env['BACKEND_API_URL'] = originalEnv;
    vi.unstubAllGlobals();
  });

  it('proxies a GET, forwarding the query string and Authorization header', async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ content: [] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const request = makeRequest('GET', 'http://localhost:3000/api/estado/paginado?size=100', {
      authorization: 'Bearer token-123',
    });
    const response = await GET(request, {
      params: Promise.resolve({ path: ['estado', 'paginado'] }),
    });

    expect(fetchMock).toHaveBeenCalledWith(
      `${BACKEND_BASE_URL}/estado/paginado?size=100`,
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({ Authorization: 'Bearer token-123' }),
      }),
    );
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ content: [] });
  });

  it('proxies a POST, forwarding the request body', async () => {
    fetchMock.mockResolvedValue(jsonResponse('{}', 201));

    const request = makeRequest('POST', 'http://localhost:3000/api/estado/', {
      body: JSON.stringify({ nome: 'Minas Gerais', sigla: 'MG' }),
    });
    const response = await POST(request, { params: Promise.resolve({ path: ['estado', ''] }) });

    expect(fetchMock).toHaveBeenCalledWith(
      `${BACKEND_BASE_URL}/estado/`,
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ nome: 'Minas Gerais', sigla: 'MG' }),
      }),
    );
    expect(response.status).toBe(201);
  });

  it('proxies a PUT to the id-suffixed path', async () => {
    fetchMock.mockResolvedValue(jsonResponse('{}', 200));

    const request = makeRequest('PUT', 'http://localhost:3000/api/estado/1', {
      body: JSON.stringify({ nome: 'Minas Gerais', sigla: 'MG' }),
    });
    const response = await PUT(request, { params: Promise.resolve({ path: ['estado', '1'] }) });

    expect(fetchMock).toHaveBeenCalledWith(
      `${BACKEND_BASE_URL}/estado/1`,
      expect.objectContaining({ method: 'PUT' }),
    );
    expect(response.status).toBe(200);
  });

  it('proxies a DELETE', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));

    const request = makeRequest('DELETE', 'http://localhost:3000/api/estado/1');
    const response = await DELETE(request, { params: Promise.resolve({ path: ['estado', '1'] }) });

    expect(fetchMock).toHaveBeenCalledWith(
      `${BACKEND_BASE_URL}/estado/1`,
      expect.objectContaining({ method: 'DELETE' }),
    );
    expect(response.status).toBe(204);
  });

  it('does not forward an Authorization header when the request has none', async () => {
    fetchMock.mockResolvedValue(jsonResponse('{}', 200));

    const request = makeRequest('GET', 'http://localhost:3000/api/actuator/info');
    await GET(request, { params: Promise.resolve({ path: ['actuator', 'info'] }) });

    const [, options] = fetchMock.mock.calls[0] as [string, { headers: Record<string, string> }];
    expect(options.headers['Authorization']).toBeUndefined();
  });

  it('forwards X-Request-Id to the backend and back to the client', async () => {
    fetchMock.mockResolvedValue(jsonResponse('{}', 200, { 'X-Request-Id': REQUEST_ID }));

    const request = new NextRequest('http://localhost:3000/api/estado/1', {
      method: 'GET',
      headers: new Headers({ 'x-request-id': REQUEST_ID }),
    });
    const response = await GET(request, { params: Promise.resolve({ path: ['estado', '1'] }) });

    const [, options] = fetchMock.mock.calls[0] as [string, { headers: Record<string, string> }];
    expect(options.headers['X-Request-Id']).toBe(REQUEST_ID);
    expect(response.headers.get('X-Request-Id')).toBe(REQUEST_ID);
  });

  it('answers 500 in production when BACKEND_API_URL is not configured', async () => {
    delete process.env['BACKEND_API_URL'];
    vi.stubEnv('NODE_ENV', 'production');

    const request = makeRequest('GET', 'http://localhost:3000/api/estado/1');
    const response = await GET(request, { params: Promise.resolve({ path: ['estado', '1'] }) });

    expect(response.status).toBe(500);
    expect(fetchMock).not.toHaveBeenCalled();
    vi.unstubAllEnvs();
  });

  it('answers 504 when the backend times out, and passes an abort signal to fetch', async () => {
    fetchMock.mockRejectedValue(new DOMException('timed out', 'TimeoutError'));

    const request = makeRequest('GET', 'http://localhost:3000/api/estado/paginado');
    const response = await GET(request, {
      params: Promise.resolve({ path: ['estado', 'paginado'] }),
    });

    const [, options] = fetchMock.mock.calls[0] as [string, { signal?: AbortSignal }];
    expect(options.signal).toBeInstanceOf(AbortSignal);
    expect(response.status).toBe(504);
    await expect(response.json()).resolves.toEqual({ message: 'Backend timed out' });
  });

  it('drops an X-Request-Id that is not a UUID instead of forwarding it', async () => {
    fetchMock.mockResolvedValue(jsonResponse('{}', 200, { 'X-Request-Id': '<script>x</script>' }));

    const request = new NextRequest('http://localhost:3000/api/estado/1', {
      method: 'GET',
      headers: new Headers({ 'x-request-id': '<script>alert(1)</script>' }),
    });
    const response = await GET(request, { params: Promise.resolve({ path: ['estado', '1'] }) });

    const [, options] = fetchMock.mock.calls[0] as [string, { headers: Record<string, string> }];
    expect(options.headers['X-Request-Id']).toBeUndefined();
    expect(response.headers.get('X-Request-Id')).toBeNull();
  });

  it.each([
    [['actuator', 'heapdump']],
    [['actuator', 'env']],
    [['v3', 'api-docs']],
    [['..', 'secret']],
    [['estado', '..', '..', 'secret']],
    [['estado', '1', 'extra']],
    [['estado/../../secret']],
    [['auth', 'login', 'x']],
    [['estado', 'abc']],
  ])('does not proxy a path outside the allowlist: %j', async (path) => {
    const request = makeRequest('GET', 'http://localhost:3000/api/whatever');
    const response = await GET(request, { params: Promise.resolve({ path }) });

    expect(response.status).toBe(404);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('proxies the login endpoint', async () => {
    fetchMock.mockResolvedValue(jsonResponse('{"token":"t"}', 200));

    const request = makeRequest('POST', 'http://localhost:3000/api/auth/login', { body: '{}' });
    const response = await POST(request, { params: Promise.resolve({ path: ['auth', 'login'] }) });

    expect(response.status).toBe(200);
  });

  it('refuses a non-JSON backend body (HTML would run on the app origin) with a 502', async () => {
    fetchMock.mockResolvedValue(
      new Response('<script>alert(1)</script>', {
        status: 200,
        headers: { 'Content-Type': 'text/html' },
      }),
    );

    const request = makeRequest('GET', 'http://localhost:3000/api/estado/1');
    const response = await GET(request, { params: Promise.resolve({ path: ['estado', '1'] }) });

    expect(response.status).toBe(502);
    expect(await response.text()).not.toContain('<script>');
  });

  it('accepts +json media types and charset parameters', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse('{}', 400, { 'Content-Type': 'application/problem+json; charset=utf-8' }),
    );

    const request = makeRequest('GET', 'http://localhost:3000/api/estado/1');
    const response = await GET(request, { params: Promise.resolve({ path: ['estado', '1'] }) });

    expect(response.status).toBe(400);
  });

  it('marks proxied responses with a locked-down CSP', async () => {
    fetchMock.mockResolvedValue(jsonResponse('{}', 200));

    const request = makeRequest('GET', 'http://localhost:3000/api/estado/1');
    const response = await GET(request, { params: Promise.resolve({ path: ['estado', '1'] }) });

    expect(response.headers.get('Content-Security-Policy')).toBe(
      "default-src 'none'; frame-ancestors 'none'; sandbox",
    );
  });

  describe('client IP forwarding', () => {
    const CLIENT_IP = '203.0.113.7';

    async function proxiedHeaders(incoming: Record<string, string>) {
      fetchMock.mockResolvedValue(jsonResponse('{}', 200));
      const request = new NextRequest('http://localhost:3000/api/estado/1', {
        method: 'GET',
        headers: new Headers(incoming),
      });
      await GET(request, { params: Promise.resolve({ path: ['estado', '1'] }) });
      const [, options] = fetchMock.mock.calls[0] as [string, { headers: Record<string, string> }];
      return options.headers;
    }

    afterEach(() => {
      vi.unstubAllEnvs();
    });

    it('sends the Vercel client IP with the shared secret', async () => {
      vi.stubEnv('BACKEND_PROXY_SECRET', 's3cret');

      const headers = await proxiedHeaders({ 'x-vercel-forwarded-for': CLIENT_IP });

      expect(headers['X-Client-IP']).toBe(CLIENT_IP);
      expect(headers['X-Proxy-Secret']).toBe('s3cret');
    });

    it('sends nothing when BACKEND_PROXY_SECRET is not configured', async () => {
      vi.stubEnv('BACKEND_PROXY_SECRET', '');

      const headers = await proxiedHeaders({ 'x-vercel-forwarded-for': CLIENT_IP });

      expect(headers['X-Client-IP']).toBeUndefined();
      expect(headers['X-Proxy-Secret']).toBeUndefined();
    });

    it('sends nothing when the request has no Vercel client IP (local dev, direct hit)', async () => {
      vi.stubEnv('BACKEND_PROXY_SECRET', 's3cret');

      const headers = await proxiedHeaders({});

      expect(headers['X-Client-IP']).toBeUndefined();
      expect(headers['X-Proxy-Secret']).toBeUndefined();
    });

    it('sends nothing when the forwarded value is not a single IP address', async () => {
      vi.stubEnv('BACKEND_PROXY_SECRET', 's3cret');

      const headers = await proxiedHeaders({ 'x-vercel-forwarded-for': '1.2.3.4, 5.6.7.8' });

      expect(headers['X-Client-IP']).toBeUndefined();
    });

    it('never copies X-Client-IP / X-Proxy-Secret supplied by the caller', async () => {
      vi.stubEnv('BACKEND_PROXY_SECRET', 's3cret');

      const headers = await proxiedHeaders({
        'x-client-ip': '6.6.6.6',
        'x-proxy-secret': 'guess',
        'x-vercel-forwarded-for': CLIENT_IP,
      });

      expect(headers['X-Client-IP']).toBe(CLIENT_IP);
      expect(headers['X-Proxy-Secret']).toBe('s3cret');
    });

    it('does not forward a caller-supplied X-Client-IP when there is no Vercel IP', async () => {
      vi.stubEnv('BACKEND_PROXY_SECRET', 's3cret');

      const headers = await proxiedHeaders({ 'x-client-ip': '6.6.6.6', 'x-proxy-secret': 'guess' });

      expect(headers['X-Client-IP']).toBeUndefined();
      expect(headers['X-Proxy-Secret']).toBeUndefined();
    });
  });

  it('returns a 502 when the backend is unreachable', async () => {
    fetchMock.mockRejectedValue(new Error('ECONNREFUSED'));

    const request = makeRequest('GET', 'http://localhost:3000/api/estado/paginado');
    const response = await GET(request, {
      params: Promise.resolve({ path: ['estado', 'paginado'] }),
    });

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({ message: 'Failed to reach backend' });
  });
});
