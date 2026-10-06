//#region src/Enum/PzAccountSdkEnum.d.ts
/**
 * Base dos enums do SDK — o equivalente ao `enum: string` do PHP.
 *
 * Cada caso é uma instância única (`PzAccountSdkPromptEnum.LOGIN`), com
 * `name` e `value`, e cada enum expõe `cases()`, `from()` e `tryFrom()`.
 * Onde o SDK recebe um enum, também aceita o valor cru (`'login'`), para
 * quem escreve JavaScript puro.
 */
declare abstract class PzAccountSdkEnum<V extends string = string> {
  readonly name: string;
  readonly value: V;
  protected constructor(name: string, value: V);
  toString(): string;
  toJSON(): string;
}
//#endregion
//#region src/Enum/PzAccountSdkAccountPageEnum.d.ts
type PzAccountSdkAccountPageValue = '/' | '/account/profile' | '/account/picture' | '/account/password' | '/account/login-methods' | '/account/mfa/enroll' | '/account/delete';
/**
 * Telas da conta no Puzl Account para onde o produto pode mandar o usuário.
 * O valor é o caminho a partir do issuer.
 */
declare class PzAccountSdkAccountPageEnum extends PzAccountSdkEnum<PzAccountSdkAccountPageValue> {
  static readonly HOME: PzAccountSdkAccountPageEnum;
  static readonly PROFILE: PzAccountSdkAccountPageEnum;
  static readonly PICTURE: PzAccountSdkAccountPageEnum;
  static readonly PASSWORD: PzAccountSdkAccountPageEnum;
  static readonly LOGIN_METHODS: PzAccountSdkAccountPageEnum;
  static readonly MFA_ENROLL: PzAccountSdkAccountPageEnum;
  static readonly DELETE: PzAccountSdkAccountPageEnum;
  private static readonly lookup;
  static cases(): readonly PzAccountSdkAccountPageEnum[];
  static from(value: PzAccountSdkAccountPageEnum | PzAccountSdkAccountPageValue | string): PzAccountSdkAccountPageEnum;
  static tryFrom(value: unknown): PzAccountSdkAccountPageEnum | null;
}
//#endregion
//#region src/Enum/PzAccountSdkPromptEnum.d.ts
type PzAccountSdkPromptValue = 'none' | 'login' | 'consent' | 'select_account' | 'create';
/**
 * Valores aceitos no parâmetro `prompt` do /oauth/authorize.
 */
declare class PzAccountSdkPromptEnum extends PzAccountSdkEnum<PzAccountSdkPromptValue> {
  /** Não mostra tela nenhuma: sem sessão no provedor, volta com `login_required`. */
  static readonly NONE: PzAccountSdkPromptEnum;
  /** Pede a senha de novo, mesmo havendo sessão. */
  static readonly LOGIN: PzAccountSdkPromptEnum;
  /** Mostra a tela de consentimento mesmo já havendo um. */
  static readonly CONSENT: PzAccountSdkPromptEnum;
  /** Mostra a escolha de conta. */
  static readonly SELECT_ACCOUNT: PzAccountSdkPromptEnum;
  /** Abre direto o cadastro em vez do login ("Criar conta Puzl"). */
  static readonly CREATE: PzAccountSdkPromptEnum;
  private static readonly lookup;
  static cases(): readonly PzAccountSdkPromptEnum[];
  static from(value: PzAccountSdkPromptEnum | PzAccountSdkPromptValue | string): PzAccountSdkPromptEnum;
  static tryFrom(value: unknown): PzAccountSdkPromptEnum | null;
}
//#endregion
//#region src/Support/PzAccountSdkValue.d.ts
/**
 * Coerção de valores soltos (JSON da resposta, entrada de quem usa
 * JavaScript puro) com as mesmas regras do SDK PHP — é o que garante que os
 * dois SDKs leiam a mesma resposta do mesmo jeito.
 *
 * @internal
 */
/** Objeto JSON (ou array) — o que o PHP chamaria de array. */
type PzAccountSdkValues = Record<string, unknown>;
//#endregion
//#region src/Support/PzAccountSdkDto.d.ts
/**
 * Base dos DTOs.
 *
 * Cada DTO tem um `static from(values)`, que aceita qualquer coisa (resposta
 * crua do provedor, objeto vindo de JavaScript sem tipos) e aplica as regras
 * de coerção abaixo — as mesmas do SDK PHP. Ausente e `null` viram o valor
 * neutro do tipo: `''`, `0`, `false`, `[]`.
 *
 * `toArray()` devolve um objeto simples; `toJSON()` e o `console.log` usam o
 * mesmo formato — com os segredos mascarados nos DTOs de entrada.
 */
