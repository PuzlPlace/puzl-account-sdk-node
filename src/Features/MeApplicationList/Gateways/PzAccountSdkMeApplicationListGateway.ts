import type { PzAccountSdkAccessTokenDto } from '../../Shared/Dtos/PzAccountSdkAccessTokenDto.js';
import { PzAccountSdkBaseGateway } from '../../Shared/Gateways/PzAccountSdkBaseGateway.js';
import { PzAccountSdkApplicationListViewDto } from '../Dtos/PzAccountSdkApplicationListViewDto.js';

/**
 * GET /api/identity/me/applications — Bearer de client first-party, 200 no
 * sucesso.
 *
 * @internal
 */
export class PzAccountSdkMeApplicationListGateway extends PzAccountSdkBaseGateway {
  static readonly ENDPOINT = '/api/identity/me/applications';

  async execute(input: PzAccountSdkAccessTokenDto): Promise<PzAccountSdkApplicationListViewDto> {
    const response = await this.apiRequest(input.access_token).get(this.url(PzAccountSdkMeApplicationListGateway.ENDPOINT));

    if (response.statusCode === 200) {
      if (!this.hasData(response)) {
        return PzAccountSdkApplicationListViewDto.from(this.buildInvalidResponse(response));
      }

      return PzAccountSdkApplicationListViewDto.from({ ...this.buildSuccess(response), applications: this.responseData(response) });
    }

    return PzAccountSdkApplicationListViewDto.from(this.buildApiError(response));
  }
}
