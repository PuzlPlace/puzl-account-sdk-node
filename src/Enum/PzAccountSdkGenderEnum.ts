import { PzAccountSdkEnum, enumLookup } from './PzAccountSdkEnum.js';

export type PzAccountSdkGenderValue =
  | 'female'
  | 'male'
  | 'other'
  | 'prefer_not_to_say';

/**
 * Valores aceitos no campo `gender` da conta.
 *
 * Os DTOs guardam a string crua (vazia quando não informado); use
 * `tryFrom()` para ramificar.
 */
export class PzAccountSdkGenderEnum extends PzAccountSdkEnum<PzAccountSdkGenderValue> {
  static readonly FEMALE = new PzAccountSdkGenderEnum('FEMALE', 'female');
  static readonly MALE = new PzAccountSdkGenderEnum('MALE', 'male');
  static readonly OTHER = new PzAccountSdkGenderEnum('OTHER', 'other');
  static readonly PREFER_NOT_TO_SAY = new PzAccountSdkGenderEnum('PREFER_NOT_TO_SAY', 'prefer_not_to_say');

  private static readonly lookup = enumLookup('PzAccountSdkGenderEnum', [
    PzAccountSdkGenderEnum.FEMALE,
    PzAccountSdkGenderEnum.MALE,
    PzAccountSdkGenderEnum.OTHER,
    PzAccountSdkGenderEnum.PREFER_NOT_TO_SAY,
  ]);

  static cases(): readonly PzAccountSdkGenderEnum[] {
    return PzAccountSdkGenderEnum.lookup.cases();
  }

  static from(value: PzAccountSdkGenderEnum | PzAccountSdkGenderValue | string): PzAccountSdkGenderEnum {
    return PzAccountSdkGenderEnum.lookup.from(value);
  }

  static tryFrom(value: unknown): PzAccountSdkGenderEnum | null {
    return PzAccountSdkGenderEnum.lookup.tryFrom(value);
  }
}
