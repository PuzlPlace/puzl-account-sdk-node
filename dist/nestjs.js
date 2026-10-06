import { t as PzAccountSdkClient } from "./PzAccountSdkClient-Dk04gL8z.js";
import { t as PzAccountSdkClientFactory } from "./PzAccountSdkClientFactory-Cgh8IDiz.js";
//#region src/NestJs/PzAccountSdkModule.ts
/** Token das opções resolvidas — para quem quiser injetá-las. */
const PZ_ACCOUNT_SDK_OPTIONS = Symbol.for("@puzl/account-sdk:options");
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
var PzAccountSdkModule = class PzAccountSdkModule {
	static forRoot(options = {}) {
		const { isGlobal = false, ...clientOptions } = options;
		return PzAccountSdkModule.module(isGlobal, [], {
			provide: PZ_ACCOUNT_SDK_OPTIONS,
			useValue: clientOptions
		});
	}
	static forRootAsync(options) {
		return PzAccountSdkModule.module(options.isGlobal ?? false, options.imports ?? [], {
			provide: PZ_ACCOUNT_SDK_OPTIONS,
			useFactory: options.useFactory,
			inject: options.inject ?? []
		});
	}
	static module(isGlobal, imports, optionsProvider) {
		return {
			module: PzAccountSdkModule,
			global: isGlobal,
			imports: imports ?? [],
			providers: [optionsProvider, {
				provide: PzAccountSdkClient,
				useFactory: (clientOptions) => PzAccountSdkClientFactory.fromEnv(process.env, clientOptions),
				inject: [PZ_ACCOUNT_SDK_OPTIONS]
			}],
			exports: [PzAccountSdkClient, PZ_ACCOUNT_SDK_OPTIONS]
		};
	}
};
//#endregion
export { PZ_ACCOUNT_SDK_OPTIONS, PzAccountSdkClient, PzAccountSdkModule };
