import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { PzAccountSdkAccountPageEnum } from '../../../src/Enum/PzAccountSdkAccountPageEnum.js';
import { PzAccountSdkPromptEnum } from '../../../src/Enum/PzAccountSdkPromptEnum.js';
import { PzAccountSdkConfigurationException } from '../../../src/Exception/PzAccountSdkConfigurationException.js';
import { PzAccountSdkAuthorizeUrlDto } from '../../../src/Features/AuthorizeUrl/Dtos/PzAccountSdkAuthorizeUrlDto.js';
import { PzAccountSdkLogoutUrlDto } from '../../../src/Features/LogoutUrl/Dtos/PzAccountSdkLogoutUrlDto.js';
import { PzAccountSdkPkceCreateService } from '../../../src/Features/PkceCreate/Services/PzAccountSdkPkceCreateService.js';
import { rawUrlEncode } from '../../../src/Support/PzAccountSdkValue.js';
import { CLIENT_ID, ISSUER, makeClient, REDIRECT_URI } from '../../Support/PzAccountSdkTestCase.js';

describe('local builders (no HTTP)', () => {
  it('pkceCreate generates fresh url-safe values', () => {
    const { client, recorder } = makeClient();

    const first = client.pkceCreate();
    const second = client.pkceCreate();

    expect(first.state).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(first.nonce).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(first.code_verifier).toMatch(/^[A-Za-z0-9_-]{43,128}$/);
    expect(first.state).not.toBe(second.state);
    expect(first.code_verifier).not.toBe(second.code_verifier);
    expect(recorder.requestCount()).toBe(0);
  });

  it('the pkce challenge is the S256 of the verifier', () => {
    const pkce = makeClient().client.pkceCreate();

    expect(pkce.code_challenge).toBe(createHash('sha256').update(pkce.code_verifier).digest('base64url'));
  });

  it('matches the RFC 7636 example', () => {
    // RFC 7636, apêndice B.
    expect(PzAccountSdkPkceCreateService.challengeFor('dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk')).toBe(
      'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM',
    );
  });

  it('authorizeUrl uses the configuration defaults', () => {
    const url = makeClient().client.authorizeUrl(
      new PzAccountSdkAuthorizeUrlDto({ state: 'st', nonce: 'no', code_challenge: 'ch' }),
    );

    expect(url).toBe(
      `${ISSUER}/oauth/authorize?response_type=code&client_id=${CLIENT_ID}` +
        `&redirect_uri=${rawUrlEncode(REDIRECT_URI)}` +
        '&scope=openid%20email%20profile&state=st&nonce=no&code_challenge=ch&code_challenge_method=S256',
    );
  });

  it('authorizeUrl accepts overrides and optional parameters', () => {
    const url = makeClient().client.authorizeUrl({
      state: 'st',
      nonce: 'no',
      code_challenge: 'ch',
      redirect_uri: 'https://web.test/login/puzl/popup',
      scope: 'openid offline_access',
      prompt: PzAccountSdkPromptEnum.CREATE,
      login_hint: 'ana@exemplo.test',
      response_mode: 'web_message',
    });
    const query = new URL(url).searchParams;

    expect(query.get('redirect_uri')).toBe('https://web.test/login/puzl/popup');
    expect(query.get('scope')).toBe('openid offline_access');
    expect(query.get('prompt')).toBe('create');
    expect(query.get('login_hint')).toBe('ana@exemplo.test');
    expect(query.get('response_mode')).toBe('web_message');
  });

  it('authorizeUrl accepts the prompt as a raw string', () => {
    const url = makeClient().client.authorizeUrl({ state: 's', nonce: 'n', code_challenge: 'c', prompt: 'login' });

    expect(new URL(url).searchParams.get('prompt')).toBe('login');
  });

  it('authorizeUrl without any redirect_uri is a configuration error', () => {
    const { client } = makeClient({ redirectUri: '' });

    expect(() => client.authorizeUrl({ state: 's', nonce: 'n', code_challenge: 'c' })).toThrow(PzAccountSdkConfigurationException);
    expect(() => client.authorizeUrl({ state: 's', nonce: 'n', code_challenge: 'c' })).toThrow('PUZL_ACCOUNT_REDIRECT_URI');
  });

  it('authorizeUrl with an explicit redirect does not need the configured one', () => {
    const url = makeClient({ redirectUri: '' }).client.authorizeUrl({
      state: 's',
      nonce: 'n',
      code_challenge: 'c',
      redirect_uri: 'https://web.test/cb',
    });

    expect(url).toContain('redirect_uri=https%3A%2F%2Fweb.test%2Fcb');
  });

  it('logoutUrl includes the hint, the redirect and the client', () => {
    const url = makeClient().client.logoutUrl(
      new PzAccountSdkLogoutUrlDto({
        id_token_hint: 'id.token.jwt',
        post_logout_redirect_uri: 'https://web.test/login?logged_out=1',
      }),
    );

    expect(url).toBe(
      `${ISSUER}/oauth/logout?id_token_hint=id.token.jwt` +
        `&post_logout_redirect_uri=${rawUrlEncode('https://web.test/login?logged_out=1')}` +
        `&client_id=${CLIENT_ID}`,
    );
  });

  it('logoutUrl omits empty parameters', () => {
    expect(makeClient().client.logoutUrl({ state: 'xyz' })).toBe(`${ISSUER}/oauth/logout?client_id=${CLIENT_ID}&state=xyz`);
  });

  it('accountUrl points to the issuer pages', () => {
    const { client } = makeClient();

    expect(client.accountUrl(PzAccountSdkAccountPageEnum.HOME)).toBe(`${ISSUER}/`);
    expect(client.accountUrl(PzAccountSdkAccountPageEnum.PASSWORD)).toBe(`${ISSUER}/account/password`);
    expect(client.accountUrl('/account/profile')).toBe(`${ISSUER}/account/profile`);
  });

  it('accountUrl rejects an unknown page', () => {
    expect(() => makeClient().client.accountUrl('/admin' as never)).toThrow(TypeError);
  });
});
