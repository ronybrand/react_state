import { NextRequest } from 'next/server';
import { GET, POST, PUT, DELETE } from './route';

const BACKEND_BASE_URL = 'http://backend.internal:8080';

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
  const originalEnv = process.env['NEXT_PUBLIC_API_URL'];
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    process.env['NEXT_PUBLIC_API_URL'] = BACKEND_BASE_URL;
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    process.env['NEXT_PUBLIC_API_URL'] = originalEnv;
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
    fetchMock.mockResolvedValue(new Response('{}', { status: 201 }));

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
    fetchMock.mockResolvedValue(new Response('{}', { status: 200 }));

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
    fetchMock.mockResolvedValue(new Response('{}', { status: 200 }));

    const request = makeRequest('GET', 'http://localhost:3000/api/actuator/info');
    await GET(request, { params: Promise.resolve({ path: ['actuator', 'info'] }) });

    const [, options] = fetchMock.mock.calls[0] as [string, { headers: Record<string, string> }];
    expect(options.headers['Authorization']).toBeUndefined();
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
