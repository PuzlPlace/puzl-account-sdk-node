import { pullInt, pullString, valuesOf, type PzAccountSdkValues } from '../../../Support/PzAccountSdkDto.js';
import { PzAccountSdkResultDto, type PzAccountSdkResultFields } from './PzAccountSdkResultDto.js';

export interface PzAccountSdkTokenViewFields extends PzAccountSdkResultFields {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  id_token: string;
  refresh_token: string;
}

/**
 * Resposta do /oauth/token: `tokenExchangeCode`, `tokenRefresh` e
 * `tokenPassword`.
 *
 * - `access_token` é opaco: valide-o chamando `userInfoShow`, nunca
 *   decodificando.
 * - `id_token` é um JWT RS256: passe-o por `idTokenVerify` antes de confiar
 *   em qualquer claim.
 * - `refresh_token` só vem com o escopo `offline_access`, e GIRA a cada uso —
 *   guarde sempre o novo. Reusar o antigo derruba a família inteira.
 */
export class PzAccountSdkTokenViewDto extends PzAccountSdkResultDto {
  readonly access_token: string;
  readonly token_type: string;
  readonly expires_in: number;
  readonly scope: string;
  readonly id_token: string;
  readonly refresh_token: string;

  constructor(props: Partial<PzAccountSdkTokenViewFields> = {}) {
    super(props);
    this.access_token = props.access_token ?? '';
    this.token_type = props.token_type ?? '';
    this.expires_in = props.expires_in ?? 0;
    this.scope = props.scope ?? '';
    this.id_token = props.id_token ?? '';
    this.refresh_token = props.refresh_token ?? '';
  }

  static override from(values: unknown): PzAccountSdkTokenViewDto {
    const v = valuesOf(values);

    return new PzAccountSdkTokenViewDto({
      ...PzAccountSdkResultDto.resultArgs(v),
      access_token: pullString(v, 'access_token'),
      token_type: pullString(v, 'token_type'),
      expires_in: pullInt(v, 'expires_in'),
      scope: pullString(v, 'scope'),
      id_token: pullString(v, 'id_token'),
      refresh_token: pullString(v, 'refresh_token'),
    });
  }

  hasIdToken(): boolean {
    return this.id_token !== '';
  }

  hasRefreshToken(): boolean {
    return this.refresh_token !== '';
  }

  override toArray(): PzAccountSdkValues {
    return {
      ...super.toArray(),
      access_token: this.access_token,
      token_type: this.token_type,
      expires_in: this.expires_in,
      scope: this.scope,
      id_token: this.id_token,
      refresh_token: this.refresh_token,
    };
  }
}
