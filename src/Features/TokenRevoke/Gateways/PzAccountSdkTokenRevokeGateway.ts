import { PzAccountSdkResultDto } from '../../Shared/Dtos/PzAccountSdkResultDto.js';
import { PzAccountSdkBaseGateway } from '../../Shared/Gateways/PzAccountSdkBaseGateway.js';
import type { PzAccountSdkTokenRevokeDto } from '../Dtos/PzAccountSdkTokenRevokeDto.js';

/**
 * POST /oauth/revoke — autenticação do client, 200 no sucesso.
 *
 * Pela RFC 7009 o provedor responde 200 até para token desconhecido ou já
 * vencido: o único erro real é `invalid_client`. Revogar o refresh token
 * derruba a família e os access tokens emitidos a partir dela.
 *
 * @internal
 */
export class PzAccountSdkTokenRevokeGateway extends PzAccountSdkBaseGateway {
  static readonly ENDPOINT = '/oauth/revoke';

  async execute(input: PzAccountSdkTokenRevokeDto): Promise<PzAccountSdkResultDto> {
    const request = this.oauthRequest();
    const params: Record<string, string> = { token: input.token, token_type_hint: input.token_type_hint?.value ?? '' };
    const body = this.withClientAuth(
      request,
      Object.fromEntries(Object.entries(params).filter(([, value]) => value !== '')),
    );

    const response = await request.post(this.url(PzAccountSdkTokenRevokeGateway.ENDPOINT), body);

    return PzAccountSdkResultDto.from(
      response.statusCode === 200 ? this.buildSuccess(response) : this.buildOauthError(response),
    );
  }
}
