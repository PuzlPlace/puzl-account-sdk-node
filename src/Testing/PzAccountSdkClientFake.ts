import { PzAccountSdkAccountPageEnum, type PzAccountSdkAccountPageValue } from '../Enum/PzAccountSdkAccountPageEnum.js';
import { PzAccountSdkAuthorizeUrlDto, type PzAccountSdkAuthorizeUrlInput } from '../Features/AuthorizeUrl/Dtos/PzAccountSdkAuthorizeUrlDto.js';
import type { PzAccountSdkDiscoveryViewDto } from '../Features/DiscoveryShow/Dtos/PzAccountSdkDiscoveryViewDto.js';
import type { PzAccountSdkIdentityViewDto } from '../Features/IdTokenVerify/Dtos/PzAccountSdkIdentityViewDto.js';
import { PzAccountSdkIdTokenVerifyDto, type PzAccountSdkIdTokenVerifyInput } from '../Features/IdTokenVerify/Dtos/PzAccountSdkIdTokenVerifyDto.js';
import { PzAccountSdkLogoutUrlDto, type PzAccountSdkLogoutUrlInput } from '../Features/LogoutUrl/Dtos/PzAccountSdkLogoutUrlDto.js';
import type { PzAccountSdkConsentListViewDto } from '../Features/MeConsentList/Dtos/PzAccountSdkConsentListViewDto.js';
import { PzAccountSdkMeConsentRevokeDto, type PzAccountSdkMeConsentRevokeInput } from '../Features/MeConsentRevoke/Dtos/PzAccountSdkMeConsentRevokeDto.js';
import { PzAccountSdkMeEmailChangeDto, type PzAccountSdkMeEmailChangeInput } from '../Features/MeEmailChange/Dtos/PzAccountSdkMeEmailChangeDto.js';
import { PzAccountSdkMeMfaDisableDto, type PzAccountSdkMeMfaDisableInput } from '../Features/MeMfaDisable/Dtos/PzAccountSdkMeMfaDisableDto.js';
import { PzAccountSdkMeMfaEnrollDto, type PzAccountSdkMeMfaEnrollInput } from '../Features/MeMfaEnroll/Dtos/PzAccountSdkMeMfaEnrollDto.js';
import type { PzAccountSdkMfaEnrollViewDto } from '../Features/MeMfaEnroll/Dtos/PzAccountSdkMfaEnrollViewDto.js';
import {
  PzAccountSdkMeMfaEnrollConfirmDto,
  type PzAccountSdkMeMfaEnrollConfirmInput,
} from '../Features/MeMfaEnrollConfirm/Dtos/PzAccountSdkMeMfaEnrollConfirmDto.js';
import {
  PzAccountSdkMeMfaRecoveryCodesRegenerateDto,
  type PzAccountSdkMeMfaRecoveryCodesRegenerateInput,
} from '../Features/MeMfaRecoveryCodesRegenerate/Dtos/PzAccountSdkMeMfaRecoveryCodesRegenerateDto.js';
import type { PzAccountSdkMfaStatusViewDto } from '../Features/MeMfaShow/Dtos/PzAccountSdkMfaStatusViewDto.js';
import { PzAccountSdkMePasswordChangeDto, type PzAccountSdkMePasswordChangeInput } from '../Features/MePasswordChange/Dtos/PzAccountSdkMePasswordChangeDto.js';
import {
  PzAccountSdkMePicturePresetSetDto,
  type PzAccountSdkMePicturePresetSetInput,
} from '../Features/MePicturePresetSet/Dtos/PzAccountSdkMePicturePresetSetDto.js';
import { PzAccountSdkMePictureUploadDto, type PzAccountSdkMePictureUploadInput } from '../Features/MePictureUpload/Dtos/PzAccountSdkMePictureUploadDto.js';
import { PzAccountSdkMeUpdateDto, type PzAccountSdkMeUpdateInput } from '../Features/MeUpdate/Dtos/PzAccountSdkMeUpdateDto.js';
import { PzAccountSdkPkceViewDto } from '../Features/PkceCreate/Dtos/PzAccountSdkPkceViewDto.js';
import { PzAccountSdkPkceCreateService } from '../Features/PkceCreate/Services/PzAccountSdkPkceCreateService.js';
import { PzAccountSdkAccessTokenDto, type PzAccountSdkAccessTokenInput } from '../Features/Shared/Dtos/PzAccountSdkAccessTokenDto.js';
import type { PzAccountSdkMfaRecoveryCodesViewDto } from '../Features/Shared/Dtos/PzAccountSdkMfaRecoveryCodesViewDto.js';
import { PzAccountSdkResultDto } from '../Features/Shared/Dtos/PzAccountSdkResultDto.js';
import type { PzAccountSdkTokenViewDto } from '../Features/Shared/Dtos/PzAccountSdkTokenViewDto.js';
import type { PzAccountSdkUserProfileViewDto } from '../Features/Shared/Dtos/PzAccountSdkUserProfileViewDto.js';
import {
  PzAccountSdkTokenExchangeCodeDto,
  type PzAccountSdkTokenExchangeCodeInput,
} from '../Features/TokenExchangeCode/Dtos/PzAccountSdkTokenExchangeCodeDto.js';
import { PzAccountSdkTokenPasswordDto, type PzAccountSdkTokenPasswordInput } from '../Features/TokenPassword/Dtos/PzAccountSdkTokenPasswordDto.js';
import { PzAccountSdkTokenRefreshDto, type PzAccountSdkTokenRefreshInput } from '../Features/TokenRefresh/Dtos/PzAccountSdkTokenRefreshDto.js';
import { PzAccountSdkTokenRevokeDto, type PzAccountSdkTokenRevokeInput } from '../Features/TokenRevoke/Dtos/PzAccountSdkTokenRevokeDto.js';
import type { PzAccountSdkUserInfoViewDto } from '../Features/UserInfoShow/Dtos/PzAccountSdkUserInfoViewDto.js';
import { PzAccountSdkUserRegisterDto, type PzAccountSdkUserRegisterInput } from '../Features/UserRegister/Dtos/PzAccountSdkUserRegisterDto.js';
import {
  PzAccountSdkWebhookEventVerifyDto,
  type PzAccountSdkWebhookEventVerifyInput,
} from '../Features/WebhookEventVerify/Dtos/PzAccountSdkWebhookEventVerifyDto.js';
import type { PzAccountSdkWebhookEventViewDto } from '../Features/WebhookEventVerify/Dtos/PzAccountSdkWebhookEventViewDto.js';
import { PzAccountSdkClient } from '../PzAccountSdkClient.js';
import { PzAccountSdkDto, toDto } from '../Support/PzAccountSdkDto.js';
import { isTruthy, type PzAccountSdkValues } from '../Support/PzAccountSdkValue.js';
import {
  PzAccountSdkFakeResponses,
  type PzAccountSdkFakeMethod,
  type PzAccountSdkFakeReturn,
} from './PzAccountSdkFakeResponses.js';

