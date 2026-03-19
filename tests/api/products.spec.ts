import { test, expect } from '../../fixtures/api.fixture';
import { dataFactory } from '../../utils/dataFactory';
import { validateProduct, validateError, assertSchema } from '../../utils/schemas';

test.describe('@regression @api Products API — Minimal Suite', () => {

  // ── Smoke Tests ───────────────────────────────
  test('@smoke GET all products returns a non-empty list', async ({ productsApi }) => {
    const res = await productsApi.getAll();
    const body = await res.json();

    expect(res.status()).toBe(200);
    expect(Array.isArray(body.products)).toBe(true);
    expect(body.products.length).toBeGreaterThan(0);
  });

  test('@smoke GET product by id returns correct schema', async ({ productsApi }) => {
    const res = await productsApi.getById(1);
    const body = await res.json();

    expect(res.status()).toBe(200);
    assertSchema(validateProduct, body, 'GET /products/1');
  });

  // ── Pagination & Filtering (merged minimal) ─────
  test('GET products with pagination returns limited set', async ({ productsApi }) => {
    const res = await productsApi.getAll({ limit: 5, skip: 5 });
    const body = await res.json();

    expect(res.status()).toBe(200);
    expect(body.products.length).toBeLessThanOrEqual(5);
  });

  test('GET products by category returns items only from that category', async ({ productsApi }) => {
    const res = await productsApi.getByCategory('laptops');
    const body = await res.json();

    expect(res.status()).toBe(200);
    for (const product of body.products) {
      expect(product.category).toBe('laptops');
    }
  });

  // ── CRUD (kept only one of PUT/PATCH) ───────────
  test('CREATE a product returns the created resource', async ({ productsApi }) => {
    const payload = dataFactory.product();
    const res = await productsApi.create(payload);
    const body = await res.json();

    expect(res.status()).toBe(201);
    expect(body.title).toBe(payload.title);
    expect(body.price).toBe(payload.price);
    expect(body.id).toBeDefined();
  });

  test('UPDATE a product updates fields', async ({ productsApi }) => {
    const res = await productsApi.update(1, { title: 'Updated Item', price: 99.99 });
    const body = await res.json();

    expect(res.status()).toBe(200);
    expect(body).toMatchObject({ id: 1, title: 'Updated Item', price: 99.99 });
  });

  test('DELETE a product marks it deleted', async ({ productsApi }) => {
    const res = await productsApi.remove(1);
    const body = await res.json();

    expect(res.status()).toBe(200);
    expect(body.isDeleted).toBe(true);
  });

  // ── Negative Tests ─────────────────────────────
  test('GET non-existent product returns 404 with error schema', async ({ productsApi }) => {
    const res = await productsApi.getById(99999);
    const body = await res.json();

    expect(res.status()).toBe(404);
    assertSchema(validateError, body, 'GET /products/99999');
  });

  // ── Schema Integrity on Lists (valuable) ───────
  test('all products in list match schema (smoke integrity)', async ({ productsApi }) => {
    const body = await (await productsApi.getAll({ limit: 10 })).json();

    for (const product of body.products) {
      assertSchema(validateProduct, product, `product id=${product.id}`);
    }
  });

});