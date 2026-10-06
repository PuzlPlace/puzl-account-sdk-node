import { PzAccountSdkEnum, enumLookup } from './PzAccountSdkEnum.js';

export type PzAccountSdkAccountPageValue =
  | '/'
  | '/account/profile'
  | '/account/picture'
  | '/account/password'
  | '/account/login-methods'
  | '/account/mfa/enroll'
  | '/account/delete';

/**
 * Telas da conta no Puzl Account para onde o produto pode mandar o usuário.
 * O valor é o caminho a partir do issuer.
 */
export class PzAccountSdkAccountPageEnum extends PzAccountSdkEnum<PzAccountSdkAccountPageValue> {
  static readonly HOME = new PzAccountSdkAccountPageEnum('HOME', '/');
  static readonly PROFILE = new PzAccountSdkAccountPageEnum('PROFILE', '/account/profile');
  static readonly PICTURE = new PzAccountSdkAccountPageEnum('PICTURE', '/account/picture');
  static readonly PASSWORD = new PzAccountSdkAccountPageEnum('PASSWORD', '/account/password');
  static readonly LOGIN_METHODS = new PzAccountSdkAccountPageEnum('LOGIN_METHODS', '/account/login-methods');
  static readonly MFA_ENROLL = new PzAccountSdkAccountPageEnum('MFA_ENROLL', '/account/mfa/enroll');
  static readonly DELETE = new PzAccountSdkAccountPageEnum('DELETE', '/account/delete');

  private static readonly lookup = enumLookup('PzAccountSdkAccountPageEnum', [
    PzAccountSdkAccountPageEnum.HOME,
    PzAccountSdkAccountPageEnum.PROFILE,
    PzAccountSdkAccountPageEnum.PICTURE,
    PzAccountSdkAccountPageEnum.PASSWORD,
    PzAccountSdkAccountPageEnum.LOGIN_METHODS,
    PzAccountSdkAccountPageEnum.MFA_ENROLL,
    PzAccountSdkAccountPageEnum.DELETE,
  ]);

  static cases(): readonly PzAccountSdkAccountPageEnum[] {
    return PzAccountSdkAccountPageEnum.lookup.cases();
  }

  static from(value: PzAccountSdkAccountPageEnum | PzAccountSdkAccountPageValue | string): PzAccountSdkAccountPageEnum {
    return PzAccountSdkAccountPageEnum.lookup.from(value);
  }

  static tryFrom(value: unknown): PzAccountSdkAccountPageEnum | null {
    return PzAccountSdkAccountPageEnum.lookup.tryFrom(value);
  }
}
