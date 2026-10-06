/**
 * Raiz das exceções do SDK.
 *
 * Falha do Puzl Account NÃO passa por aqui: erro de credencial, validação ou
 * indisponibilidade chega no retorno, em `PzAccountSdkResultDto.has_error`.
 * O que herda desta classe é erro de integração — configuração ausente,
 * uso indevido da API do SDK.
 */
export abstract class PzAccountSdkException extends Error {
  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}
