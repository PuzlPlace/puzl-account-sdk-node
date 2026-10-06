// TypeScript com moduleResolution "node" (node10): ignora `exports` e acha os
// tipos por `types`/`typesVersions`. É o tsconfig clássico do NestJS.
import { PzAccountSdkClient, PzAccountSdkErrorCodeEnum, type PzAccountSdkTokenViewDto } from '@puzl/account-sdk';
import { PzAccountSdkModule, type PzAccountSdkModuleOptions } from '@puzl/account-sdk/nestjs';
import { PzAccountSdkClientFake } from '@puzl/account-sdk/testing';

const options: PzAccountSdkModuleOptions = { issuer: 'https://a.test', clientId: 'c', isGlobal: true };
const client: PzAccountSdkClient = new PzAccountSdkClient(options);
const fake = new PzAccountSdkClientFake();

export async function exchange(code: string): Promise<string> {
  const tokens: PzAccountSdkTokenViewDto = await client.tokenExchangeCode({ code, code_verifier: 'v' });

  if (tokens.getErrorCode() === PzAccountSdkErrorCodeEnum.INVALID_GRANT) {
    return 'expirou';
  }

  return tokens.access_token;
}

export const module = PzAccountSdkModule.forRoot(options);
export const calls: number = fake.callCount();