/** A entrada que cada operação recebe, já como DTO — o que `lastInput()` e `respond()` entregam. */
export interface PzAccountSdkFakeInputs {
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

type LocalMethod = 'pkceCreate' | 'authorizeUrl' | 'logoutUrl' | 'accountUrl';

/** Toda operação do contrato, programável ou local. */
export type PzAccountSdkFakeKnownMethod = keyof PzAccountSdkFakeInputs;

/** Campos do DTO de retorno, para programar a resposta como objeto (um nome errado não compila). */
export type PzAccountSdkFakeValues<M extends PzAccountSdkFakeMethod> = {
  [K in keyof PzAccountSdkFakeReturn<M>]?: unknown;
};

/** O que dá para programar como resposta: o DTO pronto, os campos dele, ou uma função da entrada. */
export type PzAccountSdkFakeResponse<M extends PzAccountSdkFakeMethod = PzAccountSdkFakeMethod> =
  | PzAccountSdkFakeReturn<M>
  | PzAccountSdkFakeValues<M>
  | ((
      input: PzAccountSdkFakeInputs[M],
    ) => PzAccountSdkFakeReturn<M> | PzAccountSdkFakeValues<M> | Promise<PzAccountSdkFakeReturn<M> | PzAccountSdkFakeValues<M>>);

/** Uma chamada recebida pelo fake. */
export interface PzAccountSdkFakeCall<M extends PzAccountSdkFakeKnownMethod = PzAccountSdkFakeKnownMethod> {
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
export class PzAccountSdkClientFake extends PzAccountSdkClient {
  static readonly FAKE_ISSUER = PzAccountSdkFakeResponses.FAKE_ISSUER;
  static readonly FAKE_CLIENT_ID = PzAccountSdkFakeResponses.FAKE_CLIENT_ID;
  /** `sub` de todas as respostas padrão: um ULID fixo. */
  static readonly FAKE_SUB = PzAccountSdkFakeResponses.FAKE_SUB;
  static readonly FAKE_EMAIL = PzAccountSdkFakeResponses.FAKE_EMAIL;

