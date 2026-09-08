import type { Page, Route } from '@playwright/test';

export interface StateFixture {
  id: number;
  nome: string;
  sigla: string;
  dataHoraCadastro: string;
  dataHoraUltimaAtualizacao: string | null;
}

export const STATES: StateFixture[] = [
  {
    id: 1,
    nome: 'São Paulo',
    sigla: 'SP',
    dataHoraCadastro: '2026-01-10T09:00:00',
    dataHoraUltimaAtualizacao: '2026-01-10T09:00:00',
  },
  {
    id: 2,
    nome: 'Rio de Janeiro',
    sigla: 'RJ',
    dataHoraCadastro: '2026-01-11T09:00:00',
    dataHoraUltimaAtualizacao: '2026-01-11T09:00:00',
  },
];

// The backend only has GET /estado/paginado (the unpaginated GET /estado
// was removed, see ADR 0018 in the estado repo) - every list response
// follows Spring Data's { content, page } envelope, not a plain array.
export function pageOf(states: StateFixture[]): unknown {
  return {
    content: states,
    page: { size: 100, number: 0, totalElements: states.length, totalPages: 1 },
  };
}

async function fulfillDelayed(
  route: Route,
  body: unknown,
  status = 200,
  delayMs = 0,
): Promise<void> {
  if (delayMs > 0) {
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
  await route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
}

export function mockStateList(
  page: Page,
  states: StateFixture[] = STATES,
  delayMs = 0,
): Promise<void> {
  return page.route('**/api/estado/paginado**', (route) => {
    if (route.request().method() !== 'GET') {
      return route.fallback();
    }
    return fulfillDelayed(route, pageOf(states), 200, delayMs);
  });
}

export function mockGetState(page: Page, state: StateFixture, delayMs = 0): Promise<void> {
  return page.route(`**/api/estado/${state.id}`, (route) => {
    if (route.request().method() !== 'GET') {
      return route.fallback();
    }
    return fulfillDelayed(route, state, 200, delayMs);
  });
}

export function mockCreateState(page: Page, status = 201): Promise<void> {
  return page.route('**/api/estado/', (route) => {
    if (route.request().method() !== 'POST') {
      return route.fallback();
    }
    const body = status === 201 ? (route.request().postData() ?? '{}') : '{}';
    return route.fulfill({ status, contentType: 'application/json', body });
  });
}

// PUT goes to the id in the URL now (PUT /estado/{id}, see ADR 0018 in the
// estado repo), not to the `/estado/` root.
export function mockUpdateState(page: Page, id: number, status = 200): Promise<void> {
  return page.route(`**/api/estado/${id}`, (route) => {
    if (route.request().method() !== 'PUT') {
      return route.fallback();
    }
    const body = status === 200 ? (route.request().postData() ?? '{}') : '{}';
    return route.fulfill({ status, contentType: 'application/json', body });
  });
}

export function mockDeleteState(page: Page, id: number, onDelete?: () => void): Promise<void> {
  return page.route(`**/api/estado/${id}`, (route) => {
    if (route.request().method() !== 'DELETE') {
      return route.fallback();
    }
    onDelete?.();
    return route.fulfill({ status: 204 });
  });
}

export function mockError(
  page: Page,
  urlPattern: string,
  status: number,
  method?: string,
): Promise<void> {
  return page.route(urlPattern, (route) => {
    if (method && route.request().method() !== method) {
      return route.fallback();
    }
    return route.fulfill({ status, contentType: 'application/json', body: '{}' });
  });
}

export function mockLogin(page: Page, status = 200): Promise<void> {
  return page.route('**/api/auth/login', (route) => {
    const body =
      status === 200
        ? { token: 'e2e-test-token', expiresInSeconds: 3600 }
        : { message: 'Invalid username or password.' };
    return route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
  });
}
