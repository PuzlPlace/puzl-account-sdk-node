import { valuesOf, type PzAccountSdkValues } from '../../../Support/PzAccountSdkDto.js';
import { isRecord } from '../../../Support/PzAccountSdkValue.js';
import { PzAccountSdkResultDto, type PzAccountSdkResultFields } from './PzAccountSdkResultDto.js';
import { PzAccountSdkUserViewDto } from './PzAccountSdkUserViewDto.js';

export interface PzAccountSdkUserProfileViewFields extends PzAccountSdkResultFields {
  user: PzAccountSdkUserViewDto | null;
}

/**
 * Retorno das operações que devolvem a conta: `userRegister`, `meShow`,
 * `meUpdate` e as operações de foto.
 *
 * `user` só vem preenchido no sucesso.
 */
export class PzAccountSdkUserProfileViewDto extends PzAccountSdkResultDto {
  readonly user: PzAccountSdkUserViewDto | null;

  constructor(props: Partial<PzAccountSdkUserProfileViewFields> = {}) {
    super(props);
    this.user = props.user ?? null;
  }

  static override from(values: unknown): PzAccountSdkUserProfileViewDto {
    const v = valuesOf(values);
    const user = v['user'];

    return new PzAccountSdkUserProfileViewDto({
      ...PzAccountSdkResultDto.resultArgs(v),
      user: user instanceof PzAccountSdkUserViewDto ? user : isRecord(user) ? PzAccountSdkUserViewDto.from(user) : null,
    });
  }

  override toArray(): PzAccountSdkValues {
    return { ...super.toArray(), user: this.user?.toArray() ?? null };
  }
}
