import type { PzAccountSdkConfig } from '../../../Support/PzAccountSdkConfig.js';
import type { PzAccountSdkFetch } from '../../../Support/PzAccountSdkHttp.js';
import type { PzAccountSdkJwksProvider } from '../../../Support/PzAccountSdkJwksProvider.js';
import { PzAccountSdkJwtException } from '../../../Support/PzAccountSdkJwt.js';
import { isNumeric, type PzAccountSdkValues } from '../../../Support/PzAccountSdkValue.js';
import { PzAccountSdkBaseGateway } from './PzAccountSdkBaseGateway.js';

/**
 * Base da verificação de JWTs do Puzl Account (id_token e webhook).
 *
 * A assinatura e as datas ficam com o `PzAccountSdkJwksProvider`; aqui ficam
 * as checagens de claims comuns aos dois: emissor e audiência. Cada falha é
 * uma `PzAccountSdkJwtException` com o motivo — o gateway a converte em
 * resultado, nunca a deixa escapar.
 *
 * @internal
 */
export abstract class PzAccountSdkJwtBaseGateway extends PzAccountSdkBaseGateway {
  constructor(
    config: PzAccountSdkConfig,
    fetchFn: PzAccountSdkFetch,
    protected readonly jwks: PzAccountSdkJwksProvider,
  ) {
    super(config, fetchFn);
  }

  protected assertIssuer(claims: PzAccountSdkValues): void {
    if (claims['iss'] !== this.config.issuer) {
      throw new PzAccountSdkJwtException('iss diferente do issuer configurado.');
    }
  }

  /**
   * `aud` pode ser string ou lista. Com mais de uma audiência, o OIDC exige
   * `azp`; e, presente, ele precisa ser o client_id (Core 3.1.3.7) — senão o
   * token foi feito para outro app.
   */
  protected assertAudience(claims: PzAccountSdkValues): void {
    const audience = claims['aud'];
    const audiences: unknown[] = Array.isArray(audience) ? audience : [audience ?? null];

    if (!audiences.includes(this.config.clientId)) {
      throw new PzAccountSdkJwtException('aud não contém o client_id configurado.');
    }

    const azp = claims['azp'] ?? null;

    if ((audiences.length > 1 || azp !== null) && azp !== this.config.clientId) {
      throw new PzAccountSdkJwtException('azp ausente ou diferente do client_id.');
    }
  }

  protected assertNonEmptyString(claims: PzAccountSdkValues, claim: string): void {
    const value = claims[claim];

    if (typeof value !== 'string' || value === '') {
      throw new PzAccountSdkJwtException(`claim "${claim}" ausente.`);
    }
  }

  protected assertNumeric(claims: PzAccountSdkValues, claim: string): void {
    if (!isNumeric(claims[claim])) {
      throw new PzAccountSdkJwtException(`claim "${claim}" ausente.`);
    }
  }
}
