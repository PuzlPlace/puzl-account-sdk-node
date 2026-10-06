import { describe, expect, it } from 'vitest';
import { PzAccountSdkAccountPageEnum } from '../../../src/Enum/PzAccountSdkAccountPageEnum.js';
import { PzAccountSdkErrorCodeEnum } from '../../../src/Enum/PzAccountSdkErrorCodeEnum.js';
import { PzAccountSdkClient } from '../../../src/PzAccountSdkClient.js';
import { PzAccountSdkResultDto } from '../../../src/Features/Shared/Dtos/PzAccountSdkResultDto.js';
import { PzAccountSdkTokenViewDto } from '../../../src/Features/Shared/Dtos/PzAccountSdkTokenViewDto.js';
import { PzAccountSdkClientFake } from '../../../src/Testing/PzAccountSdkClientFake.js';
import { PzAccountSdkFakeResponses, type PzAccountSdkFakeMethod } from '../../../src/Testing/PzAccountSdkFakeResponses.js';

/** Entrada mínima válida de cada operação programável. */
const INPUTS: Record<PzAccountSdkFakeMethod, unknown> = {
  discoveryShow: undefined,
  tokenExchangeCode: { code: 'c', code_verifier: 'v' },
  tokenRefresh: { refresh_token: 'r' },
  tokenPassword: { username: 'u', password: 'p' },
  tokenRevoke: { token: 't' },
  userInfoShow: { access_token: 'a' },
  idTokenVerify: { id_token: 'i', nonce: 'n' },
  webhookEventVerify: { token: 't' },
  userRegister: { name: 'n', email: 'e@e.test', password: 'p', birthdate: '1990-01-01' },
  meShow: { access_token: 'a' },
  meUpdate: { access_token: 'a', name: 'n', email: 'e@e.test', birthdate: '1990-01-01', locale: 'pt-BR', zoneinfo: 'UTC' },
  mePasswordChange: { access_token: 'a', current_password: 'c', password: 'p' },
  meEmailChange: { access_token: 'a', email: 'n@e.test', current_password: 'c' },
  mePictureUpload: { access_token: 'a', contents: 'x', filename: 'a.png' },
  mePicturePresetSet: { access_token: 'a', preset: 'rocket' },
  mePictureDelete: { access_token: 'a' },
  meMfaShow: { access_token: 'a' },
  meMfaEnroll: { access_token: 'a', current_password: 'c' },
  meMfaEnrollConfirm: { access_token: 'a', code: '1' },
  meMfaDisable: { access_token: 'a', current_password: 'c', code: '1' },
  meMfaRecoveryCodesRegenerate: { access_token: 'a', current_password: 'c', code: '1' },
  meConsentList: { access_token: 'a' },
  meConsentRevoke: { access_token: 'a', client_id: 'c' },
};

const call = (fake: PzAccountSdkClientFake, method: PzAccountSdkFakeMethod) =>
  (fake[method] as (input: unknown) => Promise<PzAccountSdkResultDto>).call(fake, INPUTS[method]);

