import { PzAccountSdkConfigurationException } from '../Exception/PzAccountSdkConfigurationException.js';
import { isNumeric, isRecord, isScalar, scalarToString, toInt } from './PzAccountSdkValue.js';

export type PzAccountSdkTokenAuthMethod = 'client_secret_post' | 'client_secret_basic' | 'none';

/**
 * Opções de configuração do SDK. Todas aceitam string, para que dê para
 * repassar `process.env` sem conversão — números vazios ou inválidos voltam
 * ao padrão.
 */
export interface PzAccountSdkConfigOptions {
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
export const PZ_ACCOUNT_SDK_ENV_KEYS = {
  issuer: 'PUZL_ACCOUNT_ISSUER',
  clientId: 'PUZL_ACCOUNT_CLIENT_ID',
  clientSecret: 'PUZL_ACCOUNT_CLIENT_SECRET',
  redirectUri: 'PUZL_ACCOUNT_REDIRECT_URI',
  scope: 'PUZL_ACCOUNT_SCOPE',
  tokenAuthMethod: 'PUZL_ACCOUNT_TOKEN_AUTH_METHOD',
  timeout: 'PUZL_ACCOUNT_TIMEOUT',
  jwksCacheTtl: 'PUZL_ACCOUNT_JWKS_CACHE_TTL',
  leeway: 'PUZL_ACCOUNT_LEEWAY',
} as const satisfies Record<keyof PzAccountSdkConfigOptions, string>;

/**
 * Configuração do SDK, imutável e validada sob demanda.
 *
 * A validação é preguiçosa de propósito — acontece na primeira chamada ao
 * Puzl Account, não na criação do client. Uma API que instalou o pacote mas
 * ainda não configurou o Puzl Account continua subindo normalmente; quem paga
 * o preço é quem tentar usar, e aí o erro é explícito.
 */
export class PzAccountSdkConfig {
  static readonly AUTH_METHOD_POST = 'client_secret_post';
  static readonly AUTH_METHOD_BASIC = 'client_secret_basic';
  static readonly AUTH_METHOD_NONE = 'none';

  private static readonly AUTH_METHODS: readonly string[] = ['client_secret_post', 'client_secret_basic', 'none'];
  private static readonly DEFAULT_SCOPE = 'openid email profile';
  private static readonly DEFAULT_TIMEOUT = 10;
  private static readonly DEFAULT_JWKS_CACHE_TTL = 3600;
  private static readonly DEFAULT_LEEWAY = 60;

  readonly issuer: string;
  readonly clientId: string;
  readonly redirectUri: string;
  readonly scope: string;
  readonly tokenAuthMethod: string;
  readonly timeout: number;
  readonly jwksCacheTtl: number;
  readonly leeway: number;
  /** Fora da enumeração: um `console.log(config)` não expõe o segredo. */
  declare readonly clientSecret: string;

  private constructor(values: {
    issuer: string;
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    scope: string;
    tokenAuthMethod: string;
    timeout: number;
    jwksCacheTtl: number;
    leeway: number;
  }) {
    this.issuer = values.issuer;
    this.clientId = values.clientId;
    this.redirectUri = values.redirectUri;
    this.scope = values.scope;
    this.tokenAuthMethod = values.tokenAuthMethod;
    this.timeout = values.timeout;
    this.jwksCacheTtl = values.jwksCacheTtl;
    this.leeway = values.leeway;
    Object.defineProperty(this, 'clientSecret', { value: values.clientSecret, enumerable: false });
    Object.freeze(this);
  }

  /** Constrói a partir das opções, normalizando cada valor. */
  static from(options: PzAccountSdkConfigOptions = {}): PzAccountSdkConfig {
    const values: Record<string, unknown> = isRecord(options) ? options : {};
    const scope = PzAccountSdkConfig.str(values, 'scope');
    const authMethod = PzAccountSdkConfig.str(values, 'tokenAuthMethod');
    const leeway = values['leeway'];

    return new PzAccountSdkConfig({
      // A barra final sai aqui, uma única vez: o issuer é comparado
      // byte a byte com o `iss` dos tokens e concatenado com "/oauth/...".
      issuer: PzAccountSdkConfig.str(values, 'issuer').replace(/\/+$/, ''),
      clientId: PzAccountSdkConfig.str(values, 'clientId'),
      clientSecret: PzAccountSdkConfig.str(values, 'clientSecret'),
      redirectUri: PzAccountSdkConfig.str(values, 'redirectUri'),
      scope: scope !== '' ? scope : PzAccountSdkConfig.DEFAULT_SCOPE,
      tokenAuthMethod: authMethod !== '' ? authMethod : PzAccountSdkConfig.AUTH_METHOD_POST,
      timeout: PzAccountSdkConfig.positiveInt(values, 'timeout', PzAccountSdkConfig.DEFAULT_TIMEOUT),
      jwksCacheTtl: PzAccountSdkConfig.positiveInt(values, 'jwksCacheTtl', PzAccountSdkConfig.DEFAULT_JWKS_CACHE_TTL),
      // Zero é válido (sem tolerância); só negativo e lixo voltam ao padrão.
      leeway: isNumeric(leeway) && toInt(leeway) >= 0 ? toInt(leeway) : PzAccountSdkConfig.DEFAULT_LEEWAY,
    });
  }

