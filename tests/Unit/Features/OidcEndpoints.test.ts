import { beforeEach, describe, expect, it } from 'vitest';
import { PzAccountSdkErrorCodeEnum } from '../../../src/Enum/PzAccountSdkErrorCodeEnum.js';
import { PzAccountSdkTokenTypeHintEnum } from '../../../src/Enum/PzAccountSdkTokenTypeHintEnum.js';
import { PzAccountSdkAccessTokenDto } from '../../../src/Features/Shared/Dtos/PzAccountSdkAccessTokenDto.js';
import { PzAccountSdkTokenRevokeDto } from '../../../src/Features/TokenRevoke/Dtos/PzAccountSdkTokenRevokeDto.js';
import { CLIENT_ID, CLIENT_SECRET, ISSUER, makeClient } from '../../Support/PzAccountSdkTestCase.js';

describe('discovery, /oauth/revoke and /oauth/userinfo', () => {
  let ctx: ReturnType<typeof makeClient>;

  beforeEach(() => {
    ctx = makeClient();
  });

  it('discovery reads the raw document', async () => {
    ctx.recorder.pushJson(200, {
      issuer: ISSUER,
      token_endpoint: `${ISSUER}/oauth/token`,
      jwks_uri: `${ISSUER}/.well-known/jwks.json`,
      grant_types_supported: ['authorization_code', 'refresh_token'],
      code_challenge_methods_supported: ['S256'],
    });

    const result = await ctx.client.discoveryShow();
    const request = ctx.recorder.lastRequest();

    expect(request.method).toBe('GET');
    expect(request.url).toBe(`${ISSUER}/.well-known/openid-configuration`);
    expect(request.headers['authorization']).toBeUndefined();
    expect(result.isSuccess()).toBe(true);
    expect(result.issuer).toBe(ISSUER);
    expect(result.grant_types_supported).toEqual(['authorization_code', 'refresh_token']);
    expect(result.code_challenge_methods_supported).toEqual(['S256']);
  });

  it('reports a discovery failure', async () => {
    ctx.recorder.pushConnectTimeout();

    expect((await ctx.client.discoveryShow()).isServiceUnavailable()).toBe(true);
  });

  it('revoke posts token and hint with client auth', async () => {
    ctx.recorder.pushEmpty(200);

    const result = await ctx.client.tokenRevoke(
      new PzAccountSdkTokenRevokeDto({ token: 'refresh-1', token_type_hint: PzAccountSdkTokenTypeHintEnum.REFRESH_TOKEN }),
    );
    const request = ctx.recorder.lastRequest();

    expect(request.method).toBe('POST');
    expect(request.url).toBe(`${ISSUER}/oauth/revoke`);
    expect(request.formUrlEncoded).toBe(true);
    expect(request.bodyArray).toEqual({
      token: 'refresh-1',
      token_type_hint: 'refresh_token',
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    });
    expect(result.isSuccess()).toBe(true);
    expect(result.http_status).toBe(200);
  });

  it('revoke accepts the hint as a raw string', async () => {
    ctx.recorder.pushEmpty(200);

    await ctx.client.tokenRevoke({ token: 'a', token_type_hint: 'access_token' });

    expect(ctx.recorder.lastRequest().bodyArray['token_type_hint']).toBe('access_token');
  });

  it('revoke without hint omits it', async () => {
    ctx.recorder.pushEmpty(200);

    await ctx.client.tokenRevoke(new PzAccountSdkTokenRevokeDto({ token: 'qualquer' }));

    expect(ctx.recorder.lastRequest().bodyArray).not.toHaveProperty('token_type_hint');
  });

  it('revoke invalid_client is an error', async () => {
    ctx.recorder.pushOauthError(401, 'invalid_client');

    const result = await ctx.client.tokenRevoke({ token: 't' });

    expect(result.getErrorCode()).toBe(PzAccountSdkErrorCodeEnum.INVALID_CLIENT);
  });

  it('userinfo sends the bearer and maps claims', async () => {
    ctx.recorder.pushJson(200, {
      sub: '01J0000000000000000000000A',
      email: 'ana@exemplo.test',
      email_verified: true,
      name: 'Ana',
      picture: 'https://account.test/pictures/x.webp',
      updated_at: 1700000000,
      address: { locality: 'São Paulo', country: 'BR' },
    });

    const result = await ctx.client.userInfoShow(new PzAccountSdkAccessTokenDto({ access_token: 'access-1' }));
    const request = ctx.recorder.lastRequest();

    expect(request.method).toBe('GET');
    expect(request.url).toBe(`${ISSUER}/oauth/userinfo`);
    expect(request.headers['authorization']).toBe('Bearer access-1');
    expect(request.body).toBe('');
    expect(result.isSuccess()).toBe(true);
    expect(result.sub).toBe('01J0000000000000000000000A');
    expect(result.email_verified).toBe(true);
    expect(result.updated_at).toBe(1700000000);
    expect(result.address?.locality).toBe('São Paulo');
    expect(result.hasClaim('email')).toBe(true);
    expect(result.hasClaim('phone_number')).toBe(false);
    expect(result.phone_number).toBe('');
  });

  it('userinfo email_verified only counts a real true', async () => {
    ctx.recorder.pushJson(200, { sub: 's', email_verified: 'true' });

    expect((await ctx.client.userInfoShow({ access_token: 'a' })).email_verified).toBe(false);
  });

  it('userinfo 401 without body becomes invalid_token', async () => {
    ctx.recorder.pushEmpty(401);

    const result = await ctx.client.userInfoShow({ access_token: 'vencido' });

    expect(result.has_error).toBe(true);
    expect(result.getErrorCode()).toBe(PzAccountSdkErrorCodeEnum.INVALID_TOKEN);
    expect(result.http_status).toBe(401);
    expect(result.error_message).toBe('Unauthorized');
  });

  it('userinfo for a deleted account is invalid_grant', async () => {
    ctx.recorder.pushOauthError(400, 'invalid_grant');

    expect((await ctx.client.userInfoShow({ access_token: 'a' })).getErrorCode()).toBe(PzAccountSdkErrorCodeEnum.INVALID_GRANT);
  });

  it('userinfo 401 with an empty object body becomes invalid_token', async () => {
    // É o que o Puzl Account manda de fato: `{}` com WWW-Authenticate.
    ctx.recorder.pushJson(401, {});

    expect((await ctx.client.userInfoShow({ access_token: 'vencido' })).getErrorCode()).toBe(PzAccountSdkErrorCodeEnum.INVALID_TOKEN);
  });

  it('detects the rate limit on /oauth/* by status', async () => {
    // O Handler do Puzl Account responde 429 em /oauth/* como invalid_request.
    ctx.recorder.pushOauthError(429, 'invalid_request', 'Muitas tentativas.');

    const result = await ctx.client.userInfoShow({ access_token: 'a' });

    expect(result.isRateLimited()).toBe(true);
    expect(result.isServiceUnavailable()).toBe(false);
    expect(result.getErrorCode()).toBe(PzAccountSdkErrorCodeEnum.INVALID_REQUEST);
  });

  it('masks the access token input in toArray', () => {
    expect(new PzAccountSdkAccessTokenDto({ access_token: 'segredo' }).toArray()).toEqual({ access_token: '********' });
    expect(new PzAccountSdkAccessTokenDto({ access_token: '' }).toArray()).toEqual({ access_token: '' });
  });
});
