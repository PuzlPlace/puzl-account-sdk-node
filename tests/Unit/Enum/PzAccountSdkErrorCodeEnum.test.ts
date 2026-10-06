import { describe, expect, it } from 'vitest';
import { PzAccountSdkErrorCodeEnum } from '../../../src/Enum/PzAccountSdkErrorCodeEnum.js';
import { PzAccountSdkPicturePresetEnum } from '../../../src/Enum/PzAccountSdkPicturePresetEnum.js';
import { PzAccountSdkWebhookEventTypeEnum } from '../../../src/Enum/PzAccountSdkWebhookEventTypeEnum.js';

describe('PzAccountSdkErrorCodeEnum', () => {
  it('every case has an http status and a fault classification', () => {
    expect(PzAccountSdkErrorCodeEnum.cases()).toHaveLength(34);

    for (const code of PzAccountSdkErrorCodeEnum.cases()) {
      expect(code.httpStatus()).toBeGreaterThanOrEqual(400);
      expect(code.httpStatus()).toBeLessThan(600);
      expect(typeof code.isClientFault()).toBe('boolean');
    }
  });

  it('maps the http status of each origin', () => {
    expect(PzAccountSdkErrorCodeEnum.BUSINESS_ERROR.httpStatus()).toBe(406);
    expect(PzAccountSdkErrorCodeEnum.EMAIL_ALREADY_EXISTS.httpStatus()).toBe(409);
    expect(PzAccountSdkErrorCodeEnum.INVALID_CLIENT.httpStatus()).toBe(401);
    expect(PzAccountSdkErrorCodeEnum.INVALID_GRANT.httpStatus()).toBe(400);
    expect(PzAccountSdkErrorCodeEnum.MFA_LOCKED.httpStatus()).toBe(429);
    expect(PzAccountSdkErrorCodeEnum.JWKS_UNAVAILABLE.httpStatus()).toBe(503);
  });

  it('separates the caller fault from configuration and infrastructure', () => {
    expect(PzAccountSdkErrorCodeEnum.INVALID_GRANT.isClientFault()).toBe(true);
    expect(PzAccountSdkErrorCodeEnum.ID_TOKEN_INVALID.isClientFault()).toBe(true);
    expect(PzAccountSdkErrorCodeEnum.INVALID_CLIENT.isClientFault()).toBe(false);
    expect(PzAccountSdkErrorCodeEnum.JWKS_UNAVAILABLE.isClientFault()).toBe(false);
  });

  it('tryFrom follows the exact spelling of each origin', () => {
    expect(PzAccountSdkErrorCodeEnum.tryFrom('invalid_grant')).toBe(PzAccountSdkErrorCodeEnum.INVALID_GRANT);
    expect(PzAccountSdkErrorCodeEnum.tryFrom('INVALID_GRANT')).toBeNull();
    expect(PzAccountSdkErrorCodeEnum.tryFrom('')).toBeNull();
    expect(() => PzAccountSdkErrorCodeEnum.from('nao-existe')).toThrow(TypeError);
  });

  it('serializes as the raw value', () => {
    expect(JSON.stringify({ code: PzAccountSdkErrorCodeEnum.INVALID_GRANT })).toBe('{"code":"invalid_grant"}');
    expect(`${PzAccountSdkErrorCodeEnum.MFA_LOCKED}`).toBe('MFA_LOCKED');
  });
});

describe('enums across package copies', () => {
  it('match by value, not by instance (ESM and CJS copies in one process)', () => {
    const fromOtherCopy = { name: 'INVALID_GRANT', value: 'invalid_grant' };

    expect(PzAccountSdkErrorCodeEnum.tryFrom(fromOtherCopy)).toBe(PzAccountSdkErrorCodeEnum.INVALID_GRANT);
    expect(PzAccountSdkErrorCodeEnum.tryFrom({ value: 'nao-existe' })).toBeNull();
    expect(PzAccountSdkErrorCodeEnum.tryFrom(null)).toBeNull();
  });
});

describe('other enums', () => {
  it('mirror the provider values', () => {
    expect(PzAccountSdkPicturePresetEnum.cases()).toHaveLength(22);
    expect(PzAccountSdkPicturePresetEnum.MIXER_TRUCK.value).toBe('mixer_truck');
    expect(PzAccountSdkWebhookEventTypeEnum.cases().map((type) => type.value)).toEqual([
      'consent.revoked',
      'account.disabled',
      'account.deleted',
      'tokens.revoked',
      'email.changed',
    ]);
  });
});
