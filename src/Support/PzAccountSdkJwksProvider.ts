import { createHash } from 'node:crypto';
import { PzAccountSdkException } from '../Exception/PzAccountSdkException.js';
import { PzAccountSdkJwksUnavailableException } from '../Exception/PzAccountSdkJwksUnavailableException.js';
import { PzAccountSdkMemoryCache, type PzAccountSdkCache } from './PzAccountSdkCache.js';
import type { PzAccountSdkConfig } from './PzAccountSdkConfig.js';
import type { PzAccountSdkFetch } from './PzAccountSdkHttp.js';
import { PzAccountSdkRequest } from './PzAccountSdkHttp.js';
import {
  jwtDecode,
  jwtHeader,
  parseKeySet,
  PzAccountSdkJwtException,
  type PzAccountSdkJwtKey,
} from './PzAccountSdkJwt.js';
import { isRecord, type PzAccountSdkValues } from './PzAccountSdkValue.js';

/** O cache, ou quem o resolve na primeira verificação. */
export type PzAccountSdkCacheOption = PzAccountSdkCache | (() => PzAccountSdkCache | Promise<PzAccountSdkCache>);

type Keys = Map<string, PzAccountSdkJwtKey>;

/**
 * Verifica a assinatura de JWTs emitidos pelo Puzl Account (id_token e
 * webhooks) contra o JWKS publicado em `{issuer}/.well-known/jwks.json`.
 *
 * - Só aceita RS256. `alg: none`, HS256 e afins são recusados antes de
 *   qualquer chave ser consultada — é a defesa clássica contra confusão de
 *   algoritmo.
 * - O JWKS fica no cache por `jwksCacheTtl` segundos.
 * - Um `kid` desconhecido indica rotação de chave: o JWKS é buscado de novo,
 *   mas no máximo uma vez a cada REFRESH_COOLDOWN segundos, e nunca logo após
 *   uma busca feita na mesma verificação. Sem esse freio, cada token forjado
 *   com `kid` inventado viraria uma requisição ao provedor.
 * - Uma busca que falha fica lembrada por FAILURE_COOLDOWN segundos: com o
 *   provedor fora do ar, as verificações seguintes falham na hora em vez de
 *   esperar o timeout uma a uma.
 * - O cache é melhor-esforço: se ele próprio falhar (Redis fora, por
 *   exemplo), a verificação segue buscando direto no provedor.
 *
 * Só a assinatura e as datas (exp/iat/nbf, com `leeway`) são conferidas aqui.
 * Emissor, audiência e o resto ficam com o gateway, que sabe o que esperar.
 *
 * @internal
 */
export class PzAccountSdkJwksProvider {
  static readonly SUPPORTED_ALG = 'RS256';

  /** Intervalo mínimo, em segundos, entre duas buscas forçadas do JWKS. */
  static readonly REFRESH_COOLDOWN = 60;

  /** Por quantos segundos uma busca que falhou impede nova tentativa. */
  static readonly FAILURE_COOLDOWN = 30;

  private cacheStore: PzAccountSdkCache | null;
  private cacheResolver: (() => PzAccountSdkCache | Promise<PzAccountSdkCache>) | null;
  private cacheResolving: Promise<PzAccountSdkCache> | null = null;

  /**
   * Busca em andamento. Num processo Node, várias verificações correm ao
   * mesmo tempo: todas esperam a MESMA busca, em vez de uma por requisição
   * (cache frio, TTL vencido) — e, na rotação de chave, ninguém desiste
   * enquanto a busca forçada ainda não terminou.
   */
  private fetching: Promise<Keys> | null = null;
  private refreshing: Promise<Keys | null> | null = null;

  constructor(
    private readonly config: PzAccountSdkConfig,
    private readonly fetchFn: PzAccountSdkFetch,
    cache: PzAccountSdkCacheOption,
  ) {
    this.cacheStore = typeof cache === 'function' ? null : cache;
    this.cacheResolver = typeof cache === 'function' ? cache : null;
  }

