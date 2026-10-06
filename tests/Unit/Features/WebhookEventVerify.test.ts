import { randomBytes } from 'node:crypto';
import { beforeEach, describe, expect, it } from 'vitest';
import { PzAccountSdkErrorCodeEnum } from '../../../src/Enum/PzAccountSdkErrorCodeEnum.js';
import { PzAccountSdkWebhookEventTypeEnum } from '../../../src/Enum/PzAccountSdkWebhookEventTypeEnum.js';
import { PzAccountSdkWebhookEventVerifyDto } from '../../../src/Features/WebhookEventVerify/Dtos/PzAccountSdkWebhookEventVerifyDto.js';
import { CLIENT_ID, ISSUER, makeClient } from '../../Support/PzAccountSdkTestCase.js';
import { RsaKeyPair } from '../../Support/RsaKeyPair.js';

const now = () => Math.floor(Date.now() / 1000);

function claims(event = 'consent-revoked', data: Record<string, unknown> = {}, overrides: Record<string, unknown> = {}) {
  return {
    iss: ISSUER,
    aud: CLIENT_ID,
    iat: now(),
    exp: now() + 300,
    jti: randomBytes(16).toString('hex'),
    txn: 'evento-123',
    sub: '01J0000000000000000000000A',
    events: { [`${ISSUER}/events/${event}`]: data },
    ...overrides,
  };
}

describe('webhookEventVerify', () => {
  const key = RsaKeyPair.forKid('chave-ativa');
  let ctx: ReturnType<typeof makeClient>;

  const verify = (token: string) => ctx.client.webhookEventVerify(new PzAccountSdkWebhookEventVerifyDto({ token }));

  beforeEach(() => {
    ctx = makeClient();
  });

  it('decodes a valid event', async () => {
    ctx.recorder.pushJson(200, RsaKeyPair.jwks(key));

    const event = await verify(key.sign(claims()));

    expect(event.isSuccess(), event.error_message).toBe(true);
    expect(event.event_type).toBe('consent.revoked');
    expect(event.getEventType()).toBe(PzAccountSdkWebhookEventTypeEnum.CONSENT_REVOKED);
    expect(event.event_uri).toBe(`${ISSUER}/events/consent-revoked`);
    expect(event.txn).toBe('evento-123');
    expect(event.sub).toBe('01J0000000000000000000000A');
    expect(event.data).toEqual({});
  });

  it('carries the data of email.changed', async () => {
    ctx.recorder.pushJson(200, RsaKeyPair.jwks(key));

    const event = await verify(key.sign(claims('email-changed', { email: 'nova@exemplo.test', email_verified: true })));

    expect(event.getEventType()).toBe(PzAccountSdkWebhookEventTypeEnum.EMAIL_CHANGED);
    expect(event.data).toEqual({ email: 'nova@exemplo.test', email_verified: true });
  });

  it('tolerates surrounding whitespace in the body', async () => {
    ctx.recorder.pushJson(200, RsaKeyPair.jwks(key));

    expect((await ctx.client.webhookEventVerify({ token: `\n${key.sign(claims())}\n` })).isSuccess()).toBe(true);
  });

  it('keeps an unknown event type as a raw string', async () => {
    ctx.recorder.pushJson(200, RsaKeyPair.jwks(key));

    const event = await verify(key.sign(claims('evento-futuro')));

    expect(event.isSuccess()).toBe(true);
    expect(event.event_type).toBe('evento.futuro');
    expect(event.getEventType()).toBeNull();
  });

  it.each([
    ['iss de outro provedor', { iss: 'https://outro.test' }],
    ['aud de outro app', { aud: 'outro-client' }],
    ['sem txn', { txn: '' }],
    ['sem jti', { jti: '' }],
    ['sem events', { events: null }],
    ['dois eventos', { events: { [`${ISSUER}/events/a`]: {}, [`${ISSUER}/events/b`]: {} } }],
    ['evento de outro emissor', { events: { 'https://outro.test/events/consent-revoked': {} } }],
    ['uri sem nome de evento', { events: { [`${ISSUER}/events/`]: {} } }],
    ['dados não-objeto', { events: { [`${ISSUER}/events/consent-revoked`]: 'x' } }],
    ['vencido', { exp: now() - 600 }],
  ])('rejects invalid events: %s', async (_name, overrides) => {
    ctx.recorder.pushJson(200, RsaKeyPair.jwks(key));

    const event = await verify(key.sign(claims('consent-revoked', {}, overrides)));

    expect(event.has_error).toBe(true);
    expect(event.getErrorCode()).toBe(PzAccountSdkErrorCodeEnum.WEBHOOK_TOKEN_INVALID);
    expect(event.event_type).toBe('');
  });

  it('does not accept an id_token as a webhook', async () => {
    ctx.recorder.pushJson(200, RsaKeyPair.jwks(key));
    const idToken = key.sign({ iss: ISSUER, aud: CLIENT_ID, sub: 's', iat: now(), exp: now() + 60, nonce: 'n' });

    expect((await verify(idToken)).getErrorCode()).toBe(PzAccountSdkErrorCodeEnum.WEBHOOK_TOKEN_INVALID);
  });

  it('reports the jwks down as unavailable', async () => {
    ctx.recorder.pushConnectTimeout();

    expect((await verify(key.sign(claims()))).getErrorCode()).toBe(PzAccountSdkErrorCodeEnum.JWKS_UNAVAILABLE);
  });

  it('masks the token in the input dto', () => {
    expect(new PzAccountSdkWebhookEventVerifyDto({ token: 'a.b.c' }).toArray()).toEqual({ token: '********' });
  });
});
