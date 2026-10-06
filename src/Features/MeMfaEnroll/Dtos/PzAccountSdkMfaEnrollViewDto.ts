import { pullString, valuesOf, type PzAccountSdkValues } from '../../../Support/PzAccountSdkDto.js';
import { PzAccountSdkResultDto, type PzAccountSdkResultFields } from '../../Shared/Dtos/PzAccountSdkResultDto.js';

export interface PzAccountSdkMfaEnrollViewFields extends PzAccountSdkResultFields {
  /** base32, para digitação manual */
  secret: string;
  /** otpauth://totp/... — o conteúdo do QR code */
  otpauth_uri: string;
  /** o QR code já renderizado, em SVG */
  qr_svg: string;
}

/**
 * Segredo TOTP para o usuário cadastrar no app autenticador.
 *
 * O MFA só liga depois de `meMfaEnrollConfirm` com um código gerado a partir
 * deste segredo. Não persista o segredo no produto.
 */
export class PzAccountSdkMfaEnrollViewDto extends PzAccountSdkResultDto {
  readonly secret: string;
  readonly otpauth_uri: string;
  readonly qr_svg: string;

  constructor(props: Partial<PzAccountSdkMfaEnrollViewFields> = {}) {
    super(props);
    this.secret = props.secret ?? '';
    this.otpauth_uri = props.otpauth_uri ?? '';
    this.qr_svg = props.qr_svg ?? '';
  }

  static override from(values: unknown): PzAccountSdkMfaEnrollViewDto {
    const v = valuesOf(values);

    return new PzAccountSdkMfaEnrollViewDto({
      ...PzAccountSdkResultDto.resultArgs(v),
      secret: pullString(v, 'secret'),
      otpauth_uri: pullString(v, 'otpauth_uri'),
      qr_svg: pullString(v, 'qr_svg'),
    });
  }

  override toArray(): PzAccountSdkValues {
    return { ...super.toArray(), secret: this.secret, otpauth_uri: this.otpauth_uri, qr_svg: this.qr_svg };
  }
}
