import { PzAccountSdkDto, mask, pullString, valuesOf, type PzAccountSdkValues } from '../../../Support/PzAccountSdkDto.js';

export interface PzAccountSdkTokenPasswordInput {
  /** o e-mail da conta */
  username: string;
  password: string;
  scope?: string | undefined;
}

/**
 * Entrada de `tokenPassword` — login com e-mail e senha digitados no próprio
 * produto.
 *
 * `scope` vazio usa o da configuração.
 */
export class PzAccountSdkTokenPasswordDto extends PzAccountSdkDto {
  readonly username: string;
  readonly password: string;
  readonly scope: string;

  constructor(props: PzAccountSdkTokenPasswordInput) {
    super();
    this.username = props.username;
    this.password = props.password;
    this.scope = props.scope ?? '';
  }

  static from(values: unknown): PzAccountSdkTokenPasswordDto {
    const v = valuesOf(values);

    return new PzAccountSdkTokenPasswordDto({
      username: pullString(v, 'username'),
      password: pullString(v, 'password'),
      scope: pullString(v, 'scope'),
    });
  }

  toArray(): PzAccountSdkValues {
    return { username: this.username, password: mask(this.password), scope: this.scope };
  }
}
