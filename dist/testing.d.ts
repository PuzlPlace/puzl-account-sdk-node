import { $ as PzAccountSdkMePicturePresetSetDto, A as PzAccountSdkTokenPasswordInput, B as PzAccountSdkAccessTokenInput, C as PzAccountSdkTokenRevokeDto, D as PzAccountSdkTokenRefreshDto, Dt as PzAccountSdkIdTokenVerifyDto, Et as PzAccountSdkLogoutUrlInput, F as PzAccountSdkTokenViewDto, Ft as PzAccountSdkResultDto, G as PzAccountSdkMeUpdateInput, Gt as PzAccountSdkAccountPageValue, L as PzAccountSdkMfaRecoveryCodesViewDto, M as PzAccountSdkTokenExchangeCodeInput, N as PzAccountSdkUserProfileViewDto, Nt as PzAccountSdkDiscoveryViewDto, O as PzAccountSdkTokenRefreshInput, Ot as PzAccountSdkIdTokenVerifyInput, Rt as PzAccountSdkAuthorizeUrlDto, Tt as PzAccountSdkLogoutUrlDto, V as PzAccountSdkPkceViewDto, W as PzAccountSdkMeUpdateDto, Wt as PzAccountSdkAccountPageEnum, X as PzAccountSdkMePictureUploadDto, Z as PzAccountSdkMePictureUploadInput, _t as PzAccountSdkMeEmailChangeDto, at as PzAccountSdkMfaStatusViewDto, b as PzAccountSdkUserRegisterInput, bt as PzAccountSdkMeConsentRevokeInput, ct as PzAccountSdkMeMfaRecoveryCodesRegenerateInput, dt as PzAccountSdkMfaEnrollViewDto, et as PzAccountSdkMePicturePresetSetInput, gt as PzAccountSdkMeMfaDisableInput, h as PzAccountSdkWebhookEventViewDto, ht as PzAccountSdkMeMfaDisableDto, it as PzAccountSdkMePasswordChangeInput, j as PzAccountSdkTokenExchangeCodeDto, k as PzAccountSdkTokenPasswordDto, kt as PzAccountSdkIdentityViewDto, lt as PzAccountSdkMeMfaEnrollConfirmDto, m as PzAccountSdkWebhookEventVerifyInput, mt as PzAccountSdkMeMfaEnrollInput, p as PzAccountSdkWebhookEventVerifyDto, pt as PzAccountSdkMeMfaEnrollDto, rt as PzAccountSdkMePasswordChangeDto, st as PzAccountSdkMeMfaRecoveryCodesRegenerateDto, t as PzAccountSdkClient, ut as PzAccountSdkMeMfaEnrollConfirmInput, vt as PzAccountSdkMeEmailChangeInput, w as PzAccountSdkTokenRevokeInput, x as PzAccountSdkUserInfoViewDto, xt as PzAccountSdkConsentListViewDto, y as PzAccountSdkUserRegisterDto, yt as PzAccountSdkMeConsentRevokeDto, z as PzAccountSdkAccessTokenDto, zt as PzAccountSdkAuthorizeUrlInput } from "./PzAccountSdkClient-BTGGiVTp.js";
//#region src/Testing/PzAccountSdkFakeResponses.d.ts
declare const RETURN_DTO: {
  discoveryShow: typeof PzAccountSdkDiscoveryViewDto;
  tokenExchangeCode: typeof PzAccountSdkTokenViewDto;
  tokenRefresh: typeof PzAccountSdkTokenViewDto;
  tokenPassword: typeof PzAccountSdkTokenViewDto;
  tokenRevoke: typeof PzAccountSdkResultDto;
  userInfoShow: typeof PzAccountSdkUserInfoViewDto;
  idTokenVerify: typeof PzAccountSdkIdentityViewDto;
  webhookEventVerify: typeof PzAccountSdkWebhookEventViewDto;
  userRegister: typeof PzAccountSdkUserProfileViewDto;
  meShow: typeof PzAccountSdkUserProfileViewDto;
  meUpdate: typeof PzAccountSdkUserProfileViewDto;
  mePasswordChange: typeof PzAccountSdkResultDto;
  meEmailChange: typeof PzAccountSdkResultDto;
  mePictureUpload: typeof PzAccountSdkUserProfileViewDto;
  mePicturePresetSet: typeof PzAccountSdkUserProfileViewDto;
  mePictureDelete: typeof PzAccountSdkUserProfileViewDto;
  meMfaShow: typeof PzAccountSdkMfaStatusViewDto;
  meMfaEnroll: typeof PzAccountSdkMfaEnrollViewDto;
  meMfaEnrollConfirm: typeof PzAccountSdkMfaRecoveryCodesViewDto;
  meMfaDisable: typeof PzAccountSdkResultDto;
  meMfaRecoveryCodesRegenerate: typeof PzAccountSdkMfaRecoveryCodesViewDto;
  meConsentList: typeof PzAccountSdkConsentListViewDto;
  meConsentRevoke: typeof PzAccountSdkResultDto;
};
/** Operações programáveis do fake (as que falam com o provedor). */
type PzAccountSdkFakeMethod = keyof typeof RETURN_DTO;
/** DTO de retorno de cada operação programável. */
type PzAccountSdkFakeReturn<M extends PzAccountSdkFakeMethod> = InstanceType<(typeof RETURN_DTO)[M]>;
//#endregion
//#region src/Testing/PzAccountSdkClientFake.d.ts
/** A entrada que cada operação recebe, já como DTO — o que `lastInput()` e `respond()` entregam. */
interface PzAccountSdkFakeInputs {
  pkceCreate: null;
  authorizeUrl: PzAccountSdkAuthorizeUrlDto;
  logoutUrl: PzAccountSdkLogoutUrlDto;
  accountUrl: PzAccountSdkAccountPageEnum;
  discoveryShow: null;
  tokenExchangeCode: PzAccountSdkTokenExchangeCodeDto;
  tokenRefresh: PzAccountSdkTokenRefreshDto;
  tokenPassword: PzAccountSdkTokenPasswordDto;
  tokenRevoke: PzAccountSdkTokenRevokeDto;
  userInfoShow: PzAccountSdkAccessTokenDto;
  idTokenVerify: PzAccountSdkIdTokenVerifyDto;
  webhookEventVerify: PzAccountSdkWebhookEventVerifyDto;
  userRegister: PzAccountSdkUserRegisterDto;
  meShow: PzAccountSdkAccessTokenDto;
  meUpdate: PzAccountSdkMeUpdateDto;
  mePasswordChange: PzAccountSdkMePasswordChangeDto;
  meEmailChange: PzAccountSdkMeEmailChangeDto;
  mePictureUpload: PzAccountSdkMePictureUploadDto;
  mePicturePresetSet: PzAccountSdkMePicturePresetSetDto;
  mePictureDelete: PzAccountSdkAccessTokenDto;
  meMfaShow: PzAccountSdkAccessTokenDto;
  meMfaEnroll: PzAccountSdkMeMfaEnrollDto;
  meMfaEnrollConfirm: PzAccountSdkMeMfaEnrollConfirmDto;
  meMfaDisable: PzAccountSdkMeMfaDisableDto;
  meMfaRecoveryCodesRegenerate: PzAccountSdkMeMfaRecoveryCodesRegenerateDto;
  meConsentList: PzAccountSdkAccessTokenDto;
  meConsentRevoke: PzAccountSdkMeConsentRevokeDto;
}
/** Toda operação do contrato, programável ou local. */
type PzAccountSdkFakeKnownMethod = keyof PzAccountSdkFakeInputs;
/** Campos do DTO de retorno, para programar a resposta como objeto (um nome errado não compila). */
type PzAccountSdkFakeValues<M extends PzAccountSdkFakeMethod> = { [K in keyof PzAccountSdkFakeReturn<M>]?: unknown; };
/** O que dá para programar como resposta: o DTO pronto, os campos dele, ou uma função da entrada. */
type PzAccountSdkFakeResponse<M extends PzAccountSdkFakeMethod = PzAccountSdkFakeMethod> = PzAccountSdkFakeReturn<M> | PzAccountSdkFakeValues<M> | ((input: PzAccountSdkFakeInputs[M]) => PzAccountSdkFakeReturn<M> | PzAccountSdkFakeValues<M> | Promise<PzAccountSdkFakeReturn<M> | PzAccountSdkFakeValues<M>>);
/** Uma chamada recebida pelo fake. */
interface PzAccountSdkFakeCall<M extends PzAccountSdkFakeKnownMethod = PzAccountSdkFakeKnownMethod> {
  method: M;
  input: PzAccountSdkFakeInputs[M];
}
/**
 * Dublê do client para os testes do produto — nenhuma requisição sai.
 *
 * Toda operação devolve sucesso plausível por padrão; programe falhas e
 * respostas específicas com `respond()`/`respondWithError()` e confira o
 * que o produto mandou com `calls()`/`lastInput()`.
 *
 * ```ts
 * const puzl = new PzAccountSdkClientFake();
 * puzl.respondWithError('tokenExchangeCode', 'invalid_grant', 400);
 * ```
 *
 * Estende o `PzAccountSdkClient`: entra em qualquer lugar tipado com o
 * client. No NestJS: `Test.createTestingModule(...).overrideProvider(PzAccountSdkClient).useValue(puzl)`.
 */
