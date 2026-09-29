import { NextRequest, NextResponse } from 'next/server';

// Real API route (per the migration plan's "prove API routes work" step):
// a thin BFF proxy to the Java backend's /estado/paginado endpoint, so the
// browser only ever talks to this same-origin Next.js app.
//
// Deviation from the plan: the Angular sibling project's /ask BFF
// (angular_estado, branch feat/bff-ask-proxy) turned out to live entirely
// server-side in the Java backend itself (POST /ask there), not in a Node
// proxy inside the Angular app - so there was no Node-side BFF pattern to
// port from that project. This route instead follows the same backend-base-
// URL convention as src/lib/httpClient.ts (NEXT_PUBLIC_API_URL, defaulting
// to a local backend), forwarding query params and the Authorization
// header through to the real backend's GET /estado/paginado.
const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

export async function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams.toString();
  const backendUrl = `${BACKEND_BASE_URL}/estado/paginado${search ? `?${search}` : ''}`;

  const headers: Record<string, string> = {};
  const authorization = request.headers.get('authorization');
  if (authorization) {
    headers.Authorization = authorization;
  }

  try {
    const backendResponse = await fetch(backendUrl, { headers });
    const body = await backendResponse.text();

    return new NextResponse(body, {
      status: backendResponse.status,
      headers: {
        'Content-Type': backendResponse.headers.get('Content-Type') ?? 'application/json',
      },
    });
  } catch {
    return NextResponse.json({ message: 'Failed to reach backend' }, { status: 502 });
  }
}
