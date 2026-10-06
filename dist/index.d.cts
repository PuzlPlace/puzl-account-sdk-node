import { $ as PzAccountSdkMePicturePresetSetDto, A as PzAccountSdkTokenPasswordInput, At as PzAccountSdkIdentityViewFields, B as PzAccountSdkAccessTokenInput, Bt as PzAccountSdkDto, C as PzAccountSdkTokenRevokeDto, Ct as PzAccountSdkConsentViewDto, D as PzAccountSdkTokenRefreshDto, Dt as PzAccountSdkIdTokenVerifyDto, E as PzAccountSdkTokenTypeHintValue, Et as PzAccountSdkLogoutUrlInput, F as PzAccountSdkTokenViewDto, Ft as PzAccountSdkResultDto, G as PzAccountSdkMeUpdateInput, Gt as PzAccountSdkAccountPageValue, H as PzAccountSdkPkceViewFields, Ht as PzAccountSdkPromptEnum, I as PzAccountSdkTokenViewFields, It as PzAccountSdkResultFields, J as PzAccountSdkGenderEnum, K as PzAccountSdkUserViewDto, Kt as PzAccountSdkEnum, L as PzAccountSdkMfaRecoveryCodesViewDto, Lt as PzAccountSdkErrorCodeEnum, M as PzAccountSdkTokenExchangeCodeInput, Mt as PzAccountSdkAddressInput, N as PzAccountSdkUserProfileViewDto, Nt as PzAccountSdkDiscoveryViewDto, O as PzAccountSdkTokenRefreshInput, Ot as PzAccountSdkIdTokenVerifyInput, P as PzAccountSdkUserProfileViewFields, Pt as PzAccountSdkDiscoveryViewFields, Q as PzAccountSdkPictureContents, R as PzAccountSdkMfaRecoveryCodesViewFields, Rt as PzAccountSdkAuthorizeUrlDto, S as PzAccountSdkUserInfoViewFields, St as PzAccountSdkConsentListViewFields, T as PzAccountSdkTokenTypeHintEnum, Tt as PzAccountSdkLogoutUrlDto, U as PzAccountSdkMeUpdateChanges, Ut as PzAccountSdkPromptValue, V as PzAccountSdkPkceViewDto, Vt as PzAccountSdkValues, W as PzAccountSdkMeUpdateDto, Wt as PzAccountSdkAccountPageEnum, X as PzAccountSdkMePictureUploadDto, Y as PzAccountSdkGenderValue, Z as PzAccountSdkMePictureUploadInput, _ as PzAccountSdkWebhookEventTypeEnum, _t as PzAccountSdkMeEmailChangeDto, a as PzAccountSdkCache, at as PzAccountSdkMfaStatusViewDto, b as PzAccountSdkUserRegisterInput, bt as PzAccountSdkMeConsentRevokeInput, c as PZ_ACCOUNT_SDK_ENV_KEYS, ct as PzAccountSdkMeMfaRecoveryCodesRegenerateInput, d as PzAccountSdkTokenAuthMethod, dt as PzAccountSdkMfaEnrollViewDto, et as PzAccountSdkMePicturePresetSetInput, f as PzAccountSdkClientInterface, ft as PzAccountSdkMfaEnrollViewFields, g as PzAccountSdkWebhookEventViewFields, gt as PzAccountSdkMeMfaDisableInput, h as PzAccountSdkWebhookEventViewDto, ht as PzAccountSdkMeMfaDisableDto, i as PzAccountSdkCacheOption, it as PzAccountSdkMePasswordChangeInput, j as PzAccountSdkTokenExchangeCodeDto, jt as PzAccountSdkAddressDto, k as PzAccountSdkTokenPasswordDto, kt as PzAccountSdkIdentityViewDto, l as PzAccountSdkConfig, lt as PzAccountSdkMeMfaEnrollConfirmDto, m as PzAccountSdkWebhookEventVerifyInput, mt as PzAccountSdkMeMfaEnrollInput, n as PzAccountSdkClientDependencies, nt as PzAccountSdkPicturePresetValue, o as PzAccountSdkMemoryCache, ot as PzAccountSdkMfaStatusViewFields, p as PzAccountSdkWebhookEventVerifyDto, pt as PzAccountSdkMeMfaEnrollDto, q as PzAccountSdkUserViewFields, r as PzAccountSdkClientOptions, rt as PzAccountSdkMePasswordChangeDto, s as PzAccountSdkFetch, st as PzAccountSdkMeMfaRecoveryCodesRegenerateDto, t as PzAccountSdkClient, tt as PzAccountSdkPicturePresetEnum, u as PzAccountSdkConfigOptions, ut as PzAccountSdkMeMfaEnrollConfirmInput, v as PzAccountSdkWebhookEventTypeValue, vt as PzAccountSdkMeEmailChangeInput, w as PzAccountSdkTokenRevokeInput, wt as PzAccountSdkConsentViewFields, x as PzAccountSdkUserInfoViewDto, xt as PzAccountSdkConsentListViewDto, y as PzAccountSdkUserRegisterDto, yt as PzAccountSdkMeConsentRevokeDto, z as PzAccountSdkAccessTokenDto, zt as PzAccountSdkAuthorizeUrlInput } from "./PzAccountSdkClient-BTGGiVTp.cjs";
//#region src/Factory/PzAccountSdkClientFactory.d.ts
/**
 * Atalhos para criar o client.
 *
 * ```ts
 * const puzl = PzAccountSdkClientFactory.fromEnv(); // lê PUZL_ACCOUNT_* de process.env
 * ```
 */
