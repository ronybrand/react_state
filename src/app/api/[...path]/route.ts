import { NextRequest, NextResponse } from 'next/server';

// Full catch-all BFF proxy to the Java backend: every /api/* call the
// browser makes is same-origin against this Next.js app, which forwards it
// on to BACKEND_API_URL server-side. Replaces an earlier version of this
// route that only proxied GET /estado/paginado - that left every other
// call (auth, create/update/delete, actuator/info) going straight from the
// browser to the backend's own origin, which needs CORS enabled there and
// a CSP connect-src naming that origin. Routing everything through here
// removes that requirement entirely.
//
// Deliberately BACKEND_API_URL, not NEXT_PUBLIC_API_URL: a NEXT_PUBLIC_
// var is inlined into the client bundle, so httpClient.ts (running in the
// browser) would read the same value and call the backend directly,
// bypassing this proxy - exactly the CORS/CSP exposure this route exists
// to avoid. Confirmed in production: setting NEXT_PUBLIC_API_URL broke the
// app with connect-src CSP violations and a doubled /estado/estado path
// (httpClient's own /estado prefix on top of the full backend URL).
interface RouteParams {
  params: Promise<{ path: string[] }>;
}

async function proxy(request: NextRequest, params: RouteParams['params']): Promise<NextResponse> {
  // Read per-request, not module-level: a module-level constant is
  // evaluated once at import time, before tests (or any per-request env
  // override) can set BACKEND_API_URL.
  const backendBaseUrl = process.env.BACKEND_API_URL ?? 'http://localhost:8080';
  const { path } = await params;
  const search = request.nextUrl.search;
  const backendUrl = `${backendBaseUrl}/${path.join('/')}${search}`;

  const headers: Record<string, string> = {};
  const authorization = request.headers.get('authorization');
  if (authorization) {
    headers.Authorization = authorization;
  }
  const contentType = request.headers.get('content-type');
  if (contentType) {
    headers['Content-Type'] = contentType;
  }

  const hasBody =
    request.method !== 'GET' && request.method !== 'HEAD' && request.method !== 'DELETE';

  try {
    const backendResponse = await fetch(backendUrl, {
      method: request.method,
      headers,
      body: hasBody ? await request.text() : undefined,
    });
    const body = await backendResponse.text();

    return new NextResponse(body || null, {
      status: backendResponse.status,
      headers: {
        'Content-Type': backendResponse.headers.get('Content-Type') ?? 'application/json',
      },
    });
  } catch {
    return NextResponse.json({ message: 'Failed to reach backend' }, { status: 502 });
  }
}

export function GET(request: NextRequest, { params }: RouteParams) {
  return proxy(request, params);
}

export function POST(request: NextRequest, { params }: RouteParams) {
  return proxy(request, params);
}

export function PUT(request: NextRequest, { params }: RouteParams) {
  return proxy(request, params);
}

export function DELETE(request: NextRequest, { params }: RouteParams) {
  return proxy(request, params);
}
