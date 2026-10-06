import { createPublicKey, createHash, verify, type KeyObject } from 'node:crypto';
import { isNumeric, isRecord, isScalar, scalarToString, type PzAccountSdkValues } from './PzAccountSdkValue.js';

/**
 * Erro de verificação de JWT: token malformado, assinatura inválida, datas
 * fora da janela. É o `UnexpectedValueException` do SDK PHP — os gateways o
 * convertem em resultado, nunca o deixam escapar.
 *
 * @internal
 */
export class PzAccountSdkJwtException extends Error {
  override readonly name = 'PzAccountSdkJwtException';
}

/** Chave pública já pronta para verificar, com o algoritmo que ela aceita. */
export interface PzAccountSdkJwtKey {
  readonly alg: string;
  readonly key: KeyObject;
}

const SUPPORTED_ALGS = ['RS256'] as const;
const MIN_RSA_BITS = 2048;

/**
 * Alfabeto estrito do base64url. O decodificador do Node ignora caractere
 * inválido em silêncio: sem esta checagem, `token + "!!"` também validaria.
 */
const BASE64URL = /^[A-Za-z0-9_-]*$/;

export function base64UrlEncode(value: Buffer | string): string {
  return Buffer.from(value).toString('base64url');
}

export function base64UrlDecode(value: string): Buffer {
  return Buffer.from(value, 'base64url');
}

export function sha256(value: string): Buffer {
  return createHash('sha256').update(value).digest();
}

function decodeJson(segment: string): unknown {
  try {
    return JSON.parse(base64UrlDecode(segment).toString('utf8'));
  } catch {
    return null;
  }
}

/**
 * Lê o header sem verificar nada — serve só para escolher a chave e recusar
 * cedo o algoritmo errado.
 */
export function jwtHeader(jwt: string): PzAccountSdkValues | null {
  const segments = jwt.split('.');
  const header = segments.length === 3 ? decodeJson(segments[0] ?? '') : null;

  return isRecord(header) && !Array.isArray(header) ? header : null;
}

/**
 * Converte o JWKS em chaves públicas, indexadas por `kid` (ou pela posição,
 * quando a chave não tem `kid`). Chaves de tipo não suportado são ignoradas.
 *
 * @throws PzAccountSdkJwtException conjunto inválido
 */
export function parseKeySet(jwks: PzAccountSdkValues, defaultAlg: string): Map<string, PzAccountSdkJwtKey> {
  const keys = new Map<string, PzAccountSdkJwtKey>();
  const list = jwks['keys'];

  if (!isRecord(list)) {
    throw new PzAccountSdkJwtException('JWK Set did not contain any keys');
  }

  Object.entries(list).forEach(([index, jwk]) => {
    if (!isRecord(jwk)) {
      throw new PzAccountSdkJwtException('JWK must be an object');
    }

    if (jwk['kty'] === undefined || jwk['kty'] === '') {
      throw new PzAccountSdkJwtException('JWK must contain a "kty" parameter');
    }

    if (jwk['kty'] !== 'RSA') {
      return;
    }

    if (jwk['d'] !== undefined) {
      throw new PzAccountSdkJwtException('RSA private keys are not supported');
    }

    if (typeof jwk['n'] !== 'string' || typeof jwk['e'] !== 'string') {
      throw new PzAccountSdkJwtException('RSA keys must contain values for both "n" and "e"');
    }

    let key: KeyObject;

    try {
      key = createPublicKey({ key: { kty: 'RSA', n: jwk['n'], e: jwk['e'] }, format: 'jwk' });
    } catch (error) {
      throw new PzAccountSdkJwtException(`invalid RSA key: ${(error as Error).message}`);
    }

    // `kid` numérico vale como string, como no PHP.
    const kid = isScalar(jwk['kid']) && scalarToString(jwk['kid']) !== '' ? scalarToString(jwk['kid']) : index;
    const alg = typeof jwk['alg'] === 'string' && jwk['alg'] !== '' ? jwk['alg'] : defaultAlg;

    keys.set(kid, { alg, key });
  });

  if (keys.size === 0) {
    throw new PzAccountSdkJwtException('No supported algorithms found in JWK Set');
  }

  return keys;
}

