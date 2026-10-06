import { PzAccountSdkEnum, enumLookup } from './PzAccountSdkEnum.js';

export type PzAccountSdkWebhookEventTypeValue =
  | 'consent.revoked'
  | 'account.disabled'
  | 'account.deleted'
  | 'tokens.revoked'
  | 'email.changed';

/**
 * Eventos que o Puzl Account entrega por webhook.
 *
 * O DTO guarda o tipo como string crua: um evento novo do provedor precisa
 * chegar ao produto em vez de virar outro caso silenciosamente. Use
 * `PzAccountSdkWebhookEventViewDto.getEventType()`, que devolve `null` para
 * o que esta versão do SDK não conhece.
 */
export class PzAccountSdkWebhookEventTypeEnum extends PzAccountSdkEnum<PzAccountSdkWebhookEventTypeValue> {
  /** O usuário revogou o acesso do aplicativo à conta dele. */
  static readonly CONSENT_REVOKED = new PzAccountSdkWebhookEventTypeEnum('CONSENT_REVOKED', 'consent.revoked');
  /** A conta foi desativada. */
  static readonly ACCOUNT_DISABLED = new PzAccountSdkWebhookEventTypeEnum('ACCOUNT_DISABLED', 'account.disabled');
  /** A conta foi excluída. */
  static readonly ACCOUNT_DELETED = new PzAccountSdkWebhookEventTypeEnum('ACCOUNT_DELETED', 'account.deleted');
  /** Os tokens do usuário foram revogados (troca de senha, MFA desligado, recuperação...). */
  static readonly TOKENS_REVOKED = new PzAccountSdkWebhookEventTypeEnum('TOKENS_REVOKED', 'tokens.revoked');
  /** O e-mail da conta mudou. `data` traz `email` e `email_verified`. */
  static readonly EMAIL_CHANGED = new PzAccountSdkWebhookEventTypeEnum('EMAIL_CHANGED', 'email.changed');

  private static readonly lookup = enumLookup('PzAccountSdkWebhookEventTypeEnum', [
    PzAccountSdkWebhookEventTypeEnum.CONSENT_REVOKED,
    PzAccountSdkWebhookEventTypeEnum.ACCOUNT_DISABLED,
    PzAccountSdkWebhookEventTypeEnum.ACCOUNT_DELETED,
    PzAccountSdkWebhookEventTypeEnum.TOKENS_REVOKED,
    PzAccountSdkWebhookEventTypeEnum.EMAIL_CHANGED,
  ]);

  static cases(): readonly PzAccountSdkWebhookEventTypeEnum[] {
    return PzAccountSdkWebhookEventTypeEnum.lookup.cases();
  }

  static from(value: PzAccountSdkWebhookEventTypeEnum | PzAccountSdkWebhookEventTypeValue | string): PzAccountSdkWebhookEventTypeEnum {
    return PzAccountSdkWebhookEventTypeEnum.lookup.from(value);
  }

  static tryFrom(value: unknown): PzAccountSdkWebhookEventTypeEnum | null {
    return PzAccountSdkWebhookEventTypeEnum.lookup.tryFrom(value);
  }
}
