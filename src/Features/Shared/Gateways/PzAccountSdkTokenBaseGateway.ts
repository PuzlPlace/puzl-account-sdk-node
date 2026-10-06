import { PzAccountSdkTokenViewDto } from '../Dtos/PzAccountSdkTokenViewDto.js';
import { PzAccountSdkBaseGateway } from './PzAccountSdkBaseGateway.js';

/**
 * Base dos três grants do /oauth/token: authorization_code, refresh_token e
 * password.
 *
 * @internal
 */
export abstract class PzAccountSdkTokenBaseGateway extends PzAccountSdkBaseGateway {
  static readonly ENDPOINT = '/oauth/token';

  /** @param params parâmetros do grant; vazios não são enviados */
  protected async requestToken(params: Record<string, string>): Promise<PzAccountSdkTokenViewDto> {
    const request = this.oauthRequest();
    const body = this.withClientAuth(
      request,
      Object.fromEntries(Object.entries(params).filter(([, value]) => value !== '')),
    );

    const response = await request.post(this.url(PzAccountSdkTokenBaseGateway.ENDPOINT), body);

    if (response.statusCode === 200) {
      if (!this.hasBody(response)) {
        return PzAccountSdkTokenViewDto.from(this.buildInvalidResponse(response));
      }

      return PzAccountSdkTokenViewDto.from({ ...this.responseBody(response), ...this.buildSuccess(response) });
    }

    return PzAccountSdkTokenViewDto.from(this.buildOauthError(response));
  }
}
