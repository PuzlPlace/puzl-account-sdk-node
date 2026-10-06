import { PzAccountSdkDto, mask, pullString, valuesOf, type PzAccountSdkValues } from '../../../Support/PzAccountSdkDto.js';

export interface PzAccountSdkMeConsentRevokeInput {
  access_token: string;
  /** client_id do aplicativo, como veio em `meConsentList` */
  client_id: string;
}

/**
 * Entrada de `meConsentRevoke` — tira o acesso de um aplicativo à conta.
 */
export class PzAccountSdkMeConsentRevokeDto extends PzAccountSdkDto {
  readonly access_token: string;
  readonly client_id: string;

  constructor(props: PzAccountSdkMeConsentRevokeInput) {
    super();
    this.access_token = props.access_token;
    this.client_id = props.client_id;
  }

  static from(values: unknown): PzAccountSdkMeConsentRevokeDto {
    const v = valuesOf(values);

    return new PzAccountSdkMeConsentRevokeDto({
      access_token: pullString(v, 'access_token'),
      client_id: pullString(v, 'client_id'),
    });
  }

  /** Credenciais mascaradas: `toArray()` e `toJSON()` podem acabar em log. O valor real fica na propriedade. */
  toArray(): PzAccountSdkValues {
    return {
      access_token: mask(this.access_token),
      client_id: this.client_id,
    };
  }
}
