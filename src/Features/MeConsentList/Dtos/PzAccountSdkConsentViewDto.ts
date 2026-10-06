import { PzAccountSdkDto, pullString, pullStringList, valuesOf, type PzAccountSdkValues } from '../../../Support/PzAccountSdkDto.js';

export interface PzAccountSdkConsentViewFields {
  client_id: string;
  client_name: string;
  logo_uri: string;
  client_uri: string;
  /** títulos legíveis dos escopos, já traduzidos */
  scopes: string[];
  granted_at: string;
}

/** Um aplicativo a que o usuário deu acesso à conta. */
export class PzAccountSdkConsentViewDto extends PzAccountSdkDto {
  readonly client_id: string;
  readonly client_name: string;
  readonly logo_uri: string;
  readonly client_uri: string;
  readonly scopes: string[];
  readonly granted_at: string;

  constructor(props: Partial<PzAccountSdkConsentViewFields> = {}) {
    super();
    this.client_id = props.client_id ?? '';
    this.client_name = props.client_name ?? '';
    this.logo_uri = props.logo_uri ?? '';
    this.client_uri = props.client_uri ?? '';
    this.scopes = props.scopes ?? [];
    this.granted_at = props.granted_at ?? '';
  }

  static from(values: unknown): PzAccountSdkConsentViewDto {
    const v = valuesOf(values);

    return new PzAccountSdkConsentViewDto({
      client_id: pullString(v, 'client_id'),
      client_name: pullString(v, 'client_name'),
      logo_uri: pullString(v, 'logo_uri'),
      client_uri: pullString(v, 'client_uri'),
      scopes: pullStringList(v, 'scopes'),
      granted_at: pullString(v, 'granted_at'),
    });
  }

  toArray(): PzAccountSdkValues {
    return {
      client_id: this.client_id,
      client_name: this.client_name,
      logo_uri: this.logo_uri,
      client_uri: this.client_uri,
      scopes: this.scopes,
      granted_at: this.granted_at,
    };
  }
}
