import { PzAccountSdkDto, pullString, valuesOf } from '../../../Support/PzAccountSdkDto.js';

/** Os segredos como objeto simples — o formato para guardar na sessão. */
export type PzAccountSdkPkceViewFields = {
  state: string;
  nonce: string;
  code_verifier: string;
  code_challenge: string;
};

/**
 * Segredos de uma tentativa de login (Authorization Code + PKCE S256).
 *
 * - `state`: protege o retorno contra CSRF — confira-o no callback.
 * - `nonce`: amarra o id_token a esta tentativa — passe-o ao `idTokenVerify`.
 * - `code_verifier`: fica no servidor do produto, nunca vai ao navegador;
 *   é exigido no `tokenExchangeCode`.
 * - `code_challenge`: vai na URL de authorize.
 *
 * Guarde `state`, `nonce` e `code_verifier` (cache/sessão) até o callback, e
 * use cada um uma única vez.
 */
export class PzAccountSdkPkceViewDto extends PzAccountSdkDto {
  readonly state: string;
  readonly nonce: string;
  readonly code_verifier: string;
  readonly code_challenge: string;

  constructor(props: PzAccountSdkPkceViewFields) {
    super();
    this.state = props.state;
    this.nonce = props.nonce;
    this.code_verifier = props.code_verifier;
    this.code_challenge = props.code_challenge;
  }

  static from(values: unknown): PzAccountSdkPkceViewDto {
    const v = valuesOf(values);

    return new PzAccountSdkPkceViewDto({
      state: pullString(v, 'state'),
      nonce: pullString(v, 'nonce'),
      code_verifier: pullString(v, 'code_verifier'),
      code_challenge: pullString(v, 'code_challenge'),
    });
  }

  /** Tipado: dá para guardar na sessão e ler de volta sem conversão. */
  override toArray(): PzAccountSdkPkceViewFields {
    return {
      state: this.state,
      nonce: this.nonce,
      code_verifier: this.code_verifier,
      code_challenge: this.code_challenge,
    };
  }
}
