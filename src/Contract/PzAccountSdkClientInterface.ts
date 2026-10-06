import type { PzAccountSdkAccountPageEnum, PzAccountSdkAccountPageValue } from '../Enum/PzAccountSdkAccountPageEnum.js';
import type { PzAccountSdkAuthorizeUrlDto, PzAccountSdkAuthorizeUrlInput } from '../Features/AuthorizeUrl/Dtos/PzAccountSdkAuthorizeUrlDto.js';
import type { PzAccountSdkDiscoveryViewDto } from '../Features/DiscoveryShow/Dtos/PzAccountSdkDiscoveryViewDto.js';
import type { PzAccountSdkIdentityViewDto } from '../Features/IdTokenVerify/Dtos/PzAccountSdkIdentityViewDto.js';
import type { PzAccountSdkIdTokenVerifyDto, PzAccountSdkIdTokenVerifyInput } from '../Features/IdTokenVerify/Dtos/PzAccountSdkIdTokenVerifyDto.js';
import type { PzAccountSdkLogoutUrlDto, PzAccountSdkLogoutUrlInput } from '../Features/LogoutUrl/Dtos/PzAccountSdkLogoutUrlDto.js';
import type { PzAccountSdkConsentListViewDto } from '../Features/MeConsentList/Dtos/PzAccountSdkConsentListViewDto.js';
import type { PzAccountSdkMeConsentRevokeDto, PzAccountSdkMeConsentRevokeInput } from '../Features/MeConsentRevoke/Dtos/PzAccountSdkMeConsentRevokeDto.js';
import type { PzAccountSdkMeEmailChangeDto, PzAccountSdkMeEmailChangeInput } from '../Features/MeEmailChange/Dtos/PzAccountSdkMeEmailChangeDto.js';
import type { PzAccountSdkMeMfaDisableDto, PzAccountSdkMeMfaDisableInput } from '../Features/MeMfaDisable/Dtos/PzAccountSdkMeMfaDisableDto.js';
import type { PzAccountSdkMeMfaEnrollDto, PzAccountSdkMeMfaEnrollInput } from '../Features/MeMfaEnroll/Dtos/PzAccountSdkMeMfaEnrollDto.js';
import type { PzAccountSdkMfaEnrollViewDto } from '../Features/MeMfaEnroll/Dtos/PzAccountSdkMfaEnrollViewDto.js';
import type { PzAccountSdkMeMfaEnrollConfirmDto, PzAccountSdkMeMfaEnrollConfirmInput } from '../Features/MeMfaEnrollConfirm/Dtos/PzAccountSdkMeMfaEnrollConfirmDto.js';
import type {
  PzAccountSdkMeMfaRecoveryCodesRegenerateDto,
  PzAccountSdkMeMfaRecoveryCodesRegenerateInput,
} from '../Features/MeMfaRecoveryCodesRegenerate/Dtos/PzAccountSdkMeMfaRecoveryCodesRegenerateDto.js';
import type { PzAccountSdkMfaStatusViewDto } from '../Features/MeMfaShow/Dtos/PzAccountSdkMfaStatusViewDto.js';
import type { PzAccountSdkMePasswordChangeDto, PzAccountSdkMePasswordChangeInput } from '../Features/MePasswordChange/Dtos/PzAccountSdkMePasswordChangeDto.js';
import type { PzAccountSdkMePicturePresetSetDto, PzAccountSdkMePicturePresetSetInput } from '../Features/MePicturePresetSet/Dtos/PzAccountSdkMePicturePresetSetDto.js';
import type { PzAccountSdkMePictureUploadDto, PzAccountSdkMePictureUploadInput } from '../Features/MePictureUpload/Dtos/PzAccountSdkMePictureUploadDto.js';
import type { PzAccountSdkMeUpdateDto, PzAccountSdkMeUpdateInput } from '../Features/MeUpdate/Dtos/PzAccountSdkMeUpdateDto.js';
import type { PzAccountSdkPkceViewDto } from '../Features/PkceCreate/Dtos/PzAccountSdkPkceViewDto.js';
import type { PzAccountSdkAccessTokenDto, PzAccountSdkAccessTokenInput } from '../Features/Shared/Dtos/PzAccountSdkAccessTokenDto.js';
import type { PzAccountSdkMfaRecoveryCodesViewDto } from '../Features/Shared/Dtos/PzAccountSdkMfaRecoveryCodesViewDto.js';
import type { PzAccountSdkResultDto } from '../Features/Shared/Dtos/PzAccountSdkResultDto.js';
import type { PzAccountSdkTokenViewDto } from '../Features/Shared/Dtos/PzAccountSdkTokenViewDto.js';
import type { PzAccountSdkUserProfileViewDto } from '../Features/Shared/Dtos/PzAccountSdkUserProfileViewDto.js';
import type { PzAccountSdkTokenExchangeCodeDto, PzAccountSdkTokenExchangeCodeInput } from '../Features/TokenExchangeCode/Dtos/PzAccountSdkTokenExchangeCodeDto.js';
import type { PzAccountSdkTokenPasswordDto, PzAccountSdkTokenPasswordInput } from '../Features/TokenPassword/Dtos/PzAccountSdkTokenPasswordDto.js';
import type { PzAccountSdkTokenRefreshDto, PzAccountSdkTokenRefreshInput } from '../Features/TokenRefresh/Dtos/PzAccountSdkTokenRefreshDto.js';
import type { PzAccountSdkTokenRevokeDto, PzAccountSdkTokenRevokeInput } from '../Features/TokenRevoke/Dtos/PzAccountSdkTokenRevokeDto.js';
import type { PzAccountSdkUserInfoViewDto } from '../Features/UserInfoShow/Dtos/PzAccountSdkUserInfoViewDto.js';
import type { PzAccountSdkUserRegisterDto, PzAccountSdkUserRegisterInput } from '../Features/UserRegister/Dtos/PzAccountSdkUserRegisterDto.js';
import type { PzAccountSdkWebhookEventViewDto } from '../Features/WebhookEventVerify/Dtos/PzAccountSdkWebhookEventViewDto.js';
import type { PzAccountSdkWebhookEventVerifyDto, PzAccountSdkWebhookEventVerifyInput } from '../Features/WebhookEventVerify/Dtos/PzAccountSdkWebhookEventVerifyDto.js';

