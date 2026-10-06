import type { DynamicModule, InjectionToken, ModuleMetadata, OptionalFactoryDependency, Provider } from '@nestjs/common';
import { PzAccountSdkClientFactory } from '../Factory/PzAccountSdkClientFactory.js';
import { PzAccountSdkClient, type PzAccountSdkClientOptions } from '../PzAccountSdkClient.js';

/** Token das opções resolvidas — para quem quiser injetá-las. */
export const PZ_ACCOUNT_SDK_OPTIONS = Symbol.for('@puzl/account-sdk:options');

export interface PzAccountSdkModuleOptions extends PzAccountSdkClientOptions {
  /** Registra o client para a aplicação inteira, sem reimportar o módulo. */
  isGlobal?: boolean;
}

export interface PzAccountSdkModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  /** Registra o client para a aplicação inteira, sem reimportar o módulo. */
  isGlobal?: boolean;
  inject?: Array<InjectionToken | OptionalFactoryDependency>;
  useFactory: (...args: any[]) => PzAccountSdkClientOptions | Promise<PzAccountSdkClientOptions>;
}

/**
 * Módulo NestJS do SDK: registra um `PzAccountSdkClient` único, injetável
 * pela própria classe.
 *
 * ```ts
 * @Module({ imports: [PzAccountSdkModule.forRoot({ isGlobal: true })] })
 * export class AppModule {}
 *
 * constructor(private readonly puzl: PzAccountSdkClient) {}
 * ```
 *
 * As opções vencem as variáveis `PUZL_ACCOUNT_*` de `process.env`; sem
 * opções, o client sai inteiro do ambiente.
 *
 * Montado sem decorators e sem import de runtime do `@nestjs/common`: o
 * mesmo arquivo serve ao Nest 9, 10, 11 e 12, em CommonJS ou ESM.
 */
export class PzAccountSdkModule {
  static forRoot(options: PzAccountSdkModuleOptions = {}): DynamicModule {
    const { isGlobal = false, ...clientOptions } = options;

    return PzAccountSdkModule.module(isGlobal, [], { provide: PZ_ACCOUNT_SDK_OPTIONS, useValue: clientOptions });
  }

  static forRootAsync(options: PzAccountSdkModuleAsyncOptions): DynamicModule {
    return PzAccountSdkModule.module(options.isGlobal ?? false, options.imports ?? [], {
      provide: PZ_ACCOUNT_SDK_OPTIONS,
      useFactory: options.useFactory,
      inject: options.inject ?? [],
    });
  }

  private static module(isGlobal: boolean, imports: ModuleMetadata['imports'], optionsProvider: Provider): DynamicModule {
    return {
      module: PzAccountSdkModule,
      global: isGlobal,
      imports: imports ?? [],
      providers: [
        optionsProvider,
        {
          provide: PzAccountSdkClient,
          useFactory: (clientOptions: PzAccountSdkClientOptions) =>
            PzAccountSdkClientFactory.fromEnv(process.env, clientOptions),
          inject: [PZ_ACCOUNT_SDK_OPTIONS],
        },
      ],
      exports: [PzAccountSdkClient, PZ_ACCOUNT_SDK_OPTIONS],
    };
  }
}
