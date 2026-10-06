import { beforeEach, describe, expect, it } from 'vitest';
import { PzAccountSdkErrorCodeEnum } from '../../../src/Enum/PzAccountSdkErrorCodeEnum.js';
import { PzAccountSdkGenderEnum } from '../../../src/Enum/PzAccountSdkGenderEnum.js';
import { PzAccountSdkMeEmailChangeDto } from '../../../src/Features/MeEmailChange/Dtos/PzAccountSdkMeEmailChangeDto.js';
import { PzAccountSdkMePasswordChangeDto } from '../../../src/Features/MePasswordChange/Dtos/PzAccountSdkMePasswordChangeDto.js';
import { PzAccountSdkMeUpdateDto } from '../../../src/Features/MeUpdate/Dtos/PzAccountSdkMeUpdateDto.js';
import { PzAccountSdkAddressDto } from '../../../src/Features/Shared/Dtos/PzAccountSdkAddressDto.js';
import { PzAccountSdkUserViewDto } from '../../../src/Features/Shared/Dtos/PzAccountSdkUserViewDto.js';
import { PzAccountSdkUserRegisterDto } from '../../../src/Features/UserRegister/Dtos/PzAccountSdkUserRegisterDto.js';
import { assertApiRequest, ISSUER, makeClient, USER_TOKEN } from '../../Support/PzAccountSdkTestCase.js';

function userPayload(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id: 42,
    sub: '01J0000000000000000000000A',
    name: 'Ana',
    email: 'ana@exemplo.test',
    is_active: true,
    email_verified_at: '2026-01-01T00:00:00+00:00',
    birthdate: '1990-05-10',
    gender: 'female',
    phone_number: null,
    phone_number_verified_at: null,
    locale: 'pt-BR',
    zoneinfo: 'America/Sao_Paulo',
    picture: 'https://account.test/pictures/a.webp',
    address: { street_address: 'Rua A, 1', locality: 'São Paulo', region: 'SP', postal_code: '01000-000', country: 'BR' },
    mfa_enabled: false,
    deleted_at: null,
    ...overrides,
  };
}

const update = (name = 'Ana Maria') =>
  new PzAccountSdkMeUpdateDto({
    access_token: USER_TOKEN,
    name,
    email: 'ana@exemplo.test',
    birthdate: '1990-05-10',
    locale: 'pt-BR',
    zoneinfo: 'America/Sao_Paulo',
  });

