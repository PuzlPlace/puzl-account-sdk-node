import { STATUS_CODES } from 'node:http';
import { isRecord, type PzAccountSdkValues } from './PzAccountSdkValue.js';

/**
 * Função de transporte: recebe um `Request` pronto e devolve a `Response`.
 * O padrão é o `fetch` global do Node; testes e casos especiais (proxy,
 * agente HTTP próprio) injetam outra pela opção `fetch` do client.
 */
export type PzAccountSdkFetch = (request: Request) => Promise<Response>;

/**
 * Resposta já lida, no formato que os gateways esperam. Falha de rede não
 * vira exceção: vira uma resposta sintética 504/500, como no PzRequest do
 * SDK PHP.
 */
export class PzAccountSdkResponse {
  constructor(
    readonly statusCode: number,
    readonly statusText: string,
    readonly content: string,
  ) {}

  /**
   * Corpo como objeto. JSON que não é objeto (HTML do nginx, corpo vazio,
   * escalar) vira `{ content: corpo }` — nunca exceção.
   */
  /** O corpo é um objeto JSON? Um 2xx sem isso não é resposta do Puzl Account. */
  isJsonObject(): boolean {
    try {
      const decoded: unknown = JSON.parse(this.content);

      return isRecord(decoded) && !Array.isArray(decoded);
    } catch {
      return false;
    }
  }

  getArrayContent(): PzAccountSdkValues {
    try {
      const decoded: unknown = JSON.parse(this.content);

      if (isRecord(decoded)) {
        return decoded;
      }
    } catch {
      // segue para o fallback
    }

    return { content: this.content };
  }
}

type Body = PzAccountSdkValues | FormData | undefined;

/** Maior atraso que um timer do Node aceita (~24,8 dias), em segundos. */
const MAX_TIMEOUT = 2_147_483;

/**
 * Uma requisição ao Puzl Account. Cada chamada do SDK cria uma nova: assim o
 * Bearer de uma operação nunca vaza para a próxima.
 *
 * @internal
 */
export class PzAccountSdkRequest {
  private readonly headers: Record<string, string> = { Accept: 'application/json' };
  private formUrlEncoded = false;

  constructor(
    private readonly fetchFn: PzAccountSdkFetch,
    private readonly timeout: number,
  ) {}

  withBearer(token: string): this {
    this.headers['Authorization'] = `Bearer ${token}`;

    return this;
  }

  withBasicAuth(username: string, password: string): this {
    this.headers['Authorization'] = `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;

    return this;
  }

  asFormUrlEncoded(): this {
    this.formUrlEncoded = true;

    return this;
  }

  get(url: string): Promise<PzAccountSdkResponse> {
    return this.send('GET', url, undefined);
  }

  delete(url: string): Promise<PzAccountSdkResponse> {
    return this.send('DELETE', url, undefined);
  }

  post(url: string, body?: Body): Promise<PzAccountSdkResponse> {
    return this.send('POST', url, body);
  }

  put(url: string, body?: Body): Promise<PzAccountSdkResponse> {
    return this.send('PUT', url, body);
  }

  private async send(method: string, url: string, body: Body): Promise<PzAccountSdkResponse> {
    try {
      const request = new Request(url, {
        method,
        headers: this.requestHeaders(body),
        body: this.encode(body),
        signal: AbortSignal.timeout(Math.min(this.timeout, MAX_TIMEOUT) * 1000),
        // Endpoint do Puzl Account não redireciona. Seguir um 3xx mandaria
        // client_secret, code e senha no corpo para outro destino: o 3xx
        // chega ao gateway e vira erro, como qualquer status inesperado.
        redirect: 'manual',
      });
      const response = await this.fetchFn(request);
      const content = await response.text();

      return new PzAccountSdkResponse(
        response.status,
        response.statusText !== '' ? response.statusText : (STATUS_CODES[response.status] ?? ''),
        content,
      );
    } catch (error) {
      return this.failure(error);
    }
  }

  private requestHeaders(body: Body): Record<string, string> {
    const headers = { ...this.headers };

    // Multipart: o próprio fetch põe o Content-Type com o boundary.
    if (body !== undefined && !(body instanceof FormData)) {
      headers['Content-Type'] = this.formUrlEncoded ? 'application/x-www-form-urlencoded' : 'application/json';
    }

    return headers;
  }

  private encode(body: Body): string | FormData | undefined {
    if (body === undefined || body instanceof FormData) {
      return body;
    }

    if (this.formUrlEncoded) {
      const params = new URLSearchParams();

      for (const [key, value] of Object.entries(body)) {
        params.append(key, String(value));
      }

      return params.toString();
    }

    return JSON.stringify(body);
  }

  /**
   * Timeout e falha de conexão (DNS, recusa, TLS) viram 504; qualquer outra
   * coisa, 500 — sem código de erro, para `isServiceUnavailable()` pegar.
   */
  private failure(error: unknown): PzAccountSdkResponse {
    const message = error instanceof Error ? error.message : String(error);
    const name = error instanceof Error ? error.name : '';
    const cause = error instanceof Error ? (error.cause as { code?: unknown } | undefined) : undefined;
    // undici: TypeError "fetch failed", com o código do sistema (ECONNREFUSED, ENOTFOUND...) no `cause`.
    const network = error instanceof TypeError && (message === 'fetch failed' || typeof cause?.code === 'string');

    if (name === 'TimeoutError' || name === 'AbortError' || network) {
      return new PzAccountSdkResponse(504, `Connection timed out after ${this.timeout} seconds`, message);
    }

    return new PzAccountSdkResponse(500, 'Uncategorised exception occurred.', message);
  }
}
