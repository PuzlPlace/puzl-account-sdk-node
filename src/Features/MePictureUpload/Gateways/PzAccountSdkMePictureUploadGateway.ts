import { PzAccountSdkUserProfileViewDto } from '../../Shared/Dtos/PzAccountSdkUserProfileViewDto.js';
import { PzAccountSdkBaseGateway } from '../../Shared/Gateways/PzAccountSdkBaseGateway.js';
import type { PzAccountSdkMePictureUploadDto } from '../Dtos/PzAccountSdkMePictureUploadDto.js';

/**
 * POST /api/identity/me/picture (multipart) — Bearer de client first-party,
 * 200 no sucesso, com a conta já com a foto nova.
 *
 * @internal
 */
export class PzAccountSdkMePictureUploadGateway extends PzAccountSdkBaseGateway {
  static readonly ENDPOINT = '/api/identity/me/picture';

  async execute(input: PzAccountSdkMePictureUploadDto): Promise<PzAccountSdkUserProfileViewDto> {
    const form = new FormData();
    const type = input.mimeType();

    form.append('picture', new Blob([input.contents], type !== '' ? { type } : {}), input.filename);

    const response = await this.apiRequest(input.access_token).post(
      this.url(PzAccountSdkMePictureUploadGateway.ENDPOINT),
      form,
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
