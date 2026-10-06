import { PzAccountSdkMfaRecoveryCodesViewDto } from '../../Shared/Dtos/PzAccountSdkMfaRecoveryCodesViewDto.js';
import { PzAccountSdkBaseGateway } from '../../Shared/Gateways/PzAccountSdkBaseGateway.js';
import type { PzAccountSdkMeMfaEnrollConfirmDto } from '../Dtos/PzAccountSdkMeMfaEnrollConfirmDto.js';

/**
 * POST /api/identity/me/mfa/enroll/confirm — Bearer de client first-party,
 * 201 no sucesso, com os códigos de recuperação.
 *
 * @internal
 */
export class PzAccountSdkMeMfaEnrollConfirmGateway extends PzAccountSdkBaseGateway {
  static readonly ENDPOINT = '/api/identity/me/mfa/enroll/confirm';

  async execute(input: PzAccountSdkMeMfaEnrollConfirmDto): Promise<PzAccountSdkMfaRecoveryCodesViewDto> {
    const response = await this.apiRequest(input.access_token).post(
      this.url(PzAccountSdkMeMfaEnrollConfirmGateway.ENDPOINT),
      { code: input.code },
    );

    if (response.statusCode === 201) {
      if (!this.hasData(response)) {
        return PzAccountSdkMfaRecoveryCodesViewDto.from(this.buildInvalidResponse(response));
      }

      return PzAccountSdkMfaRecoveryCodesViewDto.from({ ...this.responseData(response), ...this.buildSuccess(response) });
    }

    return PzAccountSdkMfaRecoveryCodesViewDto.from(this.buildApiError(response));
  }
}
