import { PzAccountSdkDto, pullString, valuesOf, type PzAccountSdkValues } from '../../../Support/PzAccountSdkDto.js';
import { isRecord } from '../../../Support/PzAccountSdkValue.js';

export interface PzAccountSdkAddressInput {
  street_address?: string | undefined;
  locality?: string | undefined;
  region?: string | undefined;
  postal_code?: string | undefined;
  /** ISO 3166-1 alfa-2, em maiúsculas (ex.: `BR`). */
  country?: string | undefined;
}

/**
 * Endereço da conta — formato do claim `address` do OIDC (Core 5.1.1).
 *
 * Serve tanto de entrada (`meUpdate`) quanto de saída (conta, userinfo,
 * id_token). Campo não informado é string vazia.
 */
export class PzAccountSdkAddressDto extends PzAccountSdkDto {
  readonly street_address: string;
  readonly locality: string;
  readonly region: string;
  readonly postal_code: string;
  readonly country: string;

  constructor(props: PzAccountSdkAddressInput = {}) {
    super();
    this.street_address = props.street_address ?? '';
    this.locality = props.locality ?? '';
    this.region = props.region ?? '';
    this.postal_code = props.postal_code ?? '';
    this.country = props.country ?? '';
  }

  static from(values: unknown): PzAccountSdkAddressDto {
    const v = valuesOf(values);

    return new PzAccountSdkAddressDto({
      street_address: pullString(v, 'street_address'),
      locality: pullString(v, 'locality'),
      region: pullString(v, 'region'),
      postal_code: pullString(v, 'postal_code'),
      country: pullString(v, 'country'),
    });
  }

  /** O endereço em `values[key]`, ou `null` quando ausente — o provedor manda `null` para conta sem endereço. */
  static fromNullable(values: PzAccountSdkValues, key: string): PzAccountSdkAddressDto | null {
    const value = values[key];

    if (value instanceof PzAccountSdkAddressDto) {
      return value;
    }

    return isRecord(value) ? PzAccountSdkAddressDto.from(value) : null;
  }

  toArray(): PzAccountSdkValues {
    return {
      street_address: this.street_address,
      locality: this.locality,
      region: this.region,
      postal_code: this.postal_code,
      country: this.country,
    };
  }
}
