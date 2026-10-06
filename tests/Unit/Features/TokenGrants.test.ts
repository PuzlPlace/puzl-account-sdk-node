import { beforeEach, describe, expect, it } from 'vitest';
import { PzAccountSdkErrorCodeEnum } from '../../../src/Enum/PzAccountSdkErrorCodeEnum.js';
import { PzAccountSdkConfigurationException } from '../../../src/Exception/PzAccountSdkConfigurationException.js';
import { PzAccountSdkTokenExchangeCodeDto } from '../../../src/Features/TokenExchangeCode/Dtos/PzAccountSdkTokenExchangeCodeDto.js';
import { PzAccountSdkTokenPasswordDto } from '../../../src/Features/TokenPassword/Dtos/PzAccountSdkTokenPasswordDto.js';
import { PzAccountSdkTokenRefreshDto } from '../../../src/Features/TokenRefresh/Dtos/PzAccountSdkTokenRefreshDto.js';
import { CLIENT_ID, CLIENT_SECRET, ISSUER, makeClient, REDIRECT_URI } from '../../Support/PzAccountSdkTestCase.js';

function tokenBody(overrides: Record<string, unknown> = {}) {
  return {
    access_token: 'access-opaco',
    token_type: 'Bearer',
    expires_in: 3600,
    scope: 'openid email profile',
    id_token: 'header.payload.assinatura',
    ...overrides,
  };
}

const exchange = (code = 'c', verifier = 'v', redirectUri = '') =>
  new PzAccountSdkTokenExchangeCodeDto({ code, code_verifier: verifier, redirect_uri: redirectUri });

