import { PzAccountSdkResultDto } from '../../Shared/Dtos/PzAccountSdkResultDto.js';
import { PzAccountSdkBaseGateway } from '../../Shared/Gateways/PzAccountSdkBaseGateway.js';
import type { PzAccountSdkMeEmailChangeDto } from '../Dtos/PzAccountSdkMeEmailChangeDto.js';

/**
 * POST /api/identity/me/email — Bearer (inclusive de terceiros), 202 no
 * sucesso.
 *
 * 202 porque a troca ainda não aconteceu: o usuário confirma pelo link
 * enviado ao e-mail ANTIGO. Quando confirmar, o produto recebe o webhook
 * `email.changed`.
 *
 * @internal
 */
export class PzAccountSdkMeEmailChangeGateway extends PzAccountSdkBaseGateway {
  static readonly ENDPOINT = '/api/identity/me/email';

  async execute(input: PzAccountSdkMeEmailChangeDto): Promise<PzAccountSdkResultDto> {
    const body: Record<string, string> = { email: input.email, current_password: input.current_password };

    if (input.code !== '') {
      body['code'] = input.code;
    }

    const response = await this.apiRequest(input.access_token).post(
      this.url(PzAccountSdkMeEmailChangeGateway.ENDPOINT),
      body,
    );

    return PzAccountSdkResultDto.from(
      response.statusCode === 202 ? this.buildSuccess(response) : this.buildApiError(response),
    );
  }
}
