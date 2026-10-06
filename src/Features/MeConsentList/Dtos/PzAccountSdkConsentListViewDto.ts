import { pullArray, valuesOf, type PzAccountSdkValues } from '../../../Support/PzAccountSdkDto.js';
import { isRecord } from '../../../Support/PzAccountSdkValue.js';
import { PzAccountSdkResultDto, type PzAccountSdkResultFields } from '../../Shared/Dtos/PzAccountSdkResultDto.js';
import { PzAccountSdkConsentViewDto } from './PzAccountSdkConsentViewDto.js';

export interface PzAccountSdkConsentListViewFields extends PzAccountSdkResultFields {
  consents: PzAccountSdkConsentViewDto[];
}

/** Aplicativos com acesso à conta do usuário. */
export class PzAccountSdkConsentListViewDto extends PzAccountSdkResultDto {
  readonly consents: PzAccountSdkConsentViewDto[];

  constructor(props: Partial<PzAccountSdkConsentListViewFields> = {}) {
    super(props);
    this.consents = props.consents ?? [];
  }

  static override from(values: unknown): PzAccountSdkConsentListViewDto {
    const v = valuesOf(values);
    const consents: PzAccountSdkConsentViewDto[] = [];

    for (const item of Object.values(pullArray(v, 'consents'))) {
      if (item instanceof PzAccountSdkConsentViewDto) {
        consents.push(item);
      } else if (isRecord(item)) {
        consents.push(PzAccountSdkConsentViewDto.from(item));
      }
    }

    return new PzAccountSdkConsentListViewDto({ ...PzAccountSdkResultDto.resultArgs(v), consents });
  }

  override toArray(): PzAccountSdkValues {
    return { ...super.toArray(), consents: this.consents.map((consent) => consent.toArray()) };
  }
}
