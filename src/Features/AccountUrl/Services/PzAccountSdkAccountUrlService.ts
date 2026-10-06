import type { PzAccountSdkAccountPageEnum } from '../../../Enum/PzAccountSdkAccountPageEnum.js';
import type { PzAccountSdkConfig } from '../../../Support/PzAccountSdkConfig.js';

/**
 * URL de uma tela da conta no Puzl Account (editar perfil, trocar senha).
 *
 * Local, sem HTTP. A sessão do usuário no provedor é que decide se ele vê a
 * tela direto ou passa antes pelo login.
 *
 * @internal
 */
export class PzAccountSdkAccountUrlService {
  constructor(private readonly config: PzAccountSdkConfig) {}

  execute(page: PzAccountSdkAccountPageEnum): string {
    this.config.assertUsable();

    return this.config.issuer + page.value;
  }
}
