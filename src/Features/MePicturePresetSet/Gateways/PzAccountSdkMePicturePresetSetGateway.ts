import { PzAccountSdkUserProfileViewDto } from '../../Shared/Dtos/PzAccountSdkUserProfileViewDto.js';
import { PzAccountSdkBaseGateway } from '../../Shared/Gateways/PzAccountSdkBaseGateway.js';
import type { PzAccountSdkMePicturePresetSetDto } from '../Dtos/PzAccountSdkMePicturePresetSetDto.js';

/**
 * PUT /api/identity/me/picture/preset — Bearer de client first-party, 200 no
 * sucesso.
 *
 * @internal
 */
export class PzAccountSdkMePicturePresetSetGateway extends PzAccountSdkBaseGateway {
  static readonly ENDPOINT = '/api/identity/me/picture/preset';

  async execute(input: PzAccountSdkMePicturePresetSetDto): Promise<PzAccountSdkUserProfileViewDto> {
    const response = await this.apiRequest(input.access_token).put(
      this.url(PzAccountSdkMePicturePresetSetGateway.ENDPOINT),
      { preset: input.preset.value },
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
