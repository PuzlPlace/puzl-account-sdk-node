import { PzAccountSdkEnum, enumLookup } from './PzAccountSdkEnum.js';

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
export class PzAccountSdkErrorCodeEnum extends PzAccountSdkEnum {
  private constructor(
    name: string,
    value: string,
    private readonly status: number,
    private readonly clientFault: boolean,
  ) {
    super(name, value);
  }

  // ------------------------------------------------------------------
  // API da conta
  // ------------------------------------------------------------------

  /** 422 — falha de validação; detalhes em `errors` */
  static readonly VALIDATION_ERROR = new PzAccountSdkErrorCodeEnum('VALIDATION_ERROR', 'VALIDATION_ERROR', 422, true);
  /** 401 — access token ausente, vencido ou revogado */
  static readonly UNAUTHENTICATED = new PzAccountSdkErrorCodeEnum('UNAUTHENTICATED', 'UNAUTHENTICATED', 401, true);
  /** 403 — o token não foi emitido para um client first-party */
  static readonly FORBIDDEN = new PzAccountSdkErrorCodeEnum('FORBIDDEN', 'FORBIDDEN', 403, false);
  /** 404 — rota ou registro inexistente */
  static readonly NOT_FOUND = new PzAccountSdkErrorCodeEnum('NOT_FOUND', 'NOT_FOUND', 404, false);
  /** 405 — método HTTP não aceito pela rota */
  static readonly METHOD_NOT_ALLOWED = new PzAccountSdkErrorCodeEnum('METHOD_NOT_ALLOWED', 'METHOD_NOT_ALLOWED', 405, false);
  /** 406 — regra de negócio sem código específico */
  static readonly BUSINESS_ERROR = new PzAccountSdkErrorCodeEnum('BUSINESS_ERROR', 'BUSINESS_ERROR', 406, true);
  /** 429 — rate limit estourado */
  static readonly TOO_MANY_REQUESTS = new PzAccountSdkErrorCodeEnum('TOO_MANY_REQUESTS', 'TOO_MANY_REQUESTS', 429, true);
  /** 503 — falha não categorizada no Puzl Account */
  static readonly SERVICE_UNAVAILABLE = new PzAccountSdkErrorCodeEnum('SERVICE_UNAVAILABLE', 'SERVICE_UNAVAILABLE', 503, false);
  /** 409 — e-mail já cadastrado em outra conta */
  static readonly EMAIL_ALREADY_EXISTS = new PzAccountSdkErrorCodeEnum('EMAIL_ALREADY_EXISTS', 'EMAIL_ALREADY_EXISTS', 409, true);
  /** 403 — conta desativada */
  static readonly USER_INACTIVE = new PzAccountSdkErrorCodeEnum('USER_INACTIVE', 'USER_INACTIVE', 403, true);
  /** 401 — a senha atual informada não confere */
  static readonly INVALID_CURRENT_PASSWORD = new PzAccountSdkErrorCodeEnum('INVALID_CURRENT_PASSWORD', 'INVALID_CURRENT_PASSWORD', 401, true);
  /** 404 — conta inexistente */
  static readonly USER_NOT_FOUND = new PzAccountSdkErrorCodeEnum('USER_NOT_FOUND', 'USER_NOT_FOUND', 404, false);
  /** 429 — senha atual errada vezes demais: conferência bloqueada por um tempo */
  static readonly CURRENT_PASSWORD_LOCKED = new PzAccountSdkErrorCodeEnum('CURRENT_PASSWORD_LOCKED', 'CURRENT_PASSWORD_LOCKED', 429, true);
  /** 409 — a conta não tem senha (entra com Google/Apple) */
  static readonly CURRENT_PASSWORD_NOT_SET = new PzAccountSdkErrorCodeEnum('CURRENT_PASSWORD_NOT_SET', 'CURRENT_PASSWORD_NOT_SET', 409, true);
  /** 409 — já existe um pedido de troca de e-mail em aberto */
  static readonly EMAIL_CHANGE_ALREADY_REQUESTED = new PzAccountSdkErrorCodeEnum('EMAIL_CHANGE_ALREADY_REQUESTED', 'EMAIL_CHANGE_ALREADY_REQUESTED', 409, true);
  /** 404 — não há consentimento ativo para o client informado */
  static readonly CONSENT_NOT_FOUND = new PzAccountSdkErrorCodeEnum('CONSENT_NOT_FOUND', 'CONSENT_NOT_FOUND', 404, true);
  /** 409 — MFA já está ligado */
  static readonly MFA_ALREADY_ENABLED = new PzAccountSdkErrorCodeEnum('MFA_ALREADY_ENABLED', 'MFA_ALREADY_ENABLED', 409, true);
  /** 409 — MFA não está ligado */
  static readonly MFA_NOT_ENABLED = new PzAccountSdkErrorCodeEnum('MFA_NOT_ENABLED', 'MFA_NOT_ENABLED', 409, true);
  /** 404 — não há cadastro de MFA pendente para confirmar */
  static readonly MFA_ENROLLMENT_NOT_FOUND = new PzAccountSdkErrorCodeEnum('MFA_ENROLLMENT_NOT_FOUND', 'MFA_ENROLLMENT_NOT_FOUND', 404, true);
  /** 401 — código TOTP recusado */
  static readonly MFA_INVALID_CODE = new PzAccountSdkErrorCodeEnum('MFA_INVALID_CODE', 'MFA_INVALID_CODE', 401, true);
  /** 401 — código de recuperação recusado */
  static readonly MFA_RECOVERY_CODE_INVALID = new PzAccountSdkErrorCodeEnum('MFA_RECOVERY_CODE_INVALID', 'MFA_RECOVERY_CODE_INVALID', 401, true);
  /** 429 — códigos errados demais: MFA bloqueado por um tempo */
  static readonly MFA_LOCKED = new PzAccountSdkErrorCodeEnum('MFA_LOCKED', 'MFA_LOCKED', 429, true);

