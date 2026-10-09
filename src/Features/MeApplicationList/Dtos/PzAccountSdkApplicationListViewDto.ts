import { pullArray, valuesOf, type PzAccountSdkValues } from '../../../Support/PzAccountSdkDto.js';
import { isRecord } from '../../../Support/PzAccountSdkValue.js';
import { PzAccountSdkResultDto, type PzAccountSdkResultFields } from '../../Shared/Dtos/PzAccountSdkResultDto.js';
import { PzAccountSdkApplicationViewDto } from './PzAccountSdkApplicationViewDto.js';

export interface PzAccountSdkApplicationListViewFields extends PzAccountSdkResultFields {
  applications: PzAccountSdkApplicationViewDto[];
}

/** Aplicativos em que o usuário está cadastrado: da Puzl e de terceiros. */
export class PzAccountSdkApplicationListViewDto extends PzAccountSdkResultDto {
  readonly applications: PzAccountSdkApplicationViewDto[];

  constructor(props: Partial<PzAccountSdkApplicationListViewFields> = {}) {
    super(props);
    this.applications = props.applications ?? [];
  }

  static override from(values: unknown): PzAccountSdkApplicationListViewDto {
    const v = valuesOf(values);
    const applications: PzAccountSdkApplicationViewDto[] = [];

    for (const item of Object.values(pullArray(v, 'applications'))) {
      if (item instanceof PzAccountSdkApplicationViewDto) {
        applications.push(item);
      } else if (isRecord(item)) {
        applications.push(PzAccountSdkApplicationViewDto.from(item));
      }
    }

    return new PzAccountSdkApplicationListViewDto({ ...PzAccountSdkResultDto.resultArgs(v), applications });
  }

  override toArray(): PzAccountSdkValues {
    return { ...super.toArray(), applications: this.applications.map((application) => application.toArray()) };
  }
}
