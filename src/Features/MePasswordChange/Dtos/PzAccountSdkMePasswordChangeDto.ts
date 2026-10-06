import { PzAccountSdkDto, mask, pullString, valuesOf, type PzAccountSdkValues } from '../../../Support/PzAccountSdkDto.js';

export interface PzAccountSdkMePasswordChangeInput {
  access_token: string;
  current_password: string;
  password: string;
  /** TOTP ou código de recuperação — só para conta com MFA */
  code?: string | undefined;
}

/**
 * Entrada de `mePasswordChange`.
 *
 * `code` (TOTP ou código de recuperação) é exigido só de conta com MFA. A
 * `password_confirmation` é preenchida pelo SDK.
 */
export class PzAccountSdkMePasswordChangeDto extends PzAccountSdkDto {
  readonly access_token: string;
  readonly current_password: string;
  readonly password: string;
  readonly code: string;

  constructor(props: PzAccountSdkMePasswordChangeInput) {
    super();
    this.access_token = props.access_token;
    this.current_password = props.current_password;
    this.password = props.password;
    this.code = props.code ?? '';
  }

  static from(values: unknown): PzAccountSdkMePasswordChangeDto {
    const v = valuesOf(values);

    return new PzAccountSdkMePasswordChangeDto({
      access_token: pullString(v, 'access_token'),
      current_password: pullString(v, 'current_password'),
      password: pullString(v, 'password'),
      code: pullString(v, 'code'),
    });
  }

  /** Credenciais mascaradas: `toArray()` e `toJSON()` podem acabar em log. O valor real fica na propriedade. */
  toArray(): PzAccountSdkValues {
    return {
      access_token: mask(this.access_token),
      current_password: mask(this.current_password),
      password: mask(this.password),
      code: mask(this.code),
    };
  }
}
