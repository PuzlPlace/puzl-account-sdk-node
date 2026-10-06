import { PzAccountSdkErrorCodeEnum } from '../../../Enum/PzAccountSdkErrorCodeEnum.js';
import { PzAccountSdkJwksUnavailableException } from '../../../Exception/PzAccountSdkJwksUnavailableException.js';
import { hashEquals } from '../../../Support/PzAccountSdkHashEquals.js';
import { base64UrlEncode, PzAccountSdkJwtException, sha256 } from '../../../Support/PzAccountSdkJwt.js';
import type { PzAccountSdkValues } from '../../../Support/PzAccountSdkValue.js';
import { PzAccountSdkJwtBaseGateway } from '../../Shared/Gateways/PzAccountSdkJwtBaseGateway.js';
import type { PzAccountSdkIdTokenVerifyDto } from '../Dtos/PzAccountSdkIdTokenVerifyDto.js';
import { PzAccountSdkIdentityViewDto } from '../Dtos/PzAccountSdkIdentityViewDto.js';

/**
 * Verifica um id_token (OIDC Core 3.1.3.7) contra o JWKS do Puzl Account.
 *
 * Confere, nesta ordem: RS256 e assinatura pela chave do `kid`; exp/iat com
 * `leeway`; `iss`; `aud`/`azp`; `sub`; ausência de `events` (um token de
 * webhook não pode se passar por id_token); `nonce` (obrigatório, salvo
 * password grant); e `at_hash` (quando o access_token é informado).
 *
 * Sem HTTP, exceto quando o JWKS não está em cache.
 *
 * @internal
 */
export class PzAccountSdkIdTokenVerifyGateway extends PzAccountSdkJwtBaseGateway {
  async execute(input: PzAccountSdkIdTokenVerifyDto): Promise<PzAccountSdkIdentityViewDto> {
    this.config.assertUsable();

    let claims: PzAccountSdkValues;

    try {
      claims = await this.jwks.decode(input.id_token.trim());
      this.assertClaims(claims, input);
    } catch (error) {
      if (error instanceof PzAccountSdkJwksUnavailableException) {
        return PzAccountSdkIdentityViewDto.from(
          this.buildLocalError(PzAccountSdkErrorCodeEnum.JWKS_UNAVAILABLE, error.message),
        );
      }

      if (error instanceof PzAccountSdkJwtException) {
        return PzAccountSdkIdentityViewDto.from(
          this.buildLocalError(PzAccountSdkErrorCodeEnum.ID_TOKEN_INVALID, `id_token inválido: ${error.message}`),
        );
      }

      throw error;
    }

    return PzAccountSdkIdentityViewDto.from({ ...claims, claims, ...this.buildLocalSuccess() });
  }

  private assertClaims(claims: PzAccountSdkValues, input: PzAccountSdkIdTokenVerifyDto): void {
    this.assertIssuer(claims);
    this.assertAudience(claims);
    this.assertNonEmptyString(claims, 'sub');
    this.assertNumeric(claims, 'exp');
    this.assertNumeric(claims, 'iat');

    if (Object.hasOwn(claims, 'events')) {
      throw new PzAccountSdkJwtException('o token é um evento de webhook, não um id_token.');
    }

    if (input.require_nonce) {
      const nonce = claims['nonce'];

      if (typeof nonce !== 'string' || !hashEquals(input.nonce, nonce)) {
        throw new PzAccountSdkJwtException('nonce diferente do esperado.');
      }
    }

    if (input.access_token !== '') {
      // O Puzl Account sempre emite `at_hash` junto do access token.
      const atHash = claims['at_hash'];
      const expected = base64UrlEncode(sha256(input.access_token).subarray(0, 16));

      if (typeof atHash !== 'string' || !hashEquals(expected, atHash)) {
        throw new PzAccountSdkJwtException('at_hash ausente ou diferente do access_token.');
      }
    }
  }
}
