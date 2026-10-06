const require_PzAccountSdkClient = require("./PzAccountSdkClient-DrGNxF0p.cjs");
//#region src/Factory/PzAccountSdkClientFactory.ts
/**
* Atalhos para criar o client.
*
* ```ts
* const puzl = PzAccountSdkClientFactory.fromEnv(); // lê PUZL_ACCOUNT_* de process.env
* ```
*/
var PzAccountSdkClientFactory = class {
	/** Client a partir das opções (configuração + `fetch`/`cache` opcionais). */
	static make(options = {}) {
		return new require_PzAccountSdkClient.PzAccountSdkClient(options);
	}
	/**
	* Client a partir das variáveis `PUZL_ACCOUNT_*` (por padrão, de
	* `process.env`). Opções em `overrides` vencem o ambiente.
	*/
	static fromEnv(env = process.env, overrides = {}) {
		const { fetch, cache, ...configOverrides } = overrides;
		return new require_PzAccountSdkClient.PzAccountSdkClient(require_PzAccountSdkClient.PzAccountSdkConfig.fromEnv(env, configOverrides), {
			fetch,
			cache
		});
	}
};
//#endregion
Object.defineProperty(exports, "PzAccountSdkClientFactory", {
	enumerable: true,
	get: function() {
		return PzAccountSdkClientFactory;
	}
});