export declare class PzAccountSdkClientFactory {
  /** Client a partir das opções (configuração + `fetch`/`cache` opcionais). */
  static make(options?: PzAccountSdkClientOptions): PzAccountSdkClient;
  /**
   * Client a partir das variáveis `PUZL_ACCOUNT_*` (por padrão, de
   * `process.env`). Opções em `overrides` vencem o ambiente.
   */
  static fromEnv(env?: Record<string, string | undefined>, overrides?: PzAccountSdkConfigOptions & PzAccountSdkClientDependencies): PzAccountSdkClient;
}
//#endregion
//#region src/Exception/PzAccountSdkException.d.ts
/**
 * Raiz das exceções do SDK.
 *
 * Falha do Puzl Account NÃO passa por aqui: erro de credencial, validação ou
 * indisponibilidade chega no retorno, em `PzAccountSdkResultDto.has_error`.
 * O que herda desta classe é erro de integração — configuração ausente,
 * uso indevido da API do SDK.
 */
export declare abstract class PzAccountSdkException extends Error {
  constructor(message: string);
}
//#endregion
//#region src/Exception/PzAccountSdkConfigurationException.d.ts
/**
 * Configuração ausente ou inválida no projeto que instalou o SDK.
 *
 * A mensagem cita a opção e a variável de ambiente exatas: quem vê o erro
 * normalmente está integrando o pacote pela primeira vez, e "config inválida"
 * sem o nome da chave transforma um ajuste de trinta segundos numa caça ao
 * tesouro.
 */
