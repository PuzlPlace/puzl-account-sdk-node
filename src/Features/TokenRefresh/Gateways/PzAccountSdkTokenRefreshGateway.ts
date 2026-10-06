import type { PzAccountSdkTokenViewDto } from '../../Shared/Dtos/PzAccountSdkTokenViewDto.js';
import { PzAccountSdkTokenBaseGateway } from '../../Shared/Gateways/PzAccountSdkTokenBaseGateway.js';
import type { PzAccountSdkTokenRefreshDto } from '../Dtos/PzAccountSdkTokenRefreshDto.js';

/**
 * POST /oauth/token, grant `refresh_token` — autenticação do client, 200 no
 * sucesso.
 *
 * O refresh token SEMPRE gira: a resposta traz um novo, e o antigo morre.
 * Reapresentar um já usado é tratado como roubo e derruba a família inteira.
 *
 * @internal
 */
export class PzAccountSdkTokenRefreshGateway extends PzAccountSdkTokenBaseGateway {
  execute(input: PzAccountSdkTokenRefreshDto): Promise<PzAccountSdkTokenViewDto> {
    return this.requestToken({ grant_type: 'refresh_token', refresh_token: input.refresh_token, scope: input.scope });
  }
}
