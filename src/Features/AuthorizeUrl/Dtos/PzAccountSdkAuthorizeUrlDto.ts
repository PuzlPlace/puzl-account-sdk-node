import { PzAccountSdkPromptEnum, type PzAccountSdkPromptValue } from '../../../Enum/PzAccountSdkPromptEnum.js';
import { PzAccountSdkDto, pullString, valuesOf, type PzAccountSdkValues } from '../../../Support/PzAccountSdkDto.js';

export interface PzAccountSdkAuthorizeUrlInput {
  state: string;
  nonce: string;
  code_challenge: string;
  redirect_uri?: string | undefined;
  scope?: string | undefined;
  prompt?: PzAccountSdkPromptEnum | PzAccountSdkPromptValue | null | undefined;
  /** e-mail para pré-preencher a tela de login */
  login_hint?: string | undefined;
  /** `web_message` para o fluxo em popup; vazio é `query` */
  response_mode?: string | undefined;
}

/**
 * Entrada de `authorizeUrl`.
 *
 * `state`, `nonce` e `code_challenge` vêm de `pkceCreate()`. Os demais são
 * opcionais: string vazia ou `null` significa "não enviar" — e, para
 * `redirect_uri` e `scope`, "usar o da configuração".
 */
export class PzAccountSdkAuthorizeUrlDto extends PzAccountSdkDto {
  readonly state: string;
  readonly nonce: string;
  readonly code_challenge: string;
  readonly redirect_uri: string;
  readonly scope: string;
  readonly prompt: PzAccountSdkPromptEnum | null;
  readonly login_hint: string;
  readonly response_mode: string;

  constructor(props: PzAccountSdkAuthorizeUrlInput) {
    super();
    this.state = props.state;
    this.nonce = props.nonce;
    this.code_challenge = props.code_challenge;
    this.redirect_uri = props.redirect_uri ?? '';
    this.scope = props.scope ?? '';
    this.prompt = PzAccountSdkPromptEnum.tryFrom(props.prompt);
    this.login_hint = props.login_hint ?? '';
    this.response_mode = props.response_mode ?? '';
  }

  static from(values: unknown): PzAccountSdkAuthorizeUrlDto {
    const v = valuesOf(values);

    return new PzAccountSdkAuthorizeUrlDto({
      state: pullString(v, 'state'),
      nonce: pullString(v, 'nonce'),
      code_challenge: pullString(v, 'code_challenge'),
      redirect_uri: pullString(v, 'redirect_uri'),
      scope: pullString(v, 'scope'),
      prompt: PzAccountSdkPromptEnum.tryFrom(v['prompt']),
      login_hint: pullString(v, 'login_hint'),
      response_mode: pullString(v, 'response_mode'),
    });
  }

  toArray(): PzAccountSdkValues {
    return {
      state: this.state,
      nonce: this.nonce,
      code_challenge: this.code_challenge,
      redirect_uri: this.redirect_uri,
      scope: this.scope,
      prompt: this.prompt?.value ?? null,
      login_hint: this.login_hint,
      response_mode: this.response_mode,
    };
  }
}