/**
 * Contrato público do SDK do Puzl Account — congelado por semver.
 *
 * Nenhum método lança exceção por falha do Puzl Account: erro de credencial,
 * validação, token inválido ou indisponibilidade chegam no DTO de retorno, em
 * `has_error`. Exceção só existe para erro de integração, não de execução:
 * `PzAccountSdkConfigurationException` (configuração ausente) e `TypeError`
 * (uso indevido — nonce vazio, preset ou tela inexistente, foto ilegível).
 * Nos métodos `async`, elas chegam como Promise rejeitada.
 *
 * Cada método aceita o DTO de entrada ou um objeto simples com os mesmos
 * campos (`{ code, code_verifier }`).
 *
 * Transformar a falha em resposta HTTP é decisão do produto que consome.
 */
export interface PzAccountSdkClientInterface {
  /**
   * issuer, clientId e (salvo client público) clientSecret estão
   * preenchidos? Não faz HTTP nem lança exceção.
   */
  isConfigured(): boolean;

  // OIDC — construtores locais, sem HTTP

  /** Gera state, nonce e o par PKCE (S256) de uma tentativa de login. Local. */
  pkceCreate(): PzAccountSdkPkceViewDto;

  /** URL do /oauth/authorize para onde mandar o navegador. Local. */
  authorizeUrl(input: PzAccountSdkAuthorizeUrlDto | PzAccountSdkAuthorizeUrlInput): string;

  /** URL do /oauth/logout, que encerra a sessão no provedor. Local. */
  logoutUrl(input: PzAccountSdkLogoutUrlDto | PzAccountSdkLogoutUrlInput): string;

  /** URL de uma tela da conta no Puzl Account. Local. */
  accountUrl(page: PzAccountSdkAccountPageEnum | PzAccountSdkAccountPageValue): string;

  // OIDC — protocolo

  /** GET /.well-known/openid-configuration. */
  discoveryShow(): Promise<PzAccountSdkDiscoveryViewDto>;

  /** Troca o code do callback por tokens (authorization_code + PKCE). */
  tokenExchangeCode(input: PzAccountSdkTokenExchangeCodeDto | PzAccountSdkTokenExchangeCodeInput): Promise<PzAccountSdkTokenViewDto>;

  /** Renova os tokens com o refresh_token (que gira a cada uso). */
  tokenRefresh(input: PzAccountSdkTokenRefreshDto | PzAccountSdkTokenRefreshInput): Promise<PzAccountSdkTokenViewDto>;

  /** Login com e-mail e senha (password grant; exige client habilitado). */
  tokenPassword(input: PzAccountSdkTokenPasswordDto | PzAccountSdkTokenPasswordInput): Promise<PzAccountSdkTokenViewDto>;

  /** Revoga um access ou refresh token (RFC 7009). */
  tokenRevoke(input: PzAccountSdkTokenRevokeDto | PzAccountSdkTokenRevokeInput): Promise<PzAccountSdkResultDto>;

