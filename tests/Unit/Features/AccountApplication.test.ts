import { beforeEach, describe, expect, it } from 'vitest';
import { PzAccountSdkErrorCodeEnum } from '../../../src/Enum/PzAccountSdkErrorCodeEnum.js';
import { assertApiRequest, makeClient, USER_TOKEN as TOKEN } from '../../Support/PzAccountSdkTestCase.js';

describe('account API: applications', () => {
  let ctx: ReturnType<typeof makeClient>;

  beforeEach(() => {
    ctx = makeClient();
  });

  it('application list', async () => {
    ctx.recorder.pushSuccess(200, [
      {
        client_id: 'puzl-task',
        client_name: 'Puzl Task',
        logo_uri: 'https://task.test/logo.png',
        launch_uri: 'https://task.test',
        is_first_party: true,
        granted_at: '2026-09-20T13:00:00.000000Z',
      },
      {
        client_id: 'abc',
        client_name: 'App Parceiro',
        logo_uri: null,
        launch_uri: null,
        is_first_party: false,
        granted_at: '2026-10-01T09:30:00.000000Z',
      },
    ]);

    const result = await ctx.client.meApplicationList({ access_token: TOKEN });

    assertApiRequest(ctx.recorder.lastRequest(), 'GET', '/api/identity/me/applications');
    expect(result.isSuccess()).toBe(true);
    expect(result.applications).toHaveLength(2);
    expect(result.applications[0]?.client_name).toBe('Puzl Task');
    expect(result.applications[0]?.launch_uri).toBe('https://task.test');
    expect(result.applications[0]?.is_first_party).toBe(true);
    expect(result.applications[0]?.granted_at).toBe('2026-09-20T13:00:00.000000Z');
    expect(result.applications[1]?.is_first_party).toBe(false);
    expect(result.applications[1]?.logo_uri).toBe('');
    expect(result.applications[1]?.launch_uri).toBe('');
  });

  it('application list is empty', async () => {
    ctx.recorder.pushSuccess(200, []);

    const result = await ctx.client.meApplicationList({ access_token: TOKEN });

    expect(result.isSuccess()).toBe(true);
    expect(result.applications).toEqual([]);
  });

  it('application list is forbidden for a third-party token', async () => {
    ctx.recorder.pushError(403, 'FORBIDDEN');

    const result = await ctx.client.meApplicationList({ access_token: TOKEN });

    expect(result.getErrorCode()).toBe(PzAccountSdkErrorCodeEnum.FORBIDDEN);
    expect(result.applications).toEqual([]);
  });
});