  // ------------------------------------------------------------------
  // Protocolo OAuth / OIDC
  // ------------------------------------------------------------------

  /**
   * 400 — parâmetro ausente ou malformado.
   *
   * Atenção: o rate limit dos endpoints `/oauth/*` também chega com este
   * código, mas com status 429 — use `isRateLimited()` para separar.
   */
  static readonly INVALID_REQUEST = new PzAccountSdkErrorCodeEnum('INVALID_REQUEST', 'invalid_request', 400, false);
  /** 401 — client_id/client_secret inválidos ou método de autenticação diferente do registrado */
  static readonly INVALID_CLIENT = new PzAccountSdkErrorCodeEnum('INVALID_CLIENT', 'invalid_client', 401, false);
  /**
   * 400 — code, refresh_token ou credencial do usuário inválidos.
   *
   * No password grant é a resposta tanto para senha errada quanto para
   * conta com MFA — o provedor não diferencia, de propósito.
   */
  static readonly INVALID_GRANT = new PzAccountSdkErrorCodeEnum('INVALID_GRANT', 'invalid_grant', 400, true);
  /** 400 — o client não pode usar este grant (ex.: password grant não habilitado) */
  static readonly UNAUTHORIZED_CLIENT = new PzAccountSdkErrorCodeEnum('UNAUTHORIZED_CLIENT', 'unauthorized_client', 400, false);
  /** 400 — grant_type desconhecido */
  static readonly UNSUPPORTED_GRANT_TYPE = new PzAccountSdkErrorCodeEnum('UNSUPPORTED_GRANT_TYPE', 'unsupported_grant_type', 400, false);
  /** 400 — escopo pedido não permitido para o client */
  static readonly INVALID_SCOPE = new PzAccountSdkErrorCodeEnum('INVALID_SCOPE', 'invalid_scope', 400, false);
  /**
   * 401 — access token inválido no /oauth/userinfo (RFC 6750).
   *
   * O provedor manda esse código só no header WWW-Authenticate; o SDK o
   * preenche ao ver um 401 sem corpo.
   */
  static readonly INVALID_TOKEN = new PzAccountSdkErrorCodeEnum('INVALID_TOKEN', 'invalid_token', 401, true);
  /** 500 — falha interna no provedor */
  static readonly SERVER_ERROR = new PzAccountSdkErrorCodeEnum('SERVER_ERROR', 'server_error', 500, false);
  /** 503 — provedor temporariamente indisponível */
  static readonly TEMPORARILY_UNAVAILABLE = new PzAccountSdkErrorCodeEnum('TEMPORARILY_UNAVAILABLE', 'temporarily_unavailable', 503, false);

  // ------------------------------------------------------------------
  // Detectados pelo SDK
  // ------------------------------------------------------------------

  /**
   * O id_token não passou na verificação: assinatura, emissor, audiência,
   * expiração, nonce, at_hash ou `sub` ausente. O SDK não detalha qual —
   * o motivo vai só em `error_message`, para log.
   */
  static readonly ID_TOKEN_INVALID = new PzAccountSdkErrorCodeEnum('ID_TOKEN_INVALID', 'ID_TOKEN_INVALID', 401, true);
  /** O token do webhook (SET) não passou na verificação. */
  static readonly WEBHOOK_TOKEN_INVALID = new PzAccountSdkErrorCodeEnum('WEBHOOK_TOKEN_INVALID', 'WEBHOOK_TOKEN_INVALID', 401, false);
  /**
   * Não deu para obter as chaves públicas (JWKS). O token pode estar
   * perfeito: trate como indisponibilidade, não como credencial inválida.
   */
  static readonly JWKS_UNAVAILABLE = new PzAccountSdkErrorCodeEnum('JWKS_UNAVAILABLE', 'JWKS_UNAVAILABLE', 503, false);

