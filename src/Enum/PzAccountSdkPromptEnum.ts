import { PzAccountSdkEnum, enumLookup } from './PzAccountSdkEnum.js';

export type PzAccountSdkPromptValue =
  | 'none'
  | 'login'
  | 'consent'
  | 'select_account'
  | 'create';

/**
 * Valores aceitos no parâmetro `prompt` do /oauth/authorize.
 */
export class PzAccountSdkPromptEnum extends PzAccountSdkEnum<PzAccountSdkPromptValue> {
  /** Não mostra tela nenhuma: sem sessão no provedor, volta com `login_required`. */
  static readonly NONE = new PzAccountSdkPromptEnum('NONE', 'none');
  /** Pede a senha de novo, mesmo havendo sessão. */
  static readonly LOGIN = new PzAccountSdkPromptEnum('LOGIN', 'login');
  /** Mostra a tela de consentimento mesmo já havendo um. */
  static readonly CONSENT = new PzAccountSdkPromptEnum('CONSENT', 'consent');
  /** Mostra a escolha de conta. */
  static readonly SELECT_ACCOUNT = new PzAccountSdkPromptEnum('SELECT_ACCOUNT', 'select_account');
  /** Abre direto o cadastro em vez do login ("Criar conta Puzl"). */
  static readonly CREATE = new PzAccountSdkPromptEnum('CREATE', 'create');

  private static readonly lookup = enumLookup('PzAccountSdkPromptEnum', [
    PzAccountSdkPromptEnum.NONE,
    PzAccountSdkPromptEnum.LOGIN,
    PzAccountSdkPromptEnum.CONSENT,
    PzAccountSdkPromptEnum.SELECT_ACCOUNT,
    PzAccountSdkPromptEnum.CREATE,
  ]);

  static cases(): readonly PzAccountSdkPromptEnum[] {
    return PzAccountSdkPromptEnum.lookup.cases();
  }

  static from(value: PzAccountSdkPromptEnum | PzAccountSdkPromptValue | string): PzAccountSdkPromptEnum {
    return PzAccountSdkPromptEnum.lookup.from(value);
  }

  static tryFrom(value: unknown): PzAccountSdkPromptEnum | null {
    return PzAccountSdkPromptEnum.lookup.tryFrom(value);
  }
}
