import { createHash, createHmac, generateKeyPairSync, sign } from 'node:crypto';
import { beforeEach, describe, expect, it } from 'vitest';
import { PzAccountSdkErrorCodeEnum } from '../../../src/Enum/PzAccountSdkErrorCodeEnum.js';
import { PzAccountSdkIdTokenVerifyDto } from '../../../src/Features/IdTokenVerify/Dtos/PzAccountSdkIdTokenVerifyDto.js';
import { CLIENT_ID, ISSUER, makeClient } from '../../Support/PzAccountSdkTestCase.js';
import { RsaKeyPair } from '../../Support/RsaKeyPair.js';

const SUB = '01J0000000000000000000000A';
const now = () => Math.floor(Date.now() / 1000);
const b64url = (value: string | Buffer) => Buffer.from(value).toString('base64url');

function claims(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    iss: ISSUER,
    sub: SUB,
    aud: CLIENT_ID,
    iat: now(),
    exp: now() + 3600,
    auth_time: now() - 10,
    nonce: 'nonce-1',
    email: 'ana@exemplo.test',
    email_verified: true,
    name: 'Ana',
    picture: 'https://account.test/pictures/a.webp',
    acr: 'urn:puzl:accounts:acr:mfa',
    amr: ['pwd', 'otp'],
    ...overrides,
  };
}

function without(key: string): Record<string, unknown> {
  const values = claims();
  delete values[key];

  return values;
}

