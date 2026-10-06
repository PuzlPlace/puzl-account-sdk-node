import { PzAccountSdkUserProfileViewDto } from '../../Shared/Dtos/PzAccountSdkUserProfileViewDto.js';
import { PzAccountSdkBaseGateway } from '../../Shared/Gateways/PzAccountSdkBaseGateway.js';
import type { PzAccountSdkMeUpdateDto } from '../Dtos/PzAccountSdkMeUpdateDto.js';

/**
 * PUT /api/identity/me — Bearer de client first-party, 200 no sucesso.
 *
 * @internal
 */
export class PzAccountSdkMeUpdateGateway extends PzAccountSdkBaseGateway {
  static readonly ENDPOINT = '/api/identity/me';

  async execute(input: PzAccountSdkMeUpdateDto): Promise<PzAccountSdkUserProfileViewDto> {
    const response = await this.apiRequest(input.access_token).put(this.url(PzAccountSdkMeUpdateGateway.ENDPOINT), {
      name: input.name,
      email: input.email,
      birthdate: input.birthdate,
      // PUT completo: opcional vazio vai como null e apaga o valor na conta.
      gender: input.gender !== '' ? input.gender : null,
      phone_number: input.phone_number !== '' ? input.phone_number : null,
      locale: input.locale,
      zoneinfo: input.zoneinfo,
      address: input.address?.toArray() ?? null,
    });

    if (response.statusCode === 200) {
      if (!this.hasData(response)) {
        return PzAccountSdkUserProfileViewDto.from(this.buildInvalidResponse(response));
      }

      return PzAccountSdkUserProfileViewDto.from({ ...this.buildSuccess(response), user: this.responseData(response) });
    }

    return PzAccountSdkUserProfileViewDto.from(this.buildApiError(response));
  }
}
