import type { PzAccountSdkTokenViewDto } from '../../Shared/Dtos/PzAccountSdkTokenViewDto.js';
import { PzAccountSdkTokenBaseGateway } from '../../Shared/Gateways/PzAccountSdkTokenBaseGateway.js';
import type { PzAccountSdkTokenExchangeCodeDto } from '../Dtos/PzAccountSdkTokenExchangeCodeDto.js';

/**
 * POST /oauth/token, grant `authorization_code` com PKCE — autenticação do
 * client, 200 no sucesso.
 *
 * @internal
 */
export class PzAccountSdkTokenExchangeCodeGateway extends PzAccountSdkTokenBaseGateway {
  execute(input: PzAccountSdkTokenExchangeCodeDto): Promise<PzAccountSdkTokenViewDto> {
    let redirectUri = input.redirect_uri;

    if (redirectUri === '') {
      this.config.assertRedirectUsable();
      redirectUri = this.config.redirectUri;
    }

    return this.requestToken({
      grant_type: 'authorization_code',
      code: input.code,
      redirect_uri: redirectUri,
      code_verifier: input.code_verifier,
    });
  }
}
