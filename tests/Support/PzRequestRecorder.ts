import { STATUS_CODES } from 'node:http';
import type { PzAccountSdkFetch } from '../../src/Support/PzAccountSdkHttp.js';

/** Uma requisição que o SDK tentou fazer, já lida (o corpo de um Request só se lê uma vez). */
export interface RecordedRequest {
  method: string;
  url: string;
  /** Nomes em minúsculas, como o `Headers` do fetch os guarda. */
  headers: Record<string, string>;
  /** Corpo cru, como iria no fio. */
  body: string;
  /** Corpo decodificado: JSON, form-urlencoded ou multipart. */
  bodyArray: Record<string, unknown>;
  formUrlEncoded: boolean;
  multiparts: Array<{ name: string; filename: string; type: string; contents: string }>;
  signal: AbortSignal;
  redirect: Request['redirect'];
}

type Queued = Response | Error | ((request: Request) => Promise<Response>);

/**
 * Fila de respostas + histórico de requisições, para o `fetch` injetado no
 * client — o equivalente do PzRequestRecorder/PzRequestSpy do SDK PHP.
 * Nenhum teste abre socket.
 */
export class PzRequestRecorder {
  private readonly responses: Queued[] = [];
  private readonly recorded: RecordedRequest[] = [];

  readonly fetch: PzAccountSdkFetch = async (request) => {
    this.recorded.push(await PzRequestRecorder.read(request));

    const next = this.responses.shift();

    if (next === undefined) {
      throw new Error(
        'PzRequestRecorder: o SDK fez uma requisição sem resposta enfileirada. ' +
          'Enfileire uma resposta ou verifique se a chamada deveria acontecer.',
      );
    }

    if (next instanceof Error) {
      throw next;
    }

    return typeof next === 'function' ? next(request) : next;
  };

  pushJson(status: number, body: unknown, statusText = ''): this {
    return this.push(
      new Response(JSON.stringify(body), {
        status,
        statusText: statusText !== '' ? statusText : (STATUS_CODES[status] ?? ''),
        headers: { 'Content-Type': 'application/json' },
      }),
    );
  }

  /** Erro no formato das RFCs (`/oauth/*`). */
  pushOauthError(status: number, error: string, description = 'falhou'): this {
    return this.pushJson(status, { error, error_description: description });
  }

  /** Resposta sem corpo. */
  pushEmpty(status: number): this {
    return this.push(new Response(status === 204 ? null : '', { status, statusText: STATUS_CODES[status] ?? '' }));
  }

  /** Sucesso no envelope da API da conta. */
  pushSuccess(status: number, data: unknown): this {
    return this.pushJson(status, { error: false, message: 'Operação realizada com sucesso.', data });
  }

  /** Erro no envelope da API da conta. */
  pushError(status: number, code: string, message = 'falhou', errors: unknown = []): this {
    return this.pushJson(status, { code, message, errors });
  }

  pushNoContent(): this {
    return this.pushEmpty(204);
  }

  /** O fetch estoura o timeout (AbortSignal.timeout). */
  pushConnectTimeout(): this {
    return this.push(new DOMException('The operation was aborted due to timeout', 'TimeoutError'));
  }

  /** O fetch falha antes de haver resposta (DNS, conexão recusada). */
  pushNetworkError(): this {
    return this.push(new TypeError('fetch failed', { cause: new Error('connect ECONNREFUSED') }));
  }

  push(response: Queued): this {
    this.responses.push(response);

    return this;
  }

  requests(): RecordedRequest[] {
    return [...this.recorded];
  }

  requestCount(): number {
    return this.recorded.length;
  }

  firstRequest(): RecordedRequest {
    return this.requestAt(0);
  }

  lastRequest(): RecordedRequest {
    return this.requestAt(this.recorded.length - 1);
  }

  requestAt(index: number): RecordedRequest {
    const request = this.recorded[index];

    if (request === undefined) {
      throw new Error(`PzRequestRecorder: não há requisição no índice ${index} (foram ${this.recorded.length}).`);
    }

    return request;
  }

  private static async read(request: Request): Promise<RecordedRequest> {
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      headers[key] = value;
    });

    const contentType = headers['content-type'] ?? '';
    const body = request.body === null ? '' : await request.clone().text();
    const formUrlEncoded = contentType.startsWith('application/x-www-form-urlencoded');
    const multiparts: RecordedRequest['multiparts'] = [];
    let bodyArray: Record<string, unknown> = {};

    if (formUrlEncoded) {
      bodyArray = Object.fromEntries(new URLSearchParams(body));
    } else if (contentType.startsWith('application/json') && body !== '') {
      bodyArray = JSON.parse(body) as Record<string, unknown>;
    } else if (contentType.startsWith('multipart/form-data')) {
      const form = await request.clone().formData();

      for (const [name, value] of form.entries()) {
        if (typeof value !== 'string') {
          multiparts.push({ name, filename: value.name, type: value.type, contents: Buffer.from(await value.arrayBuffer()).toString('binary') });
        }
      }
    }

    return { method: request.method, url: request.url, headers, body, bodyArray, formUrlEncoded, multiparts, signal: request.signal, redirect: request.redirect };
  }
}
