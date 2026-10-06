import type { PzAccountSdkTokenViewDto } from '../../Shared/Dtos/PzAccountSdkTokenViewDto.js';
import { PzAccountSdkTokenBaseGateway } from '../../Shared/Gateways/PzAccountSdkTokenBaseGateway.js';
import type { PzAccountSdkTokenPasswordDto } from '../Dtos/PzAccountSdkTokenPasswordDto.js';

/**
 * POST /oauth/token, grant `password` — autenticação do client, 200 no
 * sucesso.
 *
 * Só funciona para client first-party e confidencial habilitado com
 * `php artisan oidc:client:password-grant`; fora disso, `unauthorized_client`.
 * Não devolve refresh_token. Senha errada e conta com MFA chegam iguais, como
 * `invalid_grant` — para conta com MFA, mande o usuário ao fluxo de redirect.
 *
 * @internal
 */
export class PzAccountSdkTokenPasswordGateway extends PzAccountSdkTokenBaseGateway {
  execute(input: PzAccountSdkTokenPasswordDto): Promise<PzAccountSdkTokenViewDto> {
    return this.requestToken({
      grant_type: 'password',
      username: input.username,
      password: input.password,
      scope: input.scope !== '' ? input.scope : this.config.scope,
    });
  }
}
