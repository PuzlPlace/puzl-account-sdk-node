import { PzAccountSdkClient, type PzAccountSdkClientDependencies, type PzAccountSdkClientOptions } from '../PzAccountSdkClient.js';
import { PzAccountSdkConfig, type PzAccountSdkConfigOptions } from '../Support/PzAccountSdkConfig.js';

/**
 * Atalhos para criar o client.
 *
 * ```ts
 * const puzl = PzAccountSdkClientFactory.fromEnv(); // lê PUZL_ACCOUNT_* de process.env
 * ```
 */
export class PzAccountSdkClientFactory {
  /** Client a partir das opções (configuração + `fetch`/`cache` opcionais). */
  static make(options: PzAccountSdkClientOptions = {}): PzAccountSdkClient {
    return new PzAccountSdkClient(options);
  }

  /**
   * Client a partir das variáveis `PUZL_ACCOUNT_*` (por padrão, de
   * `process.env`). Opções em `overrides` vencem o ambiente.
   */
  static fromEnv(
    env: Record<string, string | undefined> = process.env,
    overrides: PzAccountSdkConfigOptions & PzAccountSdkClientDependencies = {},
  ): PzAccountSdkClient {
    const { fetch, cache, ...configOverrides } = overrides;

    return new PzAccountSdkClient(PzAccountSdkConfig.fromEnv(env, configOverrides), { fetch, cache });
  }
}
