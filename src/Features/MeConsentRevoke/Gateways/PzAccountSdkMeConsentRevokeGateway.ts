import { rawUrlEncode } from '../../../Support/PzAccountSdkValue.js';
import { PzAccountSdkResultDto } from '../../Shared/Dtos/PzAccountSdkResultDto.js';
import { PzAccountSdkBaseGateway } from '../../Shared/Gateways/PzAccountSdkBaseGateway.js';
import type { PzAccountSdkMeConsentRevokeDto } from '../Dtos/PzAccountSdkMeConsentRevokeDto.js';

/**
 * DELETE /api/identity/me/consents/{clientId} — Bearer de client first-party,
 * 204 no sucesso; 404 `CONSENT_NOT_FOUND` quando não há consentimento ativo.
 *
 * O aplicativo afetado recebe o webhook `consent.revoked`.
 *
 * @internal
 */
export class PzAccountSdkMeConsentRevokeGateway extends PzAccountSdkBaseGateway {
  static readonly ENDPOINT = '/api/identity/me/consents/';

  async execute(input: PzAccountSdkMeConsentRevokeDto): Promise<PzAccountSdkResultDto> {
    const response = await this.apiRequest(input.access_token).delete(
      this.url(PzAccountSdkMeConsentRevokeGateway.ENDPOINT + rawUrlEncode(input.client_id)),
    );

    return PzAccountSdkResultDto.from(
      response.statusCode === 204 ? this.buildSuccess(response) : this.buildApiError(response),
    );
  }
}