/**
 * Verifica assinatura e datas (`nbf`, `iat`, `exp`, com tolerância de
 * `leeway` segundos) e devolve os claims. Emissor, audiência e o resto ficam
 * com quem chama, que sabe o que esperar.
 *
 * @throws PzAccountSdkJwtException
 */
export function jwtDecode(jwt: string, key: PzAccountSdkJwtKey, leeway: number, now = Date.now() / 1000): PzAccountSdkValues {
  const segments = jwt.split('.');

  if (segments.length !== 3) {
    throw new PzAccountSdkJwtException('Wrong number of segments');
  }

  if (!segments.every((segment) => BASE64URL.test(segment))) {
    throw new PzAccountSdkJwtException('Invalid base64url encoding');
  }

  const [headB64 = '', bodyB64 = '', cryptoB64 = ''] = segments;
  const header = decodeJson(headB64);

  if (!isRecord(header) || Array.isArray(header)) {
    throw new PzAccountSdkJwtException('Invalid header encoding');
  }

  const payload = decodeJson(bodyB64);

  if (payload === null) {
    throw new PzAccountSdkJwtException('Invalid claims encoding');
  }

  if (!isRecord(payload) || Array.isArray(payload)) {
    throw new PzAccountSdkJwtException('Payload must be a JSON object');
  }

  // `null` vale como ausente, como o `isset()` do PHP.
  for (const claim of ['iat', 'nbf', 'exp']) {
    if (payload[claim] !== undefined && payload[claim] !== null && !isNumeric(payload[claim])) {
      throw new PzAccountSdkJwtException(`Payload ${claim} must be a number`);
    }
  }

  const alg = header['alg'];

  if (typeof alg !== 'string' || alg === '') {
    throw new PzAccountSdkJwtException('Empty algorithm');
  }

  if (!(SUPPORTED_ALGS as readonly string[]).includes(alg)) {
    throw new PzAccountSdkJwtException('Algorithm not supported');
  }

  if (key.alg !== alg) {
    throw new PzAccountSdkJwtException('Incorrect key for this algorithm');
  }

  if ((key.key.asymmetricKeyDetails?.modulusLength ?? 0) < MIN_RSA_BITS) {
    throw new PzAccountSdkJwtException('Provided key is too short');
  }

  const valid = verify('RSA-SHA256', Buffer.from(`${headB64}.${bodyB64}`), key.key, base64UrlDecode(cryptoB64));

  if (!valid) {
    throw new PzAccountSdkJwtException('Signature verification failed');
  }

  const nbf = payload['nbf'] ?? undefined;
  const iat = payload['iat'] ?? undefined;
  const exp = payload['exp'] ?? undefined;

  if (nbf !== undefined && Math.floor(Number(nbf)) > now + leeway) {
    throw new PzAccountSdkJwtException(`Cannot handle token with nbf prior to ${isoDate(Number(nbf))}`);
  }

  if (nbf === undefined && iat !== undefined && Math.floor(Number(iat)) > now + leeway) {
    throw new PzAccountSdkJwtException(`Cannot handle token with iat prior to ${isoDate(Number(iat))}`);
  }

  if (exp !== undefined && now - leeway >= Number(exp)) {
    throw new PzAccountSdkJwtException('Expired token');
  }

  return payload;
}

function isoDate(seconds: number): string {
  const date = new Date(Math.floor(seconds) * 1000);

  // Data fora do alcance do `Date` (ex.: nbf 1e20) não pode virar RangeError.
  return Number.isNaN(date.getTime()) ? String(seconds) : date.toISOString();
}
