import { PzAccountSdkWebhookEventTypeEnum } from '../../../Enum/PzAccountSdkWebhookEventTypeEnum.js';
import { pullArray, pullInt, pullString, valuesOf, type PzAccountSdkValues } from '../../../Support/PzAccountSdkDto.js';
import { PzAccountSdkResultDto, type PzAccountSdkResultFields } from '../../Shared/Dtos/PzAccountSdkResultDto.js';

export interface PzAccountSdkWebhookEventViewFields extends PzAccountSdkResultFields {
  /** ex.: consent.revoked — valor de PzAccountSdkWebhookEventTypeEnum */
  event_type: string;
  /** URI do evento como veio no token, ex.: {issuer}/events/consent-revoked */
  event_uri: string;
  sub: string;
  txn: string;
  jti: string;
  iat: number;
  exp: number;
  data: PzAccountSdkValues;
}

/**
 * Evento de webhook JÁ VERIFICADO (Security Event Token, RFC 8417).
 *
 * - `txn` identifica o evento e se repete nas reentregas: use-o como chave de
 *   idempotência. `jti` muda a cada tentativa.
 * - `sub` é o usuário afetado.
 * - `data` é vazio em todos os eventos, exceto `email.changed`, que traz
 *   `email` e `email_verified`.
 */
export class PzAccountSdkWebhookEventViewDto extends PzAccountSdkResultDto {
  readonly event_type: string;
  readonly event_uri: string;
  readonly sub: string;
  readonly txn: string;
  readonly jti: string;
  readonly iat: number;
  readonly exp: number;
  readonly data: PzAccountSdkValues;

  constructor(props: Partial<PzAccountSdkWebhookEventViewFields> = {}) {
    super(props);
    this.event_type = props.event_type ?? '';
    this.event_uri = props.event_uri ?? '';
    this.sub = props.sub ?? '';
    this.txn = props.txn ?? '';
    this.jti = props.jti ?? '';
    this.iat = props.iat ?? 0;
    this.exp = props.exp ?? 0;
    this.data = props.data ?? {};
  }

  static override from(values: unknown): PzAccountSdkWebhookEventViewDto {
    const v = valuesOf(values);

    return new PzAccountSdkWebhookEventViewDto({
      ...PzAccountSdkResultDto.resultArgs(v),
      event_type: pullString(v, 'event_type'),
      event_uri: pullString(v, 'event_uri'),
      sub: pullString(v, 'sub'),
      txn: pullString(v, 'txn'),
      jti: pullString(v, 'jti'),
      iat: pullInt(v, 'iat'),
      exp: pullInt(v, 'exp'),
      data: pullArray(v, 'data'),
    });
  }

  /**
   * Tipo do evento como enum, ou `null` quando houve erro ou o evento é
   * novo demais para esta versão do SDK — responda 2xx e ignore.
   */
  getEventType(): PzAccountSdkWebhookEventTypeEnum | null {
    return PzAccountSdkWebhookEventTypeEnum.tryFrom(this.event_type);
  }

  override toArray(): PzAccountSdkValues {
    return {
      ...super.toArray(),
      event_type: this.event_type,
      event_uri: this.event_uri,
      sub: this.sub,
      txn: this.txn,
      jti: this.jti,
      iat: this.iat,
      exp: this.exp,
      data: this.data,
    };
  }
}
