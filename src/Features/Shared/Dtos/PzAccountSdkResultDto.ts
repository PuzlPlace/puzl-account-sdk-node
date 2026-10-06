import { PzAccountSdkErrorCodeEnum } from '../../../Enum/PzAccountSdkErrorCodeEnum.js';
import {
  PzAccountSdkDto,
  pullArray,
  pullBool,
  pullInt,
  pullString,
  valuesOf,
  type PzAccountSdkValues,
} from '../../../Support/PzAccountSdkDto.js';
import { isRecord, isScalar, scalarToString } from '../../../Support/PzAccountSdkValue.js';

/** Os cinco campos de resultado que todo retorno do SDK carrega. */
export interface PzAccountSdkResultFields {
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
export class PzAccountSdkResultDto extends PzAccountSdkDto {
  readonly has_error: boolean;
  readonly error_code: string;
  readonly error_message: string;
  readonly errors: Record<string, string[]>;
  readonly http_status: number;

  constructor(props: Partial<PzAccountSdkResultFields> = {}) {
    super();
    this.has_error = props.has_error ?? false;
    this.error_code = props.error_code ?? '';
    this.error_message = props.error_message ?? '';
    this.errors = props.errors ?? {};
    this.http_status = props.http_status ?? 0;
  }

  static from(values: unknown): PzAccountSdkResultDto {
    return new PzAccountSdkResultDto(PzAccountSdkResultDto.resultArgs(valuesOf(values)));
  }

  /**
   * Os cinco campos de resultado, para os DTOs de retorno espalharem no
   * próprio construtor: `new Dto({ ...PzAccountSdkResultDto.resultArgs(v), campo })`.
   */
  static resultArgs(values: PzAccountSdkValues): PzAccountSdkResultFields {
    return {
      has_error: pullBool(values, 'has_error'),
      error_code: pullString(values, 'error_code'),
      error_message: pullString(values, 'error_message'),
      errors: PzAccountSdkResultDto.pullFieldErrors(values),
      http_status: pullInt(values, 'http_status'),
    };
  }

  toArray(): PzAccountSdkValues {
    return {
      has_error: this.has_error,
      error_code: this.error_code,
      error_message: this.error_message,
      errors: this.errors,
      http_status: this.http_status,
    };
  }

  isSuccess(): boolean {
    return !this.has_error;
  }

  /**
   * Código do erro como enum, ou `null` quando não houve erro ou quando o
   * Puzl Account devolveu um código que esta versão do SDK ainda não conhece.
   *
   * Um `null` inesperado significa "código novo": trate como falha genérica,
   * nunca como sucesso.
   */
  getErrorCode(): PzAccountSdkErrorCodeEnum | null {
    return PzAccountSdkErrorCodeEnum.tryFrom(this.error_code);
  }

  /**
   * Indisponibilidade do Puzl Account: timeout, falha de conexão ou 5xx.
   *
   * Decidido pelo status, e não pelo `error_code`, porque timeout e falha de
   * conexão nem chegam ao Puzl Account — o transporte devolve 504/500
   * sintéticos, sem corpo e portanto sem código.
   */
  isServiceUnavailable(): boolean {
    return this.has_error && this.http_status >= 500;
  }

  /**
   * Rate limit do Puzl Account (429).
   *
   * Decidido pelo status: nos endpoints `/oauth/*` o 429 chega com
   * `error_code` `invalid_request`, que sozinho pareceria erro de quem chamou.
   * Trate como indisponibilidade temporária.
   */
  isRateLimited(): boolean {
    return this.has_error && this.http_status === 429;
  }

  /**
   * Primeira mensagem de erro de campo, ou `null` quando não há nenhuma.
   *
   * Atalho para o caso comum de um 422: mostrar ao usuário a primeira coisa
   * que o Puzl Account reclamou.
   */
  firstFieldError(): string | null {
    for (const messages of Object.values(this.errors)) {
      for (const message of messages) {
        if (message !== '') {
          return message;
        }
      }
    }

    return null;
  }

  /**
   * Normaliza o `errors` do Puzl Account para `{ campo: ['mensagem', ...] }`.
   *
   * O handler devolve `[]` (lista vazia) quando não há erro de campo e um
   * mapa quando há; ambos passam por aqui sem surpresa.
   */
  private static pullFieldErrors(values: PzAccountSdkValues): Record<string, string[]> {
    const normalized: Record<string, string[]> = {};

    for (const [field, messages] of Object.entries(pullArray(values, 'errors'))) {
      const list = messages === null || messages === undefined ? [] : isRecord(messages) ? Object.values(messages) : [messages];

      normalized[field] = list.filter(isScalar).map(scalarToString);
    }

    return normalized;
  }
}
