import { test, expect } from '@playwright/test';

const BASE_URL = process.env.API_BASE || 'https://dummyjson.com';

const VALID_USER = {
  username: process.env.USER || 'emilys',
  password: process.env.PASS || 'emilyspass',
};

// Helper — login and return parsed body
async function loginAndParse(request: any, credentials = VALID_USER) {
  const res = await request.post(`${BASE_URL}/auth/login`, { data: credentials });
  const body = await res.json();
  return { res, body };
}

test.describe('Auth — Minimal but Complete', () => {
  // ─────────────────────────────────────────────
  // Smoke: Valid login returns tokens
  // ─────────────────────────────────────────────
  test('@smoke login returns 200 with access & refresh tokens', async ({ request }) => {
    const { res, body } = await loginAndParse(request);

    expect(res.status()).toBe(200);
    expect(typeof body.accessToken).toBe('string');
    expect(typeof body.refreshToken).toBe('string');
    expect(body.accessToken.length).toBeGreaterThan(0);
    expect(body.refreshToken.length).toBeGreaterThan(0);
  });

  // ─────────────────────────────────────────────
  // JWT structure quick check
  // ─────────────────────────────────────────────
  test('accessToken looks like a JWT (3 parts, base64url-safe)', async ({ request }) => {
    const { body } = await loginAndParse(request);
    const parts = body.accessToken.split('.');
    expect(parts).toHaveLength(3);
    for (const p of parts) {
      expect(p).toMatch(/^[A-Za-z0-9\-_]+$/);
    }
  });

  // ─────────────────────────────────────────────
  // Protected route using token
  // ─────────────────────────────────────────────
  test('@smoke can call /auth/me with access token', async ({ request }) => {
    const { body } = await loginAndParse(request);
    const meRes = await request.get(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${body.accessToken}` },
    });
    expect(meRes.status()).toBe(200);
    const me = await meRes.json();
    expect(me).toHaveProperty('username', VALID_USER.username);
    expect(me).toHaveProperty('email');
  });

  // ─────────────────────────────────────────────
  // Refresh flow: get new token and use it
  // ─────────────────────────────────────────────
  test('refresh returns new token that works on /auth/me', async ({ request }) => {
    const { body } = await loginAndParse(request);
    const refreshRes = await request.post(`${BASE_URL}/auth/refresh`, {
      data: { refreshToken: body.refreshToken, expiresInMins: 1 },
    });
    expect(refreshRes.status()).toBe(200);
    const refreshed = await refreshRes.json();
    expect(refreshed).toHaveProperty('accessToken');
    expect(refreshed.accessToken.length).toBeGreaterThan(0);

    const meRes = await request.get(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${refreshed.accessToken}` },
    });
    expect(meRes.status()).toBe(200);
    const me = await meRes.json();
    expect(me).toHaveProperty('username', VALID_USER.username);
  });

  // ─────────────────────────────────────────────
  // Negative basics
  // ─────────────────────────────────────────────
  test('wrong password → 400 with error message', async ({ request }) => {
    const res = await request.post(`${BASE_URL}/auth/login`, {
      data: { username: VALID_USER.username, password: 'wrongpassword' },
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body).toHaveProperty('message');
  });

  test('protected route without token → 401', async ({ request }) => {
    const res = await request.get(`${BASE_URL}/auth/me`);
    expect(res.status()).toBe(401);
  });

  test('tampered token → 401/500 (provider-dependent)', async ({ request }) => {
    const res = await request.get(`${BASE_URL}/auth/me`, {
      headers: { Authorization: 'Bearer fake.token.here' },
    });
    expect([401, 500]).toContain(res.status());
  });
});