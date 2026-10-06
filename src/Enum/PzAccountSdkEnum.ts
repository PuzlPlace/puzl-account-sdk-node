/**
 * Base dos enums do SDK — o equivalente ao `enum: string` do PHP.
 *
 * Cada caso é uma instância única (`PzAccountSdkPromptEnum.LOGIN`), com
 * `name` e `value`, e cada enum expõe `cases()`, `from()` e `tryFrom()`.
 * Onde o SDK recebe um enum, também aceita o valor cru (`'login'`), para
 * quem escreve JavaScript puro.
 */
export abstract class PzAccountSdkEnum<V extends string = string> {
  protected constructor(
    public readonly name: string,
    public readonly value: V,
  ) {}

  toString(): string {
    return this.value;
  }

  toJSON(): string {
    return this.value;
  }
}

/**
 * Monta `cases`, `from` e `tryFrom` de um enum a partir da lista de casos.
 *
 * @internal
 */
export function enumLookup<E extends PzAccountSdkEnum>(enumName: string, cases: readonly E[]) {
  const byValue = new Map<string, E>(cases.map((c) => [c.value, c]));

  const tryFrom = (value: unknown): E | null => {
    if (typeof value === 'string') {
      return byValue.get(value) ?? null;
    }

    // Pelo valor, e não por `instanceof`: um caso vindo da outra cópia do
    // pacote (ESM e CJS no mesmo processo) continua valendo.
    if (value instanceof PzAccountSdkEnum || (typeof value === 'object' && value !== null && 'value' in value)) {
      const raw = (value as { value: unknown }).value;

      return typeof raw === 'string' ? (byValue.get(raw) ?? null) : null;
    }

    return null;
  };

  const from = (value: unknown): E => {
    const found = tryFrom(value);

    if (found === null) {
      throw new TypeError(`"${String(value)}" não é um valor válido de ${enumName}.`);
    }

    return found;
  };

  return { cases: () => cases, from, tryFrom };
}
