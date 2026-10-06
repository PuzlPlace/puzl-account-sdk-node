import { describe, expect, it } from 'vitest';
import { PzAccountSdkErrorCodeEnum } from '../../../src/Enum/PzAccountSdkErrorCodeEnum.js';
import { PzAccountSdkClient } from '../../../src/PzAccountSdkClient.js';
import type { PzAccountSdkCache } from '../../../src/Support/PzAccountSdkCache.js';
import { PzAccountSdkMemoryCache } from '../../../src/Support/PzAccountSdkCache.js';
import { CLIENT_ID, configValues, ISSUER, makeClient } from '../../Support/PzAccountSdkTestCase.js';
import { PzRequestRecorder } from '../../Support/PzRequestRecorder.js';
import { RsaKeyPair } from '../../Support/RsaKeyPair.js';

const now = () => Math.floor(Date.now() / 1000);
const claims = () => ({ iss: ISSUER, aud: CLIENT_ID, sub: 's', iat: now(), exp: now() + 60, nonce: 'n' });
const verifyWith = (client: PzAccountSdkClient, token: string) => client.idTokenVerify({ id_token: token, nonce: 'n' });

/** Política de busca e cache do JWKS: quantas requisições saem em cada cenário. */
describe('PzAccountSdkJwksProvider', () => {
  it('fetches only once on a cold cache with an unknown kid', async () => {
    const { client, recorder } = makeClient();
    recorder.pushJson(200, RsaKeyPair.jwks(RsaKeyPair.forKid('chave-ativa')));

    const result = await verifyWith(client, RsaKeyPair.forKid('kid-forjado').sign(claims()));

    expect(result.getErrorCode()).toBe(PzAccountSdkErrorCodeEnum.ID_TOKEN_INVALID);
    expect(recorder.requestCount()).toBe(1);
  });

  it('remembers a failed fetch instead of retrying on every call', async () => {
    const { client, recorder } = makeClient();
    recorder.pushConnectTimeout();
    const token = RsaKeyPair.forKid('chave-ativa').sign(claims());

    for (let i = 0; i < 5; i++) {
      expect((await verifyWith(client, token)).getErrorCode()).toBe(PzAccountSdkErrorCodeEnum.JWKS_UNAVAILABLE);
    }

    expect(recorder.requestCount()).toBe(1);
  });

  it('does not break verification when the cache itself is broken', async () => {
    const broken: PzAccountSdkCache = {
      get: () => Promise.reject(new Error('redis fora')),
      set: () => {
        throw new Error('redis fora');
      },
      add: () => Promise.reject(new Error('redis fora')),
    };
    const key = RsaKeyPair.forKid('chave-ativa');
    const recorder = new PzRequestRecorder();
    recorder.pushJson(200, RsaKeyPair.jwks(key));
    const client = new PzAccountSdkClient(configValues(), { fetch: recorder.fetch, cache: broken });

    const result = await verifyWith(client, key.sign(claims()));

    expect(result.isSuccess(), result.error_message).toBe(true);
  });

  it('calls the cache resolver only on the first verification', async () => {
    let calls = 0;
    const cache = new PzAccountSdkMemoryCache();
    const recorder = new PzRequestRecorder();
    const client = new PzAccountSdkClient(configValues(), {
      fetch: recorder.fetch,
      cache: () => {
        calls++;

        return cache;
      },
    });

    client.pkceCreate();
    expect(calls).toBe(0);

    const key = RsaKeyPair.forKid('chave-ativa');
    recorder.pushJson(200, RsaKeyPair.jwks(key));
    await verifyWith(client, key.sign(claims()));
    await verifyWith(client, key.sign(claims()));

    expect(calls).toBe(1);
  });

  it('works with a cache without add() (get + set)', async () => {
    const store = new Map<string, string>();
    const cache: PzAccountSdkCache = { get: (k) => store.get(k), set: (k, v) => store.set(k, v) };
    const key = RsaKeyPair.forKid('chave-ativa');
    const recorder = new PzRequestRecorder();
    recorder.pushJson(200, RsaKeyPair.jwks(key));
    const client = new PzAccountSdkClient(configValues(), { fetch: recorder.fetch, cache });

    expect((await verifyWith(client, key.sign(claims()))).isSuccess()).toBe(true);
    expect([...store.keys()][0]).toMatch(/^pzaccountsdk:jwks:[0-9a-f]{32}$/);
  });

  it('shares one fetch between concurrent verifications on a cold cache', async () => {
    const { client, recorder } = makeClient();
    const key = RsaKeyPair.forKid('chave-ativa');
    recorder.pushJson(200, RsaKeyPair.jwks(key));

    const results = await Promise.all(Array.from({ length: 20 }, () => verifyWith(client, key.sign(claims()))));

    expect(results.every((result) => result.isSuccess())).toBe(true);
    expect(recorder.requestCount()).toBe(1);
  });

  it('lets every concurrent verification follow a key rotation', async () => {
    const { client, recorder } = makeClient();
    const old = RsaKeyPair.forKid('chave-ativa');
    const rotated = RsaKeyPair.forKid('chave-nova');
    recorder.pushJson(200, RsaKeyPair.jwks(old));
    await verifyWith(client, old.sign(claims()));

    recorder.pushJson(200, RsaKeyPair.jwks(old, rotated));
    const results = await Promise.all(Array.from({ length: 10 }, () => verifyWith(client, rotated.sign(claims()))));

    expect(results.map((result) => result.error_message)).toEqual(Array(10).fill(''));
    expect(recorder.requestCount()).toBe(2);
  });

  it('works with a redis-like adapter that stores strings', async () => {
    const store = new Map<string, string>();
    const cache: PzAccountSdkCache = {
      get: async (k) => store.get(k) ?? null,
      set: async (k, v) => {
        store.set(k, String(v));
      },
      add: async (k, v) => (store.has(k) ? false : (store.set(k, v), true)),
    };
    const key = RsaKeyPair.forKid('chave-ativa');
    const recorder = new PzRequestRecorder();
    recorder.pushJson(200, RsaKeyPair.jwks(key));
    const client = new PzAccountSdkClient(configValues(), { fetch: recorder.fetch, cache });

    for (let i = 0; i < 5; i++) {
      expect((await verifyWith(client, key.sign(claims()))).isSuccess()).toBe(true);
    }

    expect(recorder.requestCount()).toBe(1);
  });

  it('resolves the cache once even under concurrent first verifications', async () => {
    let calls = 0;
    const key = RsaKeyPair.forKid('chave-ativa');
    const recorder = new PzRequestRecorder();
    recorder.pushJson(200, RsaKeyPair.jwks(key));
    const client = new PzAccountSdkClient(configValues(), {
      fetch: recorder.fetch,
      cache: async () => {
        calls++;

        return new PzAccountSdkMemoryCache();
      },
    });

    await Promise.all(Array.from({ length: 10 }, () => verifyWith(client, key.sign(claims()))));

    expect(calls).toBe(1);
  });

  it('falls back to memory when the cache resolver fails', async () => {
    let calls = 0;
    const key = RsaKeyPair.forKid('chave-ativa');
    const recorder = new PzRequestRecorder();
    recorder.pushJson(200, RsaKeyPair.jwks(key));
    const client = new PzAccountSdkClient(configValues(), {
      fetch: recorder.fetch,
      cache: () => {
        calls++;
        throw new Error('redis fora');
      },
    });

    for (let i = 0; i < 3; i++) {
      expect((await verifyWith(client, key.sign(claims()))).isSuccess()).toBe(true);
    }

    expect(calls).toBe(1);
    expect(recorder.requestCount()).toBe(1);
  });
});
