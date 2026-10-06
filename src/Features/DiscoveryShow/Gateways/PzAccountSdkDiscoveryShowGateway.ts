import { PzAccountSdkBaseGateway } from '../../Shared/Gateways/PzAccountSdkBaseGateway.js';
import { PzAccountSdkDiscoveryViewDto } from '../Dtos/PzAccountSdkDiscoveryViewDto.js';

/**
 * GET /.well-known/openid-configuration — público, 200 no sucesso.
 *
 * @internal
 */
export class PzAccountSdkDiscoveryShowGateway extends PzAccountSdkBaseGateway {
  static readonly ENDPOINT = '/.well-known/openid-configuration';

  async execute(): Promise<PzAccountSdkDiscoveryViewDto> {
    this.config.assertUsable();

    const response = await this.http().get(this.url(PzAccountSdkDiscoveryShowGateway.ENDPOINT));

    if (response.statusCode === 200) {
      if (!this.hasBody(response)) {
        return PzAccountSdkDiscoveryViewDto.from(this.buildInvalidResponse(response));
      }

      return PzAccountSdkDiscoveryViewDto.from({ ...this.responseBody(response), ...this.buildSuccess(response) });
    }

    return PzAccountSdkDiscoveryViewDto.from(this.buildOauthError(response));
  }
}
