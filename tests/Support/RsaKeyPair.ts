import { generateKeyPairSync, sign, type KeyObject } from 'node:crypto';

const cache = new Map<string, { privateKey: KeyObject; publicKey: KeyObject }>();

/**
 * Par RSA de teste que assina JWTs RS256 e publica o JWKS correspondente.
 * As chaves ficam em cache por `kid`: gerar RSA é lento.
 */
export class RsaKeyPair {
  private constructor(
    readonly kid: string,
    private readonly privateKey: KeyObject,
    private readonly publicKey: KeyObject,
  ) {}

  static forKid(kid: string): RsaKeyPair {
    let pair = cache.get(kid);

    if (pair === undefined) {
      pair = generateKeyPairSync('rsa', { modulusLength: 2048 });
      cache.set(kid, pair);
    }

    return new RsaKeyPair(kid, pair.privateKey, pair.publicKey);
  }

  static jwks(...pairs: RsaKeyPair[]): { keys: Record<string, unknown>[] } {
    return { keys: pairs.map((pair) => pair.jwk()) };
  }

  /** JWT RS256; `header` sobrescreve o cabeçalho (ex.: `kid` forjado, `alg`). */
  sign(claims: Record<string, unknown>, header: Record<string, unknown> = {}): string {
    const head = Buffer.from(JSON.stringify({ typ: 'JWT', alg: 'RS256', kid: this.kid, ...header })).toString('base64url');
    const body = Buffer.from(JSON.stringify(claims)).toString('base64url');
    const signature = sign('RSA-SHA256', Buffer.from(`${head}.${body}`), this.privateKey).toString('base64url');

    return `${head}.${body}.${signature}`;
  }

  jwk(): Record<string, unknown> {
    const { n, e } = this.publicKey.export({ format: 'jwk' });

    return { kty: 'RSA', use: 'sig', alg: 'RS256', kid: this.kid, n, e };
  }

  /** O módulo cru — usado para forjar um HS256 "assinado com a chave pública". */
  modulus(): string {
    return String(this.publicKey.export({ format: 'jwk' }).n);
  }
}
