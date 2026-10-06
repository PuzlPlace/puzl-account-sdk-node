import { PzAccountSdkResultDto } from '../../Shared/Dtos/PzAccountSdkResultDto.js';
import { PzAccountSdkBaseGateway } from '../../Shared/Gateways/PzAccountSdkBaseGateway.js';
import type { PzAccountSdkMeMfaDisableDto } from '../Dtos/PzAccountSdkMeMfaDisableDto.js';

/**
 * POST /api/identity/me/mfa/disable — Bearer de client first-party, 204 no
 * sucesso.
 *
 * Desligar o MFA revoga os tokens do usuário (evento `tokens.revoked`).
 *
 * @internal
 */
export class PzAccountSdkMeMfaDisableGateway extends PzAccountSdkBaseGateway {
  static readonly ENDPOINT = '/api/identity/me/mfa/disable';

  async execute(input: PzAccountSdkMeMfaDisableDto): Promise<PzAccountSdkResultDto> {
    const response = await this.apiRequest(input.access_token).post(
      this.url(PzAccountSdkMeMfaDisableGateway.ENDPOINT),
      { current_password: input.current_password, code: input.code },
    );

    return PzAccountSdkResultDto.from(
      response.statusCode === 204 ? this.buildSuccess(response) : this.buildApiError(response),
    );
  }
}
