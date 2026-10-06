import { PzAccountSdkDto, mask, pullString, valuesOf, type PzAccountSdkValues } from '../../../Support/PzAccountSdkDto.js';

export interface PzAccountSdkTokenExchangeCodeInput {
  code: string;
  code_verifier: string;
  redirect_uri?: string | undefined;
}

/**
 * Entrada de `tokenExchangeCode`.
 *
 * `redirect_uri` precisa ser a MESMA usada na URL de authorize; vazio usa a
 * da configuração. O `code` vale 60 segundos e uma única vez.
 */
export class PzAccountSdkTokenExchangeCodeDto extends PzAccountSdkDto {
  readonly code: string;
  readonly code_verifier: string;
  readonly redirect_uri: string;

  constructor(props: PzAccountSdkTokenExchangeCodeInput) {
    super();
    this.code = props.code;
    this.code_verifier = props.code_verifier;
    this.redirect_uri = props.redirect_uri ?? '';
  }

  static from(values: unknown): PzAccountSdkTokenExchangeCodeDto {
    const v = valuesOf(values);

    return new PzAccountSdkTokenExchangeCodeDto({
      code: pullString(v, 'code'),
      code_verifier: pullString(v, 'code_verifier'),
      redirect_uri: pullString(v, 'redirect_uri'),
    });
  }

  toArray(): PzAccountSdkValues {
    return { code: mask(this.code), code_verifier: mask(this.code_verifier), redirect_uri: this.redirect_uri };
  }
}
