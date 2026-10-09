import { PzAccountSdkDto, pullBool, pullString, valuesOf, type PzAccountSdkValues } from '../../../Support/PzAccountSdkDto.js';

export interface PzAccountSdkApplicationViewFields {
  client_id: string;
  client_name: string;
  logo_uri: string;
  /** endereço para abrir o aplicativo */
  launch_uri: string;
  /** `true` para aplicativo da Puzl */
  is_first_party: boolean;
  /** primeiro login (Puzl) ou autorização (terceiro), ISO 8601 UTC */
  granted_at: string;
}

/** Um aplicativo em que o usuário está cadastrado. */
export class PzAccountSdkApplicationViewDto extends PzAccountSdkDto {
  readonly client_id: string;
  readonly client_name: string;
  readonly logo_uri: string;
  readonly launch_uri: string;
  readonly is_first_party: boolean;
  readonly granted_at: string;

  constructor(props: Partial<PzAccountSdkApplicationViewFields> = {}) {
    super();
    this.client_id = props.client_id ?? '';
    this.client_name = props.client_name ?? '';
    this.logo_uri = props.logo_uri ?? '';
    this.launch_uri = props.launch_uri ?? '';
    this.is_first_party = props.is_first_party ?? false;
    this.granted_at = props.granted_at ?? '';
  }

  static from(values: unknown): PzAccountSdkApplicationViewDto {
    const v = valuesOf(values);

    return new PzAccountSdkApplicationViewDto({
      client_id: pullString(v, 'client_id'),
      client_name: pullString(v, 'client_name'),
      logo_uri: pullString(v, 'logo_uri'),
      launch_uri: pullString(v, 'launch_uri'),
      is_first_party: pullBool(v, 'is_first_party'),
      granted_at: pullString(v, 'granted_at'),
    });
  }

  toArray(): PzAccountSdkValues {
    return {
      client_id: this.client_id,
      client_name: this.client_name,
      logo_uri: this.logo_uri,
      launch_uri: this.launch_uri,
      is_first_party: this.is_first_party,
      granted_at: this.granted_at,
    };
  }
}
