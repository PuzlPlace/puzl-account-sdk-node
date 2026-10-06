import { PzAccountSdkUserProfileViewDto } from '../../Shared/Dtos/PzAccountSdkUserProfileViewDto.js';
import { PzAccountSdkBaseGateway } from '../../Shared/Gateways/PzAccountSdkBaseGateway.js';
import type { PzAccountSdkUserRegisterDto } from '../Dtos/PzAccountSdkUserRegisterDto.js';

/**
 * POST /api/identity/users — público (sem token), 201 no sucesso.
 *
 * Cadastrar não autentica: a resposta traz a conta, não tokens. Para entrar
 * em seguida, siga o fluxo de login normal.
 *
 * @internal
 */
export class PzAccountSdkUserRegisterGateway extends PzAccountSdkBaseGateway {
  static readonly ENDPOINT = '/api/identity/users';

  async execute(input: PzAccountSdkUserRegisterDto): Promise<PzAccountSdkUserProfileViewDto> {
    const body: Record<string, string> = {
      name: input.name,
      email: input.email,
      password: input.password,
      password_confirmation: input.password,
      birthdate: input.birthdate,
    };

    for (const optional of ['phone_number', 'locale', 'zoneinfo'] as const) {
      if (input[optional] !== '') {
        body[optional] = input[optional];
      }
    }

    const response = await this.apiRequest().post(this.url(PzAccountSdkUserRegisterGateway.ENDPOINT), body);

    if (response.statusCode === 201) {
      if (!this.hasData(response)) {
        return PzAccountSdkUserProfileViewDto.from(this.buildInvalidResponse(response));
      }

      return PzAccountSdkUserProfileViewDto.from({ ...this.buildSuccess(response), user: this.responseData(response) });
    }

    return PzAccountSdkUserProfileViewDto.from(this.buildApiError(response));
  }
}
