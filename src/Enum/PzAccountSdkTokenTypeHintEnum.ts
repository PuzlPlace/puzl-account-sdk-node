import { PzAccountSdkEnum, enumLookup } from './PzAccountSdkEnum.js';

export type PzAccountSdkTokenTypeHintValue =
  | 'access_token'
  | 'refresh_token';

/**
 * Dica do tipo de token no /oauth/revoke (RFC 7009).
 */
export class PzAccountSdkTokenTypeHintEnum extends PzAccountSdkEnum<PzAccountSdkTokenTypeHintValue> {
  static readonly ACCESS_TOKEN = new PzAccountSdkTokenTypeHintEnum('ACCESS_TOKEN', 'access_token');
  /** Revogar o refresh token derruba a família inteira e os access tokens dela. */
  static readonly REFRESH_TOKEN = new PzAccountSdkTokenTypeHintEnum('REFRESH_TOKEN', 'refresh_token');

  private static readonly lookup = enumLookup('PzAccountSdkTokenTypeHintEnum', [
    PzAccountSdkTokenTypeHintEnum.ACCESS_TOKEN,
    PzAccountSdkTokenTypeHintEnum.REFRESH_TOKEN,
  ]);

  static cases(): readonly PzAccountSdkTokenTypeHintEnum[] {
    return PzAccountSdkTokenTypeHintEnum.lookup.cases();
  }

  static from(value: PzAccountSdkTokenTypeHintEnum | PzAccountSdkTokenTypeHintValue | string): PzAccountSdkTokenTypeHintEnum {
    return PzAccountSdkTokenTypeHintEnum.lookup.from(value);
  }

  static tryFrom(value: unknown): PzAccountSdkTokenTypeHintEnum | null {
    return PzAccountSdkTokenTypeHintEnum.lookup.tryFrom(value);
  }
}
