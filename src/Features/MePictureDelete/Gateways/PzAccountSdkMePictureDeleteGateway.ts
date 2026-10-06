import type { PzAccountSdkAccessTokenDto } from '../../Shared/Dtos/PzAccountSdkAccessTokenDto.js';
import { PzAccountSdkUserProfileViewDto } from '../../Shared/Dtos/PzAccountSdkUserProfileViewDto.js';
import { PzAccountSdkBaseGateway } from '../../Shared/Gateways/PzAccountSdkBaseGateway.js';

/**
 * DELETE /api/identity/me/picture — Bearer de client first-party, 200 no
 * sucesso, com a conta já sem foto.
 *
 * @internal
 */
export class PzAccountSdkMePictureDeleteGateway extends PzAccountSdkBaseGateway {
  static readonly ENDPOINT = '/api/identity/me/picture';

  async execute(input: PzAccountSdkAccessTokenDto): Promise<PzAccountSdkUserProfileViewDto> {
    const response = await this.apiRequest(input.access_token).delete(
      this.url(PzAccountSdkMePictureDeleteGateway.ENDPOINT),
    );

    if (response.statusCode === 200) {
      if (!this.hasData(response)) {
        return PzAccountSdkUserProfileViewDto.from(this.buildInvalidResponse(response));
      }

      return PzAccountSdkUserProfileViewDto.from({ ...this.buildSuccess(response), user: this.responseData(response) });
    }

    return PzAccountSdkUserProfileViewDto.from(this.buildApiError(response));
  }
}
