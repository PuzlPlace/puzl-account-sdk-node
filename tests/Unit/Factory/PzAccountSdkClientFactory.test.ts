import { describe, expect, it } from 'vitest';
import { PzAccountSdkClientFactory } from '../../../src/Factory/PzAccountSdkClientFactory.js';
import { PzAccountSdkClient } from '../../../src/PzAccountSdkClient.js';
import { PzRequestRecorder } from '../../Support/PzRequestRecorder.js';

describe('PzAccountSdkClientFactory', () => {
  it('make builds a client from plain options', async () => {
    const recorder = new PzRequestRecorder();
    recorder.pushJson(200, { sub: 's' });

    const client = PzAccountSdkClientFactory.make({ issuer: 'https://account.test/', clientId: 'c', fetch: recorder.fetch });
    const result = await client.userInfoShow({ access_token: 'a' });

    expect(client).toBeInstanceOf(PzAccountSdkClient);
    expect(result.sub).toBe('s');
    expect(recorder.lastRequest().url).toBe('https://account.test/oauth/userinfo');
  });

  it('fromEnv reads PUZL_ACCOUNT_* and keeps the injected fetch', async () => {
    const recorder = new PzRequestRecorder();
    recorder.pushJson(200, { sub: 's' });

    const client = PzAccountSdkClientFactory.fromEnv(
      { PUZL_ACCOUNT_ISSUER: 'https://env.test', PUZL_ACCOUNT_CLIENT_ID: 'c', PUZL_ACCOUNT_CLIENT_SECRET: 's' },
      { fetch: recorder.fetch },
    );
    await client.userInfoShow({ access_token: 'a' });

    expect(client.isConfigured()).toBe(true);
    expect(client.config.issuer).toBe('https://env.test');
    expect(recorder.lastRequest().url).toBe('https://env.test/oauth/userinfo');
  });

  it('creating a client without configuration does not throw (validation is lazy)', () => {
    const client = PzAccountSdkClientFactory.fromEnv({});

    expect(client.isConfigured()).toBe(false);
    expect(() => client.pkceCreate()).not.toThrow();
  });
});
