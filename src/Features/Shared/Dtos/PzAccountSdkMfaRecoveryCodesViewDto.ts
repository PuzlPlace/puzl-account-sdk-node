import { pullString, pullStringList, valuesOf, type PzAccountSdkValues } from '../../../Support/PzAccountSdkDto.js';
import { PzAccountSdkResultDto, type PzAccountSdkResultFields } from './PzAccountSdkResultDto.js';

export interface PzAccountSdkMfaRecoveryCodesViewFields extends PzAccountSdkResultFields {
  recovery_codes: string[];
  /** Aviso traduzido para mostrar junto dos códigos. */
  warning: string;
}

/**
 * Códigos de recuperação do MFA: `meMfaEnrollConfirm` e
 * `meMfaRecoveryCodesRegenerate`.
 *
 * Os códigos aparecem UMA vez. Mostre ao usuário e não persista.
 */
export class PzAccountSdkMfaRecoveryCodesViewDto extends PzAccountSdkResultDto {
  readonly recovery_codes: string[];
  readonly warning: string;

  constructor(props: Partial<PzAccountSdkMfaRecoveryCodesViewFields> = {}) {
    super(props);
    this.recovery_codes = props.recovery_codes ?? [];
    this.warning = props.warning ?? '';
  }

  static override from(values: unknown): PzAccountSdkMfaRecoveryCodesViewDto {
    const v = valuesOf(values);

    return new PzAccountSdkMfaRecoveryCodesViewDto({
      ...PzAccountSdkResultDto.resultArgs(v),
      recovery_codes: pullStringList(v, 'recovery_codes'),
      warning: pullString(v, 'warning'),
    });
  }

  override toArray(): PzAccountSdkValues {
    return { ...super.toArray(), recovery_codes: this.recovery_codes, warning: this.warning };
  }
}