declare abstract class PzAccountSdkDto {
  abstract toArray(): PzAccountSdkValues;
  toJSON(): PzAccountSdkValues;
  toJson(): string;
}
//#endregion
//#region src/Features/AuthorizeUrl/Dtos/PzAccountSdkAuthorizeUrlDto.d.ts
interface PzAccountSdkAuthorizeUrlInput {
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
declare class PzAccountSdkAuthorizeUrlDto extends PzAccountSdkDto {
  readonly state: string;
  readonly nonce: string;
  readonly code_challenge: string;
  readonly redirect_uri: string;
  readonly scope: string;
  readonly prompt: PzAccountSdkPromptEnum | null;
  readonly login_hint: string;
  readonly response_mode: string;
  constructor(props: PzAccountSdkAuthorizeUrlInput);
  static from(values: unknown): PzAccountSdkAuthorizeUrlDto;
  toArray(): PzAccountSdkValues;
}
//#endregion
//#region src/Enum/PzAccountSdkErrorCodeEnum.d.ts
/**
 * Códigos de erro que chegam em `PzAccountSdkResultDto.error_code`.
 *
 * Três origens convivem aqui, cada uma com sua grafia:
 *
 * - API da conta (`/api/identity/*`): campo `code` do envelope de erro,
 *   em MAIÚSCULAS (ex.: `EMAIL_ALREADY_EXISTS`).
 * - Protocolo OAuth (`/oauth/*`): campo `error` das RFCs 6749/7009, em
 *   minúsculas (ex.: `invalid_grant`).
 * - O próprio SDK, quando a falha é detectada do lado de cá: id_token ou
 *   webhook que não passou na verificação, JWKS inacessível.
 *
 * O código é contrato estável; a mensagem é traduzida e pode mudar sem aviso.
 * Ramifique sempre por este enum.
 *
 * Nunca tipe uma propriedade de DTO com ele: um código novo do Puzl Account,
 * ainda desconhecido por esta versão do SDK, precisa chegar ao consumidor
 * como string crua. Por isso o DTO guarda `error_code: string` e expõe
 * `getErrorCode()`, que devolve `null` para o que não reconhece.
 */
declare class PzAccountSdkErrorCodeEnum extends PzAccountSdkEnum {
  private readonly status;
  private readonly clientFault;
  private constructor();
  /** 422 — falha de validação; detalhes em `errors` */
  static readonly VALIDATION_ERROR: PzAccountSdkErrorCodeEnum;
  /** 401 — access token ausente, vencido ou revogado */
  static readonly UNAUTHENTICATED: PzAccountSdkErrorCodeEnum;
  /** 403 — o token não foi emitido para um client first-party */
  static readonly FORBIDDEN: PzAccountSdkErrorCodeEnum;
  /** 404 — rota ou registro inexistente */
  static readonly NOT_FOUND: PzAccountSdkErrorCodeEnum;
  /** 405 — método HTTP não aceito pela rota */
  static readonly METHOD_NOT_ALLOWED: PzAccountSdkErrorCodeEnum;
  /** 406 — regra de negócio sem código específico */
  static readonly BUSINESS_ERROR: PzAccountSdkErrorCodeEnum;
  /** 429 — rate limit estourado */
  static readonly TOO_MANY_REQUESTS: PzAccountSdkErrorCodeEnum;
  /** 503 — falha não categorizada no Puzl Account */
  static readonly SERVICE_UNAVAILABLE: PzAccountSdkErrorCodeEnum;
  /** 409 — e-mail já cadastrado em outra conta */
  static readonly EMAIL_ALREADY_EXISTS: PzAccountSdkErrorCodeEnum;
  /** 403 — conta desativada */
  static readonly USER_INACTIVE: PzAccountSdkErrorCodeEnum;
  /** 401 — a senha atual informada não confere */
  static readonly INVALID_CURRENT_PASSWORD: PzAccountSdkErrorCodeEnum;
  /** 404 — conta inexistente */
  static readonly USER_NOT_FOUND: PzAccountSdkErrorCodeEnum;
  /** 429 — senha atual errada vezes demais: conferência bloqueada por um tempo */
  static readonly CURRENT_PASSWORD_LOCKED: PzAccountSdkErrorCodeEnum;
  /** 409 — a conta não tem senha (entra com Google/Apple) */
  static readonly CURRENT_PASSWORD_NOT_SET: PzAccountSdkErrorCodeEnum;
  /** 409 — já existe um pedido de troca de e-mail em aberto */
  static readonly EMAIL_CHANGE_ALREADY_REQUESTED: PzAccountSdkErrorCodeEnum;
  /** 404 — não há consentimento ativo para o client informado */
  static readonly CONSENT_NOT_FOUND: PzAccountSdkErrorCodeEnum;
  /** 409 — MFA já está ligado */
  static readonly MFA_ALREADY_ENABLED: PzAccountSdkErrorCodeEnum;
  /** 409 — MFA não está ligado */
  static readonly MFA_NOT_ENABLED: PzAccountSdkErrorCodeEnum;
  /** 404 — não há cadastro de MFA pendente para confirmar */
  static readonly MFA_ENROLLMENT_NOT_FOUND: PzAccountSdkErrorCodeEnum;
  /** 401 — código TOTP recusado */
  static readonly MFA_INVALID_CODE: PzAccountSdkErrorCodeEnum;
  /** 401 — código de recuperação recusado */
  static readonly MFA_RECOVERY_CODE_INVALID: PzAccountSdkErrorCodeEnum;
  /** 429 — códigos errados demais: MFA bloqueado por um tempo */
  static readonly MFA_LOCKED: PzAccountSdkErrorCodeEnum;
  /**
   * 400 — parâmetro ausente ou malformado.
   *
   * Atenção: o rate limit dos endpoints `/oauth/*` também chega com este
   * código, mas com status 429 — use `isRateLimited()` para separar.
   */
  static readonly INVALID_REQUEST: PzAccountSdkErrorCodeEnum;
  /** 401 — client_id/client_secret inválidos ou método de autenticação diferente do registrado */
  static readonly INVALID_CLIENT: PzAccountSdkErrorCodeEnum;
  /**
   * 400 — code, refresh_token ou credencial do usuário inválidos.
   *
   * No password grant é a resposta tanto para senha errada quanto para
   * conta com MFA — o provedor não diferencia, de propósito.
   */
  static readonly INVALID_GRANT: PzAccountSdkErrorCodeEnum;
  /** 400 — o client não pode usar este grant (ex.: password grant não habilitado) */
  static readonly UNAUTHORIZED_CLIENT: PzAccountSdkErrorCodeEnum;
  /** 400 — grant_type desconhecido */
  static readonly UNSUPPORTED_GRANT_TYPE: PzAccountSdkErrorCodeEnum;
  /** 400 — escopo pedido não permitido para o client */
  static readonly INVALID_SCOPE: PzAccountSdkErrorCodeEnum;
  /**
   * 401 — access token inválido no /oauth/userinfo (RFC 6750).
   *
   * O provedor manda esse código só no header WWW-Authenticate; o SDK o
   * preenche ao ver um 401 sem corpo.
   */
  static readonly INVALID_TOKEN: PzAccountSdkErrorCodeEnum;
  /** 500 — falha interna no provedor */
  static readonly SERVER_ERROR: PzAccountSdkErrorCodeEnum;
  /** 503 — provedor temporariamente indisponível */
  static readonly TEMPORARILY_UNAVAILABLE: PzAccountSdkErrorCodeEnum;
  /**
   * O id_token não passou na verificação: assinatura, emissor, audiência,
   * expiração, nonce, at_hash ou `sub` ausente. O SDK não detalha qual —
   * o motivo vai só em `error_message`, para log.
   */
  static readonly ID_TOKEN_INVALID: PzAccountSdkErrorCodeEnum;
  /** O token do webhook (SET) não passou na verificação. */
  static readonly WEBHOOK_TOKEN_INVALID: PzAccountSdkErrorCodeEnum;
  /**
   * Não deu para obter as chaves públicas (JWKS). O token pode estar
   * perfeito: trate como indisponibilidade, não como credencial inválida.
   */
  static readonly JWKS_UNAVAILABLE: PzAccountSdkErrorCodeEnum;
  private static readonly lookup;
  static cases(): readonly PzAccountSdkErrorCodeEnum[];
  static from(value: PzAccountSdkErrorCodeEnum | string): PzAccountSdkErrorCodeEnum;
  static tryFrom(value: unknown): PzAccountSdkErrorCodeEnum | null;
  /**
   * Separa o que é culpa de quem chamou — credencial do usuário final, dado
   * inválido, excesso de tentativas — do que é erro de configuração do
   * produto ou de infraestrutura.
   *
   * Repassar ao usuário final um `invalid_client` (credencial do APP) como
   * se fosse culpa dele derruba a sessão de quem não tem nada a ver com isso.
   */
  isClientFault(): boolean;
  /** Status HTTP com que este código chega (ou, nos do SDK, o que ele atribui). */
  httpStatus(): number;
}
//#endregion
//#region src/Features/Shared/Dtos/PzAccountSdkResultDto.d.ts
/** Os cinco campos de resultado que todo retorno do SDK carrega. */
interface PzAccountSdkResultFields {
  has_error: boolean;
  error_code: string;
  error_message: string;
  /** Erros por campo: `{ email: ['mensagem'] }`. */
  errors: Record<string, string[]>;
  http_status: number;
}
/**
 * Base de todo retorno do SDK.
 *
 * Nenhuma operação lança exceção por falha do Puzl Account: credencial
 * errada, validação, indisponibilidade — tudo chega aqui, em `has_error`.
 */
declare class PzAccountSdkResultDto extends PzAccountSdkDto {
  readonly has_error: boolean;
  readonly error_code: string;
  readonly error_message: string;
  readonly errors: Record<string, string[]>;
  readonly http_status: number;
  constructor(props?: Partial<PzAccountSdkResultFields>);
  static from(values: unknown): PzAccountSdkResultDto;
  /**
   * Os cinco campos de resultado, para os DTOs de retorno espalharem no
   * próprio construtor: `new Dto({ ...PzAccountSdkResultDto.resultArgs(v), campo })`.
   */
  static resultArgs(values: PzAccountSdkValues): PzAccountSdkResultFields;
  toArray(): PzAccountSdkValues;
  isSuccess(): boolean;
  /**
   * Código do erro como enum, ou `null` quando não houve erro ou quando o
   * Puzl Account devolveu um código que esta versão do SDK ainda não conhece.
   *
   * Um `null` inesperado significa "código novo": trate como falha genérica,
   * nunca como sucesso.
   */
  getErrorCode(): PzAccountSdkErrorCodeEnum | null;
  /**
   * Indisponibilidade do Puzl Account: timeout, falha de conexão ou 5xx.
   *
   * Decidido pelo status, e não pelo `error_code`, porque timeout e falha de
   * conexão nem chegam ao Puzl Account — o transporte devolve 504/500
   * sintéticos, sem corpo e portanto sem código.
   */
  isServiceUnavailable(): boolean;
  /**
   * Rate limit do Puzl Account (429).
   *
   * Decidido pelo status: nos endpoints `/oauth/*` o 429 chega com
   * `error_code` `invalid_request`, que sozinho pareceria erro de quem chamou.
   * Trate como indisponibilidade temporária.
   */
  isRateLimited(): boolean;
  /**
   * Primeira mensagem de erro de campo, ou `null` quando não há nenhuma.
   *
   * Atalho para o caso comum de um 422: mostrar ao usuário a primeira coisa
   * que o Puzl Account reclamou.
   */
  firstFieldError(): string | null;
  /**
   * Normaliza o `errors` do Puzl Account para `{ campo: ['mensagem', ...] }`.
   *
   * O handler devolve `[]` (lista vazia) quando não há erro de campo e um
   * mapa quando há; ambos passam por aqui sem surpresa.
   */
  private static pullFieldErrors;
}
//#endregion
//#region src/Features/DiscoveryShow/Dtos/PzAccountSdkDiscoveryViewDto.d.ts
interface PzAccountSdkDiscoveryViewFields extends PzAccountSdkResultFields {
  issuer: string;
  authorization_endpoint: string;
  token_endpoint: string;
  userinfo_endpoint: string;
  revocation_endpoint: string;
  end_session_endpoint: string;
  jwks_uri: string;
  response_types_supported: string[];
  grant_types_supported: string[];
  scopes_supported: string[];
  claims_supported: string[];
  token_endpoint_auth_methods_supported: string[];
  code_challenge_methods_supported: string[];
  id_token_signing_alg_values_supported: string[];
}
/**
 * Documento de discovery do OIDC (`/.well-known/openid-configuration`).
 *
 * O SDK não depende dele — os endpoints são fixos e derivados do issuer —,
 * mas ele é útil para diagnóstico e para conferir o que o provedor suporta.
 */
declare class PzAccountSdkDiscoveryViewDto extends PzAccountSdkResultDto {
  readonly issuer: string;
  readonly authorization_endpoint: string;
  readonly token_endpoint: string;
  readonly userinfo_endpoint: string;
  readonly revocation_endpoint: string;
  readonly end_session_endpoint: string;
  readonly jwks_uri: string;
  readonly response_types_supported: string[];
  readonly grant_types_supported: string[];
  readonly scopes_supported: string[];
  readonly claims_supported: string[];
  readonly token_endpoint_auth_methods_supported: string[];
  readonly code_challenge_methods_supported: string[];
  readonly id_token_signing_alg_values_supported: string[];
  constructor(props?: Partial<PzAccountSdkDiscoveryViewFields>);
  static from(values: unknown): PzAccountSdkDiscoveryViewDto;
  toArray(): PzAccountSdkValues;
}
//#endregion
//#region src/Features/Shared/Dtos/PzAccountSdkAddressDto.d.ts
interface PzAccountSdkAddressInput {
  street_address?: string | undefined;
  locality?: string | undefined;
  region?: string | undefined;
  postal_code?: string | undefined;
  /** ISO 3166-1 alfa-2, em maiúsculas (ex.: `BR`). */
  country?: string | undefined;
}
/**
 * Endereço da conta — formato do claim `address` do OIDC (Core 5.1.1).
 *
 * Serve tanto de entrada (`meUpdate`) quanto de saída (conta, userinfo,
 * id_token). Campo não informado é string vazia.
 */
declare class PzAccountSdkAddressDto extends PzAccountSdkDto {
  readonly street_address: string;
  readonly locality: string;
  readonly region: string;
  readonly postal_code: string;
  readonly country: string;
  constructor(props?: PzAccountSdkAddressInput);
  static from(values: unknown): PzAccountSdkAddressDto;
  /** O endereço em `values[key]`, ou `null` quando ausente — o provedor manda `null` para conta sem endereço. */
  static fromNullable(values: PzAccountSdkValues, key: string): PzAccountSdkAddressDto | null;
  toArray(): PzAccountSdkValues;
}
//#endregion
//#region src/Features/IdTokenVerify/Dtos/PzAccountSdkIdentityViewDto.d.ts
interface PzAccountSdkIdentityViewFields extends PzAccountSdkResultFields {
  sub: string;
  email: string;
  email_verified: boolean;
  name: string;
  birthdate: string;
  gender: string;
  picture: string;
  locale: string;
  zoneinfo: string;
  updated_at: number;
  phone_number: string;
  phone_number_verified: boolean;
  address: PzAccountSdkAddressDto | null;
  /** epoch em que o usuário se autenticou de fato (não a emissão do token) */
  auth_time: number;
  /** `urn:puzl:accounts:acr:1fa` ou `urn:puzl:accounts:acr:mfa` */
  acr: string;
  /** métodos de autenticação usados (ex.: `['pwd', 'otp']`) */
  amr: string[];
  iat: number;
  exp: number;
  /** todos os claims do token */
  claims: PzAccountSdkValues;
}
/**
 * Identidade extraída de um id_token JÁ VERIFICADO.
 *
 * Identifique o usuário pelo `sub`, que é estável — nunca pelo e-mail. Hoje
 * é o ULID público da conta (26 caracteres); se o client for configurado como
 * `pairwise` no Puzl Account, passa a ser um identificador próprio deste app
 * (e deixa de bater com o `sub` de `meShow`). Só use o `email` para vincular
 * uma conta existente quando `email_verified` for `true`.
 *
 * Claims de perfil dependem dos escopos; o ausente vira valor neutro. Todos os
 * claims crus ficam em `claims`.
 */
declare class PzAccountSdkIdentityViewDto extends PzAccountSdkResultDto {
  readonly sub: string;
  readonly email: string;
  readonly email_verified: boolean;
  readonly name: string;
  readonly birthdate: string;
  readonly gender: string;
  readonly picture: string;
  readonly locale: string;
  readonly zoneinfo: string;
  readonly updated_at: number;
  readonly phone_number: string;
  readonly phone_number_verified: boolean;
  readonly address: PzAccountSdkAddressDto | null;
  readonly auth_time: number;
  readonly acr: string;
  readonly amr: string[];
  readonly iat: number;
  readonly exp: number;
  readonly claims: PzAccountSdkValues;
  constructor(props?: Partial<PzAccountSdkIdentityViewFields>);
  static from(values: unknown): PzAccountSdkIdentityViewDto;
  /** O usuário provou um segundo fator nesta autenticação? */
  isMultiFactor(): boolean;
  toArray(): PzAccountSdkValues;
}
//#endregion
//#region src/Features/IdTokenVerify/Dtos/PzAccountSdkIdTokenVerifyDto.d.ts
interface PzAccountSdkIdTokenVerifyInput {
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
declare class PzAccountSdkIdTokenVerifyDto extends PzAccountSdkDto {
  readonly id_token: string;
  readonly nonce: string;
  readonly access_token: string;
  readonly require_nonce: boolean;
  /**
   * @throws TypeError nonce vazio sem dispensa explícita — é erro de
   *                   integração, não token inválido
   */
  constructor(props: PzAccountSdkIdTokenVerifyInput);
  /** Verificação do id_token devolvido pelo password grant, que não carrega nonce. */
  static forPasswordGrant(idToken: string, accessToken?: string): PzAccountSdkIdTokenVerifyDto;
  static from(values: unknown): PzAccountSdkIdTokenVerifyDto;
  /** Tokens mascarados: `toArray()` e `toJSON()` podem acabar em log. */
  toArray(): PzAccountSdkValues;
}
//#endregion
//#region src/Features/LogoutUrl/Dtos/PzAccountSdkLogoutUrlDto.d.ts
interface PzAccountSdkLogoutUrlInput {
  id_token_hint?: string | undefined;
  post_logout_redirect_uri?: string | undefined;
  state?: string | undefined;
}
/**
 * Entrada de `logoutUrl` (RP-initiated logout).
 *
 * `post_logout_redirect_uri` precisa estar registrada no client com
 * `--kind=post_logout`. Sem `id_token_hint`, o provedor pede confirmação ao
 * usuário antes de encerrar a sessão.
 */
declare class PzAccountSdkLogoutUrlDto extends PzAccountSdkDto {
  readonly id_token_hint: string;
  readonly post_logout_redirect_uri: string;
  readonly state: string;
  constructor(props?: PzAccountSdkLogoutUrlInput);
  static from(values: unknown): PzAccountSdkLogoutUrlDto;
  toArray(): PzAccountSdkValues;
}
//#endregion
//#region src/Features/MeConsentList/Dtos/PzAccountSdkConsentViewDto.d.ts
interface PzAccountSdkConsentViewFields {
  client_id: string;
  client_name: string;
  logo_uri: string;
  client_uri: string;
  /** títulos legíveis dos escopos, já traduzidos */
  scopes: string[];
  granted_at: string;
}
/** Um aplicativo a que o usuário deu acesso à conta. */
declare class PzAccountSdkConsentViewDto extends PzAccountSdkDto {
  readonly client_id: string;
  readonly client_name: string;
  readonly logo_uri: string;
  readonly client_uri: string;
  readonly scopes: string[];
  readonly granted_at: string;
  constructor(props?: Partial<PzAccountSdkConsentViewFields>);
  static from(values: unknown): PzAccountSdkConsentViewDto;
  toArray(): PzAccountSdkValues;
}
//#endregion
//#region src/Features/MeConsentList/Dtos/PzAccountSdkConsentListViewDto.d.ts
interface PzAccountSdkConsentListViewFields extends PzAccountSdkResultFields {
  consents: PzAccountSdkConsentViewDto[];
}
/** Aplicativos com acesso à conta do usuário. */
declare class PzAccountSdkConsentListViewDto extends PzAccountSdkResultDto {
  readonly consents: PzAccountSdkConsentViewDto[];
  constructor(props?: Partial<PzAccountSdkConsentListViewFields>);
  static from(values: unknown): PzAccountSdkConsentListViewDto;
  toArray(): PzAccountSdkValues;
}
//#endregion
//#region src/Features/MeConsentRevoke/Dtos/PzAccountSdkMeConsentRevokeDto.d.ts
interface PzAccountSdkMeConsentRevokeInput {
  access_token: string;
  /** client_id do aplicativo, como veio em `meConsentList` */
  client_id: string;
}
/**
 * Entrada de `meConsentRevoke` — tira o acesso de um aplicativo à conta.
 */
declare class PzAccountSdkMeConsentRevokeDto extends PzAccountSdkDto {
  readonly access_token: string;
  readonly client_id: string;
  constructor(props: PzAccountSdkMeConsentRevokeInput);
  static from(values: unknown): PzAccountSdkMeConsentRevokeDto;
  /** Credenciais mascaradas: `toArray()` e `toJSON()` podem acabar em log. O valor real fica na propriedade. */
  toArray(): PzAccountSdkValues;
}
//#endregion
//#region src/Features/MeEmailChange/Dtos/PzAccountSdkMeEmailChangeDto.d.ts
interface PzAccountSdkMeEmailChangeInput {
  access_token: string;
  /** o NOVO e-mail */
  email: string;
  current_password: string;
  /** TOTP ou código de recuperação — só para conta com MFA */
  code?: string | undefined;
}
/**
 * Entrada de `meEmailChange` — pede a troca do e-mail da conta.
 *
 * `code` (TOTP ou código de recuperação) é exigido só de conta com MFA.
 */
declare class PzAccountSdkMeEmailChangeDto extends PzAccountSdkDto {
  readonly access_token: string;
  readonly email: string;
  readonly current_password: string;
  readonly code: string;
  constructor(props: PzAccountSdkMeEmailChangeInput);
  static from(values: unknown): PzAccountSdkMeEmailChangeDto;
  /** Credenciais mascaradas: `toArray()` e `toJSON()` podem acabar em log. O valor real fica na propriedade. */
  toArray(): PzAccountSdkValues;
}
//#endregion
//#region src/Features/MeMfaDisable/Dtos/PzAccountSdkMeMfaDisableDto.d.ts
interface PzAccountSdkMeMfaDisableInput {
  access_token: string;
  current_password: string;
  code: string;
}
/**
 * Entrada de `meMfaDisable` — senha atual e um código do app autenticador
 * (ou de recuperação).
 */
declare class PzAccountSdkMeMfaDisableDto extends PzAccountSdkDto {
  readonly access_token: string;
  readonly current_password: string;
  readonly code: string;
  constructor(props: PzAccountSdkMeMfaDisableInput);
  static from(values: unknown): PzAccountSdkMeMfaDisableDto;
  /** Credenciais mascaradas: `toArray()` e `toJSON()` podem acabar em log. O valor real fica na propriedade. */
  toArray(): PzAccountSdkValues;
}
//#endregion
//#region src/Features/MeMfaEnroll/Dtos/PzAccountSdkMeMfaEnrollDto.d.ts
interface PzAccountSdkMeMfaEnrollInput {
  access_token: string;
  current_password: string;
}
/**
 * Entrada de `meMfaEnroll` — começa a ligar o MFA; pede a senha atual.
 */
declare class PzAccountSdkMeMfaEnrollDto extends PzAccountSdkDto {
  readonly access_token: string;
  readonly current_password: string;
  constructor(props: PzAccountSdkMeMfaEnrollInput);
  static from(values: unknown): PzAccountSdkMeMfaEnrollDto;
  /** Credenciais mascaradas: `toArray()` e `toJSON()` podem acabar em log. O valor real fica na propriedade. */
  toArray(): PzAccountSdkValues;
}
//#endregion
//#region src/Features/MeMfaEnroll/Dtos/PzAccountSdkMfaEnrollViewDto.d.ts
interface PzAccountSdkMfaEnrollViewFields extends PzAccountSdkResultFields {
  /** base32, para digitação manual */
  secret: string;
  /** otpauth://totp/... — o conteúdo do QR code */
  otpauth_uri: string;
  /** o QR code já renderizado, em SVG */
  qr_svg: string;
}
/**
 * Segredo TOTP para o usuário cadastrar no app autenticador.
 *
 * O MFA só liga depois de `meMfaEnrollConfirm` com um código gerado a partir
 * deste segredo. Não persista o segredo no produto.
 */
declare class PzAccountSdkMfaEnrollViewDto extends PzAccountSdkResultDto {
  readonly secret: string;
  readonly otpauth_uri: string;
  readonly qr_svg: string;
  constructor(props?: Partial<PzAccountSdkMfaEnrollViewFields>);
  static from(values: unknown): PzAccountSdkMfaEnrollViewDto;
  toArray(): PzAccountSdkValues;
}
//#endregion
//#region src/Features/MeMfaEnrollConfirm/Dtos/PzAccountSdkMeMfaEnrollConfirmDto.d.ts
interface PzAccountSdkMeMfaEnrollConfirmInput {
  access_token: string;
  /** código de 6 dígitos do app autenticador */
  code: string;
}
/**
 * Entrada de `meMfaEnrollConfirm` — o código de 6 dígitos do app autenticador.
 */
declare class PzAccountSdkMeMfaEnrollConfirmDto extends PzAccountSdkDto {
  readonly access_token: string;
  readonly code: string;
  constructor(props: PzAccountSdkMeMfaEnrollConfirmInput);
  static from(values: unknown): PzAccountSdkMeMfaEnrollConfirmDto;
  /** Credenciais mascaradas: `toArray()` e `toJSON()` podem acabar em log. O valor real fica na propriedade. */
  toArray(): PzAccountSdkValues;
}
//#endregion
//#region src/Features/MeMfaRecoveryCodesRegenerate/Dtos/PzAccountSdkMeMfaRecoveryCodesRegenerateDto.d.ts
interface PzAccountSdkMeMfaRecoveryCodesRegenerateInput {
  access_token: string;
  current_password: string;
  code: string;
}
/**
 * Entrada de `meMfaRecoveryCodesRegenerate` — senha atual e um código do app
 * autenticador (ou de recuperação).
 */
declare class PzAccountSdkMeMfaRecoveryCodesRegenerateDto extends PzAccountSdkDto {
  readonly access_token: string;
  readonly current_password: string;
  readonly code: string;
  constructor(props: PzAccountSdkMeMfaRecoveryCodesRegenerateInput);
  static from(values: unknown): PzAccountSdkMeMfaRecoveryCodesRegenerateDto;
  /** Credenciais mascaradas: `toArray()` e `toJSON()` podem acabar em log. O valor real fica na propriedade. */
  toArray(): PzAccountSdkValues;
}
//#endregion
//#region src/Features/MeMfaShow/Dtos/PzAccountSdkMfaStatusViewDto.d.ts
interface PzAccountSdkMfaStatusViewFields extends PzAccountSdkResultFields {
  enabled: boolean;
  /** ISO 8601, ou vazio quando desligado */
  confirmed_at: string;
  recovery_codes_remaining: number;
}
/** Situação do MFA (TOTP) da conta. */
declare class PzAccountSdkMfaStatusViewDto extends PzAccountSdkResultDto {
  readonly enabled: boolean;
  readonly confirmed_at: string;
  readonly recovery_codes_remaining: number;
  constructor(props?: Partial<PzAccountSdkMfaStatusViewFields>);
  static from(values: unknown): PzAccountSdkMfaStatusViewDto;
  toArray(): PzAccountSdkValues;
}
//#endregion
//#region src/Features/MePasswordChange/Dtos/PzAccountSdkMePasswordChangeDto.d.ts
interface PzAccountSdkMePasswordChangeInput {
  access_token: string;
  current_password: string;
  password: string;
  /** TOTP ou código de recuperação — só para conta com MFA */
  code?: string | undefined;
}
/**
 * Entrada de `mePasswordChange`.
 *
 * `code` (TOTP ou código de recuperação) é exigido só de conta com MFA. A
 * `password_confirmation` é preenchida pelo SDK.
 */
declare class PzAccountSdkMePasswordChangeDto extends PzAccountSdkDto {
  readonly access_token: string;
  readonly current_password: string;
  readonly password: string;
  readonly code: string;
  constructor(props: PzAccountSdkMePasswordChangeInput);
  static from(values: unknown): PzAccountSdkMePasswordChangeDto;
  /** Credenciais mascaradas: `toArray()` e `toJSON()` podem acabar em log. O valor real fica na propriedade. */
  toArray(): PzAccountSdkValues;
}
//#endregion
//#region src/Enum/PzAccountSdkPicturePresetEnum.d.ts
type PzAccountSdkPicturePresetValue = 'puzzle' | 'rocket' | 'star' | 'leaf' | 'sun' | 'moon' | 'mountain' | 'wave' | 'cat' | 'fox' | 'owl' | 'robot' | 'mixer_truck' | 'hard_hat' | 'crane' | 'bricks' | 'laser_sword' | 'droid' | 'space_helmet' | 'ring_world' | 'electric_guitar' | 'rock_hand';
/**
 * Ilustrações prontas que o usuário pode escolher como foto da conta.
 *
 * Espelha `UserPicturePresetEnum` do Puzl Account. Um preset novo no provedor
 * exige nova versão do SDK.
 */
declare class PzAccountSdkPicturePresetEnum extends PzAccountSdkEnum<PzAccountSdkPicturePresetValue> {
  static readonly PUZZLE: PzAccountSdkPicturePresetEnum;
  static readonly ROCKET: PzAccountSdkPicturePresetEnum;
  static readonly STAR: PzAccountSdkPicturePresetEnum;
  static readonly LEAF: PzAccountSdkPicturePresetEnum;
  static readonly SUN: PzAccountSdkPicturePresetEnum;
  static readonly MOON: PzAccountSdkPicturePresetEnum;
  static readonly MOUNTAIN: PzAccountSdkPicturePresetEnum;
  static readonly WAVE: PzAccountSdkPicturePresetEnum;
  static readonly CAT: PzAccountSdkPicturePresetEnum;
  static readonly FOX: PzAccountSdkPicturePresetEnum;
  static readonly OWL: PzAccountSdkPicturePresetEnum;
  static readonly ROBOT: PzAccountSdkPicturePresetEnum;
  static readonly MIXER_TRUCK: PzAccountSdkPicturePresetEnum;
  static readonly HARD_HAT: PzAccountSdkPicturePresetEnum;
  static readonly CRANE: PzAccountSdkPicturePresetEnum;
  static readonly BRICKS: PzAccountSdkPicturePresetEnum;
  static readonly LASER_SWORD: PzAccountSdkPicturePresetEnum;
  static readonly DROID: PzAccountSdkPicturePresetEnum;
  static readonly SPACE_HELMET: PzAccountSdkPicturePresetEnum;
  static readonly RING_WORLD: PzAccountSdkPicturePresetEnum;
  static readonly ELECTRIC_GUITAR: PzAccountSdkPicturePresetEnum;
  static readonly ROCK_HAND: PzAccountSdkPicturePresetEnum;
  private static readonly lookup;
  static cases(): readonly PzAccountSdkPicturePresetEnum[];
  static from(value: PzAccountSdkPicturePresetEnum | PzAccountSdkPicturePresetValue | string): PzAccountSdkPicturePresetEnum;
  static tryFrom(value: unknown): PzAccountSdkPicturePresetEnum | null;
}
//#endregion
//#region src/Features/MePicturePresetSet/Dtos/PzAccountSdkMePicturePresetSetDto.d.ts
interface PzAccountSdkMePicturePresetSetInput {
  access_token: string;
  preset: PzAccountSdkPicturePresetEnum | PzAccountSdkPicturePresetValue;
}
/**
 * Entrada de `mePicturePresetSet` — troca a foto por uma ilustração pronta.
 *
 * Preset desconhecido lança `TypeError` já aqui: é erro de integração, e
 * mandá-lo ao provedor só trocaria a exceção por um 422.
 */
declare class PzAccountSdkMePicturePresetSetDto extends PzAccountSdkDto {
  readonly access_token: string;
  readonly preset: PzAccountSdkPicturePresetEnum;
  constructor(props: PzAccountSdkMePicturePresetSetInput);
  static from(values: unknown): PzAccountSdkMePicturePresetSetDto;
  toArray(): PzAccountSdkValues;
}
//#endregion
//#region src/Features/MePictureUpload/Dtos/PzAccountSdkMePictureUploadDto.d.ts
/** Bytes da imagem: Buffer, Uint8Array (ou outra view) ou ArrayBuffer. */
type PzAccountSdkPictureContents = Buffer | ArrayBufferView | ArrayBuffer;
interface PzAccountSdkMePictureUploadInput {
  access_token: string;
  contents: PzAccountSdkPictureContents;
  /** nome original — a extensão define o Content-Type da parte */
  filename?: string | undefined;
}
/**
 * Entrada de `mePictureUpload`.
 *
 * `contents` são os bytes da imagem (jpg, png ou webp, até 5 MB). A extensão
 * de `filename` define o Content-Type da parte — mande com a extensão certa.
 *
 * O nome é saneado aqui: ele costuma vir do navegador (`file.originalname`
 * no multer) e vai para o header da parte multipart. Fica só
 * `[A-Za-z0-9._-]`; vazio vira `picture` — sem nome, o servidor nem
 * reconheceria a parte como arquivo.
 */
declare class PzAccountSdkMePictureUploadDto extends PzAccountSdkDto {
  private static readonly MIME_TYPES;
  readonly access_token: string;
  readonly contents: Buffer;
  readonly filename: string;
  constructor(props: PzAccountSdkMePictureUploadInput);
  /**
   * Lê a imagem do disco. Sem `filename`, usa o nome do arquivo.
   *
   * @throws TypeError arquivo inexistente ou ilegível
   */
  static fromPath(accessToken: string, path: string, filename?: string): PzAccountSdkMePictureUploadDto;
  static from(values: unknown): PzAccountSdkMePictureUploadDto;
  /** Content-Type da parte, pela extensão do nome. */
  mimeType(): string;
  /** Os bytes da imagem ficam de fora (só o tamanho) e o token vai mascarado. */
  toArray(): PzAccountSdkValues;
  /** Mesmo saneamento do SDK PHP: `basename`, só `[A-Za-z0-9._-]`, sem `.`/`_` nas pontas. */
  private static sanitize;
  /**
   * Bytes de qualquer formato binário. String só por compatibilidade com o
   * SDK PHP, como bytes crus (latin1) — texto UTF-8 se corromperia, por isso
   * ela fica fora do tipo. Qualquer outra coisa é erro de integração: mandar
   * 0 bytes em silêncio seria pior.
   *
   * @throws TypeError conteúdo em formato não suportado
   */
  private static toBuffer;
}
//#endregion
//#region src/Enum/PzAccountSdkGenderEnum.d.ts
type PzAccountSdkGenderValue = 'female' | 'male' | 'other' | 'prefer_not_to_say';
/**
 * Valores aceitos no campo `gender` da conta.
 *
 * Os DTOs guardam a string crua (vazia quando não informado); use
 * `tryFrom()` para ramificar.
 */
declare class PzAccountSdkGenderEnum extends PzAccountSdkEnum<PzAccountSdkGenderValue> {
  static readonly FEMALE: PzAccountSdkGenderEnum;
  static readonly MALE: PzAccountSdkGenderEnum;
  static readonly OTHER: PzAccountSdkGenderEnum;
  static readonly PREFER_NOT_TO_SAY: PzAccountSdkGenderEnum;
  private static readonly lookup;
  static cases(): readonly PzAccountSdkGenderEnum[];
  static from(value: PzAccountSdkGenderEnum | PzAccountSdkGenderValue | string): PzAccountSdkGenderEnum;
  static tryFrom(value: unknown): PzAccountSdkGenderEnum | null;
}
//#endregion
//#region src/Features/Shared/Dtos/PzAccountSdkUserViewDto.d.ts
interface PzAccountSdkUserViewFields {
  id: number;
  sub: string;
  name: string;
  email: string;
  is_active: boolean;
  email_verified_at: string;
  /** `Y-m-d` */
  birthdate: string;
  gender: string;
  phone_number: string;
  phone_number_verified_at: string;
  locale: string;
  zoneinfo: string;
  picture: string;
  address: PzAccountSdkAddressDto | null;
  mfa_enabled: boolean;
  deleted_at: string;
}
/**
 * A conta do usuário como a API do Puzl Account a devolve.
 *
 * Identifique o usuário no produto pelo `sub` (ULID público de 26
 * caracteres, estável) — nunca pelo `id`, que é interno do provedor, nem pelo
 * e-mail, que muda. Atenção: para um client `pairwise`, o `sub` do id_token e
 * do userinfo é outro; esta API devolve sempre o público.
 *
 * Datas chegam como string ISO 8601; campo ausente é string vazia.
 */
declare class PzAccountSdkUserViewDto extends PzAccountSdkDto {
  readonly id: number;
  readonly sub: string;
  readonly name: string;
  readonly email: string;
  readonly is_active: boolean;
  readonly email_verified_at: string;
  readonly birthdate: string;
  readonly gender: string;
  readonly phone_number: string;
  readonly phone_number_verified_at: string;
  readonly locale: string;
  readonly zoneinfo: string;
  readonly picture: string;
  readonly address: PzAccountSdkAddressDto | null;
  readonly mfa_enabled: boolean;
  readonly deleted_at: string;
  constructor(props?: Partial<PzAccountSdkUserViewFields>);
  static from(values: unknown): PzAccountSdkUserViewDto;
  isEmailVerified(): boolean;
  toArray(): PzAccountSdkValues;
}
//#endregion
//#region src/Features/MeUpdate/Dtos/PzAccountSdkMeUpdateDto.d.ts
interface PzAccountSdkMeUpdateInput {
  access_token: string;
  name: string;
  email: string;
  /** Y-m-d */
  birthdate: string;
  locale: string;
  zoneinfo: string;
  /** valor de PzAccountSdkGenderEnum, ou vazio */
  gender?: PzAccountSdkGenderEnum | PzAccountSdkGenderValue | '' | undefined;
  /** E.164, ou vazio */
  phone_number?: string | undefined;
  address?: PzAccountSdkAddressDto | PzAccountSdkAddressInput | null | undefined;
}
/** Campos que dá para mudar com `fromUser()`. */
type PzAccountSdkMeUpdateChanges = Partial<Omit<PzAccountSdkMeUpdateInput, 'access_token'>>;
/**
 * Entrada de `meUpdate` — PUT COMPLETO do perfil.
 *
 * Campo opcional vazio é enviado como `null` e APAGA o valor na conta. Para
 * mudar só um campo, parta da conta atual: `fromUser(token, user, { name: 'Novo' })`.
 *
 * O `email` precisa ser o atual: troca de e-mail é `meEmailChange`.
 */
declare class PzAccountSdkMeUpdateDto extends PzAccountSdkDto {
  readonly access_token: string;
  readonly name: string;
  readonly email: string;
  readonly birthdate: string;
  readonly locale: string;
  readonly zoneinfo: string;
  readonly gender: string;
  readonly phone_number: string;
  readonly address: PzAccountSdkAddressDto | null;
  constructor(props: PzAccountSdkMeUpdateInput);
  static from(values: unknown): PzAccountSdkMeUpdateDto;
  /**
   * Parte da conta atual (de `meShow`) e aplica só as mudanças — o jeito
   * seguro de editar um campo sem apagar os outros. `changes.address` aceita
   * o DTO, um objeto, ou `null` para apagar o endereço.
   */
  static fromUser(accessToken: string, user: PzAccountSdkUserViewDto, changes?: PzAccountSdkMeUpdateChanges): PzAccountSdkMeUpdateDto;
  toArray(): PzAccountSdkValues;
}
//#endregion
//#region src/Features/PkceCreate/Dtos/PzAccountSdkPkceViewDto.d.ts
/** Os segredos como objeto simples — o formato para guardar na sessão. */
type PzAccountSdkPkceViewFields = {
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
declare class PzAccountSdkPkceViewDto extends PzAccountSdkDto {
  readonly state: string;
  readonly nonce: string;
  readonly code_verifier: string;
  readonly code_challenge: string;
  constructor(props: PzAccountSdkPkceViewFields);
  static from(values: unknown): PzAccountSdkPkceViewDto;
  /** Tipado: dá para guardar na sessão e ler de volta sem conversão. */
  toArray(): PzAccountSdkPkceViewFields;
}
//#endregion
//#region src/Features/Shared/Dtos/PzAccountSdkAccessTokenDto.d.ts
interface PzAccountSdkAccessTokenInput {
  access_token: string;
}
/**
 * Entrada das operações que só precisam do access token do usuário:
 * `userInfoShow`, `meShow`, `mePictureDelete`, `meMfaShow` e `meConsentList`.
 *
 * O SDK não guarda sessão: o token é do usuário, e quem o armazena é o produto.
 */
declare class PzAccountSdkAccessTokenDto extends PzAccountSdkDto {
  readonly access_token: string;
  constructor(props: PzAccountSdkAccessTokenInput);
  static from(values: unknown): PzAccountSdkAccessTokenDto;
  toArray(): PzAccountSdkValues;
}
//#endregion
//#region src/Features/Shared/Dtos/PzAccountSdkMfaRecoveryCodesViewDto.d.ts
interface PzAccountSdkMfaRecoveryCodesViewFields extends PzAccountSdkResultFields {
  recovery_codes: string[];
  /** Aviso traduzido para mostrar junto dos códigos. */
  warning: string;
}
/**
 * Códigos de recuperação do MFA: `meMfaEnrollConfirm` e
 * `meMfaRecoveryCodesRegenerate`.
 *
 * Os códigos aparecem UMA vez. Mostre ao usuário e não persista.
 */
declare class PzAccountSdkMfaRecoveryCodesViewDto extends PzAccountSdkResultDto {
  readonly recovery_codes: string[];
  readonly warning: string;
  constructor(props?: Partial<PzAccountSdkMfaRecoveryCodesViewFields>);
  static from(values: unknown): PzAccountSdkMfaRecoveryCodesViewDto;
  toArray(): PzAccountSdkValues;
}
//#endregion
//#region src/Features/Shared/Dtos/PzAccountSdkTokenViewDto.d.ts
interface PzAccountSdkTokenViewFields extends PzAccountSdkResultFields {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  id_token: string;
  refresh_token: string;
}
/**
 * Resposta do /oauth/token: `tokenExchangeCode`, `tokenRefresh` e
 * `tokenPassword`.
 *
 * - `access_token` é opaco: valide-o chamando `userInfoShow`, nunca
 *   decodificando.
 * - `id_token` é um JWT RS256: passe-o por `idTokenVerify` antes de confiar
 *   em qualquer claim.
 * - `refresh_token` só vem com o escopo `offline_access`, e GIRA a cada uso —
 *   guarde sempre o novo. Reusar o antigo derruba a família inteira.
 */
declare class PzAccountSdkTokenViewDto extends PzAccountSdkResultDto {
  readonly access_token: string;
  readonly token_type: string;
  readonly expires_in: number;
  readonly scope: string;
  readonly id_token: string;
  readonly refresh_token: string;
  constructor(props?: Partial<PzAccountSdkTokenViewFields>);
  static from(values: unknown): PzAccountSdkTokenViewDto;
  hasIdToken(): boolean;
  hasRefreshToken(): boolean;
  toArray(): PzAccountSdkValues;
}
//#endregion
//#region src/Features/Shared/Dtos/PzAccountSdkUserProfileViewDto.d.ts
interface PzAccountSdkUserProfileViewFields extends PzAccountSdkResultFields {
  user: PzAccountSdkUserViewDto | null;
}
/**
 * Retorno das operações que devolvem a conta: `userRegister`, `meShow`,
 * `meUpdate` e as operações de foto.
 *
 * `user` só vem preenchido no sucesso.
 */
declare class PzAccountSdkUserProfileViewDto extends PzAccountSdkResultDto {
  readonly user: PzAccountSdkUserViewDto | null;
  constructor(props?: Partial<PzAccountSdkUserProfileViewFields>);
  static from(values: unknown): PzAccountSdkUserProfileViewDto;
  toArray(): PzAccountSdkValues;
}
//#endregion
//#region src/Features/TokenExchangeCode/Dtos/PzAccountSdkTokenExchangeCodeDto.d.ts
interface PzAccountSdkTokenExchangeCodeInput {
  code: string;
  code_verifier: string;
  redirect_uri?: string | undefined;
}
/**
 * Entrada de `tokenExchangeCode`.
 *
 * `redirect_uri` precisa ser a MESMA usada na URL de authorize; vazio usa a
 * da configuração. O `code` vale 60 segundos e uma única vez.
 */
declare class PzAccountSdkTokenExchangeCodeDto extends PzAccountSdkDto {
  readonly code: string;
  readonly code_verifier: string;
  readonly redirect_uri: string;
  constructor(props: PzAccountSdkTokenExchangeCodeInput);
  static from(values: unknown): PzAccountSdkTokenExchangeCodeDto;
  toArray(): PzAccountSdkValues;
}
//#endregion
//#region src/Features/TokenPassword/Dtos/PzAccountSdkTokenPasswordDto.d.ts
interface PzAccountSdkTokenPasswordInput {
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
declare class PzAccountSdkTokenPasswordDto extends PzAccountSdkDto {
  readonly username: string;
  readonly password: string;
  readonly scope: string;
  constructor(props: PzAccountSdkTokenPasswordInput);
  static from(values: unknown): PzAccountSdkTokenPasswordDto;
  toArray(): PzAccountSdkValues;
}
//#endregion
//#region src/Features/TokenRefresh/Dtos/PzAccountSdkTokenRefreshDto.d.ts
interface PzAccountSdkTokenRefreshInput {
  refresh_token: string;
  scope?: string | undefined;
}
/**
 * Entrada de `tokenRefresh`.
 *
 * `scope` só pode reduzir o que foi concedido; vazio mantém os escopos.
 */
declare class PzAccountSdkTokenRefreshDto extends PzAccountSdkDto {
  readonly refresh_token: string;
  readonly scope: string;
  constructor(props: PzAccountSdkTokenRefreshInput);
  static from(values: unknown): PzAccountSdkTokenRefreshDto;
  toArray(): PzAccountSdkValues;
}
//#endregion
//#region src/Enum/PzAccountSdkTokenTypeHintEnum.d.ts
type PzAccountSdkTokenTypeHintValue = 'access_token' | 'refresh_token';
/**
 * Dica do tipo de token no /oauth/revoke (RFC 7009).
 */
declare class PzAccountSdkTokenTypeHintEnum extends PzAccountSdkEnum<PzAccountSdkTokenTypeHintValue> {
  static readonly ACCESS_TOKEN: PzAccountSdkTokenTypeHintEnum;
  /** Revogar o refresh token derruba a família inteira e os access tokens dela. */
  static readonly REFRESH_TOKEN: PzAccountSdkTokenTypeHintEnum;
  private static readonly lookup;
  static cases(): readonly PzAccountSdkTokenTypeHintEnum[];
  static from(value: PzAccountSdkTokenTypeHintEnum | PzAccountSdkTokenTypeHintValue | string): PzAccountSdkTokenTypeHintEnum;
  static tryFrom(value: unknown): PzAccountSdkTokenTypeHintEnum | null;
}
//#endregion
//#region src/Features/TokenRevoke/Dtos/PzAccountSdkTokenRevokeDto.d.ts
interface PzAccountSdkTokenRevokeInput {
  token: string;
  token_type_hint?: PzAccountSdkTokenTypeHintEnum | PzAccountSdkTokenTypeHintValue | null | undefined;
}
/**
 * Entrada de `tokenRevoke` (RFC 7009).
 *
 * A dica só acelera a busca no provedor; sem ela, ele procura nos dois tipos.
 */
declare class PzAccountSdkTokenRevokeDto extends PzAccountSdkDto {
  readonly token: string;
  readonly token_type_hint: PzAccountSdkTokenTypeHintEnum | null;
  constructor(props: PzAccountSdkTokenRevokeInput);
  static from(values: unknown): PzAccountSdkTokenRevokeDto;
  toArray(): PzAccountSdkValues;
}
//#endregion
//#region src/Features/UserInfoShow/Dtos/PzAccountSdkUserInfoViewDto.d.ts
interface PzAccountSdkUserInfoViewFields extends PzAccountSdkResultFields {
  sub: string;
  email: string;
  email_verified: boolean;
  name: string;
  birthdate: string;
  gender: string;
  picture: string;
  locale: string;
  zoneinfo: string;
  /** epoch em segundos */
  updated_at: number;
  phone_number: string;
  phone_number_verified: boolean;
  address: PzAccountSdkAddressDto | null;
  /** nomes dos claims que vieram na resposta */
  present_claims: string[];
}
/**
 * Claims do /oauth/userinfo.
 *
 * O provedor OMITE o claim cujo escopo o token não tem (nunca manda `null`);
 * aqui o ausente vira valor neutro: string vazia, `false`, `0` ou `null` no
 * endereço. Use `hasClaim()` quando precisar distinguir.
 */
declare class PzAccountSdkUserInfoViewDto extends PzAccountSdkResultDto {
  /** Claims de perfil que o Puzl Account pode devolver. */
  private static readonly CLAIMS;
  readonly sub: string;
  readonly email: string;
  readonly email_verified: boolean;
  readonly name: string;
  readonly birthdate: string;
  readonly gender: string;
  readonly picture: string;
  readonly locale: string;
  readonly zoneinfo: string;
  readonly updated_at: number;
  readonly phone_number: string;
  readonly phone_number_verified: boolean;
  readonly address: PzAccountSdkAddressDto | null;
  readonly present_claims: string[];
  constructor(props?: Partial<PzAccountSdkUserInfoViewFields>);
  static from(values: unknown): PzAccountSdkUserInfoViewDto;
  /** O claim veio na resposta? (Não veio = o token não tem o escopo.) */
  hasClaim(claim: string): boolean;
  toArray(): PzAccountSdkValues;
}
//#endregion
//#region src/Features/UserRegister/Dtos/PzAccountSdkUserRegisterDto.d.ts
interface PzAccountSdkUserRegisterInput {
  name: string;
  email: string;
  password: string;
  /** Y-m-d */
  birthdate: string;
  /** E.164 (ex.: +5511999999999) */
  phone_number?: string | undefined;
  /** ex.: pt-BR */
  locale?: string | undefined;
  /** ex.: America/Sao_Paulo */
  zoneinfo?: string | undefined;
}
/**
 * Entrada de `userRegister` — cria uma conta Puzl.
 *
 * A `password_confirmation` é preenchida pelo SDK. `birthdate` (Y-m-d) é
 * obrigatória e precisa indicar maioridade. Opcionais vazios não são enviados.
 */
declare class PzAccountSdkUserRegisterDto extends PzAccountSdkDto {
  readonly name: string;
  readonly email: string;
  readonly password: string;
  readonly birthdate: string;
  readonly phone_number: string;
  readonly locale: string;
  readonly zoneinfo: string;
  constructor(props: PzAccountSdkUserRegisterInput);
  static from(values: unknown): PzAccountSdkUserRegisterDto;
  /** Credenciais mascaradas: `toArray()` e `toJSON()` podem acabar em log. O valor real fica na propriedade. */
  toArray(): PzAccountSdkValues;
}
//#endregion
//#region src/Enum/PzAccountSdkWebhookEventTypeEnum.d.ts
type PzAccountSdkWebhookEventTypeValue = 'consent.revoked' | 'account.disabled' | 'account.deleted' | 'tokens.revoked' | 'email.changed';
/**
 * Eventos que o Puzl Account entrega por webhook.
 *
 * O DTO guarda o tipo como string crua: um evento novo do provedor precisa
 * chegar ao produto em vez de virar outro caso silenciosamente. Use
 * `PzAccountSdkWebhookEventViewDto.getEventType()`, que devolve `null` para
 * o que esta versão do SDK não conhece.
 */
declare class PzAccountSdkWebhookEventTypeEnum extends PzAccountSdkEnum<PzAccountSdkWebhookEventTypeValue> {
  /** O usuário revogou o acesso do aplicativo à conta dele. */
  static readonly CONSENT_REVOKED: PzAccountSdkWebhookEventTypeEnum;
  /** A conta foi desativada. */
  static readonly ACCOUNT_DISABLED: PzAccountSdkWebhookEventTypeEnum;
  /** A conta foi excluída. */
  static readonly ACCOUNT_DELETED: PzAccountSdkWebhookEventTypeEnum;
  /** Os tokens do usuário foram revogados (troca de senha, MFA desligado, recuperação...). */
  static readonly TOKENS_REVOKED: PzAccountSdkWebhookEventTypeEnum;
  /** O e-mail da conta mudou. `data` traz `email` e `email_verified`. */
  static readonly EMAIL_CHANGED: PzAccountSdkWebhookEventTypeEnum;
  private static readonly lookup;
  static cases(): readonly PzAccountSdkWebhookEventTypeEnum[];
  static from(value: PzAccountSdkWebhookEventTypeEnum | PzAccountSdkWebhookEventTypeValue | string): PzAccountSdkWebhookEventTypeEnum;
  static tryFrom(value: unknown): PzAccountSdkWebhookEventTypeEnum | null;
}
//#endregion
//#region src/Features/WebhookEventVerify/Dtos/PzAccountSdkWebhookEventViewDto.d.ts
interface PzAccountSdkWebhookEventViewFields extends PzAccountSdkResultFields {
  /** ex.: consent.revoked — valor de PzAccountSdkWebhookEventTypeEnum */
  event_type: string;
  /** URI do evento como veio no token, ex.: {issuer}/events/consent-revoked */
  event_uri: string;
  sub: string;
  txn: string;
  jti: string;
  iat: number;
  exp: number;
  data: PzAccountSdkValues;
}
/**
 * Evento de webhook JÁ VERIFICADO (Security Event Token, RFC 8417).
 *
 * - `txn` identifica o evento e se repete nas reentregas: use-o como chave de
 *   idempotência. `jti` muda a cada tentativa.
 * - `sub` é o usuário afetado.
 * - `data` é vazio em todos os eventos, exceto `email.changed`, que traz
 *   `email` e `email_verified`.
 */
declare class PzAccountSdkWebhookEventViewDto extends PzAccountSdkResultDto {
  readonly event_type: string;
  readonly event_uri: string;
  readonly sub: string;
  readonly txn: string;
  readonly jti: string;
  readonly iat: number;
  readonly exp: number;
  readonly data: PzAccountSdkValues;
  constructor(props?: Partial<PzAccountSdkWebhookEventViewFields>);
  static from(values: unknown): PzAccountSdkWebhookEventViewDto;
  /**
   * Tipo do evento como enum, ou `null` quando houve erro ou o evento é
   * novo demais para esta versão do SDK — responda 2xx e ignore.
   */
  getEventType(): PzAccountSdkWebhookEventTypeEnum | null;
  toArray(): PzAccountSdkValues;
}
//#endregion
//#region src/Features/WebhookEventVerify/Dtos/PzAccountSdkWebhookEventVerifyDto.d.ts
interface PzAccountSdkWebhookEventVerifyInput {
  /** o corpo cru do POST */
  token: string;
}
/**
 * Entrada de `webhookEventVerify`: o corpo cru do POST que o Puzl Account
 * enviou (`Content-Type: application/secevent+jwt`). No Express, leia com
 * `express.text({ type: 'application/secevent+jwt' })` e passe `req.body`.
 */
declare class PzAccountSdkWebhookEventVerifyDto extends PzAccountSdkDto {
  readonly token: string;
  constructor(props: PzAccountSdkWebhookEventVerifyInput);
  static from(values: unknown): PzAccountSdkWebhookEventVerifyDto;
  toArray(): PzAccountSdkValues;
}
//#endregion
//#region src/Contract/PzAccountSdkClientInterface.d.ts
/**
 * Contrato público do SDK do Puzl Account — congelado por semver.
 *
 * Nenhum método lança exceção por falha do Puzl Account: erro de credencial,
 * validação, token inválido ou indisponibilidade chegam no DTO de retorno, em
 * `has_error`. Exceção só existe para erro de integração, não de execução:
 * `PzAccountSdkConfigurationException` (configuração ausente) e `TypeError`
 * (uso indevido — nonce vazio, preset ou tela inexistente, foto ilegível).
 * Nos métodos `async`, elas chegam como Promise rejeitada.
 *
 * Cada método aceita o DTO de entrada ou um objeto simples com os mesmos
 * campos (`{ code, code_verifier }`).
 *
 * Transformar a falha em resposta HTTP é decisão do produto que consome.
 */
interface PzAccountSdkClientInterface {
  /**
   * issuer, clientId e (salvo client público) clientSecret estão
   * preenchidos? Não faz HTTP nem lança exceção.
   */
  isConfigured(): boolean;
  /** Gera state, nonce e o par PKCE (S256) de uma tentativa de login. Local. */
  pkceCreate(): PzAccountSdkPkceViewDto;
  /** URL do /oauth/authorize para onde mandar o navegador. Local. */
  authorizeUrl(input: PzAccountSdkAuthorizeUrlDto | PzAccountSdkAuthorizeUrlInput): string;
  /** URL do /oauth/logout, que encerra a sessão no provedor. Local. */
  logoutUrl(input: PzAccountSdkLogoutUrlDto | PzAccountSdkLogoutUrlInput): string;
  /** URL de uma tela da conta no Puzl Account. Local. */
  accountUrl(page: PzAccountSdkAccountPageEnum | PzAccountSdkAccountPageValue): string;
  /** GET /.well-known/openid-configuration. */
  discoveryShow(): Promise<PzAccountSdkDiscoveryViewDto>;
  /** Troca o code do callback por tokens (authorization_code + PKCE). */
  tokenExchangeCode(input: PzAccountSdkTokenExchangeCodeDto | PzAccountSdkTokenExchangeCodeInput): Promise<PzAccountSdkTokenViewDto>;
  /** Renova os tokens com o refresh_token (que gira a cada uso). */
  tokenRefresh(input: PzAccountSdkTokenRefreshDto | PzAccountSdkTokenRefreshInput): Promise<PzAccountSdkTokenViewDto>;
  /** Login com e-mail e senha (password grant; exige client habilitado). */
  tokenPassword(input: PzAccountSdkTokenPasswordDto | PzAccountSdkTokenPasswordInput): Promise<PzAccountSdkTokenViewDto>;
  /** Revoga um access ou refresh token (RFC 7009). */
  tokenRevoke(input: PzAccountSdkTokenRevokeDto | PzAccountSdkTokenRevokeInput): Promise<PzAccountSdkResultDto>;
  /** Claims do usuário pelo access token; 401 = token não vale mais. */
  userInfoShow(input: PzAccountSdkAccessTokenDto | PzAccountSdkAccessTokenInput): Promise<PzAccountSdkUserInfoViewDto>;
  /** Verifica o id_token contra o JWKS e devolve a identidade. */
  idTokenVerify(input: PzAccountSdkIdTokenVerifyDto | PzAccountSdkIdTokenVerifyInput): Promise<PzAccountSdkIdentityViewDto>;
  /** Verifica um webhook (SET) do Puzl Account e devolve o evento. */
  webhookEventVerify(input: PzAccountSdkWebhookEventVerifyDto | PzAccountSdkWebhookEventVerifyInput): Promise<PzAccountSdkWebhookEventViewDto>;
  /** Cria uma conta Puzl (público, sem token). */
  userRegister(input: PzAccountSdkUserRegisterDto | PzAccountSdkUserRegisterInput): Promise<PzAccountSdkUserProfileViewDto>;
  /** Conta do usuário dono do token. */
  meShow(input: PzAccountSdkAccessTokenDto | PzAccountSdkAccessTokenInput): Promise<PzAccountSdkUserProfileViewDto>;
  /** Atualiza o perfil (PUT completo). */
  meUpdate(input: PzAccountSdkMeUpdateDto | PzAccountSdkMeUpdateInput): Promise<PzAccountSdkUserProfileViewDto>;
  /** Troca a senha (revoga os tokens do usuário). */
  mePasswordChange(input: PzAccountSdkMePasswordChangeDto | PzAccountSdkMePasswordChangeInput): Promise<PzAccountSdkResultDto>;
  /** Pede a troca de e-mail; confirmada pelo e-mail antigo (202). */
  meEmailChange(input: PzAccountSdkMeEmailChangeDto | PzAccountSdkMeEmailChangeInput): Promise<PzAccountSdkResultDto>;
  /** Envia uma foto nova. */
  mePictureUpload(input: PzAccountSdkMePictureUploadDto | PzAccountSdkMePictureUploadInput): Promise<PzAccountSdkUserProfileViewDto>;
  /** Usa uma ilustração pronta como foto. */
  mePicturePresetSet(input: PzAccountSdkMePicturePresetSetDto | PzAccountSdkMePicturePresetSetInput): Promise<PzAccountSdkUserProfileViewDto>;
  /** Remove a foto. */
  mePictureDelete(input: PzAccountSdkAccessTokenDto | PzAccountSdkAccessTokenInput): Promise<PzAccountSdkUserProfileViewDto>;
  /** Situação do MFA. */
  meMfaShow(input: PzAccountSdkAccessTokenDto | PzAccountSdkAccessTokenInput): Promise<PzAccountSdkMfaStatusViewDto>;
  /** Começa a ligar o MFA: devolve o segredo TOTP. */
  meMfaEnroll(input: PzAccountSdkMeMfaEnrollDto | PzAccountSdkMeMfaEnrollInput): Promise<PzAccountSdkMfaEnrollViewDto>;
  /** Confirma o MFA com o primeiro código; devolve os códigos de recuperação. */
  meMfaEnrollConfirm(input: PzAccountSdkMeMfaEnrollConfirmDto | PzAccountSdkMeMfaEnrollConfirmInput): Promise<PzAccountSdkMfaRecoveryCodesViewDto>;
  /** Desliga o MFA (revoga os tokens do usuário). */
  meMfaDisable(input: PzAccountSdkMeMfaDisableDto | PzAccountSdkMeMfaDisableInput): Promise<PzAccountSdkResultDto>;
  /** Gera novos códigos de recuperação. */
  meMfaRecoveryCodesRegenerate(input: PzAccountSdkMeMfaRecoveryCodesRegenerateDto | PzAccountSdkMeMfaRecoveryCodesRegenerateInput): Promise<PzAccountSdkMfaRecoveryCodesViewDto>;
  /** Aplicativos com acesso à conta. */
  meConsentList(input: PzAccountSdkAccessTokenDto | PzAccountSdkAccessTokenInput): Promise<PzAccountSdkConsentListViewDto>;
  /** Tira o acesso de um aplicativo à conta. */
  meConsentRevoke(input: PzAccountSdkMeConsentRevokeDto | PzAccountSdkMeConsentRevokeInput): Promise<PzAccountSdkResultDto>;
}
//#endregion
//#region src/Support/PzAccountSdkConfig.d.ts
type PzAccountSdkTokenAuthMethod = 'client_secret_post' | 'client_secret_basic' | 'none';
/**
 * Opções de configuração do SDK. Todas aceitam string, para que dê para
 * repassar `process.env` sem conversão — números vazios ou inválidos voltam
 * ao padrão.
 */
interface PzAccountSdkConfigOptions {
  /** URL base do Puzl Account, sem barra no final. Precisa bater com o `iss` dos tokens. */
  issuer?: string | undefined;
  /** client_id do produto, registrado no Puzl Account. */
  clientId?: string | undefined;
  /** client_secret do produto. Dispensável só com `tokenAuthMethod: 'none'`. */
  clientSecret?: string | undefined;
  /** Callback padrão do login (pode ser sobrescrita por chamada). */
  redirectUri?: string | undefined;
  /** Escopos pedidos por padrão. Padrão: `openid email profile`. */
  scope?: string | undefined;
  /** Como o client se autentica no /oauth/token e no /oauth/revoke. Padrão: `client_secret_post`. */
  tokenAuthMethod?: PzAccountSdkTokenAuthMethod | (string & {}) | undefined;
  /** Timeout de cada requisição, em segundos. Padrão: 10. */
  timeout?: number | string | undefined;
  /** Por quantos segundos o JWKS fica em cache. Padrão: 3600. */
  jwksCacheTtl?: number | string | undefined;
  /** Tolerância de relógio, em segundos, para `exp`/`iat`/`nbf`. Padrão: 60. */
  leeway?: number | string | undefined;
}
/** Variável de ambiente de cada opção — usada por `fromEnv()` e nas mensagens de erro. */
declare const PZ_ACCOUNT_SDK_ENV_KEYS: {
  readonly issuer: "PUZL_ACCOUNT_ISSUER";
  readonly clientId: "PUZL_ACCOUNT_CLIENT_ID";
  readonly clientSecret: "PUZL_ACCOUNT_CLIENT_SECRET";
  readonly redirectUri: "PUZL_ACCOUNT_REDIRECT_URI";
  readonly scope: "PUZL_ACCOUNT_SCOPE";
  readonly tokenAuthMethod: "PUZL_ACCOUNT_TOKEN_AUTH_METHOD";
  readonly timeout: "PUZL_ACCOUNT_TIMEOUT";
  readonly jwksCacheTtl: "PUZL_ACCOUNT_JWKS_CACHE_TTL";
  readonly leeway: "PUZL_ACCOUNT_LEEWAY";
};
/**
 * Configuração do SDK, imutável e validada sob demanda.
 *
 * A validação é preguiçosa de propósito — acontece na primeira chamada ao
 * Puzl Account, não na criação do client. Uma API que instalou o pacote mas
 * ainda não configurou o Puzl Account continua subindo normalmente; quem paga
 * o preço é quem tentar usar, e aí o erro é explícito.
 */
declare class PzAccountSdkConfig {
  static readonly AUTH_METHOD_POST = "client_secret_post";
  static readonly AUTH_METHOD_BASIC = "client_secret_basic";
  static readonly AUTH_METHOD_NONE = "none";
  private static readonly AUTH_METHODS;
  private static readonly DEFAULT_SCOPE;
  private static readonly DEFAULT_TIMEOUT;
  private static readonly DEFAULT_JWKS_CACHE_TTL;
  private static readonly DEFAULT_LEEWAY;
  readonly issuer: string;
  readonly clientId: string;
  readonly redirectUri: string;
  readonly scope: string;
  readonly tokenAuthMethod: string;
  readonly timeout: number;
  readonly jwksCacheTtl: number;
  readonly leeway: number;
  /** Fora da enumeração: um `console.log(config)` não expõe o segredo. */
  readonly clientSecret: string;
  private constructor();
  /** Constrói a partir das opções, normalizando cada valor. */
  static from(options?: PzAccountSdkConfigOptions): PzAccountSdkConfig;
  /**
   * Lê as variáveis `PUZL_ACCOUNT_*` (por padrão, de `process.env`).
   * Opções explícitas em `overrides` vencem o ambiente.
   */
  static fromEnv(env?: Record<string, string | undefined>, overrides?: PzAccountSdkConfigOptions): PzAccountSdkConfig;
  /**
   * O mínimo para falar com o Puzl Account está preenchido? Serve para o
   * produto esconder o "Entrar com a Puzl" enquanto a integração não está
   * configurada, sem precisar capturar exceção.
   */
  isConfigured(): boolean;
  /**
   * Exige o mínimo para falar com o Puzl Account: issuer e clientId.
   *
   * @throws PzAccountSdkConfigurationException
   */
  assertUsable(): void;
  /**
   * Exige o necessário para o client se autenticar no /oauth/token e no
   * /oauth/revoke: método válido e, se não for `none`, o clientSecret.
   *
   * @throws PzAccountSdkConfigurationException
   */
  assertClientAuthUsable(): void;
  /**
   * Exige a redirectUri — só quando quem chama não informou uma própria.
   *
   * @throws PzAccountSdkConfigurationException
   */
  assertRedirectUsable(): void;
  jwksUri(): string;
  /**
   * `null`, `undefined` e ausência viram string vazia — é o que os
   * `assert*()` sabem reconhecer como "faltando".
   */
  private static str;
  private static positiveInt;
  private static defined;
}
//#endregion
//#region src/Support/PzAccountSdkHttp.d.ts
/**
 * Função de transporte: recebe um `Request` pronto e devolve a `Response`.
 * O padrão é o `fetch` global do Node; testes e casos especiais (proxy,
 * agente HTTP próprio) injetam outra pela opção `fetch` do client.
 */
type PzAccountSdkFetch = (request: Request) => Promise<Response>;
//#endregion
//#region src/Support/PzAccountSdkCache.d.ts
/**
 * Cache onde o SDK guarda o JWKS (e os freios de nova busca).
 *
 * O padrão é memória do processo, por client. Para dividir o JWKS entre
 * vários processos/pods, passe um adaptador para o seu Redis, por exemplo.
 * Os valores são sempre strings (o JWKS vai como JSON), e os métodos podem
 * ser síncronos ou assíncronos:
 *
 * ```ts
 * const cache: PzAccountSdkCache = {
 *   get: (key) => redis.get(key),
 *   set: (key, value, ttl) => redis.set(key, value, 'EX', ttl),
 *   add: async (key, value, ttl) => (await redis.set(key, value, 'EX', ttl, 'NX')) === 'OK',
 * };
 * ```
 *
 * O cache é melhor-esforço: se ele falhar, a verificação busca direto no
 * provedor.
 */
interface PzAccountSdkCache {
  /** Valor guardado, ou `undefined`/`null` quando não há (ou expirou). */
  get(key: string): string | null | undefined | Promise<string | null | undefined>;
  /** Guarda por `ttlSeconds` segundos. */
  set(key: string, value: string, ttlSeconds: number): unknown;
  /**
   * Guarda só se a chave não existir e diz se guardou — atômico no store
   * (ex.: `SET key value NX EX ttl` no Redis). Opcional: sem ele, o SDK faz
   * `get` + `set`, que basta para um processo só.
   */
  add?(key: string, value: string, ttlSeconds: number): boolean | Promise<boolean>;
}
/** Cache em memória, com expiração. É o padrão do client. */
declare class PzAccountSdkMemoryCache implements PzAccountSdkCache {
  private readonly items;
  get(key: string): string | undefined;
  set(key: string, value: string, ttlSeconds: number): void;
  add(key: string, value: string, ttlSeconds: number): boolean;
}
//#endregion
//#region src/Support/PzAccountSdkJwksProvider.d.ts
/** O cache, ou quem o resolve na primeira verificação. */
type PzAccountSdkCacheOption = PzAccountSdkCache | (() => PzAccountSdkCache | Promise<PzAccountSdkCache>);
//#endregion
//#region src/PzAccountSdkClient.d.ts
/** Dependências de infraestrutura do client — ambas opcionais. */
interface PzAccountSdkClientDependencies {
  /** Transporte HTTP. Padrão: o `fetch` global do Node. */
  fetch?: PzAccountSdkFetch | undefined;
  /**
   * Onde guardar o JWKS, ou uma função que o resolve na primeira
   * verificação. Padrão: memória do processo.
   */
  cache?: PzAccountSdkCacheOption | undefined;
}
/** Opções do client: configuração + dependências, num objeto só. */
interface PzAccountSdkClientOptions extends PzAccountSdkConfigOptions, PzAccountSdkClientDependencies {}
/**
 * Client do Puzl Account.
 *
 * Sem estado além do cache do JWKS: pode (e deve) ser uma instância única
 * por aplicação. Cada operação cria a própria requisição, então o Bearer de
 * um usuário nunca vaza para a chamada seguinte.
 *
 * ```ts
 * const puzl = new PzAccountSdkClient({ issuer, clientId, clientSecret, redirectUri });
 * // ou: PzAccountSdkClientFactory.fromEnv()
 * ```
 */
declare class PzAccountSdkClient implements PzAccountSdkClientInterface {
  readonly config: PzAccountSdkConfig;
  private readonly fetchFn;
  private readonly jwks;
  constructor(config?: PzAccountSdkConfig | PzAccountSdkClientOptions, dependencies?: PzAccountSdkClientDependencies);
  isConfigured(): boolean;
  pkceCreate(): PzAccountSdkPkceViewDto;
  authorizeUrl(input: PzAccountSdkAuthorizeUrlDto | PzAccountSdkAuthorizeUrlInput): string;
  logoutUrl(input?: PzAccountSdkLogoutUrlDto | PzAccountSdkLogoutUrlInput): string;
  accountUrl(page: PzAccountSdkAccountPageEnum | PzAccountSdkAccountPageValue): string;
  discoveryShow(): Promise<PzAccountSdkDiscoveryViewDto>;
  tokenExchangeCode(input: PzAccountSdkTokenExchangeCodeDto | PzAccountSdkTokenExchangeCodeInput): Promise<PzAccountSdkTokenViewDto>;
  tokenRefresh(input: PzAccountSdkTokenRefreshDto | PzAccountSdkTokenRefreshInput): Promise<PzAccountSdkTokenViewDto>;
  tokenPassword(input: PzAccountSdkTokenPasswordDto | PzAccountSdkTokenPasswordInput): Promise<PzAccountSdkTokenViewDto>;
  tokenRevoke(input: PzAccountSdkTokenRevokeDto | PzAccountSdkTokenRevokeInput): Promise<PzAccountSdkResultDto>;
  userInfoShow(input: PzAccountSdkAccessTokenDto | PzAccountSdkAccessTokenInput): Promise<PzAccountSdkUserInfoViewDto>;
  idTokenVerify(input: PzAccountSdkIdTokenVerifyDto | PzAccountSdkIdTokenVerifyInput): Promise<PzAccountSdkIdentityViewDto>;
  webhookEventVerify(input: PzAccountSdkWebhookEventVerifyDto | PzAccountSdkWebhookEventVerifyInput): Promise<PzAccountSdkWebhookEventViewDto>;
  userRegister(input: PzAccountSdkUserRegisterDto | PzAccountSdkUserRegisterInput): Promise<PzAccountSdkUserProfileViewDto>;
  meShow(input: PzAccountSdkAccessTokenDto | PzAccountSdkAccessTokenInput): Promise<PzAccountSdkUserProfileViewDto>;
  meUpdate(input: PzAccountSdkMeUpdateDto | PzAccountSdkMeUpdateInput): Promise<PzAccountSdkUserProfileViewDto>;
  mePasswordChange(input: PzAccountSdkMePasswordChangeDto | PzAccountSdkMePasswordChangeInput): Promise<PzAccountSdkResultDto>;
  meEmailChange(input: PzAccountSdkMeEmailChangeDto | PzAccountSdkMeEmailChangeInput): Promise<PzAccountSdkResultDto>;
  mePictureUpload(input: PzAccountSdkMePictureUploadDto | PzAccountSdkMePictureUploadInput): Promise<PzAccountSdkUserProfileViewDto>;
  mePicturePresetSet(input: PzAccountSdkMePicturePresetSetDto | PzAccountSdkMePicturePresetSetInput): Promise<PzAccountSdkUserProfileViewDto>;
  mePictureDelete(input: PzAccountSdkAccessTokenDto | PzAccountSdkAccessTokenInput): Promise<PzAccountSdkUserProfileViewDto>;
  meMfaShow(input: PzAccountSdkAccessTokenDto | PzAccountSdkAccessTokenInput): Promise<PzAccountSdkMfaStatusViewDto>;
  meMfaEnroll(input: PzAccountSdkMeMfaEnrollDto | PzAccountSdkMeMfaEnrollInput): Promise<PzAccountSdkMfaEnrollViewDto>;
  meMfaEnrollConfirm(input: PzAccountSdkMeMfaEnrollConfirmDto | PzAccountSdkMeMfaEnrollConfirmInput): Promise<PzAccountSdkMfaRecoveryCodesViewDto>;
  meMfaDisable(input: PzAccountSdkMeMfaDisableDto | PzAccountSdkMeMfaDisableInput): Promise<PzAccountSdkResultDto>;
  meMfaRecoveryCodesRegenerate(input: PzAccountSdkMeMfaRecoveryCodesRegenerateDto | PzAccountSdkMeMfaRecoveryCodesRegenerateInput): Promise<PzAccountSdkMfaRecoveryCodesViewDto>;
  meConsentList(input: PzAccountSdkAccessTokenDto | PzAccountSdkAccessTokenInput): Promise<PzAccountSdkConsentListViewDto>;
  meConsentRevoke(input: PzAccountSdkMeConsentRevokeDto | PzAccountSdkMeConsentRevokeInput): Promise<PzAccountSdkResultDto>;
  private accessToken;
  /**
   * Toda operação de rede devolve uma Promise — inclusive quando a validação
   * da entrada ou da configuração falha antes do HTTP: o erro vira rejeição,
   * nunca uma exceção síncrona escondida no meio de um `await`.
   */
  private run;
}
//#endregion
export { PzAccountSdkMePicturePresetSetDto as $, PzAccountSdkTokenPasswordInput as A, PzAccountSdkIdentityViewFields as At, PzAccountSdkAccessTokenInput as B, PzAccountSdkDto as Bt, PzAccountSdkTokenRevokeDto as C, PzAccountSdkConsentViewDto as Ct, PzAccountSdkTokenRefreshDto as D, PzAccountSdkIdTokenVerifyDto as Dt, PzAccountSdkTokenTypeHintValue as E, PzAccountSdkLogoutUrlInput as Et, PzAccountSdkTokenViewDto as F, PzAccountSdkResultDto as Ft, PzAccountSdkMeUpdateInput as G, PzAccountSdkAccountPageValue as Gt, PzAccountSdkPkceViewFields as H, PzAccountSdkPromptEnum as Ht, PzAccountSdkTokenViewFields as I, PzAccountSdkResultFields as It, PzAccountSdkGenderEnum as J, PzAccountSdkUserViewDto as K, PzAccountSdkEnum as Kt, PzAccountSdkMfaRecoveryCodesViewDto as L, PzAccountSdkErrorCodeEnum as Lt, PzAccountSdkTokenExchangeCodeInput as M, PzAccountSdkAddressInput as Mt, PzAccountSdkUserProfileViewDto as N, PzAccountSdkDiscoveryViewDto as Nt, PzAccountSdkTokenRefreshInput as O, PzAccountSdkIdTokenVerifyInput as Ot, PzAccountSdkUserProfileViewFields as P, PzAccountSdkDiscoveryViewFields as Pt, PzAccountSdkPictureContents as Q, PzAccountSdkMfaRecoveryCodesViewFields as R, PzAccountSdkAuthorizeUrlDto as Rt, PzAccountSdkUserInfoViewFields as S, PzAccountSdkConsentListViewFields as St, PzAccountSdkTokenTypeHintEnum as T, PzAccountSdkLogoutUrlDto as Tt, PzAccountSdkMeUpdateChanges as U, PzAccountSdkPromptValue as Ut, PzAccountSdkPkceViewDto as V, PzAccountSdkValues as Vt, PzAccountSdkMeUpdateDto as W, PzAccountSdkAccountPageEnum as Wt, PzAccountSdkMePictureUploadDto as X, PzAccountSdkGenderValue as Y, PzAccountSdkMePictureUploadInput as Z, PzAccountSdkWebhookEventTypeEnum as _, PzAccountSdkMeEmailChangeDto as _t, PzAccountSdkCache as a, PzAccountSdkMfaStatusViewDto as at, PzAccountSdkUserRegisterInput as b, PzAccountSdkMeConsentRevokeInput as bt, PZ_ACCOUNT_SDK_ENV_KEYS as c, PzAccountSdkMeMfaRecoveryCodesRegenerateInput as ct, PzAccountSdkTokenAuthMethod as d, PzAccountSdkMfaEnrollViewDto as dt, PzAccountSdkMePicturePresetSetInput as et, PzAccountSdkClientInterface as f, PzAccountSdkMfaEnrollViewFields as ft, PzAccountSdkWebhookEventViewFields as g, PzAccountSdkMeMfaDisableInput as gt, PzAccountSdkWebhookEventViewDto as h, PzAccountSdkMeMfaDisableDto as ht, PzAccountSdkCacheOption as i, PzAccountSdkMePasswordChangeInput as it, PzAccountSdkTokenExchangeCodeDto as j, PzAccountSdkAddressDto as jt, PzAccountSdkTokenPasswordDto as k, PzAccountSdkIdentityViewDto as kt, PzAccountSdkConfig as l, PzAccountSdkMeMfaEnrollConfirmDto as lt, PzAccountSdkWebhookEventVerifyInput as m, PzAccountSdkMeMfaEnrollInput as mt, PzAccountSdkClientDependencies as n, PzAccountSdkPicturePresetValue as nt, PzAccountSdkMemoryCache as o, PzAccountSdkMfaStatusViewFields as ot, PzAccountSdkWebhookEventVerifyDto as p, PzAccountSdkMeMfaEnrollDto as pt, PzAccountSdkUserViewFields as q, PzAccountSdkClientOptions as r, PzAccountSdkMePasswordChangeDto as rt, PzAccountSdkFetch as s, PzAccountSdkMeMfaRecoveryCodesRegenerateDto as st, PzAccountSdkClient as t, PzAccountSdkPicturePresetEnum as tt, PzAccountSdkConfigOptions as u, PzAccountSdkMeMfaEnrollConfirmInput as ut, PzAccountSdkWebhookEventTypeValue as v, PzAccountSdkMeEmailChangeInput as vt, PzAccountSdkTokenRevokeInput as w, PzAccountSdkConsentViewFields as wt, PzAccountSdkUserInfoViewDto as x, PzAccountSdkConsentListViewDto as xt, PzAccountSdkUserRegisterDto as y, PzAccountSdkMeConsentRevokeDto as yt, PzAccountSdkAccessTokenDto as z, PzAccountSdkAuthorizeUrlInput as zt };