import { expect } from 'vitest';
import { PzAccountSdkClient, type PzAccountSdkClientOptions } from '../../src/PzAccountSdkClient.js';
import { PzAccountSdkMemoryCache } from '../../src/Support/PzAccountSdkCache.js';
import { PzRequestRecorder, type RecordedRequest } from './PzRequestRecorder.js';

export const ISSUER = 'https://account.pzaccountsdk.test';
export const CLIENT_ID = 'client-de-teste';
export const CLIENT_SECRET = 'segredo-de-teste';
export const REDIRECT_URI = 'https://produto.pzaccountsdk.test/auth/callback';
export const USER_TOKEN = 'token-do-usuario';

export function configValues(): PzAccountSdkClientOptions {
  return {
    issuer: ISSUER,
    clientId: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
    redirectUri: REDIRECT_URI,
    scope: 'openid email profile',
    tokenAuthMethod: 'client_secret_post',
    timeout: 10,
    jwksCacheTtl: 3600,
    leeway: 60,
  };
}

/** Client de teste: config padrão + overrides, transporte gravado, cache em memória. */
export function makeClient(overrides: PzAccountSdkClientOptions = {}) {
  const recorder = new PzRequestRecorder();
  const cache = new PzAccountSdkMemoryCache();
  const client = new PzAccountSdkClient({ ...configValues(), ...overrides }, { fetch: recorder.fetch, cache });

  return { client, recorder, cache };
}

/** O básico de toda chamada à API da conta: método, URL, Accept e Bearer. */
export function assertApiRequest(request: RecordedRequest, method: string, path: string, accessToken = USER_TOKEN): void {
  expect(request.method).toBe(method);
  expect(request.url).toBe(ISSUER + path);
  expect(request.headers['accept']).toBe('application/json');
  expect(request.headers['authorization']).toBe(`Bearer ${accessToken}`);
  expect(request.formUrlEncoded).toBe(false);
}
