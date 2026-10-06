import { PzAccountSdkDto, mask, pullString, valuesOf, type PzAccountSdkValues } from '../../../Support/PzAccountSdkDto.js';

export interface PzAccountSdkMeMfaEnrollInput {
  access_token: string;
  current_password: string;
}

/**
 * Entrada de `meMfaEnroll` — começa a ligar o MFA; pede a senha atual.
 */
export class PzAccountSdkMeMfaEnrollDto extends PzAccountSdkDto {
  readonly access_token: string;
  readonly current_password: string;

  constructor(props: PzAccountSdkMeMfaEnrollInput) {
    super();
    this.access_token = props.access_token;
    this.current_password = props.current_password;
  }

  static from(values: unknown): PzAccountSdkMeMfaEnrollDto {
    const v = valuesOf(values);

    return new PzAccountSdkMeMfaEnrollDto({
      access_token: pullString(v, 'access_token'),
      current_password: pullString(v, 'current_password'),
    });
  }

  /** Credenciais mascaradas: `toArray()` e `toJSON()` podem acabar em log. O valor real fica na propriedade. */
  toArray(): PzAccountSdkValues {
    return {
      access_token: mask(this.access_token),
      current_password: mask(this.current_password),
    };
  }
}
