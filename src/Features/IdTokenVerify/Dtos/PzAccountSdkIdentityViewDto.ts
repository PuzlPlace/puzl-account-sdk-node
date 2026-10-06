import { pullInt, pullString, pullStringList, valuesOf, type PzAccountSdkValues } from '../../../Support/PzAccountSdkDto.js';
import { isRecord } from '../../../Support/PzAccountSdkValue.js';
import { PzAccountSdkAddressDto } from '../../Shared/Dtos/PzAccountSdkAddressDto.js';
import { PzAccountSdkResultDto, type PzAccountSdkResultFields } from '../../Shared/Dtos/PzAccountSdkResultDto.js';

export interface PzAccountSdkIdentityViewFields extends PzAccountSdkResultFields {
  sub: string;
  email: string;
  email_verified: boolean;
  name: string;
  birthdate: string;
  gender: string;
  picture: string;
  locale: string;
  zoneinfo: string;
  updated_at: number;
  phone_number: string;
  phone_number_verified: boolean;
  address: PzAccountSdkAddressDto | null;
  /** epoch em que o usuário se autenticou de fato (não a emissão do token) */
  auth_time: number;
  /** `urn:puzl:accounts:acr:1fa` ou `urn:puzl:accounts:acr:mfa` */
  acr: string;
  /** métodos de autenticação usados (ex.: `['pwd', 'otp']`) */
  amr: string[];
  iat: number;
  exp: number;
  /** todos os claims do token */
  claims: PzAccountSdkValues;
}

/**
 * Identidade extraída de um id_token JÁ VERIFICADO.
 *
 * Identifique o usuário pelo `sub`, que é estável — nunca pelo e-mail. Hoje
 * é o ULID público da conta (26 caracteres); se o client for configurado como
 * `pairwise` no Puzl Account, passa a ser um identificador próprio deste app
 * (e deixa de bater com o `sub` de `meShow`). Só use o `email` para vincular
 * uma conta existente quando `email_verified` for `true`.
 *
 * Claims de perfil dependem dos escopos; o ausente vira valor neutro. Todos os
 * claims crus ficam em `claims`.
 */
export class PzAccountSdkIdentityViewDto extends PzAccountSdkResultDto {
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
  readonly auth_time: number;
  readonly acr: string;
  readonly amr: string[];
  readonly iat: number;
  readonly exp: number;
  readonly claims: PzAccountSdkValues;

  constructor(props: Partial<PzAccountSdkIdentityViewFields> = {}) {
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
    this.auth_time = props.auth_time ?? 0;
    this.acr = props.acr ?? '';
    this.amr = props.amr ?? [];
    this.iat = props.iat ?? 0;
    this.exp = props.exp ?? 0;
    this.claims = props.claims ?? {};
  }

  static override from(values: unknown): PzAccountSdkIdentityViewDto {
    const v = valuesOf(values);
    const claims = v['claims'];

    return new PzAccountSdkIdentityViewDto({
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
      auth_time: pullInt(v, 'auth_time'),
      acr: pullString(v, 'acr'),
      amr: pullStringList(v, 'amr'),
      iat: pullInt(v, 'iat'),
      exp: pullInt(v, 'exp'),
      claims: isRecord(claims) ? claims : {},
    });
  }

  /** O usuário provou um segundo fator nesta autenticação? */
  isMultiFactor(): boolean {
    return this.acr === 'urn:puzl:accounts:acr:mfa';
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
      auth_time: this.auth_time,
      acr: this.acr,
      amr: this.amr,
      iat: this.iat,
      exp: this.exp,
      claims: this.claims,
    };
  }
}
