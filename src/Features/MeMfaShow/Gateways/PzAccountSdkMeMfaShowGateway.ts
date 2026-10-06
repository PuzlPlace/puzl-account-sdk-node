import type { PzAccountSdkAccessTokenDto } from '../../Shared/Dtos/PzAccountSdkAccessTokenDto.js';
import { PzAccountSdkBaseGateway } from '../../Shared/Gateways/PzAccountSdkBaseGateway.js';
import { PzAccountSdkMfaStatusViewDto } from '../Dtos/PzAccountSdkMfaStatusViewDto.js';

/**
 * GET /api/identity/me/mfa — Bearer (inclusive de terceiros), 200 no sucesso.
 *
 * @internal
 */
export class PzAccountSdkMeMfaShowGateway extends PzAccountSdkBaseGateway {
  static readonly ENDPOINT = '/api/identity/me/mfa';

  async execute(input: PzAccountSdkAccessTokenDto): Promise<PzAccountSdkMfaStatusViewDto> {
    const response = await this.apiRequest(input.access_token).get(this.url(PzAccountSdkMeMfaShowGateway.ENDPOINT));

    if (response.statusCode === 200) {
      if (!this.hasData(response)) {
        return PzAccountSdkMfaStatusViewDto.from(this.buildInvalidResponse(response));
      }

      return PzAccountSdkMfaStatusViewDto.from({ ...this.responseData(response), ...this.buildSuccess(response) });
    }

    return PzAccountSdkMfaStatusViewDto.from(this.buildApiError(response));
  }
}
