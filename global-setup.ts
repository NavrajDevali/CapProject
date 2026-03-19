import { request } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

export default async function globalSetup() {
  const req = await request.newContext({
    baseURL: process.env.API_BASE || 'https://dummyjson.com',
  });

  const res = await req.post('/auth/login', {
    data: {
      username: process.env.USER || 'emilys',
      password: process.env.PASS || 'emilyspass',
    },
  });

  if (!res.ok()) {
    throw new Error(`Login failed in global setup — status ${res.status()}`);
  }

  const body = await res.json();

  // Save token to a file instead of process.env
  const authData = {
    accessToken:  body.accessToken,
    refreshToken: body.refreshToken,
  };

  fs.writeFileSync(
    path.join(__dirname, '.auth.json'),
    JSON.stringify(authData, null, 2)
  );

  console.log('✓ Global setup complete — token saved to .auth.json');
  await req.dispose();
}