describe('account API: register, me, profile, password, email', () => {
  let ctx: ReturnType<typeof makeClient>;

  beforeEach(() => {
    ctx = makeClient();
  });

  it('register posts public json with password_confirmation', async () => {
    ctx.recorder.pushSuccess(201, userPayload());

    const result = await ctx.client.userRegister(
      new PzAccountSdkUserRegisterDto({
        name: 'Ana',
        email: 'ana@exemplo.test',
        password: 's3nh@-forte',
        birthdate: '1990-05-10',
        locale: 'pt-BR',
      }),
    );
    const request = ctx.recorder.lastRequest();

    expect(request.method).toBe('POST');
    expect(request.url).toBe(`${ISSUER}/api/identity/users`);
    expect(request.headers['authorization']).toBeUndefined();
    expect(request.headers['content-type']).toBe('application/json');
    expect(request.formUrlEncoded).toBe(false);
    expect(request.bodyArray).toEqual({
      name: 'Ana',
      email: 'ana@exemplo.test',
      password: 's3nh@-forte',
      password_confirmation: 's3nh@-forte',
      birthdate: '1990-05-10',
      locale: 'pt-BR',
    });
    expect(result.isSuccess()).toBe(true);
    expect(result.http_status).toBe(201);
    expect(result.user?.sub).toBe('01J0000000000000000000000A');
  });

  it('register maps conflict and validation errors', async () => {
    ctx.recorder.pushError(409, 'EMAIL_ALREADY_EXISTS', 'Este e-mail já está cadastrado.');
    ctx.recorder.pushError(422, 'VALIDATION_ERROR', 'Dados inválidos.', { birthdate: ['Precisa ter 18 anos.'] });
    const input = { name: 'Ana', email: 'ana@exemplo.test', password: 's', birthdate: '2015-01-01' };

    const conflict = await ctx.client.userRegister(input);
    const invalid = await ctx.client.userRegister(input);

    expect(conflict.getErrorCode()).toBe(PzAccountSdkErrorCodeEnum.EMAIL_ALREADY_EXISTS);
    expect(conflict.user).toBeNull();
    expect(invalid.getErrorCode()).toBe(PzAccountSdkErrorCodeEnum.VALIDATION_ERROR);
    expect(invalid.firstFieldError()).toBe('Precisa ter 18 anos.');
  });

  it('meShow maps the whole account', async () => {
    ctx.recorder.pushSuccess(200, userPayload());

    const result = await ctx.client.meShow({ access_token: USER_TOKEN });

    assertApiRequest(ctx.recorder.lastRequest(), 'GET', '/api/identity/me');
    expect(result.user?.id).toBe(42);
    expect(result.user?.name).toBe('Ana');
    expect(result.user?.isEmailVerified()).toBe(true);
    expect(result.user?.phone_number).toBe('');
    expect(result.user?.address?.country).toBe('BR');
    expect(result.user?.mfa_enabled).toBe(false);
  });

  it('meShow with a dead token is unauthenticated', async () => {
    ctx.recorder.pushError(401, 'UNAUTHENTICATED');

    const result = await ctx.client.meShow({ access_token: 'morto' });

    expect(result.getErrorCode()).toBe(PzAccountSdkErrorCodeEnum.UNAUTHENTICATED);
    expect(result.user).toBeNull();
  });

  it('meShow from a third party client is forbidden', async () => {
    ctx.recorder.pushError(403, 'FORBIDDEN');

    const result = await ctx.client.meShow({ access_token: USER_TOKEN });

    expect(result.getErrorCode()).toBe(PzAccountSdkErrorCodeEnum.FORBIDDEN);
    expect(result.getErrorCode()?.isClientFault()).toBe(false);
  });

  it('meUpdate sends a full PUT with nulls for empty optionals', async () => {
    ctx.recorder.pushSuccess(200, userPayload({ name: 'Ana Maria' }));

    const result = await ctx.client.meUpdate(update());
    const request = ctx.recorder.lastRequest();

    assertApiRequest(request, 'PUT', '/api/identity/me');
    expect(request.bodyArray).toEqual({
      name: 'Ana Maria',
      email: 'ana@exemplo.test',
      birthdate: '1990-05-10',
      gender: null,
      phone_number: null,
      locale: 'pt-BR',
      zoneinfo: 'America/Sao_Paulo',
      address: null,
    });
    expect(Object.keys(request.bodyArray)).toEqual(['name', 'email', 'birthdate', 'gender', 'phone_number', 'locale', 'zoneinfo', 'address']);
    expect(result.user?.name).toBe('Ana Maria');
  });

  it('meUpdate.fromUser keeps the current values and applies the changes', () => {
    const user = PzAccountSdkUserViewDto.from(userPayload());

    const dto = PzAccountSdkMeUpdateDto.fromUser('token-x', user, {
      name: 'Nome Novo',
      address: new PzAccountSdkAddressDto({ locality: 'Campinas', country: 'BR' }),
    });

    expect(dto.access_token).toBe('token-x');
    expect(dto.name).toBe('Nome Novo');
    expect(dto.email).toBe('ana@exemplo.test');
    expect(dto.gender).toBe('female');
    expect(dto.zoneinfo).toBe('America/Sao_Paulo');
    expect(dto.address?.locality).toBe('Campinas');
    expect(dto.address?.street_address).toBe('');
  });

  it('meUpdate.fromUser keeps the current address when it does not change', () => {
    const dto = PzAccountSdkMeUpdateDto.fromUser('t', PzAccountSdkUserViewDto.from(userPayload()));

    expect(dto.address?.street_address).toBe('Rua A, 1');
  });

  it('meUpdate.fromUser can erase the address with null', () => {
    const dto = PzAccountSdkMeUpdateDto.fromUser('t', PzAccountSdkUserViewDto.from(userPayload()), { address: null });

    expect(dto.address).toBeNull();
  });

  it('meUpdate accepts the gender enum without erasing it', () => {
    const user = PzAccountSdkUserViewDto.from(userPayload({ gender: null }));

    const dto = PzAccountSdkMeUpdateDto.fromUser('t', user, { gender: PzAccountSdkGenderEnum.OTHER });

    expect(dto.gender).toBe('other');
  });

  it('mePasswordChange puts both passwords and the optional code', async () => {
    ctx.recorder.pushNoContent();
    ctx.recorder.pushNoContent();

    const result = await ctx.client.mePasswordChange({ access_token: USER_TOKEN, current_password: 'atual', password: 'nova-senha' });
    await ctx.client.mePasswordChange({ access_token: USER_TOKEN, current_password: 'atual', password: 'nova-senha', code: '123456' });

    assertApiRequest(ctx.recorder.firstRequest(), 'PUT', '/api/identity/me/password');
    expect(ctx.recorder.firstRequest().bodyArray).toEqual({
      current_password: 'atual',
      password: 'nova-senha',
      password_confirmation: 'nova-senha',
    });
    expect(ctx.recorder.lastRequest().bodyArray['code']).toBe('123456');
    expect(result.isSuccess()).toBe(true);
    expect(result.http_status).toBe(204);
  });

  it('mePasswordChange with a wrong current password', async () => {
    ctx.recorder.pushError(401, 'INVALID_CURRENT_PASSWORD');

    const result = await ctx.client.mePasswordChange({ access_token: USER_TOKEN, current_password: 'x', password: 'y' });

    expect(result.getErrorCode()).toBe(PzAccountSdkErrorCodeEnum.INVALID_CURRENT_PASSWORD);
  });

  it('mePasswordChange does not treat a 200 as success', async () => {
    ctx.recorder.pushSuccess(200, null);

    const result = await ctx.client.mePasswordChange({ access_token: USER_TOKEN, current_password: 'x', password: 'y' });

    expect(result.has_error).toBe(true);
  });

  it('meEmailChange is accepted with 202', async () => {
    ctx.recorder.pushJson(202, { error: false, message: 'Confirme no e-mail antigo.', data: null });

    const result = await ctx.client.meEmailChange({ access_token: USER_TOKEN, email: 'nova@exemplo.test', current_password: 'senha' });

    assertApiRequest(ctx.recorder.lastRequest(), 'POST', '/api/identity/me/email');
    expect(ctx.recorder.lastRequest().bodyArray).toEqual({ email: 'nova@exemplo.test', current_password: 'senha' });
    expect(result.isSuccess()).toBe(true);
    expect(result.http_status).toBe(202);
  });

  it('meEmailChange already requested', async () => {
    ctx.recorder.pushError(409, 'EMAIL_CHANGE_ALREADY_REQUESTED');

    const result = await ctx.client.meEmailChange(
      new PzAccountSdkMeEmailChangeDto({ access_token: USER_TOKEN, email: 'n@e.test', current_password: 's', code: '654321' }),
    );

    expect(ctx.recorder.lastRequest().bodyArray['code']).toBe('654321');
    expect(result.getErrorCode()).toBe(PzAccountSdkErrorCodeEnum.EMAIL_CHANGE_ALREADY_REQUESTED);
  });

  it('masks passwords, tokens and codes in the input dtos', () => {
    const register = new PzAccountSdkUserRegisterDto({ name: 'A', email: 'a@e.test', password: 'segredo-1', birthdate: '1990-01-01' });
    const password = new PzAccountSdkMePasswordChangeDto({
      access_token: 'access-x',
      current_password: 'segredo-1',
      password: 'segredo-1',
      code: '123456',
    });
    const email = new PzAccountSdkMeEmailChangeDto({ access_token: 'access-x', email: 'n@e.test', current_password: 'segredo-1' });

    for (const json of [register.toJson(), password.toJson(), email.toJson(), JSON.stringify([register, password, email])]) {
      expect(json).not.toContain('segredo-1');
      expect(json).not.toContain('access-x');
      expect(json).not.toContain('123456');
    }
  });

  it('falls back to the status text on a non-json error body', async () => {
    ctx.recorder.push(new Response('<html>nginx</html>', { status: 502, statusText: 'Bad Gateway' }));

    const result = await ctx.client.meShow({ access_token: USER_TOKEN });

    expect(result.error_code).toBe('');
    expect(result.error_message).toBe('Bad Gateway');
    expect(result.isServiceUnavailable()).toBe(true);
  });
});
