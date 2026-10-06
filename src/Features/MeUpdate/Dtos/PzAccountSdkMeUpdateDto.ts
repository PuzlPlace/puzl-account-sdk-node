import { PzAccountSdkGenderEnum, type PzAccountSdkGenderValue } from '../../../Enum/PzAccountSdkGenderEnum.js';
import { PzAccountSdkDto, mask, pullString, valuesOf, type PzAccountSdkValues } from '../../../Support/PzAccountSdkDto.js';
import { PzAccountSdkAddressDto, type PzAccountSdkAddressInput } from '../../Shared/Dtos/PzAccountSdkAddressDto.js';
import type { PzAccountSdkUserViewDto } from '../../Shared/Dtos/PzAccountSdkUserViewDto.js';

export interface PzAccountSdkMeUpdateInput {
  access_token: string;
  name: string;
  email: string;
  /** Y-m-d */
  birthdate: string;
  locale: string;
  zoneinfo: string;
  /** valor de PzAccountSdkGenderEnum, ou vazio */
  gender?: PzAccountSdkGenderEnum | PzAccountSdkGenderValue | '' | undefined;
  /** E.164, ou vazio */
  phone_number?: string | undefined;
  address?: PzAccountSdkAddressDto | PzAccountSdkAddressInput | null | undefined;
}

/** Campos que dá para mudar com `fromUser()`. */
export type PzAccountSdkMeUpdateChanges = Partial<Omit<PzAccountSdkMeUpdateInput, 'access_token'>>;

/**
 * Entrada de `meUpdate` — PUT COMPLETO do perfil.
 *
 * Campo opcional vazio é enviado como `null` e APAGA o valor na conta. Para
 * mudar só um campo, parta da conta atual: `fromUser(token, user, { name: 'Novo' })`.
 *
 * O `email` precisa ser o atual: troca de e-mail é `meEmailChange`.
 */
export class PzAccountSdkMeUpdateDto extends PzAccountSdkDto {
  readonly access_token: string;
  readonly name: string;
  readonly email: string;
  readonly birthdate: string;
  readonly locale: string;
  readonly zoneinfo: string;
  readonly gender: string;
  readonly phone_number: string;
  readonly address: PzAccountSdkAddressDto | null;

  constructor(props: PzAccountSdkMeUpdateInput) {
    super();
    this.access_token = props.access_token;
    this.name = props.name;
    this.email = props.email;
    this.birthdate = props.birthdate;
    this.locale = props.locale;
    this.zoneinfo = props.zoneinfo;
    // Enum vira o valor — um enum convertido em vazio iria como null e apagaria o gênero.
    this.gender = typeof props.gender === 'string' ? props.gender : (PzAccountSdkGenderEnum.tryFrom(props.gender)?.value ?? '');
    this.phone_number = props.phone_number ?? '';
    this.address = PzAccountSdkAddressDto.fromNullable({ address: props.address }, 'address');
  }

  static from(values: unknown): PzAccountSdkMeUpdateDto {
    const v = valuesOf(values);

    return new PzAccountSdkMeUpdateDto({
      access_token: pullString(v, 'access_token'),
      name: pullString(v, 'name'),
      email: pullString(v, 'email'),
      birthdate: pullString(v, 'birthdate'),
      locale: pullString(v, 'locale'),
      zoneinfo: pullString(v, 'zoneinfo'),
      gender: PzAccountSdkGenderEnum.tryFrom(v['gender']) ?? (pullString(v, 'gender') as PzAccountSdkGenderValue),
      phone_number: pullString(v, 'phone_number'),
      address: PzAccountSdkAddressDto.fromNullable(v, 'address'),
    });
  }

  /**
   * Parte da conta atual (de `meShow`) e aplica só as mudanças — o jeito
   * seguro de editar um campo sem apagar os outros. `changes.address` aceita
   * o DTO, um objeto, ou `null` para apagar o endereço.
   */
  static fromUser(
    accessToken: string,
    user: PzAccountSdkUserViewDto,
    changes: PzAccountSdkMeUpdateChanges = {},
  ): PzAccountSdkMeUpdateDto {
    return PzAccountSdkMeUpdateDto.from({
      ...user.toArray(),
      address: user.address,
      ...changes,
      access_token: accessToken,
    });
  }

  toArray(): PzAccountSdkValues {
    return {
      access_token: mask(this.access_token),
      name: this.name,
      email: this.email,
      birthdate: this.birthdate,
      locale: this.locale,
      zoneinfo: this.zoneinfo,
      gender: this.gender,
      phone_number: this.phone_number,
      address: this.address?.toArray() ?? null,
    };
  }
}