describe('idTokenVerify', () => {
  const key = RsaKeyPair.forKid('chave-ativa');
  let ctx: ReturnType<typeof makeClient>;

  const verify = (idToken: string, nonce = 'nonce-1', accessToken = '') =>
    ctx.client.idTokenVerify(new PzAccountSdkIdTokenVerifyDto({ id_token: idToken, nonce, access_token: accessToken }));
  const pushJwks = (...keys: RsaKeyPair[]) => ctx.recorder.pushJson(200, RsaKeyPair.jwks(...(keys.length > 0 ? keys : [key])));

  beforeEach(() => {
    ctx = makeClient();
  });

  it('a valid token becomes an identity', async () => {
    pushJwks();

    const identity = await verify(key.sign(claims()));

    expect(identity.isSuccess(), identity.error_message).toBe(true);
    expect(identity.http_status).toBe(200);
    expect(identity.sub).toBe(SUB);
    expect(identity.email).toBe('ana@exemplo.test');
    expect(identity.email_verified).toBe(true);
    expect(identity.name).toBe('Ana');
    expect(identity.amr).toEqual(['pwd', 'otp']);
    expect(identity.isMultiFactor()).toBe(true);
    expect(identity.claims['nonce']).toBe('nonce-1');

    const request = ctx.recorder.lastRequest();
    expect(request.method).toBe('GET');
    expect(request.url).toBe(`${ISSUER}/.well-known/jwks.json`);
  });

  it('accepts a plain object as input', async () => {
    pushJwks();

    const identity = await ctx.client.idTokenVerify({ id_token: key.sign(claims()), nonce: 'nonce-1' });

    expect(identity.isSuccess(), identity.error_message).toBe(true);
  });

  it('caches the jwks between verifications', async () => {
    pushJwks();

    await verify(key.sign(claims()));
    const second = await verify(key.sign(claims()));

    expect(second.isSuccess()).toBe(true);
    expect(ctx.recorder.requestCount()).toBe(1);
  });

  it('refetches the jwks once on an unknown kid to follow key rotation', async () => {
    const rotated = RsaKeyPair.forKid('chave-nova');
    pushJwks();
    await verify(key.sign(claims()));

    pushJwks(key, rotated);
    const identity = await verify(rotated.sign(claims()));

    expect(identity.isSuccess(), identity.error_message).toBe(true);
    expect(ctx.recorder.requestCount()).toBe(2);
  });

  it('rate limits the forced refetch against forged kids', async () => {
    const forged = RsaKeyPair.forKid('kid-forjado');
    pushJwks();
    pushJwks();

    const first = await verify(forged.sign(claims()));
    const second = await verify(forged.sign(claims()));

    expect(first.getErrorCode()).toBe(PzAccountSdkErrorCodeEnum.ID_TOKEN_INVALID);
    expect(second.getErrorCode()).toBe(PzAccountSdkErrorCodeEnum.ID_TOKEN_INVALID);
    // Uma busca normal + uma forçada; a segunda tentativa já cai no freio.
    expect(ctx.recorder.requestCount()).toBe(2);
  });

  it('rejects a token signed by another key with the same kid', async () => {
    const impostor = RsaKeyPair.forKid('impostor');
    pushJwks();

    const identity = await verify(impostor.sign(claims(), { kid: 'chave-ativa' }));

    expect(identity.getErrorCode()).toBe(PzAccountSdkErrorCodeEnum.ID_TOKEN_INVALID);
    expect(identity.http_status).toBe(401);
    expect(identity.sub).toBe('');
  });

  it('rejects alg none without fetching keys', async () => {
    const token = `${b64url(JSON.stringify({ alg: 'none', kid: 'chave-ativa' }))}.${b64url(JSON.stringify(claims()))}.`;

    const identity = await verify(token);

    expect(identity.getErrorCode()).toBe(PzAccountSdkErrorCodeEnum.ID_TOKEN_INVALID);
    expect(ctx.recorder.requestCount()).toBe(0);
  });

  it('rejects HS256 signed with the public modulus', async () => {
    const head = b64url(JSON.stringify({ typ: 'JWT', alg: 'HS256', kid: 'chave-ativa' }));
    const body = b64url(JSON.stringify(claims()));
    const signature = createHmac('sha256', key.modulus()).update(`${head}.${body}`).digest('base64url');

    const identity = await verify(`${head}.${body}.${signature}`);

    expect(identity.getErrorCode()).toBe(PzAccountSdkErrorCodeEnum.ID_TOKEN_INVALID);
    expect(identity.error_message).toContain('RS256');
  });

  it('rejects garbage', async () => {
    expect((await verify('nao-e-um-jwt')).getErrorCode()).toBe(PzAccountSdkErrorCodeEnum.ID_TOKEN_INVALID);
    expect((await verify('')).getErrorCode()).toBe(PzAccountSdkErrorCodeEnum.ID_TOKEN_INVALID);
  });

  it.each([
    ['iss de outro provedor', { iss: 'https://outro.test' }],
    ['aud de outro app', { aud: 'outro-client' }],
    ['várias aud sem azp', { aud: [CLIENT_ID, 'outro-client'] }],
    ['várias aud com azp de outro', { aud: [CLIENT_ID, 'outro'], azp: 'outro' }],
    ['sub vazio', { sub: '' }],
    ['nonce errado', { nonce: 'outro-nonce' }],
    ['expirado além do leeway', { exp: now() - 120 }],
    ['emitido no futuro', { iat: now() + 600 }],
    ['token de webhook', { events: { x: {} } }],
    ['azp de outro app com aud única', { azp: 'outro-client' }],
  ])('rejects invalid claims: %s', async (_name, overrides) => {
    pushJwks();

    const identity = await verify(key.sign(claims(overrides)));

    expect(identity.has_error).toBe(true);
    expect(identity.getErrorCode()).toBe(PzAccountSdkErrorCodeEnum.ID_TOKEN_INVALID);
  });

  it('rejects a missing exp', async () => {
    pushJwks();

    expect((await verify(key.sign(without('exp')))).has_error).toBe(true);
  });

  it('accepts a token expired within the leeway', async () => {
    pushJwks();

    expect((await verify(key.sign(claims({ exp: now() - 30 })))).isSuccess()).toBe(true);
  });

  it('accepts multiple audiences with a matching azp', async () => {
    pushJwks();

    expect((await verify(key.sign(claims({ aud: [CLIENT_ID, 'outro'], azp: CLIENT_ID })))).isSuccess()).toBe(true);
  });

  it('skips the nonce explicitly on the password grant', async () => {
    pushJwks();

    const identity = await ctx.client.idTokenVerify(PzAccountSdkIdTokenVerifyDto.forPasswordGrant(key.sign(without('nonce'))));

    expect(identity.isSuccess(), identity.error_message).toBe(true);
  });

  it('treats an empty nonce without explicit skip as a usage error', () => {
    // Esquecer o nonce não pode virar "aceitar qualquer nonce" em silêncio.
    expect(() => new PzAccountSdkIdTokenVerifyDto({ id_token: 'qualquer.coisa.aqui', nonce: '' })).toThrow(/forPasswordGrant/);
  });

  it('rejects (as a Promise) a plain object with an empty nonce', async () => {
    await expect(ctx.client.idTokenVerify({ id_token: 'a.b.c', nonce: '' })).rejects.toThrow(TypeError);
  });

  it('requires the nonce claim when a nonce is expected', async () => {
    pushJwks();

    expect((await verify(key.sign(without('nonce')))).has_error).toBe(true);
  });

  it('checks at_hash when the access token is given', async () => {
    const atHash = b64url(createHash('sha256').update('access-1').digest().subarray(0, 16));
    pushJwks();
    const token = key.sign(claims({ at_hash: atHash }));

    expect((await verify(token, 'nonce-1', 'access-1')).isSuccess()).toBe(true);
    expect((await verify(token, 'nonce-1', 'outro-access')).getErrorCode()).toBe(PzAccountSdkErrorCodeEnum.ID_TOKEN_INVALID);
  });

  it('requires at_hash in the token when the access token is given', async () => {
    pushJwks();

    const identity = await verify(key.sign(claims()), 'nonce-1', 'access-1');

    expect(identity.getErrorCode()).toBe(PzAccountSdkErrorCodeEnum.ID_TOKEN_INVALID);
    expect(identity.error_message).toContain('at_hash');
  });

  it('treats the jwks down as unavailability, not an invalid token', async () => {
    ctx.recorder.pushConnectTimeout();

    const identity = await verify(key.sign(claims()));

    expect(identity.getErrorCode()).toBe(PzAccountSdkErrorCodeEnum.JWKS_UNAVAILABLE);
    expect(identity.http_status).toBe(503);
    expect(identity.isServiceUnavailable()).toBe(true);
  });

  it('treats an empty key set as unavailability', async () => {
    ctx.recorder.pushJson(200, { keys: [] });

    expect((await verify(key.sign(claims()))).getErrorCode()).toBe(PzAccountSdkErrorCodeEnum.JWKS_UNAVAILABLE);
  });

  it('tolerates surrounding whitespace in the id_token', async () => {
    pushJwks();

    expect((await verify(` ${key.sign(claims())}\n`)).isSuccess()).toBe(true);
  });

  it('masks tokens in the input dto but keeps the nonce', () => {
    const dto = new PzAccountSdkIdTokenVerifyDto({ id_token: 'id.token.jwt', nonce: 'nonce-1', access_token: 'access-1' });

    expect(dto.toArray()).toEqual({ id_token: '********', nonce: 'nonce-1', access_token: '********', require_nonce: true });
    expect(JSON.stringify(dto)).not.toContain('id.token.jwt');
    expect(dto.id_token).toBe('id.token.jwt');
  });
});

