import type { PzAccountSdkAccessTokenDto } from '../../Shared/Dtos/PzAccountSdkAccessTokenDto.js';
import { PzAccountSdkBaseGateway } from '../../Shared/Gateways/PzAccountSdkBaseGateway.js';
import { PzAccountSdkConsentListViewDto } from '../Dtos/PzAccountSdkConsentListViewDto.js';

/**
 * GET /api/identity/me/consents — Bearer de client first-party, 200 no
 * sucesso.
 *
 * @internal
 */
export class PzAccountSdkMeConsentListGateway extends PzAccountSdkBaseGateway {
  static readonly ENDPOINT = '/api/identity/me/consents';

  async execute(input: PzAccountSdkAccessTokenDto): Promise<PzAccountSdkConsentListViewDto> {
    const response = await this.apiRequest(input.access_token).get(this.url(PzAccountSdkMeConsentListGateway.ENDPOINT));

    if (response.statusCode === 200) {
      if (!this.hasData(response)) {
        return PzAccountSdkConsentListViewDto.from(this.buildInvalidResponse(response));
      }

      return PzAccountSdkConsentListViewDto.from({ ...this.buildSuccess(response), consents: this.responseData(response) });
    }

    return PzAccountSdkConsentListViewDto.from(this.buildApiError(response));
  }
}
