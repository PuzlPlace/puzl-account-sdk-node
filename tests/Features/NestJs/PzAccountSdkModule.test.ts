import 'reflect-metadata';
import type { DynamicModule } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { describe, expect, it } from 'vitest';
import { PZ_ACCOUNT_SDK_OPTIONS, PzAccountSdkModule } from '../../../src/NestJs/PzAccountSdkModule.js';
import { PzAccountSdkClient } from '../../../src/PzAccountSdkClient.js';
import { PzAccountSdkClientFake } from '../../../src/Testing/PzAccountSdkClientFake.js';

/**
 * Um módulo de feature que depende do client — montado sem decorators (o
 * vitest não os transforma), com `inject` explícito. No app de verdade, é o
 * `constructor(private readonly puzl: PzAccountSdkClient)` de sempre.
 */
class FeatureModule {
  static register(): DynamicModule {
    return {
      module: FeatureModule,
      providers: [{ provide: 'LOGIN_SERVICE', useFactory: (puzl: PzAccountSdkClient) => ({ puzl }), inject: [PzAccountSdkClient] }],
      exports: ['LOGIN_SERVICE'],
    };
  }
}

class ConfigModule {
  static register(): DynamicModule {
    return {
      module: ConfigModule,
      providers: [{ provide: 'CONFIG', useValue: { issuer: 'https://async.test', clientId: 'c', tokenAuthMethod: 'none' } }],
      exports: ['CONFIG'],
    };
  }
}

describe('PzAccountSdkModule', () => {
  it('forRoot registers the client, injectable by its class', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        PzAccountSdkModule.forRoot({ issuer: 'https://account.test', clientId: 'c', clientSecret: 's', isGlobal: true }),
        FeatureModule.register(),
      ],
    }).compile();

    const client = moduleRef.get(PzAccountSdkClient);

    expect(client).toBeInstanceOf(PzAccountSdkClient);
    expect(client.isConfigured()).toBe(true);
    expect(moduleRef.get<{ puzl: unknown }>('LOGIN_SERVICE').puzl).toBe(client);
  });

  it('forRootAsync resolves the options from other providers', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        PzAccountSdkModule.forRootAsync({
          imports: [ConfigModule.register()],
          inject: ['CONFIG'],
          useFactory: async (config: Record<string, string>) => config,
        }),
      ],
    }).compile();

    expect(moduleRef.get(PzAccountSdkClient).config.issuer).toBe('https://async.test');
    expect(moduleRef.get(PZ_ACCOUNT_SDK_OPTIONS)).toMatchObject({ clientId: 'c' });
  });

  it('can be replaced by the fake in the product tests', async () => {
    const fake = new PzAccountSdkClientFake();
    const moduleRef = await Test.createTestingModule({
      imports: [PzAccountSdkModule.forRoot({ isGlobal: true }), FeatureModule.register()],
    })
      .overrideProvider(PzAccountSdkClient)
      .useValue(fake)
      .compile();

    expect(moduleRef.get<{ puzl: unknown }>('LOGIN_SERVICE').puzl).toBe(fake);
  });
});
