import { PzAccountSdkException } from './PzAccountSdkException.js';

/**
 * Configuração ausente ou inválida no projeto que instalou o SDK.
 *
 * A mensagem cita a opção e a variável de ambiente exatas: quem vê o erro
 * normalmente está integrando o pacote pela primeira vez, e "config inválida"
 * sem o nome da chave transforma um ajuste de trinta segundos numa caça ao
 * tesouro.
 */
export class PzAccountSdkConfigurationException extends PzAccountSdkException {
  /**
   * @param optionKey opção do client (ex.: 'clientId')
   * @param envKey variável de ambiente correspondente (ex.: 'PUZL_ACCOUNT_CLIENT_ID')
   */
  static missing(optionKey: string, envKey: string): PzAccountSdkConfigurationException {
    return new PzAccountSdkConfigurationException(
      `PzAccountSdk: a configuração "${optionKey}" está vazia. Defina ${envKey} no .env do projeto.`,
    );
  }

  static invalid(optionKey: string, envKey: string, accepted: string): PzAccountSdkConfigurationException {
    return new PzAccountSdkConfigurationException(
      `PzAccountSdk: a configuração "${optionKey}" tem um valor inválido. Defina ${envKey} com um de: ${accepted}.`,
    );
  }
}