  /**
   * Lê as variáveis `PUZL_ACCOUNT_*` (por padrão, de `process.env`).
   * Opções explícitas em `overrides` vencem o ambiente.
   */
  static fromEnv(
    env: Record<string, string | undefined> = process.env,
    overrides: PzAccountSdkConfigOptions = {},
  ): PzAccountSdkConfig {
    const options: Record<string, string | undefined> = {};

    for (const [option, envKey] of Object.entries(PZ_ACCOUNT_SDK_ENV_KEYS)) {
      options[option] = env[envKey];
    }

    return PzAccountSdkConfig.from({ ...options, ...PzAccountSdkConfig.defined(overrides) });
  }

  /**
   * O mínimo para falar com o Puzl Account está preenchido? Serve para o
   * produto esconder o "Entrar com a Puzl" enquanto a integração não está
   * configurada, sem precisar capturar exceção.
   */
  isConfigured(): boolean {
    if (
      this.issuer === '' ||
      this.clientId === '' ||
      !PzAccountSdkConfig.AUTH_METHODS.includes(this.tokenAuthMethod)
    ) {
      return false;
    }

    return this.tokenAuthMethod === PzAccountSdkConfig.AUTH_METHOD_NONE || this.clientSecret !== '';
  }

  /**
   * Exige o mínimo para falar com o Puzl Account: issuer e clientId.
   *
   * @throws PzAccountSdkConfigurationException
   */
  assertUsable(): void {
    for (const key of ['issuer', 'clientId'] as const) {
      if (this[key] === '') {
        throw PzAccountSdkConfigurationException.missing(key, PZ_ACCOUNT_SDK_ENV_KEYS[key]);
      }
    }
  }

  /**
   * Exige o necessário para o client se autenticar no /oauth/token e no
   * /oauth/revoke: método válido e, se não for `none`, o clientSecret.
   *
   * @throws PzAccountSdkConfigurationException
   */
  assertClientAuthUsable(): void {
    this.assertUsable();

    if (!PzAccountSdkConfig.AUTH_METHODS.includes(this.tokenAuthMethod)) {
      throw PzAccountSdkConfigurationException.invalid(
        'tokenAuthMethod',
        PZ_ACCOUNT_SDK_ENV_KEYS.tokenAuthMethod,
        PzAccountSdkConfig.AUTH_METHODS.join(', '),
      );
    }

    if (this.tokenAuthMethod !== PzAccountSdkConfig.AUTH_METHOD_NONE && this.clientSecret === '') {
      throw PzAccountSdkConfigurationException.missing('clientSecret', PZ_ACCOUNT_SDK_ENV_KEYS.clientSecret);
    }
  }

  /**
   * Exige a redirectUri — só quando quem chama não informou uma própria.
   *
   * @throws PzAccountSdkConfigurationException
   */
  assertRedirectUsable(): void {
    this.assertUsable();

    if (this.redirectUri === '') {
      throw PzAccountSdkConfigurationException.missing('redirectUri', PZ_ACCOUNT_SDK_ENV_KEYS.redirectUri);
    }
  }

  jwksUri(): string {
    return `${this.issuer}/.well-known/jwks.json`;
  }

  /**
   * `null`, `undefined` e ausência viram string vazia — é o que os
   * `assert*()` sabem reconhecer como "faltando".
   */
  private static str(values: Record<string, unknown>, key: string): string {
    const value = values[key];

    return isScalar(value) ? scalarToString(value).trim() : '';
  }

  private static positiveInt(values: Record<string, unknown>, key: string, fallback: number): number {
    const value = values[key];

    return isNumeric(value) && toInt(value) > 0 ? toInt(value) : fallback;
  }

  private static defined(options: PzAccountSdkConfigOptions): PzAccountSdkConfigOptions {
    return Object.fromEntries(Object.entries(options).filter(([, value]) => value !== undefined));
  }
}
