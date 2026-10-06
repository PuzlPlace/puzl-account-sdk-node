import { pullInt, pullString, pullStringList, valuesOf, type PzAccountSdkValues } from '../../../Support/PzAccountSdkDto.js';
import { PzAccountSdkAddressDto } from '../../Shared/Dtos/PzAccountSdkAddressDto.js';
import { PzAccountSdkResultDto, type PzAccountSdkResultFields } from '../../Shared/Dtos/PzAccountSdkResultDto.js';

export interface PzAccountSdkUserInfoViewFields extends PzAccountSdkResultFields {
  sub: string;
  email: string;
  email_verified: boolean;
  name: string;
  birthdate: string;
  gender: string;
  picture: string;
  locale: string;
  zoneinfo: string;
  /** epoch em segundos */
  updated_at: number;
  phone_number: string;
  phone_number_verified: boolean;
  address: PzAccountSdkAddressDto | null;
  /** nomes dos claims que vieram na resposta */
  present_claims: string[];
}

/**
 * Claims do /oauth/userinfo.
 *
 * O provedor OMITE o claim cujo escopo o token não tem (nunca manda `null`);
 * aqui o ausente vira valor neutro: string vazia, `false`, `0` ou `null` no
 * endereço. Use `hasClaim()` quando precisar distinguir.
 */
export class PzAccountSdkUserInfoViewDto extends PzAccountSdkResultDto {
  /** Claims de perfil que o Puzl Account pode devolver. */
  private static readonly CLAIMS = [
    'sub', 'email', 'email_verified', 'name', 'birthdate', 'gender', 'picture', 'locale',
    'zoneinfo', 'updated_at', 'phone_number', 'phone_number_verified', 'address',
  ];

  readonly sub: string;
  readonly email: string;
  readonly email_verified: boolean;
  readonly name: string;
  readonly birthdate: string;
  readonly gender: string;
  readonly picture: string;
  readonly locale: string;
  readonly zoneinfo: string;
  readonly updated_at: number;
  readonly phone_number: string;
  readonly phone_number_verified: boolean;
  readonly address: PzAccountSdkAddressDto | null;
  readonly present_claims: string[];

  constructor(props: Partial<PzAccountSdkUserInfoViewFields> = {}) {
    super(props);
    this.sub = props.sub ?? '';
    this.email = props.email ?? '';
    this.email_verified = props.email_verified ?? false;
    this.name = props.name ?? '';
    this.birthdate = props.birthdate ?? '';
    this.gender = props.gender ?? '';
    this.picture = props.picture ?? '';
    this.locale = props.locale ?? '';
    this.zoneinfo = props.zoneinfo ?? '';
    this.updated_at = props.updated_at ?? 0;
    this.phone_number = props.phone_number ?? '';
    this.phone_number_verified = props.phone_number_verified ?? false;
    this.address = props.address ?? null;
    this.present_claims = props.present_claims ?? [];
  }

  static override from(values: unknown): PzAccountSdkUserInfoViewDto {
    const v = valuesOf(values);

    return new PzAccountSdkUserInfoViewDto({
      ...PzAccountSdkResultDto.resultArgs(v),
      sub: pullString(v, 'sub'),
      email: pullString(v, 'email'),
      email_verified: v['email_verified'] === true,
      name: pullString(v, 'name'),
      birthdate: pullString(v, 'birthdate'),
      gender: pullString(v, 'gender'),
      picture: pullString(v, 'picture'),
      locale: pullString(v, 'locale'),
      zoneinfo: pullString(v, 'zoneinfo'),
      updated_at: pullInt(v, 'updated_at'),
      phone_number: pullString(v, 'phone_number'),
      phone_number_verified: v['phone_number_verified'] === true,
      address: PzAccountSdkAddressDto.fromNullable(v, 'address'),
      present_claims: Object.hasOwn(v, 'present_claims')
        ? pullStringList(v, 'present_claims')
        : PzAccountSdkUserInfoViewDto.CLAIMS.filter((claim) => Object.hasOwn(v, claim)),
    });
  }

  /** O claim veio na resposta? (Não veio = o token não tem o escopo.) */
  hasClaim(claim: string): boolean {
    return this.present_claims.includes(claim);
  }

  override toArray(): PzAccountSdkValues {
    return {
      ...super.toArray(),
      sub: this.sub,
      email: this.email,
      email_verified: this.email_verified,
      name: this.name,
      birthdate: this.birthdate,
      gender: this.gender,
      picture: this.picture,
      locale: this.locale,
      zoneinfo: this.zoneinfo,
      updated_at: this.updated_at,
      phone_number: this.phone_number,
      phone_number_verified: this.phone_number_verified,
      address: this.address?.toArray() ?? null,
      present_claims: this.present_claims,
    };
  }
}
