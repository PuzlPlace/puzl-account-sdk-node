import { PzAccountSdkResultDto } from '../../Shared/Dtos/PzAccountSdkResultDto.js';
import { PzAccountSdkBaseGateway } from '../../Shared/Gateways/PzAccountSdkBaseGateway.js';
import type { PzAccountSdkMePasswordChangeDto } from '../Dtos/PzAccountSdkMePasswordChangeDto.js';

/**
 * PUT /api/identity/me/password — Bearer de client first-party, 204 no
 * sucesso.
 *
 * Trocar a senha revoga os tokens do usuário (evento `tokens.revoked`): o
 * access token usado aqui deixa de valer.
 *
 * @internal
 */
export class PzAccountSdkMePasswordChangeGateway extends PzAccountSdkBaseGateway {
  static readonly ENDPOINT = '/api/identity/me/password';

  async execute(input: PzAccountSdkMePasswordChangeDto): Promise<PzAccountSdkResultDto> {
    const body: Record<string, string> = {
      current_password: input.current_password,
      password: input.password,
      password_confirmation: input.password,
    };

    if (input.code !== '') {
      body['code'] = input.code;
    }

    const response = await this.apiRequest(input.access_token).put(
      this.url(PzAccountSdkMePasswordChangeGateway.ENDPOINT),
      body,
    );

    return PzAccountSdkResultDto.from(
      response.statusCode === 204 ? this.buildSuccess(response) : this.buildApiError(response),
    );
  }
}
