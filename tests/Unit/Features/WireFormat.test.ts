import { describe, expect, it } from 'vitest';
import { PzAccountSdkClient } from '../../../src/PzAccountSdkClient.js';
import { PzRequestRecorder } from '../../Support/PzRequestRecorder.js';

/**
 * O que de fato vai no fio: corpo e headers como o `Request` do fetch os
 * serializa (e não como o SDK os montou).
 */
function client(overrides: Record<string, string> = {}) {
  const recorder = new PzRequestRecorder();
  const sdk = new PzAccountSdkClient(
    {
      issuer: 'https://account.test',
      clientId: 'cliente',
      clientSecret: 'se/cr:et',
      redirectUri: 'https://app.test/cb',
      ...overrides,
    },
    { fetch: recorder.fetch },
  );

  return { sdk, recorder };
}

describe('wire format', () => {
  it('token exchange is form-urlencoded with client_secret_post', async () => {
    const { sdk, recorder } = client();
    recorder.pushJson(200, { access_token: 'a' });

    await sdk.tokenExchangeCode({ code: 'code 1', code_verifier: 'verifier-1' });
    const request = recorder.lastRequest();

    expect(request.method).toBe('POST');
    expect(request.url).toBe('https://account.test/oauth/token');
    expect(request.headers['content-type']).toMatch(/^application\/x-www-form-urlencoded/);
    expect(request.headers['accept']).toBe('application/json');
    expect(request.body).toBe(
      'grant_type=authorization_code&code=code+1&redirect_uri=https%3A%2F%2Fapp.test%2Fcb&code_verifier=verifier-1&client_id=cliente&client_secret=se%2Fcr%3Aet',
    );
  });

  it('client_secret_basic reaches the wire url-encoded', async () => {
    const { sdk, recorder } = client({ tokenAuthMethod: 'client_secret_basic' });
    recorder.pushJson(200, { access_token: 'a' });

    await sdk.tokenExchangeCode({ code: 'c', code_verifier: 'v' });
    const request = recorder.lastRequest();

    expect(request.headers['authorization']).toBe(`Basic ${Buffer.from('cliente:se%2Fcr%3Aet').toString('base64')}`);
    expect(request.body).not.toContain('client_secret');
  });

  it('the account api sends json with the bearer', async () => {
    const { sdk, recorder } = client();
    recorder.pushSuccess(200, { sub: 's' });

    await sdk.meUpdate({ access_token: 'token-1', name: 'Ana', email: 'ana@e.test', birthdate: '1990-01-01', locale: 'pt-BR', zoneinfo: 'UTC' });
    const request = recorder.lastRequest();

    expect(request.method).toBe('PUT');
    expect(request.headers['authorization']).toBe('Bearer token-1');
    expect(request.headers['content-type']).toMatch(/^application\/json/);
    expect(JSON.parse(request.body)).toMatchObject({ name: 'Ana', gender: null });
  });

  it('get requests carry no body', async () => {
    const { sdk, recorder } = client();
    recorder.pushJson(200, { sub: 's' });

    await sdk.userInfoShow({ access_token: 'a' });

    expect(recorder.lastRequest().method).toBe('GET');
    expect(recorder.lastRequest().body).toBe('');
    expect(recorder.lastRequest().headers['content-type']).toBeUndefined();
  });

  it('the picture upload is a real file part', async () => {
    const { sdk, recorder } = client();
    recorder.pushSuccess(200, { sub: 's' });

    await sdk.mePictureUpload({ access_token: 't', contents: Buffer.from('bytes-da-imagem'), filename: '../minha "foto"\r\n.png' });
    const request = recorder.lastRequest();

    expect(request.headers['content-type']).toMatch(/^multipart\/form-data; boundary=/);
    expect(request.body).toContain('Content-Disposition: form-data; name="picture"; filename="minha_foto_.png"');
    expect(request.body).toContain('Content-Type: image/png');
    expect(request.body).toContain('bytes-da-imagem');
  });

  it('the picture upload without a name still sends a file part', async () => {
    const { sdk, recorder } = client();
    recorder.pushSuccess(200, { sub: 's' });

    await sdk.mePictureUpload({ access_token: 't', contents: Buffer.from('x'), filename: '' });

    expect(recorder.lastRequest().body).toContain('name="picture"; filename="picture"');
  });

  it('every request carries a timeout signal', async () => {
    const { sdk, recorder } = client({ timeout: '1' });
    // Um servidor que nunca responde: só o AbortSignal.timeout encerra a espera.
    recorder.push(
      (request) =>
        new Promise<Response>((_resolve, reject) => {
          request.signal.addEventListener('abort', () => reject(request.signal.reason));
        }),
    );

    const result = await sdk.discoveryShow();

    expect(result.http_status).toBe(504);
    expect(result.error_message).toBe('Connection timed out after 1 seconds');
  });

  it('any other transport failure becomes a 500 without code', async () => {
    const { sdk, recorder } = client();
    recorder.push(new RangeError('algo inesperado'));

    const result = await sdk.discoveryShow();

    expect(result.http_status).toBe(500);
    expect(result.error_message).toBe('Uncategorised exception occurred.');
    expect(result.isServiceUnavailable()).toBe(true);
  });

  it('never follows redirects: a 3xx is an error, not a hop with the client secret', async () => {
    const { sdk, recorder } = client();
    recorder.push(new Response(null, { status: 307, headers: { Location: 'https://outro.test/oauth/token' } }));

    const result = await sdk.tokenExchangeCode({ code: 'c', code_verifier: 'v' });

    expect(recorder.lastRequest().redirect).toBe('manual');
    expect(recorder.requestCount()).toBe(1);
    expect(result.has_error).toBe(true);
    expect(result.http_status).toBe(307);
  });

  it.each([
    ['token com HTML', (s: PzAccountSdkClient) => s.tokenExchangeCode({ code: 'c', code_verifier: 'v' }), new Response('<html>ok</html>', { status: 200 })],
    ['token com lista', (s: PzAccountSdkClient) => s.tokenRefresh({ refresh_token: 'r' }), Response.json(['a'])],
    ['userinfo vazio', (s: PzAccountSdkClient) => s.userInfoShow({ access_token: 'a' }), new Response('', { status: 200 })],
    ['me sem data', (s: PzAccountSdkClient) => s.meShow({ access_token: 'a' }), Response.json({ error: false, data: null })],
    ['register sem data', (s: PzAccountSdkClient) => s.userRegister({ name: 'n', email: 'e', password: 'p', birthdate: 'b' }), Response.json({ error: false }, { status: 201 })],
  ])('turns a 2xx without the expected body into an error (%s)', async (_name, call, response) => {
    const { sdk, recorder } = client();
    recorder.push(response);

    const result = await call(sdk);

    expect(result.has_error).toBe(true);
    expect(result.http_status).toBe(502);
    expect(result.isServiceUnavailable()).toBe(true);
  });

  it('classifies network errors by their system code', async () => {
    const { sdk, recorder } = client();
    recorder.push(new TypeError('falhou', { cause: Object.assign(new Error('x'), { code: 'ENOTFOUND' }) }));

    expect((await sdk.discoveryShow()).http_status).toBe(504);
  });

  it('clamps a huge timeout instead of breaking every request', async () => {
    const { sdk, recorder } = client({ timeout: '99999999999' });
    recorder.pushJson(200, { issuer: 'https://account.test' });

    expect((await sdk.discoveryShow()).isSuccess()).toBe(true);
  });
});
