import { pullBool, pullInt, pullString, valuesOf, type PzAccountSdkValues } from '../../../Support/PzAccountSdkDto.js';
import { PzAccountSdkResultDto, type PzAccountSdkResultFields } from '../../Shared/Dtos/PzAccountSdkResultDto.js';

export interface PzAccountSdkMfaStatusViewFields extends PzAccountSdkResultFields {
  enabled: boolean;
  /** ISO 8601, ou vazio quando desligado */
  confirmed_at: string;
  recovery_codes_remaining: number;
}

/** Situação do MFA (TOTP) da conta. */
export class PzAccountSdkMfaStatusViewDto extends PzAccountSdkResultDto {
  readonly enabled: boolean;
  readonly confirmed_at: string;
  readonly recovery_codes_remaining: number;

  constructor(props: Partial<PzAccountSdkMfaStatusViewFields> = {}) {
    super(props);
    this.enabled = props.enabled ?? false;
    this.confirmed_at = props.confirmed_at ?? '';
    this.recovery_codes_remaining = props.recovery_codes_remaining ?? 0;
  }

  static override from(values: unknown): PzAccountSdkMfaStatusViewDto {
    const v = valuesOf(values);

    return new PzAccountSdkMfaStatusViewDto({
      ...PzAccountSdkResultDto.resultArgs(v),
      enabled: pullBool(v, 'enabled'),
      confirmed_at: pullString(v, 'confirmed_at'),
      recovery_codes_remaining: pullInt(v, 'recovery_codes_remaining'),
    });
  }

  override toArray(): PzAccountSdkValues {
    return {
      ...super.toArray(),
      enabled: this.enabled,
      confirmed_at: this.confirmed_at,
      recovery_codes_remaining: this.recovery_codes_remaining,
    };
  }
}