  /** Claims do usuário pelo access token; 401 = token não vale mais. */
  userInfoShow(input: PzAccountSdkAccessTokenDto | PzAccountSdkAccessTokenInput): Promise<PzAccountSdkUserInfoViewDto>;

  // Verificação de JWT (JWKS)

  /** Verifica o id_token contra o JWKS e devolve a identidade. */
  idTokenVerify(input: PzAccountSdkIdTokenVerifyDto | PzAccountSdkIdTokenVerifyInput): Promise<PzAccountSdkIdentityViewDto>;

  /** Verifica um webhook (SET) do Puzl Account e devolve o evento. */
  webhookEventVerify(
    input: PzAccountSdkWebhookEventVerifyDto | PzAccountSdkWebhookEventVerifyInput,
  ): Promise<PzAccountSdkWebhookEventViewDto>;

  // API da conta

  /** Cria uma conta Puzl (público, sem token). */
  userRegister(input: PzAccountSdkUserRegisterDto | PzAccountSdkUserRegisterInput): Promise<PzAccountSdkUserProfileViewDto>;

  /** Conta do usuário dono do token. */
  meShow(input: PzAccountSdkAccessTokenDto | PzAccountSdkAccessTokenInput): Promise<PzAccountSdkUserProfileViewDto>;

  /** Atualiza o perfil (PUT completo). */
  meUpdate(input: PzAccountSdkMeUpdateDto | PzAccountSdkMeUpdateInput): Promise<PzAccountSdkUserProfileViewDto>;

  /** Troca a senha (revoga os tokens do usuário). */
  mePasswordChange(input: PzAccountSdkMePasswordChangeDto | PzAccountSdkMePasswordChangeInput): Promise<PzAccountSdkResultDto>;

  /** Pede a troca de e-mail; confirmada pelo e-mail antigo (202). */
  meEmailChange(input: PzAccountSdkMeEmailChangeDto | PzAccountSdkMeEmailChangeInput): Promise<PzAccountSdkResultDto>;

  /** Envia uma foto nova. */
  mePictureUpload(input: PzAccountSdkMePictureUploadDto | PzAccountSdkMePictureUploadInput): Promise<PzAccountSdkUserProfileViewDto>;

  /** Usa uma ilustração pronta como foto. */
  mePicturePresetSet(
    input: PzAccountSdkMePicturePresetSetDto | PzAccountSdkMePicturePresetSetInput,
  ): Promise<PzAccountSdkUserProfileViewDto>;

  /** Remove a foto. */
  mePictureDelete(input: PzAccountSdkAccessTokenDto | PzAccountSdkAccessTokenInput): Promise<PzAccountSdkUserProfileViewDto>;

  // API da conta — MFA

  /** Situação do MFA. */
  meMfaShow(input: PzAccountSdkAccessTokenDto | PzAccountSdkAccessTokenInput): Promise<PzAccountSdkMfaStatusViewDto>;

  /** Começa a ligar o MFA: devolve o segredo TOTP. */
  meMfaEnroll(input: PzAccountSdkMeMfaEnrollDto | PzAccountSdkMeMfaEnrollInput): Promise<PzAccountSdkMfaEnrollViewDto>;

  /** Confirma o MFA com o primeiro código; devolve os códigos de recuperação. */
  meMfaEnrollConfirm(
    input: PzAccountSdkMeMfaEnrollConfirmDto | PzAccountSdkMeMfaEnrollConfirmInput,
  ): Promise<PzAccountSdkMfaRecoveryCodesViewDto>;

  /** Desliga o MFA (revoga os tokens do usuário). */
  meMfaDisable(input: PzAccountSdkMeMfaDisableDto | PzAccountSdkMeMfaDisableInput): Promise<PzAccountSdkResultDto>;

  /** Gera novos códigos de recuperação. */
  meMfaRecoveryCodesRegenerate(
    input: PzAccountSdkMeMfaRecoveryCodesRegenerateDto | PzAccountSdkMeMfaRecoveryCodesRegenerateInput,
  ): Promise<PzAccountSdkMfaRecoveryCodesViewDto>;

  // API da conta — aplicativos com acesso

  /** Aplicativos com acesso à conta. */
  meConsentList(input: PzAccountSdkAccessTokenDto | PzAccountSdkAccessTokenInput): Promise<PzAccountSdkConsentListViewDto>;

  /** Tira o acesso de um aplicativo à conta. */
  meConsentRevoke(input: PzAccountSdkMeConsentRevokeDto | PzAccountSdkMeConsentRevokeInput): Promise<PzAccountSdkResultDto>;
}
