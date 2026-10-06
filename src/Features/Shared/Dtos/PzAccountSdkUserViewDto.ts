import { PzAccountSdkDto, pullBool, pullInt, pullString, valuesOf, type PzAccountSdkValues } from '../../../Support/PzAccountSdkDto.js';
import { PzAccountSdkAddressDto } from './PzAccountSdkAddressDto.js';

export interface PzAccountSdkUserViewFields {
  id: number;
  sub: string;
  name: string;
  email: string;
  is_active: boolean;
  email_verified_at: string;
  /** `Y-m-d` */
  birthdate: string;
  gender: string;
  phone_number: string;
  phone_number_verified_at: string;
  locale: string;
  zoneinfo: string;
  picture: string;
  address: PzAccountSdkAddressDto | null;
  mfa_enabled: boolean;
  deleted_at: string;
}

/**
 * A conta do usuário como a API do Puzl Account a devolve.
 *
 * Identifique o usuário no produto pelo `sub` (ULID público de 26
 * caracteres, estável) — nunca pelo `id`, que é interno do provedor, nem pelo
 * e-mail, que muda. Atenção: para um client `pairwise`, o `sub` do id_token e
 * do userinfo é outro; esta API devolve sempre o público.
 *
 * Datas chegam como string ISO 8601; campo ausente é string vazia.
 */
export class PzAccountSdkUserViewDto extends PzAccountSdkDto {
  readonly id: number;
  readonly sub: string;
  readonly name: string;
  readonly email: string;
  readonly is_active: boolean;
  readonly email_verified_at: string;
  readonly birthdate: string;
  readonly gender: string;
  readonly phone_number: string;
  readonly phone_number_verified_at: string;
  readonly locale: string;
  readonly zoneinfo: string;
  readonly picture: string;
  readonly address: PzAccountSdkAddressDto | null;
  readonly mfa_enabled: boolean;
  readonly deleted_at: string;

  constructor(props: Partial<PzAccountSdkUserViewFields> = {}) {
    super();
    this.id = props.id ?? 0;
    this.sub = props.sub ?? '';
    this.name = props.name ?? '';
    this.email = props.email ?? '';
    this.is_active = props.is_active ?? false;
    this.email_verified_at = props.email_verified_at ?? '';
    this.birthdate = props.birthdate ?? '';
    this.gender = props.gender ?? '';
    this.phone_number = props.phone_number ?? '';
    this.phone_number_verified_at = props.phone_number_verified_at ?? '';
    this.locale = props.locale ?? '';
    this.zoneinfo = props.zoneinfo ?? '';
    this.picture = props.picture ?? '';
    this.address = props.address ?? null;
    this.mfa_enabled = props.mfa_enabled ?? false;
    this.deleted_at = props.deleted_at ?? '';
  }

  static from(values: unknown): PzAccountSdkUserViewDto {
    const v = valuesOf(values);

    return new PzAccountSdkUserViewDto({
      id: pullInt(v, 'id'),
      sub: pullString(v, 'sub'),
      name: pullString(v, 'name'),
      email: pullString(v, 'email'),
      is_active: pullBool(v, 'is_active'),
      email_verified_at: pullString(v, 'email_verified_at'),
      birthdate: pullString(v, 'birthdate'),
      gender: pullString(v, 'gender'),
      phone_number: pullString(v, 'phone_number'),
      phone_number_verified_at: pullString(v, 'phone_number_verified_at'),
      locale: pullString(v, 'locale'),
      zoneinfo: pullString(v, 'zoneinfo'),
      picture: pullString(v, 'picture'),
      address: PzAccountSdkAddressDto.fromNullable(v, 'address'),
      mfa_enabled: pullBool(v, 'mfa_enabled'),
      deleted_at: pullString(v, 'deleted_at'),
    });
  }

  isEmailVerified(): boolean {
    return this.email_verified_at !== '';
  }

  toArray(): PzAccountSdkValues {
    return {
      id: this.id,
      sub: this.sub,
      name: this.name,
      email: this.email,
      is_active: this.is_active,
      email_verified_at: this.email_verified_at,
      birthdate: this.birthdate,
      gender: this.gender,
      phone_number: this.phone_number,
      phone_number_verified_at: this.phone_number_verified_at,
      locale: this.locale,
      zoneinfo: this.zoneinfo,
      picture: this.picture,
      address: this.address?.toArray() ?? null,
      mfa_enabled: this.mfa_enabled,
      deleted_at: this.deleted_at,
    };
  }
}
