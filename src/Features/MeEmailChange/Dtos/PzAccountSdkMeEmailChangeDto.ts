import { PzAccountSdkDto, mask, pullString, valuesOf, type PzAccountSdkValues } from '../../../Support/PzAccountSdkDto.js';

export interface PzAccountSdkMeEmailChangeInput {
  access_token: string;
  /** o NOVO e-mail */
  email: string;
  current_password: string;
  /** TOTP ou código de recuperação — só para conta com MFA */
  code?: string | undefined;
}

/**
 * Entrada de `meEmailChange` — pede a troca do e-mail da conta.
 *
 * `code` (TOTP ou código de recuperação) é exigido só de conta com MFA.
 */
export class PzAccountSdkMeEmailChangeDto extends PzAccountSdkDto {
  readonly access_token: string;
  readonly email: string;
  readonly current_password: string;
  readonly code: string;

  constructor(props: PzAccountSdkMeEmailChangeInput) {
    super();
    this.access_token = props.access_token;
    this.email = props.email;
    this.current_password = props.current_password;
    this.code = props.code ?? '';
  }

  static from(values: unknown): PzAccountSdkMeEmailChangeDto {
    const v = valuesOf(values);

    return new PzAccountSdkMeEmailChangeDto({
      access_token: pullString(v, 'access_token'),
      email: pullString(v, 'email'),
      current_password: pullString(v, 'current_password'),
      code: pullString(v, 'code'),
    });
  }

  /** Credenciais mascaradas: `toArray()` e `toJSON()` podem acabar em log. O valor real fica na propriedade. */
  toArray(): PzAccountSdkValues {
    return {
      access_token: mask(this.access_token),
      email: this.email,
      current_password: mask(this.current_password),
      code: mask(this.code),
    };
  }
}
