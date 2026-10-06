import { isNumeric, isRecord, isScalar, isTruthy, scalarToString, toInt, type PzAccountSdkValues } from './PzAccountSdkValue.js';

export type { PzAccountSdkValues } from './PzAccountSdkValue.js';

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
export abstract class PzAccountSdkDto {
  abstract toArray(): PzAccountSdkValues;

  toJSON(): PzAccountSdkValues {
    return this.toArray();
  }

  toJson(): string {
    return JSON.stringify(this.toArray());
  }

  /** `console.log(dto)` mostra o `toArray()`, nunca um segredo cru. */
  [Symbol.for('nodejs.util.inspect.custom')](): PzAccountSdkValues {
    return this.toArray();
  }
}

/** Objeto de entrada do `from()`: qualquer coisa que não seja objeto vira `{}`. */
export function valuesOf(values: unknown): PzAccountSdkValues {
  return isRecord(values) ? values : {};
}

export function pullString(values: PzAccountSdkValues, key: string): string {
  const value = values[key];

  return isScalar(value) ? scalarToString(value) : '';
}

export function pullInt(values: PzAccountSdkValues, key: string): number {
  const value = values[key];

  return isNumeric(value) ? toInt(value) : 0;
}

export function pullBool(values: PzAccountSdkValues, key: string): boolean {
  return isTruthy(values[key]);
}

/** Objeto ou lista; qualquer outra coisa vira objeto vazio. */
export function pullArray(values: PzAccountSdkValues, key: string): PzAccountSdkValues {
  const value = values[key];

  return isRecord(value) ? value : {};
}

/**
 * Lista de strings: descarta o que não for escalar, para que um item
 * inesperado no JSON não vire `[object Object]` no consumidor.
 */
export function pullStringList(values: PzAccountSdkValues, key: string): string[] {
  return Object.values(pullArray(values, key)).filter(isScalar).map(scalarToString);
}

/**
 * Credencial para `toArray()`: os DTOs de entrada mascaram senhas, tokens
 * e códigos, porque `toArray()`/`toJSON()` costumam terminar em log. O
 * valor real continua na propriedade. Vazio fica vazio, para o log dizer
 * se o campo veio.
 */
export function mask(value: string): string {
  return value === '' ? '' : '********';
}

/**
 * A instância do DTO, se já for uma; senão, o `from()` do objeto simples.
 *
 * @internal
 */
export function toDto<T>(dto: abstract new (...args: never[]) => T, from: (values: unknown) => T, input: unknown): T {
  return input instanceof dto ? input : from(input);
}
