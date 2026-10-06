import { PzAccountSdkException } from './PzAccountSdkException.js';

/**
 * As chaves públicas (JWKS) do Puzl Account não puderam ser obtidas.
 *
 * Uso interno: nunca escapa do SDK. Os gateways de verificação a capturam e
 * devolvem `JWKS_UNAVAILABLE` no DTO de retorno, como qualquer outra falha.
 *
 * @internal
 */
export class PzAccountSdkJwksUnavailableException extends PzAccountSdkException {
  static fromStatus(statusCode: number, statusText: string): PzAccountSdkJwksUnavailableException {
    return new PzAccountSdkJwksUnavailableException(
      `PzAccountSdk: não foi possível obter o JWKS do Puzl Account (HTTP ${statusCode} ${statusText}).`,
    );
  }

  static recentFailure(seconds: number): PzAccountSdkJwksUnavailableException {
    return new PzAccountSdkJwksUnavailableException(
      `PzAccountSdk: o JWKS do Puzl Account falhou há menos de ${seconds} segundos; nova tentativa em seguida.`,
    );
  }

  static invalidKeySet(reason: string): PzAccountSdkJwksUnavailableException {
    return new PzAccountSdkJwksUnavailableException(`PzAccountSdk: o JWKS do Puzl Account é inválido: ${reason}`);
  }
}
