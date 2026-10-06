import { PzAccountSdkDto, mask, pullString, valuesOf, type PzAccountSdkValues } from '../../../Support/PzAccountSdkDto.js';

export interface PzAccountSdkMeMfaEnrollConfirmInput {
  access_token: string;
  /** código de 6 dígitos do app autenticador */
  code: string;
}

/**
 * Entrada de `meMfaEnrollConfirm` — o código de 6 dígitos do app autenticador.
 */
export class PzAccountSdkMeMfaEnrollConfirmDto extends PzAccountSdkDto {
  readonly access_token: string;
  readonly code: string;

  constructor(props: PzAccountSdkMeMfaEnrollConfirmInput) {
    super();
    this.access_token = props.access_token;
    this.code = props.code;
  }

  static from(values: unknown): PzAccountSdkMeMfaEnrollConfirmDto {
    const v = valuesOf(values);

    return new PzAccountSdkMeMfaEnrollConfirmDto({
      access_token: pullString(v, 'access_token'),
      code: pullString(v, 'code'),
    });
  }

  /** Credenciais mascaradas: `toArray()` e `toJSON()` podem acabar em log. O valor real fica na propriedade. */
  toArray(): PzAccountSdkValues {
    return {
      access_token: mask(this.access_token),
      code: mask(this.code),
    };
  }
}
