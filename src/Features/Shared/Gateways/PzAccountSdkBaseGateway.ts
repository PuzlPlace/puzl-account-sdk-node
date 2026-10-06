import type { PzAccountSdkErrorCodeEnum } from '../../../Enum/PzAccountSdkErrorCodeEnum.js';
import { PzAccountSdkErrorCodeEnum as ErrorCode } from '../../../Enum/PzAccountSdkErrorCodeEnum.js';
import { PzAccountSdkConfig } from '../../../Support/PzAccountSdkConfig.js';
import { PzAccountSdkRequest, type PzAccountSdkFetch, type PzAccountSdkResponse } from '../../../Support/PzAccountSdkHttp.js';
import { isRecord, isScalar, rawUrlEncode, scalarToString, type PzAccountSdkValues } from '../../../Support/PzAccountSdkValue.js';

/**
 * Base dos gateways: monta a requisição e traduz a resposta em objeto para o
 * `from()` do DTO de retorno.
 *
 * O Puzl Account fala dois "dialetos", e cada gateway escolhe o seu:
 *
 * - API da conta (`/api/identity/*`): JSON, Bearer do usuário, envelope
 *   `{error, message, data}` no sucesso e `{code, message, errors}` no erro.
 * - Protocolo (`/oauth/*`): form-urlencoded, autenticação do client, corpo
 *   cru no sucesso e `{error, error_description}` (RFC 6749) no erro.
 *
 * @internal
 */
export abstract class PzAccountSdkBaseGateway {
  constructor(
    protected readonly config: PzAccountSdkConfig,
    protected readonly fetchFn: PzAccountSdkFetch,
  ) {}

  /** Uma requisição nova por chamada: credencial nenhuma vaza para a próxima. */
  protected http(): PzAccountSdkRequest {
    return new PzAccountSdkRequest(this.fetchFn, this.config.timeout);
  }

  protected url(path: string): string {
    return this.config.issuer + path;
  }

  /**
   * Requisição para a API da conta. Sem `accessToken`, segue sem
   * Authorization — é o caso do cadastro, que é público.
   */
  protected apiRequest(accessToken = ''): PzAccountSdkRequest {
    this.config.assertUsable();

    const request = this.http();

    return accessToken !== '' ? request.withBearer(accessToken) : request;
  }

  /**
   * Requisição para os endpoints de protocolo que o client autentica
   * (/oauth/token, /oauth/revoke): corpo form-urlencoded.
   */
  protected oauthRequest(): PzAccountSdkRequest {
    this.config.assertClientAuthUsable();

    return this.http().asFormUrlEncoded();
  }

  /**
   * Aplica a autenticação do client conforme `tokenAuthMethod` e devolve o
   * corpo final. O provedor exige o MESMO método registrado no client.
   */
  protected withClientAuth(request: PzAccountSdkRequest, body: Record<string, string>): Record<string, string> {
    if (this.config.tokenAuthMethod === PzAccountSdkConfig.AUTH_METHOD_BASIC) {
      // RFC 6749 §2.3.1: id e secret vão url-encoded antes do Base64.
      request.withBasicAuth(rawUrlEncode(this.config.clientId), rawUrlEncode(this.config.clientSecret));

      return body;
    }

    if (this.config.tokenAuthMethod === PzAccountSdkConfig.AUTH_METHOD_NONE) {
      return { ...body, client_id: this.config.clientId };
    }

    return { ...body, client_id: this.config.clientId, client_secret: this.config.clientSecret };
  }

  protected buildSuccess(response: PzAccountSdkResponse): PzAccountSdkValues {
    return { has_error: false, error_code: '', error_message: '', errors: [], http_status: response.statusCode };
  }

  /** Erro no envelope da API da conta: `{code, message, errors}`. */
  protected buildApiError(response: PzAccountSdkResponse): PzAccountSdkValues {
    const content = response.getArrayContent();
    const message = this.stringFrom(content, 'message');

    return {
      has_error: true,
      error_code: this.stringFrom(content, 'code'),
      error_message: message !== '' && message !== '0' ? message : response.statusText,
      errors: isRecord(content['errors']) ? content['errors'] : [],
      http_status: response.statusCode,
    };
  }

  /**
   * Erro no formato das RFCs: `{error, error_description}`.
   *
   * Um 401 sem corpo é o /oauth/userinfo recusando o token — o código
   * (`invalid_token`) vai só no header WWW-Authenticate; o SDK o
   * reconstrói aqui.
   */
  protected buildOauthError(response: PzAccountSdkResponse): PzAccountSdkValues {
    const content = response.getArrayContent();
    let code = this.stringFrom(content, 'error');
    const description = this.stringFrom(content, 'error_description');

    if (code === '' && response.statusCode === 401) {
      code = ErrorCode.INVALID_TOKEN.value;
    }

    return {
      has_error: true,
      error_code: code,
      error_message: description !== '' && description !== '0' ? description : response.statusText,
      errors: [],
      http_status: response.statusCode,
    };
  }

  /**
   * Sucesso de uma operação resolvida localmente (verificação de JWT), sem
   * resposta HTTP por trás. O 200 é convenção do SDK.
   */
  protected buildLocalSuccess(): PzAccountSdkValues {
    return { has_error: false, error_code: '', error_message: '', errors: [], http_status: 200 };
  }

  /** Erro detectado pelo próprio SDK, sem resposta HTTP por trás. */
  protected buildLocalError(code: PzAccountSdkErrorCodeEnum, message: string): PzAccountSdkValues {
    return { has_error: true, error_code: code.value, error_message: message, errors: [], http_status: code.httpStatus() };
  }

  /**
   * Um 2xx de endpoint de protocolo precisa trazer um objeto JSON. HTML de
   * proxy, corpo vazio ou lixo não podem virar "sucesso" com campos vazios —
   * quem confere só `has_error` deixaria passar um token inexistente.
   */
  protected hasBody(response: PzAccountSdkResponse): boolean {
    return response.isJsonObject();
  }

  /** Idem para a API da conta: o envelope precisa trazer `data`. */
  protected hasData(response: PzAccountSdkResponse): boolean {
    return response.isJsonObject() && isRecord(response.getArrayContent()['data']);
  }

  /**
   * Resposta que não veio do Puzl Account (ou veio quebrada): erro sem
   * código, com status 502, para `isServiceUnavailable()` pegar.
   */
  protected buildInvalidResponse(response: PzAccountSdkResponse): PzAccountSdkValues {
    return {
      has_error: true,
      error_code: '',
      error_message: `Resposta inesperada do Puzl Account (HTTP ${response.statusCode}).`,
      errors: [],
      http_status: 502,
    };
  }

  /** `data` do envelope da API da conta. */
  protected responseData(response: PzAccountSdkResponse): PzAccountSdkValues {
    const data = response.getArrayContent()['data'];

    return isRecord(data) ? data : {};
  }

  /** Corpo cru — o formato dos endpoints de protocolo. */
  protected responseBody(response: PzAccountSdkResponse): PzAccountSdkValues {
    return response.getArrayContent();
  }

  private stringFrom(content: PzAccountSdkValues, key: string): string {
    const value = content[key];

    return isScalar(value) ? scalarToString(value) : '';
  }
}
