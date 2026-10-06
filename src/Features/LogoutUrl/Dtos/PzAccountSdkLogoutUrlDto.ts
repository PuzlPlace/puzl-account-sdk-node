import { PzAccountSdkDto, mask, pullString, valuesOf, type PzAccountSdkValues } from '../../../Support/PzAccountSdkDto.js';

export interface PzAccountSdkLogoutUrlInput {
  id_token_hint?: string | undefined;
  post_logout_redirect_uri?: string | undefined;
  state?: string | undefined;
}

/**
 * Entrada de `logoutUrl` (RP-initiated logout).
 *
 * `post_logout_redirect_uri` precisa estar registrada no client com
 * `--kind=post_logout`. Sem `id_token_hint`, o provedor pede confirmação ao
 * usuário antes de encerrar a sessão.
 */
export class PzAccountSdkLogoutUrlDto extends PzAccountSdkDto {
  readonly id_token_hint: string;
  readonly post_logout_redirect_uri: string;
  readonly state: string;

  constructor(props: PzAccountSdkLogoutUrlInput = {}) {
    super();
    this.id_token_hint = props.id_token_hint ?? '';
    this.post_logout_redirect_uri = props.post_logout_redirect_uri ?? '';
    this.state = props.state ?? '';
  }

  static from(values: unknown): PzAccountSdkLogoutUrlDto {
    const v = valuesOf(values);

    return new PzAccountSdkLogoutUrlDto({
      id_token_hint: pullString(v, 'id_token_hint'),
      post_logout_redirect_uri: pullString(v, 'post_logout_redirect_uri'),
      state: pullString(v, 'state'),
    });
  }

  toArray(): PzAccountSdkValues {
    return {
      id_token_hint: mask(this.id_token_hint),
      post_logout_redirect_uri: this.post_logout_redirect_uri,
      state: this.state,
    };
  }
}
