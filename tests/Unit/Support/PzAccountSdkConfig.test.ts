import { describe, expect, it } from 'vitest';
import { PzAccountSdkConfigurationException } from '../../../src/Exception/PzAccountSdkConfigurationException.js';
import { PzAccountSdkConfig } from '../../../src/Support/PzAccountSdkConfig.js';

const base = { issuer: 'https://account.test', clientId: 'c' };

describe('PzAccountSdkConfig', () => {
  it('normalizes values', () => {
    const config = PzAccountSdkConfig.from({
      issuer: ' https://account.test/ ',
      clientId: ' cliente ',
      clientSecret: 'segredo',
      redirectUri: 'https://app.test/cb',
      timeout: '15',
      jwksCacheTtl: '120',
      leeway: '0',
    });

    expect(config.issuer).toBe('https://account.test');
    expect(config.clientId).toBe('cliente');
    expect(config.timeout).toBe(15);
    expect(config.jwksCacheTtl).toBe(120);
    expect(config.leeway).toBe(0);
    expect(config.jwksUri()).toBe('https://account.test/.well-known/jwks.json');
  });

  it('falls back to the defaults on empty or invalid values', () => {
    const config = PzAccountSdkConfig.from({
      scope: '',
      tokenAuthMethod: undefined,
      timeout: 0,
      jwksCacheTtl: -5,
      leeway: '',
      issuer: ['nao-escalar'] as never,
    });

    expect(config.issuer).toBe('');
    expect(config.scope).toBe('openid email profile');
    expect(config.tokenAuthMethod).toBe(PzAccountSdkConfig.AUTH_METHOD_POST);
    expect(config.timeout).toBe(10);
    expect(config.jwksCacheTtl).toBe(3600);
    expect(config.leeway).toBe(60);
  });

  it('reads PUZL_ACCOUNT_* from the environment, with overrides winning', () => {
    const config = PzAccountSdkConfig.fromEnv(
      {
        PUZL_ACCOUNT_ISSUER: 'https://account.test/',
        PUZL_ACCOUNT_CLIENT_ID: 'do-env',
        PUZL_ACCOUNT_CLIENT_SECRET: 's',
        PUZL_ACCOUNT_REDIRECT_URI: 'https://app.test/cb',
        PUZL_ACCOUNT_SCOPE: 'openid',
        PUZL_ACCOUNT_TOKEN_AUTH_METHOD: 'client_secret_basic',
        PUZL_ACCOUNT_TIMEOUT: '5',
        PUZL_ACCOUNT_JWKS_CACHE_TTL: '60',
        PUZL_ACCOUNT_LEEWAY: '30',
      },
      { clientId: 'das-opcoes', redirectUri: undefined },
    );

    expect(config.issuer).toBe('https://account.test');
    expect(config.clientId).toBe('das-opcoes');
    expect(config.clientSecret).toBe('s');
    expect(config.redirectUri).toBe('https://app.test/cb');
    expect(config.scope).toBe('openid');
    expect(config.tokenAuthMethod).toBe('client_secret_basic');
    expect(config.timeout).toBe(5);
    expect(config.jwksCacheTtl).toBe(60);
    expect(config.leeway).toBe(30);
  });

  it('keeps the client secret out of logs', () => {
    const config = PzAccountSdkConfig.from({ ...base, clientSecret: 'segredo-x' });

    expect(config.clientSecret).toBe('segredo-x');
    expect(JSON.stringify(config)).not.toContain('segredo-x');
    expect(Object.keys(config)).not.toContain('clientSecret');
  });

  it('assertUsable names the missing env var', () => {
    expect(() => PzAccountSdkConfig.from({ issuer: 'https://account.test' }).assertUsable()).toThrow(PzAccountSdkConfigurationException);
    expect(() => PzAccountSdkConfig.from({ issuer: 'https://account.test' }).assertUsable()).toThrow('PUZL_ACCOUNT_CLIENT_ID');
  });

  it('assertUsable requires the issuer first', () => {
    expect(() => PzAccountSdkConfig.from({ clientId: 'c' }).assertUsable()).toThrow('PUZL_ACCOUNT_ISSUER');
  });

  it('client auth requires the secret unless the method is none', () => {
    expect(() => PzAccountSdkConfig.from({ ...base, tokenAuthMethod: 'none' }).assertClientAuthUsable()).not.toThrow();
    expect(() => PzAccountSdkConfig.from(base).assertClientAuthUsable()).toThrow('PUZL_ACCOUNT_CLIENT_SECRET');
  });

  it('client auth rejects an unknown method', () => {
    const config = PzAccountSdkConfig.from({ ...base, clientSecret: 's', tokenAuthMethod: 'private_key_jwt' });

    expect(() => config.assertClientAuthUsable()).toThrow(PzAccountSdkConfigurationException);
    expect(() => config.assertClientAuthUsable()).toThrow('PUZL_ACCOUNT_TOKEN_AUTH_METHOD');
  });

  it('assertRedirectUsable requires the redirect uri', () => {
    expect(() => PzAccountSdkConfig.from(base).assertRedirectUsable()).toThrow('PUZL_ACCOUNT_REDIRECT_URI');
  });

  it('isConfigured mirrors the minimum needed', () => {
    expect(PzAccountSdkConfig.from({}).isConfigured()).toBe(false);
    expect(PzAccountSdkConfig.from(base).isConfigured()).toBe(false);
    expect(PzAccountSdkConfig.from({ ...base, clientSecret: 's' }).isConfigured()).toBe(true);
    expect(PzAccountSdkConfig.from({ ...base, tokenAuthMethod: 'none' }).isConfigured()).toBe(true);
    expect(PzAccountSdkConfig.from({ ...base, clientSecret: 's', tokenAuthMethod: 'x' }).isConfigured()).toBe(false);
  });
});
