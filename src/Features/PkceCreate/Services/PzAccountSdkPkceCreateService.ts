import { randomBytes } from 'node:crypto';
import { base64UrlEncode, sha256 } from '../../../Support/PzAccountSdkJwt.js';
import { PzAccountSdkPkceViewDto } from '../Dtos/PzAccountSdkPkceViewDto.js';

/**
 * Gera state, nonce e o par code_verifier/code_challenge (RFC 7636, S256).
 *
 * Local, sem HTTP. Tudo sai de `randomBytes` em base64url.
 *
 * @internal
 */
export class PzAccountSdkPkceCreateService {
  /** 32 bytes → 43 caracteres em base64url. */
  private static readonly STATE_BYTES = 32;

  /** 64 bytes → 86 caracteres: dentro dos 43..128 que a RFC 7636 exige. */
  private static readonly VERIFIER_BYTES = 64;

  execute(): PzAccountSdkPkceViewDto {
    const verifier = PzAccountSdkPkceCreateService.random(PzAccountSdkPkceCreateService.VERIFIER_BYTES);

    return new PzAccountSdkPkceViewDto({
      state: PzAccountSdkPkceCreateService.random(PzAccountSdkPkceCreateService.STATE_BYTES),
      nonce: PzAccountSdkPkceCreateService.random(PzAccountSdkPkceCreateService.STATE_BYTES),
      code_verifier: verifier,
      code_challenge: PzAccountSdkPkceCreateService.challengeFor(verifier),
    });
  }

  /** S256: base64url(sha256(verifier)), sem padding. */
  static challengeFor(codeVerifier: string): string {
    return base64UrlEncode(sha256(codeVerifier));
  }

  private static random(bytes: number): string {
    return base64UrlEncode(randomBytes(bytes));
  }
}
