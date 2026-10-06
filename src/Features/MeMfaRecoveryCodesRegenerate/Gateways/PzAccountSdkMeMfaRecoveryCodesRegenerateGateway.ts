import { PzAccountSdkMfaRecoveryCodesViewDto } from '../../Shared/Dtos/PzAccountSdkMfaRecoveryCodesViewDto.js';
import { PzAccountSdkBaseGateway } from '../../Shared/Gateways/PzAccountSdkBaseGateway.js';
import type { PzAccountSdkMeMfaRecoveryCodesRegenerateDto } from '../Dtos/PzAccountSdkMeMfaRecoveryCodesRegenerateDto.js';

/**
 * POST /api/identity/me/mfa/recovery-codes — Bearer de client first-party,
 * 201 no sucesso. Os códigos anteriores deixam de valer.
 *
 * @internal
 */
export class PzAccountSdkMeMfaRecoveryCodesRegenerateGateway extends PzAccountSdkBaseGateway {
  static readonly ENDPOINT = '/api/identity/me/mfa/recovery-codes';

  async execute(input: PzAccountSdkMeMfaRecoveryCodesRegenerateDto): Promise<PzAccountSdkMfaRecoveryCodesViewDto> {
    const response = await this.apiRequest(input.access_token).post(
      this.url(PzAccountSdkMeMfaRecoveryCodesRegenerateGateway.ENDPOINT),
      { current_password: input.current_password, code: input.code },
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
