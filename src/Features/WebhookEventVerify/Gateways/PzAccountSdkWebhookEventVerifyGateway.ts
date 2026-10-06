import { PzAccountSdkErrorCodeEnum } from '../../../Enum/PzAccountSdkErrorCodeEnum.js';
import { PzAccountSdkWebhookEventTypeEnum } from '../../../Enum/PzAccountSdkWebhookEventTypeEnum.js';
import { PzAccountSdkJwksUnavailableException } from '../../../Exception/PzAccountSdkJwksUnavailableException.js';
import { PzAccountSdkJwtException } from '../../../Support/PzAccountSdkJwt.js';
import { isRecord, type PzAccountSdkValues } from '../../../Support/PzAccountSdkValue.js';
import { PzAccountSdkJwtBaseGateway } from '../../Shared/Gateways/PzAccountSdkJwtBaseGateway.js';
import type { PzAccountSdkWebhookEventVerifyDto } from '../Dtos/PzAccountSdkWebhookEventVerifyDto.js';
import { PzAccountSdkWebhookEventViewDto } from '../Dtos/PzAccountSdkWebhookEventViewDto.js';

/**
 * Verifica um webhook do Puzl Account: um SET (RFC 8417) assinado em RS256
 * com a mesma chave do id_token, conferido contra o JWKS.
 *
 * Confere assinatura, exp/iat (com `leeway`), `iss`, `aud`, `sub`, `jti`,
 * `txn` e exatamente um evento em `events`, sob `{issuer}/events/`.
 *
 * Sem HTTP, exceto quando o JWKS não está em cache.
 *
 * @internal
 */
export class PzAccountSdkWebhookEventVerifyGateway extends PzAccountSdkJwtBaseGateway {
  async execute(input: PzAccountSdkWebhookEventVerifyDto): Promise<PzAccountSdkWebhookEventViewDto> {
    this.config.assertUsable();

    let claims: PzAccountSdkValues;
    let event: PzAccountSdkValues;

    try {
      claims = await this.jwks.decode(input.token.trim());
      event = this.assertClaims(claims);
    } catch (error) {
      if (error instanceof PzAccountSdkJwksUnavailableException) {
        return PzAccountSdkWebhookEventViewDto.from(
          this.buildLocalError(PzAccountSdkErrorCodeEnum.JWKS_UNAVAILABLE, error.message),
        );
      }

      if (error instanceof PzAccountSdkJwtException) {
        return PzAccountSdkWebhookEventViewDto.from(
          this.buildLocalError(PzAccountSdkErrorCodeEnum.WEBHOOK_TOKEN_INVALID, `token de webhook inválido: ${error.message}`),
        );
      }

      throw error;
    }

    return PzAccountSdkWebhookEventViewDto.from({
      ...event,
      sub: claims['sub'],
      txn: claims['txn'],
      jti: claims['jti'],
      iat: claims['iat'],
      exp: claims['exp'],
      ...this.buildLocalSuccess(),
    });
  }

  private assertClaims(claims: PzAccountSdkValues): PzAccountSdkValues {
    this.assertIssuer(claims);
    this.assertAudience(claims);

    for (const claim of ['sub', 'jti', 'txn']) {
      this.assertNonEmptyString(claims, claim);
    }

    this.assertNumeric(claims, 'iat');
    this.assertNumeric(claims, 'exp');

    const events = claims['events'];

    if (!isRecord(events) || Object.keys(events).length !== 1) {
      throw new PzAccountSdkJwtException('"events" precisa trazer exatamente um evento.');
    }

    const uri = Object.keys(events)[0] ?? '';
    const prefix = `${this.config.issuer}/events/`;

    if (!uri.startsWith(prefix) || uri.length === prefix.length) {
      throw new PzAccountSdkJwtException('URI de evento fora de {issuer}/events/.');
    }

    const data = events[uri];

    if (!isRecord(data)) {
      throw new PzAccountSdkJwtException('dados do evento precisam ser um objeto.');
    }

    return {
      event_type: PzAccountSdkWebhookEventVerifyGateway.eventTypeFromUri(uri.slice(prefix.length)),
      event_uri: uri,
      data,
    };
  }

  /**
   * A URI usa hífen (consent-revoked); o tipo público usa ponto
   * (consent.revoked). Os conhecidos saem da tabela do enum — o provedor
   * troca todo ponto por hífen —; um evento novo cai na troca simples.
   */
  private static eventTypeFromUri(slug: string): string {
    for (const eventType of PzAccountSdkWebhookEventTypeEnum.cases()) {
      if (eventType.value.replaceAll('.', '-') === slug) {
        return eventType.value;
      }
    }

    return slug.replaceAll('-', '.');
  }
}
