import { PzAccountSdkDto, mask, pullString, valuesOf, type PzAccountSdkValues } from '../../../Support/PzAccountSdkDto.js';

export interface PzAccountSdkUserRegisterInput {
  name: string;
  email: string;
  password: string;
  /** Y-m-d */
  birthdate: string;
  /** E.164 (ex.: +5511999999999) */
  phone_number?: string | undefined;
  /** ex.: pt-BR */
  locale?: string | undefined;
  /** ex.: America/Sao_Paulo */
  zoneinfo?: string | undefined;
}

/**
 * Entrada de `userRegister` — cria uma conta Puzl.
 *
 * A `password_confirmation` é preenchida pelo SDK. `birthdate` (Y-m-d) é
 * obrigatória e precisa indicar maioridade. Opcionais vazios não são enviados.
 */
export class PzAccountSdkUserRegisterDto extends PzAccountSdkDto {
  readonly name: string;
  readonly email: string;
  readonly password: string;
  readonly birthdate: string;
  readonly phone_number: string;
  readonly locale: string;
  readonly zoneinfo: string;

  constructor(props: PzAccountSdkUserRegisterInput) {
    super();
    this.name = props.name;
    this.email = props.email;
    this.password = props.password;
    this.birthdate = props.birthdate;
    this.phone_number = props.phone_number ?? '';
    this.locale = props.locale ?? '';
    this.zoneinfo = props.zoneinfo ?? '';
  }

  static from(values: unknown): PzAccountSdkUserRegisterDto {
    const v = valuesOf(values);

    return new PzAccountSdkUserRegisterDto({
      name: pullString(v, 'name'),
      email: pullString(v, 'email'),
      password: pullString(v, 'password'),
      birthdate: pullString(v, 'birthdate'),
      phone_number: pullString(v, 'phone_number'),
      locale: pullString(v, 'locale'),
      zoneinfo: pullString(v, 'zoneinfo'),
    });
  }

  /** Credenciais mascaradas: `toArray()` e `toJSON()` podem acabar em log. O valor real fica na propriedade. */
  toArray(): PzAccountSdkValues {
    return {
      name: this.name,
      email: this.email,
      password: mask(this.password),
      birthdate: this.birthdate,
      phone_number: this.phone_number,
      locale: this.locale,
      zoneinfo: this.zoneinfo,
    };
  }
}
