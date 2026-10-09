import { PzAccountSdkDto, mask, pullString, valuesOf, type PzAccountSdkValues } from '../../../Support/PzAccountSdkDto.js';

export interface PzAccountSdkAccessTokenInput {
  access_token: string;
}

/**
 * Entrada das operações que só precisam do access token do usuário:
 * `userInfoShow`, `meShow`, `mePictureDelete`, `meMfaShow`, `meConsentList` e
 * `meApplicationList`.
 *
 * O SDK não guarda sessão: o token é do usuário, e quem o armazena é o produto.
 */
export class PzAccountSdkAccessTokenDto extends PzAccountSdkDto {
  readonly access_token: string;

  constructor(props: PzAccountSdkAccessTokenInput) {
    super();
    this.access_token = props.access_token;
  }

  static from(values: unknown): PzAccountSdkAccessTokenDto {
    const v = valuesOf(values);

    return new PzAccountSdkAccessTokenDto({ access_token: pullString(v, 'access_token') });
  }

  toArray(): PzAccountSdkValues {
    return { access_token: mask(this.access_token) };
  }
}
