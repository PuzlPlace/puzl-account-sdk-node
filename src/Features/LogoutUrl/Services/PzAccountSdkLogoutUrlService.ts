import type { PzAccountSdkConfig } from '../../../Support/PzAccountSdkConfig.js';
import { buildQuery } from '../../../Support/PzAccountSdkValue.js';
import type { PzAccountSdkLogoutUrlDto } from '../Dtos/PzAccountSdkLogoutUrlDto.js';

/**
 * Monta a URL do /oauth/logout, que encerra a sessão no Puzl Account e
 * devolve o navegador ao produto.
 *
 * Local, sem HTTP. Encerrar a sessão no provedor não revoga tokens já
 * emitidos — para isso use `tokenRevoke`.
 *
 * @internal
 */
export class PzAccountSdkLogoutUrlService {
  static readonly ENDPOINT = '/oauth/logout';

  constructor(private readonly config: PzAccountSdkConfig) {}

  execute(input: PzAccountSdkLogoutUrlDto): string {
    this.config.assertUsable();

    const query = buildQuery({
      id_token_hint: input.id_token_hint,
      post_logout_redirect_uri: input.post_logout_redirect_uri,
      client_id: this.config.clientId,
      state: input.state,
    });

    return `${this.config.issuer}${PzAccountSdkLogoutUrlService.ENDPOINT}?${query}`;
  }
}
