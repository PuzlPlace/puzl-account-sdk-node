import type { PzAccountSdkAccessTokenDto } from '../../Shared/Dtos/PzAccountSdkAccessTokenDto.js';
import { PzAccountSdkBaseGateway } from '../../Shared/Gateways/PzAccountSdkBaseGateway.js';
import { PzAccountSdkUserInfoViewDto } from '../Dtos/PzAccountSdkUserInfoViewDto.js';

/**
 * GET /oauth/userinfo — Bearer do usuário, 200 no sucesso.
 *
 * Como o access token é opaco, é também a forma de saber se ele ainda vale:
 * 401 (`invalid_token`) significa vencido, revogado ou inexistente.
 *
 * @internal
 */
export class PzAccountSdkUserInfoShowGateway extends PzAccountSdkBaseGateway {
  static readonly ENDPOINT = '/oauth/userinfo';

  async execute(input: PzAccountSdkAccessTokenDto): Promise<PzAccountSdkUserInfoViewDto> {
    this.config.assertUsable();

    const response = await this.http()
      .withBearer(input.access_token)
      .get(this.url(PzAccountSdkUserInfoShowGateway.ENDPOINT));

    if (response.statusCode === 200) {
      if (!this.hasBody(response)) {
        return PzAccountSdkUserInfoViewDto.from(this.buildInvalidResponse(response));
      }

      return PzAccountSdkUserInfoViewDto.from({ ...this.responseBody(response), ...this.buildSuccess(response) });
    }

    return PzAccountSdkUserInfoViewDto.from(this.buildOauthError(response));
  }
}