  private static readonly FAKE_CODE_VERIFIER = 'fake-code-verifier-fake-code-verifier-fake-code-verifier';

  /** Operações locais: registradas em `calls()`, mas não programáveis. */
  private static readonly LOCAL_METHODS: readonly LocalMethod[] = ['pkceCreate', 'authorizeUrl', 'logoutUrl', 'accountUrl'];

  /** O que `isConfigured()` responde. */
  configured = true;

  private queue = new Map<PzAccountSdkFakeMethod, unknown[]>();
  private history: PzAccountSdkFakeCall[] = [];

  constructor() {
    // Config de teste: os construtores de URL locais são os do client de verdade.
    super(
      {
        issuer: PzAccountSdkFakeResponses.FAKE_ISSUER,
        clientId: PzAccountSdkFakeResponses.FAKE_CLIENT_ID,
        clientSecret: 'fake-client-secret',
        redirectUri: 'https://app.pzaccountsdk.test/auth/callback',
      },
      {
        fetch: () => Promise.reject(new Error('PzAccountSdkClientFake: o fake nunca faz requisições.')),
      },
    );
  }

  /**
   * Programa a resposta de uma operação.
   *
   * Chamadas sucessivas formam uma fila; quando ela se esgota, a última
   * resposta se repete — assim um teste que chama o mesmo método N vezes não
   * precisa programar N respostas iguais.
   */
  respond<M extends PzAccountSdkFakeMethod>(method: M, response: PzAccountSdkFakeResponse<M>): this {
    this.assertProgrammable(method);

    const expected = PzAccountSdkFakeResponses.RETURN_DTO[method];

    if (response instanceof PzAccountSdkResultDto && !(response instanceof expected)) {
      throw new TypeError(
        `PzAccountSdkClientFake: "${method}" devolve ${expected.name}, não ${response.constructor.name}.`,
      );
    }

    this.queue.set(method, [...(this.queue.get(method) ?? []), response]);

    return this;
  }

  /**
   * Atalho para programar uma falha.
   *
   * @param errorCode valor de PzAccountSdkErrorCodeEnum, ou um código ainda
   *                  desconhecido, para exercitar esse caminho
   */
  respondWithError(
    method: PzAccountSdkFakeMethod,
    errorCode: string,
    httpStatus: number,
    message = '',
    errors: Record<string, string[]> = {},
  ): this {
    return this.respond(method, {
      has_error: true,
      error_code: errorCode,
      error_message: message,
      errors,
      http_status: httpStatus,
    });
  }

  /** Todas as chamadas recebidas, na ordem — ou só as de uma operação. */
  calls(): PzAccountSdkFakeCall[];
  calls<M extends PzAccountSdkFakeKnownMethod>(method: M): PzAccountSdkFakeCall<M>[];
  calls(method: PzAccountSdkFakeKnownMethod | null = null): PzAccountSdkFakeCall[] {
    if (method === null) {
      return [...this.history];
    }

    this.assertKnownMethod(method);

    return this.history.filter((call) => call.method === method);
  }

  callCount(method: PzAccountSdkFakeKnownMethod | null = null): number {
    return method === null ? this.history.length : this.calls(method).length;
  }

  /** Entrada da última chamada da operação, já como DTO, ou `null` se não houve. */
  lastInput<M extends PzAccountSdkFakeKnownMethod>(method: M): PzAccountSdkFakeInputs[M] | null {
    return this.calls(method).at(-1)?.input ?? null;
  }

  /** Zera fila e histórico, para reaproveitar o dublê entre cenários. */
  reset(): this {
    this.queue = new Map();
    this.history = [];

    return this;
  }