  /**
   * Confere assinatura e datas e devolve os claims.
   *
   * @throws PzAccountSdkJwtException token malformado, assinatura inválida ou vencido
   * @throws PzAccountSdkJwksUnavailableException JWKS inacessível ou inválido
   */
  async decode(jwt: string): Promise<PzAccountSdkValues> {
    const kid = this.kidFromHeader(jwt);
    let [keys, justFetched] = await this.keys();

    if (!keys.has(kid) && !justFetched) {
      keys = (await this.refreshedKeys()) ?? keys;
    }

    const key = keys.get(kid);

    if (key === undefined) {
      throw new PzAccountSdkJwtException('kid desconhecido no JWKS.');
    }

    return jwtDecode(jwt, key, this.config.leeway);
  }

  /**
   * Lê o header sem confiar nele: serve só para escolher a chave e recusar
   * cedo o algoritmo errado. A assinatura é conferida depois, pela chave.
   */
  private kidFromHeader(jwt: string): string {
    if (jwt.split('.').length !== 3) {
      throw new PzAccountSdkJwtException('JWT malformado: esperados três segmentos.');
    }

    const header = jwtHeader(jwt);

    if (header === null) {
      throw new PzAccountSdkJwtException('JWT malformado: header ilegível.');
    }

    if (header['alg'] !== PzAccountSdkJwksProvider.SUPPORTED_ALG) {
      throw new PzAccountSdkJwtException(`Algoritmo não aceito: apenas ${PzAccountSdkJwksProvider.SUPPORTED_ALG}.`);
    }

    const kid = header['kid'];

    if (typeof kid !== 'string' || kid === '') {
      throw new PzAccountSdkJwtException('JWT sem kid no header.');
    }

    return kid;
  }

  /** Chaves do cache ou, na falta delas, do provedor — e se acabaram de ser buscadas. */
  private async keys(): Promise<[Keys, boolean]> {
    const cached = PzAccountSdkJwksProvider.decodeCached(await this.cacheGet(this.cacheKey()));

    if (cached !== null) {
      try {
        return [this.parse(cached), false];
      } catch (error) {
        // Cache corrompido: cai para a busca, que sobrescreve.
        if (!(error instanceof PzAccountSdkJwksUnavailableException)) {
          throw error;
        }
      }
    }

    if (this.fetching === null) {
      const failed = await this.cacheGet(this.failureKey());

      if (failed !== null && failed !== undefined) {
        throw PzAccountSdkJwksUnavailableException.recentFailure(PzAccountSdkJwksProvider.FAILURE_COOLDOWN);
      }
    }

    return [await this.fetchAndStore(), true];
  }

  /**
   * Busca forçada por causa de `kid` desconhecido, ou `null` quando o freio
   * está ativo — aí a verificação segue com as chaves que já tem.
   */
  private refreshedKeys(): Promise<Keys | null> {
    this.refreshing ??= (async () => {
      // `add` é atômico: entre processos concorrentes, só um ganha a busca.
      if (!(await this.cacheAdd(this.cooldownKey(), PzAccountSdkJwksProvider.REFRESH_COOLDOWN))) {
        return null;
      }

      return this.fetchAndStore();
    })().finally(() => {
      this.refreshing = null;
    });

    return this.refreshing;
  }

  /** Uma busca por vez: quem chega durante uma busca espera por ela. */
  private fetchAndStore(): Promise<Keys> {
    this.fetching ??= this.fetchFromProvider().finally(() => {
      this.fetching = null;
    });

    return this.fetching;
  }