export declare class PzAccountSdkConfigurationException extends PzAccountSdkException {
  /**
   * @param optionKey opção do client (ex.: 'clientId')
   * @param envKey variável de ambiente correspondente (ex.: 'PUZL_ACCOUNT_CLIENT_ID')
   */
  static missing(optionKey: string, envKey: string): PzAccountSdkConfigurationException;
  static invalid(optionKey: string, envKey: string, accepted: string): PzAccountSdkConfigurationException;
}
//#endregion
export { PZ_ACCOUNT_SDK_ENV_KEYS, PzAccountSdkAccessTokenDto, type PzAccountSdkAccessTokenInput, PzAccountSdkAccountPageEnum, type PzAccountSdkAccountPageValue, PzAccountSdkAddressDto, type PzAccountSdkAddressInput, PzAccountSdkAuthorizeUrlDto, type PzAccountSdkAuthorizeUrlInput, type PzAccountSdkCache, type PzAccountSdkCacheOption, PzAccountSdkClient, type PzAccountSdkClientDependencies, type PzAccountSdkClientInterface, type PzAccountSdkClientOptions, PzAccountSdkConfig, type PzAccountSdkConfigOptions, PzAccountSdkConsentListViewDto, type PzAccountSdkConsentListViewFields, PzAccountSdkConsentViewDto, type PzAccountSdkConsentViewFields, PzAccountSdkDiscoveryViewDto, type PzAccountSdkDiscoveryViewFields, PzAccountSdkDto, PzAccountSdkEnum, PzAccountSdkErrorCodeEnum, type PzAccountSdkFetch, PzAccountSdkGenderEnum, type PzAccountSdkGenderValue, PzAccountSdkIdTokenVerifyDto, type PzAccountSdkIdTokenVerifyInput, PzAccountSdkIdentityViewDto, type PzAccountSdkIdentityViewFields, PzAccountSdkLogoutUrlDto, type PzAccountSdkLogoutUrlInput, PzAccountSdkMeConsentRevokeDto, type PzAccountSdkMeConsentRevokeInput, PzAccountSdkMeEmailChangeDto, type PzAccountSdkMeEmailChangeInput, PzAccountSdkMeMfaDisableDto, type PzAccountSdkMeMfaDisableInput, PzAccountSdkMeMfaEnrollConfirmDto, type PzAccountSdkMeMfaEnrollConfirmInput, PzAccountSdkMeMfaEnrollDto, type PzAccountSdkMeMfaEnrollInput, PzAccountSdkMeMfaRecoveryCodesRegenerateDto, type PzAccountSdkMeMfaRecoveryCodesRegenerateInput, PzAccountSdkMePasswordChangeDto, type PzAccountSdkMePasswordChangeInput, PzAccountSdkMePicturePresetSetDto, type PzAccountSdkMePicturePresetSetInput, PzAccountSdkMePictureUploadDto, type PzAccountSdkMePictureUploadInput, type PzAccountSdkMeUpdateChanges, PzAccountSdkMeUpdateDto, type PzAccountSdkMeUpdateInput, PzAccountSdkMemoryCache, PzAccountSdkMfaEnrollViewDto, type PzAccountSdkMfaEnrollViewFields, PzAccountSdkMfaRecoveryCodesViewDto, type PzAccountSdkMfaRecoveryCodesViewFields, PzAccountSdkMfaStatusViewDto, type PzAccountSdkMfaStatusViewFields, type PzAccountSdkPictureContents, PzAccountSdkPicturePresetEnum, type PzAccountSdkPicturePresetValue, PzAccountSdkPkceViewDto, type PzAccountSdkPkceViewFields, PzAccountSdkPromptEnum, type PzAccountSdkPromptValue, PzAccountSdkResultDto, type PzAccountSdkResultFields, type PzAccountSdkTokenAuthMethod, PzAccountSdkTokenExchangeCodeDto, type PzAccountSdkTokenExchangeCodeInput, PzAccountSdkTokenPasswordDto, type PzAccountSdkTokenPasswordInput, PzAccountSdkTokenRefreshDto, type PzAccountSdkTokenRefreshInput, PzAccountSdkTokenRevokeDto, type PzAccountSdkTokenRevokeInput, PzAccountSdkTokenTypeHintEnum, type PzAccountSdkTokenTypeHintValue, PzAccountSdkTokenViewDto, type PzAccountSdkTokenViewFields, PzAccountSdkUserInfoViewDto, type PzAccountSdkUserInfoViewFields, PzAccountSdkUserProfileViewDto, type PzAccountSdkUserProfileViewFields, PzAccountSdkUserRegisterDto, type PzAccountSdkUserRegisterInput, PzAccountSdkUserViewDto, type PzAccountSdkUserViewFields, type PzAccountSdkValues, PzAccountSdkWebhookEventTypeEnum, type PzAccountSdkWebhookEventTypeValue, PzAccountSdkWebhookEventVerifyDto, type PzAccountSdkWebhookEventVerifyInput, PzAccountSdkWebhookEventViewDto, type PzAccountSdkWebhookEventViewFields };