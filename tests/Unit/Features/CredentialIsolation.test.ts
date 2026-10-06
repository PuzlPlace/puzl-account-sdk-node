import { describe, expect, it } from 'vitest';
import { CLIENT_SECRET, makeClient } from '../../Support/PzAccountSdkTestCase.js';

describe('credential isolation', () => {
  it('each call gets a fresh request', async () => {
    const { client, recorder } = makeClient({ tokenAuthMethod: 'client_secret_basic' });
    recorder.pushSuccess(200, { sub: 'a' });
    recorder.pushSuccess(201, { sub: 'b' });
    recorder.pushJson(200, { access_token: 'x' });

    await client.meShow({ access_token: 'token-da-ana' });
    await client.userRegister({ name: 'B', email: 'b@e.test', password: 'p', birthdate: '1990-01-01' });
    await client.tokenExchangeCode({ code: 'c', code_verifier: 'v' });

    expect(recorder.requestAt(0).headers['authorization']).toBe('Bearer token-da-ana');
    expect(recorder.requestAt(1).headers['authorization']).toBeUndefined();
    expect(recorder.requestAt(2).headers['authorization']).toMatch(/^Basic /);
  });

  it('never sends the client secret to the account api', async () => {
    const { client, recorder } = makeClient();
    recorder.pushSuccess(200, { sub: 'a' });

    await client.meShow({ access_token: 'token-da-ana' });
    const request = recorder.lastRequest();

    expect(JSON.stringify(request.headers)).not.toContain(CLIENT_SECRET);
    expect(request.body).not.toContain(CLIENT_SECRET);
  });
});