describe('PzAccountSdkClientFake', () => {
  it('succeeds on every operation by default', async () => {
    const fake = new PzAccountSdkClientFake();

    const exchange = await fake.tokenExchangeCode({ code: 'c', code_verifier: 'v' });
    expect(exchange.access_token).toBe('fake-access-token');
    expect(exchange.refresh_token).toBe('fake-refresh-token');
    expect((await fake.tokenPassword({ username: 'u', password: 'p' })).refresh_token).toBe('');

    const identity = await fake.idTokenVerify({ id_token: 'fake-id-token', nonce: 'nonce-x' });
    expect(identity.sub).toBe(PzAccountSdkClientFake.FAKE_SUB);
    expect(identity.claims['nonce']).toBe('nonce-x');

    expect((await fake.webhookEventVerify({ token: 't' })).event_type).toBe('tokens.revoked');

    const me = await fake.meShow({ access_token: 't' });
    expect(me.user?.sub).toBe(PzAccountSdkClientFake.FAKE_SUB);
    expect(me.http_status).toBe(200);

    expect((await fake.meMfaShow({ access_token: 't' })).isSuccess()).toBe(true);
    expect((await fake.meConsentList({ access_token: 't' })).consents).toEqual([]);
    expect((await fake.discoveryShow()).issuer).toBe(PzAccountSdkClientFake.FAKE_ISSUER);
  });

  it('echoes the input name and email on the default success', async () => {
    const result = await new PzAccountSdkClientFake().meUpdate({
      access_token: 't',
      name: 'Bia',
      email: 'bia@e.test',
      birthdate: '1990-01-01',
      locale: 'pt-BR',
      zoneinfo: 'UTC',
    });

    expect(result.user?.name).toBe('Bia');
    expect(result.user?.email).toBe('bia@e.test');
  });

  it('respondWithError programs a failure', async () => {
    const fake = new PzAccountSdkClientFake().respondWithError('tokenPassword', 'invalid_grant', 400, 'Credenciais inválidas.');

    const result = await fake.tokenPassword({ username: 'u', password: 'p' });

    expect(result.getErrorCode()).toBe(PzAccountSdkErrorCodeEnum.INVALID_GRANT);
    expect(result.error_message).toBe('Credenciais inválidas.');
  });

  it('consumes queued responses in order and repeats the last one', async () => {
    const fake = new PzAccountSdkClientFake()
      .respondWithError('meShow', 'UNAUTHENTICATED', 401)
      .respond('meShow', { user: { sub: 'depois' } });

    expect((await fake.meShow({ access_token: 't' })).has_error).toBe(true);
    expect((await fake.meShow({ access_token: 't' })).user?.sub).toBe('depois');
    expect((await fake.meShow({ access_token: 't' })).user?.sub).toBe('depois');
  });

  it('accepts functions (sync or async) and ready dtos', async () => {
    const fake = new PzAccountSdkClientFake()
      .respond('tokenExchangeCode', (input) => ({ access_token: `para-${input.redirect_uri}` }))
      .respond('tokenRefresh', new PzAccountSdkTokenViewDto({ access_token: 'pronto' }))
      .respond('tokenPassword', async () => ({ access_token: 'assincrono' }));

    expect((await fake.tokenExchangeCode({ code: 'c', code_verifier: 'v', redirect_uri: 'abc' })).access_token).toBe('para-abc');
    expect((await fake.tokenRefresh({ refresh_token: 'r' })).access_token).toBe('pronto');
    expect((await fake.tokenPassword({ username: 'u', password: 'p' })).access_token).toBe('assincrono');
  });

  it('records calls, including the local builders', async () => {
    const fake = new PzAccountSdkClientFake();

    const pkce = fake.pkceCreate();
    const url = fake.authorizeUrl({ state: pkce.state, nonce: pkce.nonce, code_challenge: pkce.code_challenge });
    fake.accountUrl(PzAccountSdkAccountPageEnum.PASSWORD);
    await fake.meShow({ access_token: 't1' });
    await fake.meShow({ access_token: 't2' });

    expect(pkce.state).toBe('fake-state');
    expect(url.startsWith(`${PzAccountSdkClientFake.FAKE_ISSUER}/oauth/authorize?`)).toBe(true);
    expect(fake.callCount()).toBe(5);
    expect(fake.callCount('meShow')).toBe(2);
    expect(fake.lastInput('meShow')?.access_token).toBe('t2');
    expect(fake.lastInput('accountUrl')).toBe(PzAccountSdkAccountPageEnum.PASSWORD);
    expect(fake.lastInput('tokenRevoke')).toBeNull();

    fake.reset();

    expect(fake.callCount()).toBe(0);
  });

  it('fails loudly on unknown method names', () => {
    const fake = new PzAccountSdkClientFake();

    expect(() => fake.callCount('userLogin' as never)).toThrow(/desconhecida/);
    expect(() => fake.respond('authorizeUrl' as never, {})).toThrow(TypeError);
  });

  it('has a default success for every programmable operation', async () => {
    const fake = new PzAccountSdkClientFake();

    for (const method of Object.keys(PzAccountSdkFakeResponses.RETURN_DTO) as PzAccountSdkFakeMethod[]) {
      const result = await call(fake, method);

      expect(result.isSuccess(), method).toBe(true);
      expect(result, method).toBeInstanceOf(PzAccountSdkFakeResponses.RETURN_DTO[method]);
      expect(result.http_status, method).toBe(PzAccountSdkFakeResponses.SUCCESS_STATUS[method]);
    }
  });

  it('rejects up front a dto of the wrong class', () => {
    expect(() => new PzAccountSdkClientFake().respond('meShow', new PzAccountSdkResultDto() as never)).toThrow(/meShow/);
  });

  it('gives programmed success objects the real success status', async () => {
    const fake = new PzAccountSdkClientFake().respond('userRegister', { user: { sub: 'x' } });

    const result = await fake.userRegister({ name: 'n', email: 'e@e.test', password: 'p', birthdate: '1990-01-01' });

    expect(result.http_status).toBe(201);
  });

  it('can be used wherever the real client is expected', async () => {
    class AuthService {
      constructor(readonly puzl: PzAccountSdkClient) {}
    }
    const fake = new PzAccountSdkClientFake();

    const service = new AuthService(fake);

    expect(service.puzl).toBeInstanceOf(PzAccountSdkClient);
    expect((await service.puzl.meShow({ access_token: 't' })).isSuccess()).toBe(true);
    expect(fake.callCount('meShow')).toBe(1);
  });

  it('hands typed inputs to response functions', async () => {
    const fake = new PzAccountSdkClientFake().respond('tokenPassword', (input) => ({ access_token: `para-${input.username}` }));

    expect((await fake.tokenPassword({ username: 'ana', password: 'p' })).access_token).toBe('para-ana');
  });

  it('never reaches the network', async () => {
    const fake = new PzAccountSdkClientFake();

    expect((await fake.discoveryShow()).isSuccess()).toBe(true);
    expect(fake.isConfigured()).toBe(true);
  });

  it('lets isConfigured be toggled', () => {
    const fake = new PzAccountSdkClientFake();

    expect(fake.isConfigured()).toBe(true);
    fake.configured = false;
    expect(fake.isConfigured()).toBe(false);
  });
});