  private async fetchFromProvider(): Promise<Keys> {
    let jwks: PzAccountSdkValues;
    let keys: Keys;

    try {
      const response = await new PzAccountSdkRequest(this.fetchFn, this.config.timeout).get(this.config.jwksUri());

      if (response.statusCode !== 200) {
        throw PzAccountSdkJwksUnavailableException.fromStatus(response.statusCode, response.statusText);
      }

      jwks = response.getArrayContent();
      keys = this.parse(jwks);
    } catch (error) {
      if (error instanceof PzAccountSdkJwksUnavailableException) {
        await this.cachePut(this.failureKey(), '1', PzAccountSdkJwksProvider.FAILURE_COOLDOWN);
      }

      throw error;
    }

    // Guardado como JSON: qualquer store de strings (Redis, Memcached) serve.
    await this.cachePut(this.cacheKey(), JSON.stringify(jwks), this.config.jwksCacheTtl);

    return keys;
  }

  /** O JWKS guardado volta como objeto — aceita a string JSON ou o objeto já decodificado. */
  private static decodeCached(cached: unknown): PzAccountSdkValues | null {
    if (typeof cached === 'string') {
      try {
        const decoded: unknown = JSON.parse(cached);

        return isRecord(decoded) ? decoded : null;
      } catch {
        return null;
      }
    }

    return isRecord(cached) ? cached : null;
  }

  private parse(jwks: PzAccountSdkValues): Keys {
    const list = jwks['keys'];

    if (!isRecord(list) || Object.keys(list).length === 0) {
      throw PzAccountSdkJwksUnavailableException.invalidKeySet('sem chaves em "keys".');
    }

    try {
      return parseKeySet(jwks, PzAccountSdkJwksProvider.SUPPORTED_ALG);
    } catch (error) {
      throw PzAccountSdkJwksUnavailableException.invalidKeySet((error as Error).message);
    }
  }

  /**
   * O store é resolvido só na primeira verificação: um store mal configurado
   * não pode derrubar as operações que nem usam o JWKS. A resolução é única,
   * mesmo com verificações simultâneas; se ela falhar por infraestrutura, o
   * JWKS passa a viver na memória do processo.
   */
  private cache(): Promise<PzAccountSdkCache> {
    if (this.cacheStore !== null) {
      return Promise.resolve(this.cacheStore);
    }

    const resolver = this.cacheResolver as () => PzAccountSdkCache | Promise<PzAccountSdkCache>;

    this.cacheResolving ??= Promise.resolve()
      .then(resolver)
      .then(
        (store) => store,
        (error: unknown) => {
          if (error instanceof PzAccountSdkException) {
            this.cacheResolving = null;

            throw error;
          }

          return new PzAccountSdkMemoryCache();
        },
      )
      .then((store) => {
        this.cacheStore = store;
        this.cacheResolver = null;

        return store;
      });

    return this.cacheResolving;
  }

  private cacheGet(key: string): Promise<unknown> {
    return this.bestEffort(async () => (await this.cache()).get(key), null);
  }

  private async cachePut(key: string, value: string, ttl: number): Promise<void> {
    await this.bestEffort(async () => (await this.cache()).set(key, value, ttl), false);
  }

  /** Sem cache funcionando, o freio não tem onde ficar: libera a busca. */
  private async cacheAdd(key: string, ttl: number): Promise<boolean> {
    return Boolean(
      await this.bestEffort(async () => {
        const cache = await this.cache();

        if (cache.add !== undefined) {
          return cache.add(key, '1', ttl);
        }

        const current = await cache.get(key);

        if (current !== null && current !== undefined) {
          return false;
        }

        await cache.set(key, '1', ttl);

        return true;
      }, true),
    );
  }

  /**
   * Executa uma operação de cache engolindo falha de infraestrutura. Erro de
   * configuração do SDK continua subindo.
   */
  private async bestEffort<T>(operation: () => Promise<T>, fallback: T): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (error instanceof PzAccountSdkException) {
        throw error;
      }

      return fallback;
    }
  }

  private cacheKey(): string {
    return `pzaccountsdk:jwks:${createHash('md5').update(this.config.jwksUri()).digest('hex')}`;
  }

  private cooldownKey(): string {
    return `${this.cacheKey()}:refreshed`;
  }

  private failureKey(): string {
    return `${this.cacheKey()}:failed`;
  }
}
