import { PzAccountSdkDto, mask, pullString, valuesOf, type PzAccountSdkValues } from '../../../Support/PzAccountSdkDto.js';
import { isTruthy } from '../../../Support/PzAccountSdkValue.js';

export interface PzAccountSdkIdTokenVerifyInput {
  id_token: string;
  /** o `nonce` de `pkceCreate()` desta tentativa de login */
  nonce: string;
  access_token?: string | undefined;
  /** `false` só via `forPasswordGrant()` */
  require_nonce?: boolean | undefined;
}

/**
 * Entrada de `idTokenVerify`.
 *
 * - `nonce`: o gerado por `pkceCreate()` para esta tentativa. É OBRIGATÓRIO:
 *   sem ele, um id_token de outro login seria aceito. A única exceção é o
 *   password grant, que não tem nonce — use `forPasswordGrant()`, que deixa a
 *   dispensa explícita em vez de acidental.
 * - `access_token`: quando informado, o id_token precisa trazer `at_hash` e
 *   ele precisa corresponder — prova que os dois saíram da mesma emissão.
 */
export class PzAccountSdkIdTokenVerifyDto extends PzAccountSdkDto {
  readonly id_token: string;
  readonly nonce: string;
  readonly access_token: string;
  readonly require_nonce: boolean;

  /**
   * @throws TypeError nonce vazio sem dispensa explícita — é erro de
   *                   integração, não token inválido
   */
  constructor(props: PzAccountSdkIdTokenVerifyInput) {
    super();
    this.id_token = props.id_token;
    this.nonce = props.nonce;
    this.access_token = props.access_token ?? '';
    this.require_nonce = props.require_nonce ?? true;

    if (this.require_nonce && this.nonce === '') {
      throw new TypeError(
        'PzAccountSdk: idTokenVerify exige o nonce da tentativa de login. ' +
          'No password grant, use PzAccountSdkIdTokenVerifyDto.forPasswordGrant().',
      );
    }
  }

  /** Verificação do id_token devolvido pelo password grant, que não carrega nonce. */
  static forPasswordGrant(idToken: string, accessToken = ''): PzAccountSdkIdTokenVerifyDto {
    return new PzAccountSdkIdTokenVerifyDto({ id_token: idToken, nonce: '', access_token: accessToken, require_nonce: false });
  }

  static from(values: unknown): PzAccountSdkIdTokenVerifyDto {
    const v = valuesOf(values);

    return new PzAccountSdkIdTokenVerifyDto({
      id_token: pullString(v, 'id_token'),
      nonce: pullString(v, 'nonce'),
      access_token: pullString(v, 'access_token'),
      require_nonce: v['require_nonce'] === undefined || v['require_nonce'] === null ? true : isTruthy(v['require_nonce']),
    });
  }

  /** Tokens mascarados: `toArray()` e `toJSON()` podem acabar em log. */
  toArray(): PzAccountSdkValues {
    return {
      id_token: mask(this.id_token),
      nonce: this.nonce,
      access_token: mask(this.access_token),
      require_nonce: this.require_nonce,
    };
  }
}
