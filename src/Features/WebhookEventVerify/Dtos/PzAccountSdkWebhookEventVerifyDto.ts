import { PzAccountSdkDto, mask, pullString, valuesOf, type PzAccountSdkValues } from '../../../Support/PzAccountSdkDto.js';

export interface PzAccountSdkWebhookEventVerifyInput {
  /** o corpo cru do POST */
  token: string;
}

/**
 * Entrada de `webhookEventVerify`: o corpo cru do POST que o Puzl Account
 * enviou (`Content-Type: application/secevent+jwt`). No Express, leia com
 * `express.text({ type: 'application/secevent+jwt' })` e passe `req.body`.
 */
export class PzAccountSdkWebhookEventVerifyDto extends PzAccountSdkDto {
  readonly token: string;

  constructor(props: PzAccountSdkWebhookEventVerifyInput) {
    super();
    this.token = props.token;
  }

  static from(values: unknown): PzAccountSdkWebhookEventVerifyDto {
    return new PzAccountSdkWebhookEventVerifyDto({ token: pullString(valuesOf(values), 'token') });
  }

  toArray(): PzAccountSdkValues {
    return { token: mask(this.token) };
  }
}