  private static readonly lookup = enumLookup('PzAccountSdkErrorCodeEnum', [
    PzAccountSdkErrorCodeEnum.VALIDATION_ERROR,
    PzAccountSdkErrorCodeEnum.UNAUTHENTICATED,
    PzAccountSdkErrorCodeEnum.FORBIDDEN,
    PzAccountSdkErrorCodeEnum.NOT_FOUND,
    PzAccountSdkErrorCodeEnum.METHOD_NOT_ALLOWED,
    PzAccountSdkErrorCodeEnum.BUSINESS_ERROR,
    PzAccountSdkErrorCodeEnum.TOO_MANY_REQUESTS,
    PzAccountSdkErrorCodeEnum.SERVICE_UNAVAILABLE,
    PzAccountSdkErrorCodeEnum.EMAIL_ALREADY_EXISTS,
    PzAccountSdkErrorCodeEnum.USER_INACTIVE,
    PzAccountSdkErrorCodeEnum.INVALID_CURRENT_PASSWORD,
    PzAccountSdkErrorCodeEnum.USER_NOT_FOUND,
    PzAccountSdkErrorCodeEnum.CURRENT_PASSWORD_LOCKED,
    PzAccountSdkErrorCodeEnum.CURRENT_PASSWORD_NOT_SET,
    PzAccountSdkErrorCodeEnum.EMAIL_CHANGE_ALREADY_REQUESTED,
    PzAccountSdkErrorCodeEnum.CONSENT_NOT_FOUND,
    PzAccountSdkErrorCodeEnum.MFA_ALREADY_ENABLED,
    PzAccountSdkErrorCodeEnum.MFA_NOT_ENABLED,
    PzAccountSdkErrorCodeEnum.MFA_ENROLLMENT_NOT_FOUND,
    PzAccountSdkErrorCodeEnum.MFA_INVALID_CODE,
    PzAccountSdkErrorCodeEnum.MFA_RECOVERY_CODE_INVALID,
    PzAccountSdkErrorCodeEnum.MFA_LOCKED,
    PzAccountSdkErrorCodeEnum.INVALID_REQUEST,
    PzAccountSdkErrorCodeEnum.INVALID_CLIENT,
    PzAccountSdkErrorCodeEnum.INVALID_GRANT,
    PzAccountSdkErrorCodeEnum.UNAUTHORIZED_CLIENT,
    PzAccountSdkErrorCodeEnum.UNSUPPORTED_GRANT_TYPE,
    PzAccountSdkErrorCodeEnum.INVALID_SCOPE,
    PzAccountSdkErrorCodeEnum.INVALID_TOKEN,
    PzAccountSdkErrorCodeEnum.SERVER_ERROR,
    PzAccountSdkErrorCodeEnum.TEMPORARILY_UNAVAILABLE,
    PzAccountSdkErrorCodeEnum.ID_TOKEN_INVALID,
    PzAccountSdkErrorCodeEnum.WEBHOOK_TOKEN_INVALID,
    PzAccountSdkErrorCodeEnum.JWKS_UNAVAILABLE,
  ]);

  static cases(): readonly PzAccountSdkErrorCodeEnum[] {
    return PzAccountSdkErrorCodeEnum.lookup.cases();
  }

  static from(value: PzAccountSdkErrorCodeEnum | string): PzAccountSdkErrorCodeEnum {
    return PzAccountSdkErrorCodeEnum.lookup.from(value);
  }

  static tryFrom(value: unknown): PzAccountSdkErrorCodeEnum | null {
    return PzAccountSdkErrorCodeEnum.lookup.tryFrom(value);
  }

  /**
   * Separa o que é culpa de quem chamou — credencial do usuário final, dado
   * inválido, excesso de tentativas — do que é erro de configuração do
   * produto ou de infraestrutura.
   *
   * Repassar ao usuário final um `invalid_client` (credencial do APP) como
   * se fosse culpa dele derruba a sessão de quem não tem nada a ver com isso.
   */
  isClientFault(): boolean {
    return this.clientFault;
  }

  /** Status HTTP com que este código chega (ou, nos do SDK, o que ele atribui). */
  httpStatus(): number {
    return this.status;
  }
}