describe('token grants (/oauth/token)', () => {
  let ctx: ReturnType<typeof makeClient>;

  beforeEach(() => {
    ctx = makeClient();
  });

  it('exchange code posts the pkce grant as form with client_secret_post', async () => {
    ctx.recorder.pushJson(200, tokenBody({ refresh_token: 'refresh-1' }));

    const result = await ctx.client.tokenExchangeCode(exchange('code-1', 'verifier-1'));
    const request = ctx.recorder.lastRequest();

    expect(request.method).toBe('POST');
    expect(request.url).toBe(`${ISSUER}/oauth/token`);
    expect(request.formUrlEncoded).toBe(true);
    expect(request.headers['accept']).toBe('application/json');
    expect(request.headers['authorization']).toBeUndefined();
    expect(request.bodyArray).toEqual({
      grant_type: 'authorization_code',
      code: 'code-1',
      redirect_uri: REDIRECT_URI,
      code_verifier: 'verifier-1',
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    });
    expect(Object.keys(request.bodyArray)).toEqual(['grant_type', 'code', 'redirect_uri', 'code_verifier', 'client_id', 'client_secret']);
    expect(result.isSuccess()).toBe(true);
    expect(result.http_status).toBe(200);
    expect(result.access_token).toBe('access-opaco');
    expect(result.token_type).toBe('Bearer');
    expect(result.expires_in).toBe(3600);
    expect(result.id_token).toBe('header.payload.assinatura');
    expect(result.refresh_token).toBe('refresh-1');
    expect(result.hasIdToken()).toBe(true);
    expect(result.hasRefreshToken()).toBe(true);
  });

  it('exchange code uses the given redirect_uri', async () => {
    ctx.recorder.pushJson(200, tokenBody());

    await ctx.client.tokenExchangeCode({ code: 'c', code_verifier: 'v', redirect_uri: 'https://web.test/login/puzl/popup' });

    expect(ctx.recorder.lastRequest().bodyArray['redirect_uri']).toBe('https://web.test/login/puzl/popup');
  });

  it('client_secret_basic moves the credential to the Authorization header', async () => {
    ctx = makeClient({ tokenAuthMethod: 'client_secret_basic', clientSecret: 'se/cr:et' });
    ctx.recorder.pushJson(200, tokenBody());

    await ctx.client.tokenExchangeCode(exchange());
    const request = ctx.recorder.lastRequest();

    expect(request.headers['authorization']).toBe(`Basic ${Buffer.from(`${CLIENT_ID}:se%2Fcr%3Aet`).toString('base64')}`);
    expect(request.bodyArray).not.toHaveProperty('client_id');
    expect(request.bodyArray).not.toHaveProperty('client_secret');
  });

  it('public client sends only the client_id', async () => {
    ctx = makeClient({ tokenAuthMethod: 'none', clientSecret: '' });
    ctx.recorder.pushJson(200, tokenBody());

    await ctx.client.tokenExchangeCode(exchange());
    const body = ctx.recorder.lastRequest().bodyArray;

    expect(body['client_id']).toBe(CLIENT_ID);
    expect(body).not.toHaveProperty('client_secret');
  });

  it('a missing secret is a configuration error before any request', async () => {
    ctx = makeClient({ clientSecret: '' });

    const call = ctx.client.tokenExchangeCode(exchange());

    await expect(call).rejects.toBeInstanceOf(PzAccountSdkConfigurationException);
    await expect(call).rejects.toThrow('PUZL_ACCOUNT_CLIENT_SECRET');
    expect(ctx.recorder.requestCount()).toBe(0);
  });

  it('maps invalid_grant to the rfc error', async () => {
    ctx.recorder.pushOauthError(400, 'invalid_grant', 'O code expirou.');

    const result = await ctx.client.tokenExchangeCode(exchange());

    expect(result.has_error).toBe(true);
    expect(result.getErrorCode()).toBe(PzAccountSdkErrorCodeEnum.INVALID_GRANT);
    expect(result.error_message).toBe('O code expirou.');
    expect(result.http_status).toBe(400);
    expect(result.access_token).toBe('');
    expect(result.isServiceUnavailable()).toBe(false);
  });

  it('invalid_client is not a client fault', async () => {
    ctx.recorder.pushOauthError(401, 'invalid_client');

    const result = await ctx.client.tokenExchangeCode(exchange());

    expect(result.getErrorCode()).toBe(PzAccountSdkErrorCodeEnum.INVALID_CLIENT);
    expect(result.getErrorCode()?.isClientFault()).toBe(false);
  });

  it('a timeout becomes service unavailable without code', async () => {
    ctx.recorder.pushConnectTimeout();

    const result = await ctx.client.tokenExchangeCode(exchange());

    expect(result.has_error).toBe(true);
    expect(result.error_code).toBe('');
    expect(result.http_status).toBe(504);
    expect(result.error_message).toBe('Connection timed out after 10 seconds');
    expect(result.isServiceUnavailable()).toBe(true);
  });

  it('a connection failure also becomes service unavailable', async () => {
    ctx.recorder.pushNetworkError();

    const result = await ctx.client.tokenExchangeCode(exchange());

    expect(result.http_status).toBe(504);
    expect(result.isServiceUnavailable()).toBe(true);
  });

  it('keeps an unknown oauth error as a raw string', async () => {
    ctx.recorder.pushOauthError(400, 'novo_erro_do_provedor');

    const result = await ctx.client.tokenExchangeCode(exchange());

    expect(result.error_code).toBe('novo_erro_do_provedor');
    expect(result.getErrorCode()).toBeNull();
  });

  it('refresh sends the refresh grant and omits an empty scope', async () => {
    ctx.recorder.pushJson(200, tokenBody({ refresh_token: 'refresh-2' }));

    const result = await ctx.client.tokenRefresh(new PzAccountSdkTokenRefreshDto({ refresh_token: 'refresh-1' }));

    expect(ctx.recorder.lastRequest().bodyArray).toEqual({
      grant_type: 'refresh_token',
      refresh_token: 'refresh-1',
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    });
    expect(result.refresh_token).toBe('refresh-2');
  });

  it('refresh can narrow the scope', async () => {
    ctx.recorder.pushJson(200, tokenBody());

    await ctx.client.tokenRefresh({ refresh_token: 'r', scope: 'openid' });

    expect(ctx.recorder.lastRequest().bodyArray['scope']).toBe('openid');
  });

  it('password grant sends credentials and the configured scope', async () => {
    ctx.recorder.pushJson(200, tokenBody());

    const result = await ctx.client.tokenPassword(new PzAccountSdkTokenPasswordDto({ username: 'ana@exemplo.test', password: 's3nh@' }));

    expect(ctx.recorder.lastRequest().bodyArray).toEqual({
      grant_type: 'password',
      username: 'ana@exemplo.test',
      password: 's3nh@',
      scope: 'openid email profile',
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    });
    expect(result.hasRefreshToken()).toBe(false);
  });

  it('password grant with wrong credentials is invalid_grant', async () => {
    ctx.recorder.pushOauthError(400, 'invalid_grant');

    const result = await ctx.client.tokenPassword({ username: 'ana@exemplo.test', password: 'errada' });

    expect(result.getErrorCode()).toBe(PzAccountSdkErrorCodeEnum.INVALID_GRANT);
    expect(result.getErrorCode()?.isClientFault()).toBe(true);
  });

  it('the password dto never exposes the password in toArray', () => {
    const dto = new PzAccountSdkTokenPasswordDto({ username: 'ana@exemplo.test', password: 's3nh@' });

    expect(dto.toArray()['password']).toBe('********');
    expect(dto.toJson()).not.toContain('s3nh@');
    expect(JSON.stringify({ dto })).not.toContain('s3nh@');
  });
});
