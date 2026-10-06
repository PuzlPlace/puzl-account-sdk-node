import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';
import { PzAccountSdkErrorCodeEnum } from '../../../src/Enum/PzAccountSdkErrorCodeEnum.js';
import { PzAccountSdkPicturePresetEnum } from '../../../src/Enum/PzAccountSdkPicturePresetEnum.js';
import { PzAccountSdkMeMfaDisableDto } from '../../../src/Features/MeMfaDisable/Dtos/PzAccountSdkMeMfaDisableDto.js';
import { PzAccountSdkMeMfaEnrollDto } from '../../../src/Features/MeMfaEnroll/Dtos/PzAccountSdkMeMfaEnrollDto.js';
import { PzAccountSdkMePicturePresetSetDto } from '../../../src/Features/MePicturePresetSet/Dtos/PzAccountSdkMePicturePresetSetDto.js';
import { PzAccountSdkMePictureUploadDto } from '../../../src/Features/MePictureUpload/Dtos/PzAccountSdkMePictureUploadDto.js';
import { assertApiRequest, ISSUER, makeClient, USER_TOKEN as TOKEN } from '../../Support/PzAccountSdkTestCase.js';

const user = (overrides: Record<string, unknown> = {}) => ({ id: 1, sub: 's', name: 'Ana', email: 'a@e.test', ...overrides });

