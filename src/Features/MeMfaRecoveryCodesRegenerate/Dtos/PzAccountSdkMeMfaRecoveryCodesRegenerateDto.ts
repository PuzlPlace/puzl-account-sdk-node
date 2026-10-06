import { PzAccountSdkDto, mask, pullString, valuesOf, type PzAccountSdkValues } from '../../../Support/PzAccountSdkDto.js';

export interface PzAccountSdkMeMfaRecoveryCodesRegenerateInput {
  access_token: string;
  current_password: string;
  code: string;
}

/**
 * Entrada de `meMfaRecoveryCodesRegenerate` — senha atual e um código do app
 * autenticador (ou de recuperação).
 */
export class PzAccountSdkMeMfaRecoveryCodesRegenerateDto extends PzAccountSdkDto {
  readonly access_token: string;
  readonly current_password: string;
  readonly code: string;

  constructor(props: PzAccountSdkMeMfaRecoveryCodesRegenerateInput) {
    super();
    this.access_token = props.access_token;
    this.current_password = props.current_password;
    this.code = props.code;
  }

  static from(values: unknown): PzAccountSdkMeMfaRecoveryCodesRegenerateDto {
    const v = valuesOf(values);

    return new PzAccountSdkMeMfaRecoveryCodesRegenerateDto({
      access_token: pullString(v, 'access_token'),
      current_password: pullString(v, 'current_password'),
      code: pullString(v, 'code'),
    });
  }

  /** Credenciais mascaradas: `toArray()` e `toJSON()` podem acabar em log. O valor real fica na propriedade. */
  toArray(): PzAccountSdkValues {
    return {
      access_token: mask(this.access_token),
      current_password: mask(this.current_password),
      code: mask(this.code),
    };
  }
}
