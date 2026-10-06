// Consumidor ESM: só import, sem TypeScript.
import assert from 'node:assert/strict';
import { generateKeyPairSync, sign } from 'node:crypto';
import { PzAccountSdkClient, PzAccountSdkClientFactory, PzAccountSdkErrorCodeEnum } from '@puzl/account-sdk';
import { PzAccountSdkClientFake } from '@puzl/account-sdk/testing';
import { PzAccountSdkModule } from '@puzl/account-sdk/nestjs';

const ISSUER = 'https://account.smoke.test';
const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
const jwk = { ...publicKey.export({ format: 'jwk' }), kid: 'k1', alg: 'RS256', use: 'sig' };
const b64 = (value) => Buffer.from(JSON.stringify(value)).toString('base64url');

function idToken(claims) {
  const head = `${b64({ alg: 'RS256', kid: 'k1', typ: 'JWT' })}.${b64(claims)}`;
  return `${head}.${sign('RSA-SHA256', Buffer.from(head), privateKey).toString('base64url')}`;
}

(async () => {
  const client = new PzAccountSdkClient(
    { issuer: ISSUER, clientId: 'app', clientSecret: 's', redirectUri: 'https://app.test/cb' },
    { fetch: async () => new Response(JSON.stringify({ keys: [jwk] }), { status: 200 }) },
  );

  const pkce = client.pkceCreate();
  const url = client.authorizeUrl({ state: pkce.state, nonce: pkce.nonce, code_challenge: pkce.code_challenge });
  assert.ok(url.startsWith(`${ISSUER}/oauth/authorize?response_type=code&client_id=app`));

  const now = Math.floor(Date.now() / 1000);
  const identity = await client.idTokenVerify({
    id_token: idToken({ iss: ISSUER, aud: 'app', sub: 'sub-1', iat: now, exp: now + 60, nonce: pkce.nonce }),
    nonce: pkce.nonce,
  });
  assert.equal(identity.isSuccess(), true, identity.error_message);
  assert.equal(identity.sub, 'sub-1');

  const fake = new PzAccountSdkClientFake().respondWithError('meShow', 'UNAUTHENTICATED', 401);
  assert.equal((await fake.meShow({ access_token: 't' })).getErrorCode(), PzAccountSdkErrorCodeEnum.UNAUTHENTICATED);

  assert.equal(PzAccountSdkClientFactory.fromEnv({}).isConfigured(), false);
  assert.equal(PzAccountSdkModule.forRoot().providers.length, 2);

  console.log('esm: ok');
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