export declare class PzAccountSdkClientFake extends PzAccountSdkClient {
  static readonly FAKE_ISSUER: "https://account.pzaccountsdk.test";
  static readonly FAKE_CLIENT_ID: "fake-client-id";
  /** `sub` de todas as respostas padrão: um ULID fixo. */
  static readonly FAKE_SUB: "01JFAKE0000000000000000000";
  static readonly FAKE_EMAIL: "fake@pzaccountsdk.test";
  private static readonly FAKE_CODE_VERIFIER;
  /** Operações locais: registradas em `calls()`, mas não programáveis. */
  private static readonly LOCAL_METHODS;
  /** O que `isConfigured()` responde. */
  configured: boolean;
  private queue;
  private history;
  constructor();
  /**
   * Programa a resposta de uma operação.
   *
   * Chamadas sucessivas formam uma fila; quando ela se esgota, a última
   * resposta se repete — assim um teste que chama o mesmo método N vezes não
   * precisa programar N respostas iguais.
   */
  respond<M extends PzAccountSdkFakeMethod>(method: M, response: PzAccountSdkFakeResponse<M>): this;
  /**
   * Atalho para programar uma falha.
   *
   * @param errorCode valor de PzAccountSdkErrorCodeEnum, ou um código ainda
   *                  desconhecido, para exercitar esse caminho
   */
  respondWithError(method: PzAccountSdkFakeMethod, errorCode: string, httpStatus: number, message?: string, errors?: Record<string, string[]>): this;
  /** Todas as chamadas recebidas, na ordem — ou só as de uma operação. */
  calls(): PzAccountSdkFakeCall[];
  calls<M extends PzAccountSdkFakeKnownMethod>(method: M): PzAccountSdkFakeCall<M>[];
  callCount(method?: PzAccountSdkFakeKnownMethod | null): number;
  /** Entrada da última chamada da operação, já como DTO, ou `null` se não houve. */
  lastInput<M extends PzAccountSdkFakeKnownMethod>(method: M): PzAccountSdkFakeInputs[M] | null;
  /** Zera fila e histórico, para reaproveitar o dublê entre cenários. */
  reset(): this;
  /** Programável por `fake.configured = false`, para testar o produto sem a integração. */
  isConfigured(): boolean;
  pkceCreate(): PzAccountSdkPkceViewDto;
  authorizeUrl(input: PzAccountSdkAuthorizeUrlDto | PzAccountSdkAuthorizeUrlInput): string;
  logoutUrl(input?: PzAccountSdkLogoutUrlDto | PzAccountSdkLogoutUrlInput): string;
  accountUrl(page: PzAccountSdkAccountPageEnum | PzAccountSdkAccountPageValue): string;
  discoveryShow(): Promise<PzAccountSdkDiscoveryViewDto>;
  tokenExchangeCode(input: PzAccountSdkTokenExchangeCodeDto | PzAccountSdkTokenExchangeCodeInput): Promise<PzAccountSdkTokenViewDto>;
  tokenRefresh(input: PzAccountSdkTokenRefreshDto | PzAccountSdkTokenRefreshInput): Promise<PzAccountSdkTokenViewDto>;
  tokenPassword(input: PzAccountSdkTokenPasswordDto | PzAccountSdkTokenPasswordInput): Promise<PzAccountSdkTokenViewDto>;
  tokenRevoke(input: PzAccountSdkTokenRevokeDto | PzAccountSdkTokenRevokeInput): Promise<PzAccountSdkResultDto>;
  userInfoShow(input: PzAccountSdkAccessTokenDto | PzAccountSdkAccessTokenInput): Promise<PzAccountSdkUserInfoViewDto>;
  idTokenVerify(input: PzAccountSdkIdTokenVerifyDto | PzAccountSdkIdTokenVerifyInput): Promise<PzAccountSdkIdentityViewDto>;
  webhookEventVerify(input: PzAccountSdkWebhookEventVerifyDto | PzAccountSdkWebhookEventVerifyInput): Promise<PzAccountSdkWebhookEventViewDto>;
  userRegister(input: PzAccountSdkUserRegisterDto | PzAccountSdkUserRegisterInput): Promise<PzAccountSdkUserProfileViewDto>;
  meShow(input: PzAccountSdkAccessTokenDto | PzAccountSdkAccessTokenInput): Promise<PzAccountSdkUserProfileViewDto>;
  meUpdate(input: PzAccountSdkMeUpdateDto | PzAccountSdkMeUpdateInput): Promise<PzAccountSdkUserProfileViewDto>;
  mePasswordChange(input: PzAccountSdkMePasswordChangeDto | PzAccountSdkMePasswordChangeInput): Promise<PzAccountSdkResultDto>;
  meEmailChange(input: PzAccountSdkMeEmailChangeDto | PzAccountSdkMeEmailChangeInput): Promise<PzAccountSdkResultDto>;
  mePictureUpload(input: PzAccountSdkMePictureUploadDto | PzAccountSdkMePictureUploadInput): Promise<PzAccountSdkUserProfileViewDto>;
  mePicturePresetSet(input: PzAccountSdkMePicturePresetSetDto | PzAccountSdkMePicturePresetSetInput): Promise<PzAccountSdkUserProfileViewDto>;
  mePictureDelete(input: PzAccountSdkAccessTokenDto | PzAccountSdkAccessTokenInput): Promise<PzAccountSdkUserProfileViewDto>;
  meMfaShow(input: PzAccountSdkAccessTokenDto | PzAccountSdkAccessTokenInput): Promise<PzAccountSdkMfaStatusViewDto>;
  meMfaEnroll(input: PzAccountSdkMeMfaEnrollDto | PzAccountSdkMeMfaEnrollInput): Promise<PzAccountSdkMfaEnrollViewDto>;
  meMfaEnrollConfirm(input: PzAccountSdkMeMfaEnrollConfirmDto | PzAccountSdkMeMfaEnrollConfirmInput): Promise<PzAccountSdkMfaRecoveryCodesViewDto>;
  meMfaDisable(input: PzAccountSdkMeMfaDisableDto | PzAccountSdkMeMfaDisableInput): Promise<PzAccountSdkResultDto>;
  meMfaRecoveryCodesRegenerate(input: PzAccountSdkMeMfaRecoveryCodesRegenerateDto | PzAccountSdkMeMfaRecoveryCodesRegenerateInput): Promise<PzAccountSdkMfaRecoveryCodesViewDto>;
  meConsentList(input: PzAccountSdkAccessTokenDto | PzAccountSdkAccessTokenInput): Promise<PzAccountSdkConsentListViewDto>;
  meConsentRevoke(input: PzAccountSdkMeConsentRevokeDto | PzAccountSdkMeConsentRevokeInput): Promise<PzAccountSdkResultDto>;
  private resolve;
  /** A próxima da fila; a última se repete. */
  private nextResponse;
  private defaultSuccess;
  private record;
  private tokenInput;
  private assertProgrammable;
  private assertKnownMethod;
}
//#endregion
export type { PzAccountSdkFakeCall, PzAccountSdkFakeInputs, PzAccountSdkFakeKnownMethod, PzAccountSdkFakeMethod, PzAccountSdkFakeResponse, PzAccountSdkFakeReturn, PzAccountSdkFakeValues };