describe('idTokenVerify — hardening', () => {
  const key = RsaKeyPair.forKid('chave-ativa');
  let ctx: ReturnType<typeof makeClient>;

  const verify = (idToken: string) => ctx.client.idTokenVerify({ id_token: idToken, nonce: 'nonce-1' });

  beforeEach(() => {
    ctx = makeClient();
  });

  it.each([
    ['nbf no futuro', { nbf: now() + 600 }, 'nbf prior to'],
    ['nbf fora do alcance de Date', { nbf: 1e20 }, 'nbf prior to'],
    ['iss de outro provedor', { iss: 'https://outro.test' }, 'iss diferente'],
    ['aud de outro app', { aud: 'outro-client' }, 'aud não contém'],
    ['nonce errado', { nonce: 'outro' }, 'nonce diferente'],
    ['expirado', { exp: now() - 120 }, 'Expired token'],
  ])('rejects %s with the right reason', async (_name, overrides, reason) => {
    ctx.recorder.pushJson(200, RsaKeyPair.jwks(key));

    const identity = await verify(key.sign(claims(overrides)));

    expect(identity.getErrorCode()).toBe(PzAccountSdkErrorCodeEnum.ID_TOKEN_INVALID);
    expect(identity.error_message).toContain(reason);
  });

  it('treats a null nbf as absent, like the PHP sdk', async () => {
    ctx.recorder.pushJson(200, RsaKeyPair.jwks(key));

    expect((await verify(key.sign(claims({ nbf: null })))).isSuccess()).toBe(true);
  });

  it('rejects characters outside base64url, even when the decoder would ignore them', async () => {
    ctx.recorder.pushJson(200, RsaKeyPair.jwks(key));
    const token = key.sign(claims());

    expect((await verify(token)).isSuccess()).toBe(true);
    expect((await verify(`${token}!!`)).getErrorCode()).toBe(PzAccountSdkErrorCodeEnum.ID_TOKEN_INVALID);
  });

  it('rejects a key shorter than 2048 bits', async () => {
    const pair = generateKeyPairSync('rsa', { modulusLength: 1024 });
    const jwk = { ...pair.publicKey.export({ format: 'jwk' }), kid: 'curta', alg: 'RS256' };
    const head = b64url(JSON.stringify({ alg: 'RS256', kid: 'curta' }));
    const body = b64url(JSON.stringify(claims()));
    const signature = sign('RSA-SHA256', Buffer.from(`${head}.${body}`), pair.privateKey).toString('base64url');
    ctx.recorder.pushJson(200, { keys: [jwk] });

    const identity = await verify(`${head}.${body}.${signature}`);

    expect(identity.error_message).toContain('too short');
  });

  it('rejects a key whose alg is not RS256', async () => {
    ctx.recorder.pushJson(200, { keys: [{ ...key.jwk(), alg: 'RS512' }] });

    expect((await verify(key.sign(claims()))).error_message).toContain('Incorrect key for this algorithm');
  });

  it('refuses a JWKS with a private key', async () => {
    ctx.recorder.pushJson(200, { keys: [{ ...key.jwk(), d: 'segredo' }] });

    expect((await verify(key.sign(claims()))).getErrorCode()).toBe(PzAccountSdkErrorCodeEnum.JWKS_UNAVAILABLE);
  });

  it('accepts a numeric kid in the JWKS', async () => {
    const numeric = RsaKeyPair.forKid('7');
    ctx.recorder.pushJson(200, { keys: [{ ...numeric.jwk(), kid: 7 }] });

    expect((await verify(numeric.sign(claims()))).isSuccess()).toBe(true);
  });
});
