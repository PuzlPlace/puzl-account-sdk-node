import { PzAccountSdkBaseGateway } from '../../Shared/Gateways/PzAccountSdkBaseGateway.js';
import type { PzAccountSdkMeMfaEnrollDto } from '../Dtos/PzAccountSdkMeMfaEnrollDto.js';
import { PzAccountSdkMfaEnrollViewDto } from '../Dtos/PzAccountSdkMfaEnrollViewDto.js';

/**
 * POST /api/identity/me/mfa/enroll — Bearer de client first-party, 201 no
 * sucesso.
 *
 * @internal
 */
export class PzAccountSdkMeMfaEnrollGateway extends PzAccountSdkBaseGateway {
  static readonly ENDPOINT = '/api/identity/me/mfa/enroll';

  async execute(input: PzAccountSdkMeMfaEnrollDto): Promise<PzAccountSdkMfaEnrollViewDto> {
    const response = await this.apiRequest(input.access_token).post(
      this.url(PzAccountSdkMeMfaEnrollGateway.ENDPOINT),
      { current_password: input.current_password },
    );

    if (response.statusCode === 201) {
      if (!this.hasData(response)) {
        return PzAccountSdkMfaEnrollViewDto.from(this.buildInvalidResponse(response));
      }

      return PzAccountSdkMfaEnrollViewDto.from({ ...this.responseData(response), ...this.buildSuccess(response) });
    }

    return PzAccountSdkMfaEnrollViewDto.from(this.buildApiError(response));
  }
}
