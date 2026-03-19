import { test, expect } from '../../fixtures/api.fixture';
import { dataFactory } from '../../utils/dataFactory';
import { validateUser, validateError, assertSchema } from '../../utils/schemas';

test.describe('@regression @api Users API — Minimal Suite', () => {
  // ── Smoke ─────────────────────────────────────
  test('@smoke GET all users returns a non-empty list', async ({ usersApi }) => {

    const res = await usersApi.getAll();
    const body = await res.json();

    expect(res.status()).toBe(200);
    expect(Array.isArray(body.users)).toBe(true);
    expect(body.users.length).toBeGreaterThan(0);
  });

  test('@smoke GET user by id satisfies user schema', async ({ usersApi }) => {
    const res = await usersApi.getById(1);
    const body = await res.json();

    expect(res.status()).toBe(200);
    assertSchema(validateUser, body, 'GET /users/1');
  });

  
  test('GET all users responds within acceptable performance', async ({ usersApi }) => {
    const start = Date.now();
    const res = await usersApi.getAll();
    const duration = Date.now() - start;

    expect(res.status()).toBe(200);
    expect(duration).toBeLessThan(800); // performance threshold
  });

  // ── CRUD (keep one full update path) ───────────
  test('CREATE a user returns the created resource', async ({ usersApi }) => {
    const payload = dataFactory.user();
    const res = await usersApi.create(payload);
    const body = await res.json();

    expect(res.status()).toBe(201);
    expect(body.id).toBeDefined();
    // spot check key fields only
    expect(body.firstName).toBe(payload.firstName);
    expect(body.lastName).toBe(payload.lastName);
  });

  test('UPDATE (PUT) modifies fields as requested', async ({ usersApi }) => {
    const res = await usersApi.update(1, { firstName: 'Updated', age: 30 });
    const body = await res.json();

    expect(res.status()).toBe(200);
    expect(body).toMatchObject({ id: 1, firstName: 'Updated', age: 30 });
  });

  test('DELETE marks user as deleted', async ({ usersApi }) => {
    const res = await usersApi.remove(1);
    const body = await res.json();

    expect(res.status()).toBe(200);
    expect(body.isDeleted).toBe(true);
  });

  // ── Search (kept minimal) ──────────────────────
  test('SEARCH users by name returns results', async ({ usersApi }) => {
    const start=Date.now();
    const res = await usersApi.search('John');
    const body = await res.json();

    expect(res.status()).toBe(200);
    expect(Date.now()-start).toBeLessThan(800);
    expect(Array.isArray(body.users)).toBe(true);
    expect(body.users.length).toBeGreaterThan(0);
  });

  // ── Negative ───────────────────────────────────
  test('GET non-existent user returns 404 with error schema', async ({ usersApi }) => {
    const res = await usersApi.getById(99999);
    const body = await res.json();

    expect(res.status()).toBe(404);
    assertSchema(validateError, body, 'GET /users/99999');
  });
});
