/**
 * Coerção de valores soltos (JSON da resposta, entrada de quem usa
 * JavaScript puro) com as mesmas regras do SDK PHP — é o que garante que os
 * dois SDKs leiam a mesma resposta do mesmo jeito.
 *
 * @internal
 */

/** Objeto JSON (ou array) — o que o PHP chamaria de array. */
export type PzAccountSdkValues = Record<string, unknown>;

export function isRecord(value: unknown): value is PzAccountSdkValues {
  return typeof value === 'object' && value !== null;
}

/** `is_scalar()` do PHP: string, número finito ou booleano. */
export function isScalar(value: unknown): value is string | number | boolean {
  return (
    typeof value === 'string' || typeof value === 'boolean' || (typeof value === 'number' && Number.isFinite(value))
  );
}

/** `(string) $scalar` do PHP: `true` vira "1", `false` vira "". */
export function scalarToString(value: string | number | boolean): string {
  if (typeof value === 'boolean') {
    return value ? '1' : '';
  }

  return String(value);
}

const NUMERIC = /^[ \t\n\r\v\f]*[+-]?(\d+(\.\d*)?|\.\d+)([eE][+-]?\d+)?[ \t\n\r\v\f]*$/;

/** `is_numeric()` do PHP: número, ou string que representa um número. */
export function isNumeric(value: unknown): value is number | string {
  if (typeof value === 'number') {
    return Number.isFinite(value);
  }

  return typeof value === 'string' && NUMERIC.test(value);
}

/** `(int) $numeric` do PHP: trunca na direção do zero. */
export function toInt(value: number | string): number {
  return Math.trunc(Number(value));
}

/** Verdade no sentido do PHP: "", "0", 0 e array vazio são falsos. */
export function isTruthy(value: unknown): boolean {
  if (value === undefined || value === null || value === false || value === '' || value === '0' || value === 0) {
    return false;
  }

  if (Array.isArray(value)) {
    return value.length > 0;
  }

  if (isRecord(value) && Object.getPrototypeOf(value) === Object.prototype) {
    return Object.keys(value).length > 0;
  }

  return true;
}

/** `rawurlencode()` do PHP (RFC 3986): só `A-Za-z0-9-_.~` passam. */
export function rawUrlEncode(value: string): string {
  return encodeURIComponent(value).replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
}

/** `http_build_query(..., PHP_QUERY_RFC3986)`, já sem os valores vazios. */
export function buildQuery(params: Record<string, string>): string {
  return Object.entries(params)
    .filter(([, value]) => value !== '')
    .map(([key, value]) => `${rawUrlEncode(key)}=${rawUrlEncode(value)}`)
    .join('&');
}
