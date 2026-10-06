import type { PzAccountSdkAccessTokenDto } from '../../Shared/Dtos/PzAccountSdkAccessTokenDto.js';
import { PzAccountSdkUserProfileViewDto } from '../../Shared/Dtos/PzAccountSdkUserProfileViewDto.js';
import { PzAccountSdkBaseGateway } from '../../Shared/Gateways/PzAccountSdkBaseGateway.js';

/**
 * GET /api/identity/me — Bearer de client first-party, 200 no sucesso.
 *
 * @internal
 */
export class PzAccountSdkMeShowGateway extends PzAccountSdkBaseGateway {
  static readonly ENDPOINT = '/api/identity/me';

  async execute(input: PzAccountSdkAccessTokenDto): Promise<PzAccountSdkUserProfileViewDto> {
    const response = await this.apiRequest(input.access_token).get(this.url(PzAccountSdkMeShowGateway.ENDPOINT));

    if (response.statusCode === 200) {
      if (!this.hasData(response)) {
        return PzAccountSdkUserProfileViewDto.from(this.buildInvalidResponse(response));
      }

      return PzAccountSdkUserProfileViewDto.from({ ...this.buildSuccess(response), user: this.responseData(response) });
    }

    return PzAccountSdkUserProfileViewDto.from(this.buildApiError(response));
  }
}