  /** Programável por `fake.configured = false`, para testar o produto sem a integração. */
  override isConfigured(): boolean {
    return this.configured;
  }

  override pkceCreate(): PzAccountSdkPkceViewDto {
    this.record('pkceCreate', null);

    return new PzAccountSdkPkceViewDto({
      state: 'fake-state',
      nonce: 'fake-nonce',
      code_verifier: PzAccountSdkClientFake.FAKE_CODE_VERIFIER,
      code_challenge: PzAccountSdkPkceCreateService.challengeFor(PzAccountSdkClientFake.FAKE_CODE_VERIFIER),
    });
  }

  override authorizeUrl(input: PzAccountSdkAuthorizeUrlDto | PzAccountSdkAuthorizeUrlInput): string {
    const dto = toDto(PzAccountSdkAuthorizeUrlDto, PzAccountSdkAuthorizeUrlDto.from, input);
    this.record('authorizeUrl', dto);

    return super.authorizeUrl(dto);
  }

  override logoutUrl(input: PzAccountSdkLogoutUrlDto | PzAccountSdkLogoutUrlInput = {}): string {
    const dto = toDto(PzAccountSdkLogoutUrlDto, PzAccountSdkLogoutUrlDto.from, input);
    this.record('logoutUrl', dto);

    return super.logoutUrl(dto);
  }

  override accountUrl(page: PzAccountSdkAccountPageEnum | PzAccountSdkAccountPageValue): string {
    const enumPage = PzAccountSdkAccountPageEnum.from(page);
    this.record('accountUrl', enumPage);

    return super.accountUrl(enumPage);
  }

  override discoveryShow(): Promise<PzAccountSdkDiscoveryViewDto> {
    return this.resolve('discoveryShow', null);
  }

  override tokenExchangeCode(input: PzAccountSdkTokenExchangeCodeDto | PzAccountSdkTokenExchangeCodeInput): Promise<PzAccountSdkTokenViewDto> {
    return this.resolve('tokenExchangeCode', () => toDto(PzAccountSdkTokenExchangeCodeDto, PzAccountSdkTokenExchangeCodeDto.from, input));
  }

  override tokenRefresh(input: PzAccountSdkTokenRefreshDto | PzAccountSdkTokenRefreshInput): Promise<PzAccountSdkTokenViewDto> {
    return this.resolve('tokenRefresh', () => toDto(PzAccountSdkTokenRefreshDto, PzAccountSdkTokenRefreshDto.from, input));
  }

  override tokenPassword(input: PzAccountSdkTokenPasswordDto | PzAccountSdkTokenPasswordInput): Promise<PzAccountSdkTokenViewDto> {
    return this.resolve('tokenPassword', () => toDto(PzAccountSdkTokenPasswordDto, PzAccountSdkTokenPasswordDto.from, input));
  }

  override tokenRevoke(input: PzAccountSdkTokenRevokeDto | PzAccountSdkTokenRevokeInput): Promise<PzAccountSdkResultDto> {
    return this.resolve('tokenRevoke', () => toDto(PzAccountSdkTokenRevokeDto, PzAccountSdkTokenRevokeDto.from, input));
  }

  override userInfoShow(input: PzAccountSdkAccessTokenDto | PzAccountSdkAccessTokenInput): Promise<PzAccountSdkUserInfoViewDto> {
    return this.resolve('userInfoShow', () => this.tokenInput(input));
  }

  override idTokenVerify(input: PzAccountSdkIdTokenVerifyDto | PzAccountSdkIdTokenVerifyInput): Promise<PzAccountSdkIdentityViewDto> {
    return this.resolve('idTokenVerify', () => toDto(PzAccountSdkIdTokenVerifyDto, PzAccountSdkIdTokenVerifyDto.from, input));
  }

  override webhookEventVerify(
    input: PzAccountSdkWebhookEventVerifyDto | PzAccountSdkWebhookEventVerifyInput,
  ): Promise<PzAccountSdkWebhookEventViewDto> {
    return this.resolve('webhookEventVerify', () =>
      toDto(PzAccountSdkWebhookEventVerifyDto, PzAccountSdkWebhookEventVerifyDto.from, input),
    );
  }

