import { test as base } from '@playwright/test';
import { UsersApi, ProductsApi } from '../utils/apiClient';
import * as fs from 'fs';
import * as path from 'path';

type ApiFixtures = {
  usersApi:    UsersApi;
  productsApi: ProductsApi;
};

// Read token from file once
function getToken(): string {
  const authPath = path.join(__dirname, '../.auth.json');

  if (!fs.existsSync(authPath)) {
    throw new Error('.auth.json not found — make sure global setup ran');
  }

  const auth = JSON.parse(fs.readFileSync(authPath, 'utf-8'));
  return auth.accessToken;
}

export const test = base.extend<ApiFixtures>({

  usersApi: async ({ request }, use) => {
    const token = getToken();
    const api   = new UsersApi(request, process.env.API_BASE || 'https://dummyjson.com', token);
    await use(api);
  },

  productsApi: async ({ request }, use) => {
    const token = getToken();
    const api   = new ProductsApi(request, process.env.API_BASE || 'https://dummyjson.com', token);
    await use(api);
  },

});

export const expect = test.expect;