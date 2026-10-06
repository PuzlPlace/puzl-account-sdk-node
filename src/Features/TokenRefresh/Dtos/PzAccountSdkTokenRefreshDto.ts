import { PzAccountSdkDto, mask, pullString, valuesOf, type PzAccountSdkValues } from '../../../Support/PzAccountSdkDto.js';

export interface PzAccountSdkTokenRefreshInput {
  refresh_token: string;
  scope?: string | undefined;
}

/**
 * Entrada de `tokenRefresh`.
 *
 * `scope` só pode reduzir o que foi concedido; vazio mantém os escopos.
 */
export class PzAccountSdkTokenRefreshDto extends PzAccountSdkDto {
  readonly refresh_token: string;
  readonly scope: string;

  constructor(props: PzAccountSdkTokenRefreshInput) {
    super();
    this.refresh_token = props.refresh_token;
    this.scope = props.scope ?? '';
  }

  static from(values: unknown): PzAccountSdkTokenRefreshDto {
    const v = valuesOf(values);

    return new PzAccountSdkTokenRefreshDto({ refresh_token: pullString(v, 'refresh_token'), scope: pullString(v, 'scope') });
  }

  toArray(): PzAccountSdkValues {
    return { refresh_token: mask(this.refresh_token), scope: this.scope };
  }
}
