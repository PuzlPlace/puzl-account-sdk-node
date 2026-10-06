import { describe, expect, it } from 'vitest';
import { PzAccountSdkErrorCodeEnum } from '../../../src/Enum/PzAccountSdkErrorCodeEnum.js';
import { PzAccountSdkPromptEnum } from '../../../src/Enum/PzAccountSdkPromptEnum.js';
import { PzAccountSdkTokenTypeHintEnum } from '../../../src/Enum/PzAccountSdkTokenTypeHintEnum.js';
import { PzAccountSdkAuthorizeUrlDto } from '../../../src/Features/AuthorizeUrl/Dtos/PzAccountSdkAuthorizeUrlDto.js';
import { PzAccountSdkIdentityViewDto } from '../../../src/Features/IdTokenVerify/Dtos/PzAccountSdkIdentityViewDto.js';
import { PzAccountSdkConsentListViewDto } from '../../../src/Features/MeConsentList/Dtos/PzAccountSdkConsentListViewDto.js';
import { PzAccountSdkResultDto } from '../../../src/Features/Shared/Dtos/PzAccountSdkResultDto.js';
import { PzAccountSdkTokenViewDto } from '../../../src/Features/Shared/Dtos/PzAccountSdkTokenViewDto.js';
import { PzAccountSdkUserProfileViewDto } from '../../../src/Features/Shared/Dtos/PzAccountSdkUserProfileViewDto.js';
import { PzAccountSdkUserViewDto } from '../../../src/Features/Shared/Dtos/PzAccountSdkUserViewDto.js';
import { PzAccountSdkTokenRevokeDto } from '../../../src/Features/TokenRevoke/Dtos/PzAccountSdkTokenRevokeDto.js';
import { PzAccountSdkWebhookEventViewDto } from '../../../src/Features/WebhookEventVerify/Dtos/PzAccountSdkWebhookEventViewDto.js';

describe('DTOs', () => {
  it('the result dto normalizes field errors', () => {
    const result = PzAccountSdkResultDto.from({
      has_error: true,
      error_code: 'VALIDATION_ERROR',
      errors: { email: ['inválido', ['aninhado']], name: 'obrigatório', vazio: null },
      http_status: '422',
    });

    expect(result.errors).toEqual({ email: ['inválido'], name: ['obrigatório'], vazio: [] });
    expect(result.http_status).toBe(422);
    expect(result.getErrorCode()).toBe(PzAccountSdkErrorCodeEnum.VALIDATION_ERROR);
    expect(result.firstFieldError()).toBe('inválido');
  });

  it('the result dto defaults to success', () => {
    const result = PzAccountSdkResultDto.from({});

    expect(result.isSuccess()).toBe(true);
    expect(result.getErrorCode()).toBeNull();
    expect(result.firstFieldError()).toBeNull();
    expect(result.isServiceUnavailable()).toBe(false);
    expect(PzAccountSdkResultDto.from('lixo').isSuccess()).toBe(true);
  });

  it('coerces loose values with the same rules as the PHP sdk', () => {
    const user = PzAccountSdkUserViewDto.from({ id: '42', name: 7, email: ['x'], is_active: 1, mfa_enabled: '0', locale: true });

    expect(user.id).toBe(42);
    expect(user.name).toBe('7');
    expect(user.email).toBe('');
    expect(user.is_active).toBe(true);
    expect(user.mfa_enabled).toBe(false);
    expect(user.locale).toBe('1');
  });

  it.each([
    ['token', PzAccountSdkTokenViewDto, { access_token: 'a', refresh_token: 'r', expires_in: 60, http_status: 200 }],
    ['profile', PzAccountSdkUserProfileViewDto, { user: { sub: 's', address: { country: 'BR' } }, http_status: 200 }],
    ['identity', PzAccountSdkIdentityViewDto, { sub: 's', amr: ['pwd'], claims: { sub: 's' }, http_status: 200 }],
    ['webhook', PzAccountSdkWebhookEventViewDto, { event_type: 'tokens.revoked', data: { a: 1 }, http_status: 200 }],
    ['consents', PzAccountSdkConsentListViewDto, { consents: [{ client_id: 'c', scopes: ['a'] }], http_status: 200 }],
  ] as const)('the %s view round-trips through toArray', (_name, Dto, values) => {
    const dto = (Dto as { from(v: unknown): PzAccountSdkResultDto }).from(values);

    expect((Dto as { from(v: unknown): PzAccountSdkResultDto }).from(dto.toArray())).toEqual(dto);
  });

  it('input dtos accept enums or raw values', () => {
    expect(PzAccountSdkAuthorizeUrlDto.from({ prompt: 'login' }).prompt).toBe(PzAccountSdkPromptEnum.LOGIN);
    expect(PzAccountSdkAuthorizeUrlDto.from({ prompt: 'inventado' }).prompt).toBeNull();
    expect(PzAccountSdkTokenRevokeDto.from({ token: 't', token_type_hint: PzAccountSdkTokenTypeHintEnum.ACCESS_TOKEN }).token_type_hint).toBe(
      PzAccountSdkTokenTypeHintEnum.ACCESS_TOKEN,
    );
  });

  it('toJson and JSON.stringify serialize the dto', () => {
    const dto = new PzAccountSdkTokenViewDto({ access_token: 'a' });

    expect(JSON.parse(dto.toJson()).access_token).toBe('a');
    expect(JSON.parse(JSON.stringify(dto)).access_token).toBe('a');
  });
});
