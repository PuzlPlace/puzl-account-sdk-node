import { PzAccountSdkTokenTypeHintEnum, type PzAccountSdkTokenTypeHintValue } from '../../../Enum/PzAccountSdkTokenTypeHintEnum.js';
import { PzAccountSdkDto, mask, pullString, valuesOf, type PzAccountSdkValues } from '../../../Support/PzAccountSdkDto.js';

export interface PzAccountSdkTokenRevokeInput {
  token: string;
  token_type_hint?: PzAccountSdkTokenTypeHintEnum | PzAccountSdkTokenTypeHintValue | null | undefined;
}

/**
 * Entrada de `tokenRevoke` (RFC 7009).
 *
 * A dica só acelera a busca no provedor; sem ela, ele procura nos dois tipos.
 */
export class PzAccountSdkTokenRevokeDto extends PzAccountSdkDto {
  readonly token: string;
  readonly token_type_hint: PzAccountSdkTokenTypeHintEnum | null;

  constructor(props: PzAccountSdkTokenRevokeInput) {
    super();
    this.token = props.token;
    this.token_type_hint = PzAccountSdkTokenTypeHintEnum.tryFrom(props.token_type_hint);
  }

  static from(values: unknown): PzAccountSdkTokenRevokeDto {
    const v = valuesOf(values);

    return new PzAccountSdkTokenRevokeDto({
      token: pullString(v, 'token'),
      token_type_hint: PzAccountSdkTokenTypeHintEnum.tryFrom(v['token_type_hint']),
    });
  }

  toArray(): PzAccountSdkValues {
    return { token: mask(this.token), token_type_hint: this.token_type_hint?.value ?? null };
  }
}