  override userRegister(input: PzAccountSdkUserRegisterDto | PzAccountSdkUserRegisterInput): Promise<PzAccountSdkUserProfileViewDto> {
    return this.resolve('userRegister', () => toDto(PzAccountSdkUserRegisterDto, PzAccountSdkUserRegisterDto.from, input));
  }

  override meShow(input: PzAccountSdkAccessTokenDto | PzAccountSdkAccessTokenInput): Promise<PzAccountSdkUserProfileViewDto> {
    return this.resolve('meShow', () => this.tokenInput(input));
  }

  override meUpdate(input: PzAccountSdkMeUpdateDto | PzAccountSdkMeUpdateInput): Promise<PzAccountSdkUserProfileViewDto> {
    return this.resolve('meUpdate', () => toDto(PzAccountSdkMeUpdateDto, PzAccountSdkMeUpdateDto.from, input));
  }

  override mePasswordChange(input: PzAccountSdkMePasswordChangeDto | PzAccountSdkMePasswordChangeInput): Promise<PzAccountSdkResultDto> {
    return this.resolve('mePasswordChange', () => toDto(PzAccountSdkMePasswordChangeDto, PzAccountSdkMePasswordChangeDto.from, input));
  }

  override meEmailChange(input: PzAccountSdkMeEmailChangeDto | PzAccountSdkMeEmailChangeInput): Promise<PzAccountSdkResultDto> {
    return this.resolve('meEmailChange', () => toDto(PzAccountSdkMeEmailChangeDto, PzAccountSdkMeEmailChangeDto.from, input));
  }

  override mePictureUpload(input: PzAccountSdkMePictureUploadDto | PzAccountSdkMePictureUploadInput): Promise<PzAccountSdkUserProfileViewDto> {
    return this.resolve('mePictureUpload', () => toDto(PzAccountSdkMePictureUploadDto, PzAccountSdkMePictureUploadDto.from, input));
  }

  override mePicturePresetSet(
    input: PzAccountSdkMePicturePresetSetDto | PzAccountSdkMePicturePresetSetInput,
  ): Promise<PzAccountSdkUserProfileViewDto> {
    return this.resolve('mePicturePresetSet', () =>
      toDto(PzAccountSdkMePicturePresetSetDto, PzAccountSdkMePicturePresetSetDto.from, input),
    );
  }

  override mePictureDelete(input: PzAccountSdkAccessTokenDto | PzAccountSdkAccessTokenInput): Promise<PzAccountSdkUserProfileViewDto> {
    return this.resolve('mePictureDelete', () => this.tokenInput(input));
  }

  override meMfaShow(input: PzAccountSdkAccessTokenDto | PzAccountSdkAccessTokenInput): Promise<PzAccountSdkMfaStatusViewDto> {
    return this.resolve('meMfaShow', () => this.tokenInput(input));
  }

  override meMfaEnroll(input: PzAccountSdkMeMfaEnrollDto | PzAccountSdkMeMfaEnrollInput): Promise<PzAccountSdkMfaEnrollViewDto> {
    return this.resolve('meMfaEnroll', () => toDto(PzAccountSdkMeMfaEnrollDto, PzAccountSdkMeMfaEnrollDto.from, input));
  }

  override meMfaEnrollConfirm(
    input: PzAccountSdkMeMfaEnrollConfirmDto | PzAccountSdkMeMfaEnrollConfirmInput,
  ): Promise<PzAccountSdkMfaRecoveryCodesViewDto> {
    return this.resolve('meMfaEnrollConfirm', () =>
      toDto(PzAccountSdkMeMfaEnrollConfirmDto, PzAccountSdkMeMfaEnrollConfirmDto.from, input),
    );
  }

  override meMfaDisable(input: PzAccountSdkMeMfaDisableDto | PzAccountSdkMeMfaDisableInput): Promise<PzAccountSdkResultDto> {
    return this.resolve('meMfaDisable', () => toDto(PzAccountSdkMeMfaDisableDto, PzAccountSdkMeMfaDisableDto.from, input));
  }