describe('account API: picture, MFA and consents', () => {
  let ctx: ReturnType<typeof makeClient>;

  beforeEach(() => {
    ctx = makeClient();
  });

  it('picture upload is multipart', async () => {
    ctx.recorder.pushSuccess(200, user({ picture: 'https://account.test/pictures/novo.webp' }));

    const result = await ctx.client.mePictureUpload({ access_token: TOKEN, contents: Buffer.from('bytes-da-imagem'), filename: 'eu.png' });
    const request = ctx.recorder.lastRequest();

    expect(request.method).toBe('POST');
    expect(request.url).toBe(`${ISSUER}/api/identity/me/picture`);
    expect(request.headers['authorization']).toBe(`Bearer ${TOKEN}`);
    expect(request.headers['content-type']).toMatch(/^multipart\/form-data; boundary=/);
    expect(request.multiparts).toEqual([{ name: 'picture', filename: 'eu.png', type: 'image/png', contents: 'bytes-da-imagem' }]);
    expect(result.user?.picture).toBe('https://account.test/pictures/novo.webp');
  });

  it('the picture dto reads from disk', () => {
    const path = join(mkdtempSync(join(tmpdir(), 'pzaccountsdk-')), 'origem.bin');
    writeFileSync(path, 'conteudo');

    const dto = PzAccountSdkMePictureUploadDto.fromPath(TOKEN, path, 'foto.jpg');

    expect(dto.contents.toString()).toBe('conteudo');
    expect(dto.filename).toBe('foto.jpg');
    expect(dto.mimeType()).toBe('image/jpeg');
    expect(dto.toArray()).toEqual({ access_token: '********', filename: 'foto.jpg', size: 8 });
  });

  it('the picture dto rejects a missing file', () => {
    expect(() => PzAccountSdkMePictureUploadDto.fromPath(TOKEN, '/nao/existe.png')).toThrow(TypeError);
  });

  it.each([
    ['../minha "foto"\r\n.png', 'minha_foto_.png'],
    ['C:\\Users\\ana\\eu.jpg', 'eu.jpg'],
    ['a/b/', 'b'],
    ['..', 'picture'],
    ['', 'picture'],
    ['__.foto.webp..', 'foto.webp'],
  ])('sanitizes the filename %j into %j', (filename, expected) => {
    expect(new PzAccountSdkMePictureUploadDto({ access_token: TOKEN, contents: Buffer.from('x'), filename }).filename).toBe(expected);
  });

  it.each([
    ['Uint8Array', new Uint8Array([1, 2, 3])],
    ['Uint16Array', new Uint16Array([1, 2])],
    ['DataView', new DataView(new Uint8Array([1, 2, 3, 4]).buffer, 1, 2)],
    ['ArrayBuffer', new Uint8Array([9, 9]).buffer],
  ])('accepts the picture as %s with the exact bytes', (_name, contents) => {
    const dto = new PzAccountSdkMePictureUploadDto({ access_token: TOKEN, contents, filename: 'a.png' });

    expect(dto.contents.length).toBe(ArrayBuffer.isView(contents) ? contents.byteLength : (contents as ArrayBuffer).byteLength);
  });

  it.each([
    ['undefined', undefined],
    ['um objeto', { a: 1 }],
    ['um Blob', new Blob(['x'])],
  ])('refuses %s as picture contents instead of sending 0 bytes', (_name, contents) => {
    expect(() => new PzAccountSdkMePictureUploadDto({ access_token: TOKEN, contents: contents as never })).toThrow(TypeError);
  });

  it('keeps accepting raw binary strings from loose input, like the PHP sdk', () => {
    expect(PzAccountSdkMePictureUploadDto.from({ access_token: TOKEN, contents: 'bytes' }).contents.toString()).toBe('bytes');
  });

  it('maps a picture validation error', async () => {
    ctx.recorder.pushError(422, 'VALIDATION_ERROR', 'Dados inválidos.', { picture: ['Imagem inválida.'] });

    const result = await ctx.client.mePictureUpload({ access_token: TOKEN, contents: Buffer.from('x'), filename: 'a.png' });

    expect(result.firstFieldError()).toBe('Imagem inválida.');
  });

  it('picture preset puts the enum value', async () => {
    ctx.recorder.pushSuccess(200, user());

    const result = await ctx.client.mePicturePresetSet(
      new PzAccountSdkMePicturePresetSetDto({ access_token: TOKEN, preset: PzAccountSdkPicturePresetEnum.ROCKET }),
    );

    assertApiRequest(ctx.recorder.lastRequest(), 'PUT', '/api/identity/me/picture/preset');
    expect(ctx.recorder.lastRequest().bodyArray).toEqual({ preset: 'rocket' });
    expect(result.isSuccess()).toBe(true);
  });

  it('the preset dto refuses an unknown preset', () => {
    expect(() => PzAccountSdkMePicturePresetSetDto.from({ access_token: 't', preset: 'dragao' })).toThrow(TypeError);
  });

  it('picture delete', async () => {
    ctx.recorder.pushSuccess(200, user({ picture: null }));

    const result = await ctx.client.mePictureDelete({ access_token: TOKEN });

    assertApiRequest(ctx.recorder.lastRequest(), 'DELETE', '/api/identity/me/picture');
    expect(result.user?.picture).toBe('');
  });

  it('mfa show', async () => {
    ctx.recorder.pushSuccess(200, { enabled: true, confirmed_at: '2026-02-01T10:00:00+00:00', recovery_codes_remaining: 8 });

    const result = await ctx.client.meMfaShow({ access_token: TOKEN });

    assertApiRequest(ctx.recorder.lastRequest(), 'GET', '/api/identity/me/mfa');
    expect(result.enabled).toBe(true);
    expect(result.recovery_codes_remaining).toBe(8);
  });

  it('mfa enroll returns the totp secret on 201', async () => {
    ctx.recorder.pushSuccess(201, { secret: 'JBSWY3DPEHPK3PXP', otpauth_uri: 'otpauth://totp/x', qr_svg: '<svg/>' });

    const result = await ctx.client.meMfaEnroll({ access_token: TOKEN, current_password: 'senha' });

    assertApiRequest(ctx.recorder.lastRequest(), 'POST', '/api/identity/me/mfa/enroll');
    expect(ctx.recorder.lastRequest().bodyArray).toEqual({ current_password: 'senha' });
    expect(result.secret).toBe('JBSWY3DPEHPK3PXP');
    expect(result.http_status).toBe(201);
  });

  it('mfa enroll when already enabled', async () => {
    ctx.recorder.pushError(409, 'MFA_ALREADY_ENABLED');

    const result = await ctx.client.meMfaEnroll({ access_token: TOKEN, current_password: 'senha' });

    expect(result.getErrorCode()).toBe(PzAccountSdkErrorCodeEnum.MFA_ALREADY_ENABLED);
    expect(result.secret).toBe('');
  });

  it('mfa enroll confirm returns the recovery codes', async () => {
    ctx.recorder.pushSuccess(201, { recovery_codes: ['aaaa-bbbb', 'cccc-dddd'], warning: 'Guarde.' });

    const result = await ctx.client.meMfaEnrollConfirm({ access_token: TOKEN, code: '123456' });

    assertApiRequest(ctx.recorder.lastRequest(), 'POST', '/api/identity/me/mfa/enroll/confirm');
    expect(ctx.recorder.lastRequest().bodyArray).toEqual({ code: '123456' });
    expect(result.recovery_codes).toEqual(['aaaa-bbbb', 'cccc-dddd']);
    expect(result.warning).toBe('Guarde.');
  });

  it('mfa enroll confirm with a wrong code', async () => {
    ctx.recorder.pushError(401, 'MFA_INVALID_CODE');

    const result = await ctx.client.meMfaEnrollConfirm({ access_token: TOKEN, code: '000000' });

    expect(result.getErrorCode()).toBe(PzAccountSdkErrorCodeEnum.MFA_INVALID_CODE);
    expect(result.recovery_codes).toEqual([]);
  });

  it('mfa disable is 204', async () => {
    ctx.recorder.pushNoContent();

    const result = await ctx.client.meMfaDisable({ access_token: TOKEN, current_password: 'senha', code: '123456' });

    assertApiRequest(ctx.recorder.lastRequest(), 'POST', '/api/identity/me/mfa/disable');
    expect(ctx.recorder.lastRequest().bodyArray).toEqual({ current_password: 'senha', code: '123456' });
    expect(result.isSuccess()).toBe(true);
  });

  it('mfa recovery codes regenerate', async () => {
    ctx.recorder.pushSuccess(201, { recovery_codes: ['novo-1'], warning: 'w' });

    const result = await ctx.client.meMfaRecoveryCodesRegenerate({ access_token: TOKEN, current_password: 'senha', code: '123456' });

    assertApiRequest(ctx.recorder.lastRequest(), 'POST', '/api/identity/me/mfa/recovery-codes');
    expect(result.recovery_codes).toEqual(['novo-1']);
  });

  it('mfa dtos mask the password', () => {
    const enroll = new PzAccountSdkMeMfaEnrollDto({ access_token: 't', current_password: 'senha-x' });
    const disable = new PzAccountSdkMeMfaDisableDto({ access_token: 't', current_password: 'senha-x', code: '1' });

    expect(enroll.toJson()).not.toContain('senha-x');
    expect(disable.toJson()).not.toContain('senha-x');
  });

  it('consent list', async () => {
    ctx.recorder.pushSuccess(200, [
      {
        client_id: 'abc',
        client_name: 'Puzl Mix',
        logo_uri: null,
        client_uri: 'https://mix.test',
        scopes: ['Seu e-mail', 'Seu perfil'],
        granted_at: '2026-03-01T12:00:00+00:00',
      },
    ]);

    const result = await ctx.client.meConsentList({ access_token: TOKEN });

    assertApiRequest(ctx.recorder.lastRequest(), 'GET', '/api/identity/me/consents');
    expect(result.consents).toHaveLength(1);
    expect(result.consents[0]?.client_name).toBe('Puzl Mix');
    expect(result.consents[0]?.logo_uri).toBe('');
    expect(result.consents[0]?.scopes).toEqual(['Seu e-mail', 'Seu perfil']);
  });

  it('consent revoke url-encodes the client_id', async () => {
    ctx.recorder.pushNoContent();

    const result = await ctx.client.meConsentRevoke({ access_token: TOKEN, client_id: "a/b c!'()*" });

    assertApiRequest(ctx.recorder.lastRequest(), 'DELETE', '/api/identity/me/consents/a%2Fb%20c%21%27%28%29%2A');
    expect(result.isSuccess()).toBe(true);
  });

  it('consent revoke not found', async () => {
    ctx.recorder.pushError(404, 'CONSENT_NOT_FOUND');

    const result = await ctx.client.meConsentRevoke({ access_token: TOKEN, client_id: 'x' });

    expect(result.getErrorCode()).toBe(PzAccountSdkErrorCodeEnum.CONSENT_NOT_FOUND);
  });
});
