// App NestJS de verdade: decorators, DI pelo tipo do construtor
// (emitDecoratorMetadata) e o client vindo do pacote principal enquanto o
// módulo vem do subpath — os dois precisam ser a MESMA classe.
import 'reflect-metadata';
import { strict as assert } from 'node:assert';
import { Injectable, Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { PzAccountSdkClient } from '@puzl/account-sdk';
import { PzAccountSdkModule } from '@puzl/account-sdk/nestjs';

@Injectable()
class LoginService {
  constructor(readonly puzl: PzAccountSdkClient) {}

  loginUrl(): string {
    const pkce = this.puzl.pkceCreate();

    return this.puzl.authorizeUrl({ state: pkce.state, nonce: pkce.nonce, code_challenge: pkce.code_challenge });
  }
}

@Module({
  imports: [
    PzAccountSdkModule.forRootAsync({
      isGlobal: true,
      useFactory: async () => ({ issuer: 'https://account.smoke.test', clientId: 'app', clientSecret: 's', redirectUri: 'https://app.test/cb' }),
    }),
  ],
  providers: [LoginService],
})
class AppModule {}

async function main(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule, { logger: false });
  const login = app.get(LoginService);

  assert.ok(login.puzl instanceof PzAccountSdkClient);
  assert.ok(login.loginUrl().startsWith('https://account.smoke.test/oauth/authorize?'));

  await app.close();
  console.log('nest: ok');
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
