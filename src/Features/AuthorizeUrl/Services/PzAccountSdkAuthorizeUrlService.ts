import type { PzAccountSdkConfig } from '../../../Support/PzAccountSdkConfig.js';
import { buildQuery } from '../../../Support/PzAccountSdkValue.js';
import type { PzAccountSdkAuthorizeUrlDto } from '../Dtos/PzAccountSdkAuthorizeUrlDto.js';

/**
 * Monta a URL do /oauth/authorize para onde o navegador é mandado.
 *
 * Local, sem HTTP. PKCE é sempre S256 — o Puzl Account não aceita `plain`.
 *
 * @internal
 */
export class PzAccountSdkAuthorizeUrlService {
  static readonly ENDPOINT = '/oauth/authorize';

  constructor(private readonly config: PzAccountSdkConfig) {}

  execute(input: PzAccountSdkAuthorizeUrlDto): string {
    let redirectUri = input.redirect_uri;

    if (redirectUri === '') {
      this.config.assertRedirectUsable();
      redirectUri = this.config.redirectUri;
    }

    this.config.assertUsable();

    const query = buildQuery({
      response_type: 'code',
      client_id: this.config.clientId,
      redirect_uri: redirectUri,
      scope: input.scope !== '' ? input.scope : this.config.scope,
      state: input.state,
      nonce: input.nonce,
      code_challenge: input.code_challenge,
      code_challenge_method: 'S256',
      prompt: input.prompt?.value ?? '',
      login_hint: input.login_hint,
      response_mode: input.response_mode,
    });

    return `${this.config.issuer}${PzAccountSdkAuthorizeUrlService.ENDPOINT}?${query}`;
  }
}
