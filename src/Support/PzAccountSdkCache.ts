/**
 * Cache onde o SDK guarda o JWKS (e os freios de nova busca).
 *
 * O padrão é memória do processo, por client. Para dividir o JWKS entre
 * vários processos/pods, passe um adaptador para o seu Redis, por exemplo.
 * Os valores são sempre strings (o JWKS vai como JSON), e os métodos podem
 * ser síncronos ou assíncronos:
 *
 * ```ts
 * const cache: PzAccountSdkCache = {
 *   get: (key) => redis.get(key),
 *   set: (key, value, ttl) => redis.set(key, value, 'EX', ttl),
 *   add: async (key, value, ttl) => (await redis.set(key, value, 'EX', ttl, 'NX')) === 'OK',
 * };
 * ```
 *
 * O cache é melhor-esforço: se ele falhar, a verificação busca direto no
 * provedor.
 */
export interface PzAccountSdkCache {
  /** Valor guardado, ou `undefined`/`null` quando não há (ou expirou). */
  get(key: string): string | null | undefined | Promise<string | null | undefined>;
  /** Guarda por `ttlSeconds` segundos. */
  set(key: string, value: string, ttlSeconds: number): unknown;
  /**
   * Guarda só se a chave não existir e diz se guardou — atômico no store
   * (ex.: `SET key value NX EX ttl` no Redis). Opcional: sem ele, o SDK faz
   * `get` + `set`, que basta para um processo só.
   */
  add?(key: string, value: string, ttlSeconds: number): boolean | Promise<boolean>;
}

/** Cache em memória, com expiração. É o padrão do client. */
export class PzAccountSdkMemoryCache implements PzAccountSdkCache {
  private readonly items = new Map<string, { value: string; expiresAt: number }>();

  get(key: string): string | undefined {
    const item = this.items.get(key);

    if (item === undefined) {
      return undefined;
    }

    if (item.expiresAt <= Date.now()) {
      this.items.delete(key);

      return undefined;
    }

    return item.value;
  }

  set(key: string, value: string, ttlSeconds: number): void {
    this.items.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
  }

  add(key: string, value: string, ttlSeconds: number): boolean {
    if (this.get(key) !== undefined) {
      return false;
    }

    this.set(key, value, ttlSeconds);

    return true;
  }
}
