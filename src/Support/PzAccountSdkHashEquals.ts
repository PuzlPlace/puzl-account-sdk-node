import { timingSafeEqual } from 'node:crypto';

/**
 * `hash_equals()` do PHP: compara em tempo constante, para não vazar por
 * timing quanto do valor esperado já bate.
 *
 * @internal
 */
export function hashEquals(known: string, user: string): boolean {
  const a = Buffer.from(known);
  const b = Buffer.from(user);

  return a.length === b.length && timingSafeEqual(a, b);
}