  override meMfaRecoveryCodesRegenerate(
    input: PzAccountSdkMeMfaRecoveryCodesRegenerateDto | PzAccountSdkMeMfaRecoveryCodesRegenerateInput,
  ): Promise<PzAccountSdkMfaRecoveryCodesViewDto> {
    return this.resolve('meMfaRecoveryCodesRegenerate', () =>
      toDto(PzAccountSdkMeMfaRecoveryCodesRegenerateDto, PzAccountSdkMeMfaRecoveryCodesRegenerateDto.from, input),
    );
  }

  override meConsentList(input: PzAccountSdkAccessTokenDto | PzAccountSdkAccessTokenInput): Promise<PzAccountSdkConsentListViewDto> {
    return this.resolve('meConsentList', () => this.tokenInput(input));
  }

  override meConsentRevoke(input: PzAccountSdkMeConsentRevokeDto | PzAccountSdkMeConsentRevokeInput): Promise<PzAccountSdkResultDto> {
    return this.resolve('meConsentRevoke', () => toDto(PzAccountSdkMeConsentRevokeDto, PzAccountSdkMeConsentRevokeDto.from, input));
  }

  private async resolve<M extends PzAccountSdkFakeMethod>(
    method: M,
    input: (() => PzAccountSdkFakeInputs[M]) | null,
  ): Promise<PzAccountSdkFakeReturn<M>> {
    const dto = (input === null ? null : input()) as PzAccountSdkFakeInputs[M];
    this.record(method, dto);

    let response: unknown = this.nextResponse(method);

    if (response === undefined) {
      return this.defaultSuccess(method, dto);
    }

    if (typeof response === 'function') {
      response = await (response as (input: PzAccountSdkFakeInputs[M]) => unknown)(dto);
    }

    if (response instanceof PzAccountSdkResultDto) {
      return response as PzAccountSdkFakeReturn<M>;
    }

    const values = { ...(response as PzAccountSdkValues) };

    // Sucesso programado sem status ganha o status real da operação.
    if (!Object.hasOwn(values, 'http_status') && !isTruthy(values['has_error'])) {
      values['http_status'] = PzAccountSdkFakeResponses.SUCCESS_STATUS[method];
    }

    return PzAccountSdkFakeResponses.RETURN_DTO[method].from(values) as PzAccountSdkFakeReturn<M>;
  }

  /** A próxima da fila; a última se repete. */
  private nextResponse(method: PzAccountSdkFakeMethod): unknown {
    const queued = this.queue.get(method) ?? [];

    return queued.length <= 1 ? queued[0] : queued.shift();
  }

  private defaultSuccess<M extends PzAccountSdkFakeMethod>(method: M, input: PzAccountSdkFakeInputs[M]): PzAccountSdkFakeReturn<M> {
    const values = PzAccountSdkFakeResponses.success(method, input instanceof PzAccountSdkDto ? input.toArray() : {});

    return PzAccountSdkFakeResponses.RETURN_DTO[method].from({
      ...values,
      has_error: false,
      http_status: PzAccountSdkFakeResponses.SUCCESS_STATUS[method],
    }) as PzAccountSdkFakeReturn<M>;
  }

  private record<M extends PzAccountSdkFakeKnownMethod>(method: M, input: PzAccountSdkFakeInputs[M]): void {
    this.history.push({ method, input } as PzAccountSdkFakeCall);
  }

  private tokenInput(input: PzAccountSdkAccessTokenDto | PzAccountSdkAccessTokenInput): PzAccountSdkAccessTokenDto {
    return toDto(PzAccountSdkAccessTokenDto, PzAccountSdkAccessTokenDto.from, input);
  }

  private assertProgrammable(method: string): asserts method is PzAccountSdkFakeMethod {
    if (!Object.hasOwn(PzAccountSdkFakeResponses.RETURN_DTO, method)) {
      throw new TypeError(
        `PzAccountSdkClientFake: operação "${method}" não é programável. ` +
          `Esperado um de: ${Object.keys(PzAccountSdkFakeResponses.RETURN_DTO).join(', ')}.`,
      );
    }
  }

  private assertKnownMethod(method: string): void {
    const known: string[] = [...PzAccountSdkClientFake.LOCAL_METHODS, ...Object.keys(PzAccountSdkFakeResponses.RETURN_DTO)];

    if (!known.includes(method)) {
      throw new TypeError(`PzAccountSdkClientFake: operação desconhecida "${method}". Esperado um de: ${known.join(', ')}.`);
    }
  }
}
