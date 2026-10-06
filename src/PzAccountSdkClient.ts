import type { PzAccountSdkClientInterface } from './Contract/PzAccountSdkClientInterface.js';
import { PzAccountSdkAccountPageEnum, type PzAccountSdkAccountPageValue } from './Enum/PzAccountSdkAccountPageEnum.js';
import { PzAccountSdkAccountUrlService } from './Features/AccountUrl/Services/PzAccountSdkAccountUrlService.js';
import { PzAccountSdkAuthorizeUrlDto, type PzAccountSdkAuthorizeUrlInput } from './Features/AuthorizeUrl/Dtos/PzAccountSdkAuthorizeUrlDto.js';
import { PzAccountSdkAuthorizeUrlService } from './Features/AuthorizeUrl/Services/PzAccountSdkAuthorizeUrlService.js';
import type { PzAccountSdkDiscoveryViewDto } from './Features/DiscoveryShow/Dtos/PzAccountSdkDiscoveryViewDto.js';
import { PzAccountSdkDiscoveryShowGateway } from './Features/DiscoveryShow/Gateways/PzAccountSdkDiscoveryShowGateway.js';
import type { PzAccountSdkIdentityViewDto } from './Features/IdTokenVerify/Dtos/PzAccountSdkIdentityViewDto.js';
import { PzAccountSdkIdTokenVerifyDto, type PzAccountSdkIdTokenVerifyInput } from './Features/IdTokenVerify/Dtos/PzAccountSdkIdTokenVerifyDto.js';
import { PzAccountSdkIdTokenVerifyGateway } from './Features/IdTokenVerify/Gateways/PzAccountSdkIdTokenVerifyGateway.js';
import { PzAccountSdkLogoutUrlDto, type PzAccountSdkLogoutUrlInput } from './Features/LogoutUrl/Dtos/PzAccountSdkLogoutUrlDto.js';
import { PzAccountSdkLogoutUrlService } from './Features/LogoutUrl/Services/PzAccountSdkLogoutUrlService.js';
import type { PzAccountSdkConsentListViewDto } from './Features/MeConsentList/Dtos/PzAccountSdkConsentListViewDto.js';
import { PzAccountSdkMeConsentListGateway } from './Features/MeConsentList/Gateways/PzAccountSdkMeConsentListGateway.js';
import { PzAccountSdkMeConsentRevokeDto, type PzAccountSdkMeConsentRevokeInput } from './Features/MeConsentRevoke/Dtos/PzAccountSdkMeConsentRevokeDto.js';
import { PzAccountSdkMeConsentRevokeGateway } from './Features/MeConsentRevoke/Gateways/PzAccountSdkMeConsentRevokeGateway.js';
import { PzAccountSdkMeEmailChangeDto, type PzAccountSdkMeEmailChangeInput } from './Features/MeEmailChange/Dtos/PzAccountSdkMeEmailChangeDto.js';
import { PzAccountSdkMeEmailChangeGateway } from './Features/MeEmailChange/Gateways/PzAccountSdkMeEmailChangeGateway.js';
import { PzAccountSdkMeMfaDisableDto, type PzAccountSdkMeMfaDisableInput } from './Features/MeMfaDisable/Dtos/PzAccountSdkMeMfaDisableDto.js';
import { PzAccountSdkMeMfaDisableGateway } from './Features/MeMfaDisable/Gateways/PzAccountSdkMeMfaDisableGateway.js';
import { PzAccountSdkMeMfaEnrollDto, type PzAccountSdkMeMfaEnrollInput } from './Features/MeMfaEnroll/Dtos/PzAccountSdkMeMfaEnrollDto.js';
import type { PzAccountSdkMfaEnrollViewDto } from './Features/MeMfaEnroll/Dtos/PzAccountSdkMfaEnrollViewDto.js';
import { PzAccountSdkMeMfaEnrollGateway } from './Features/MeMfaEnroll/Gateways/PzAccountSdkMeMfaEnrollGateway.js';
import {
  PzAccountSdkMeMfaEnrollConfirmDto,
  type PzAccountSdkMeMfaEnrollConfirmInput,
} from './Features/MeMfaEnrollConfirm/Dtos/PzAccountSdkMeMfaEnrollConfirmDto.js';
import { PzAccountSdkMeMfaEnrollConfirmGateway } from './Features/MeMfaEnrollConfirm/Gateways/PzAccountSdkMeMfaEnrollConfirmGateway.js';
import {
  PzAccountSdkMeMfaRecoveryCodesRegenerateDto,
  type PzAccountSdkMeMfaRecoveryCodesRegenerateInput,
} from './Features/MeMfaRecoveryCodesRegenerate/Dtos/PzAccountSdkMeMfaRecoveryCodesRegenerateDto.js';
import { PzAccountSdkMeMfaRecoveryCodesRegenerateGateway } from './Features/MeMfaRecoveryCodesRegenerate/Gateways/PzAccountSdkMeMfaRecoveryCodesRegenerateGateway.js';
import type { PzAccountSdkMfaStatusViewDto } from './Features/MeMfaShow/Dtos/PzAccountSdkMfaStatusViewDto.js';
import { PzAccountSdkMeMfaShowGateway } from './Features/MeMfaShow/Gateways/PzAccountSdkMeMfaShowGateway.js';
import { PzAccountSdkMePasswordChangeDto, type PzAccountSdkMePasswordChangeInput } from './Features/MePasswordChange/Dtos/PzAccountSdkMePasswordChangeDto.js';
import { PzAccountSdkMePasswordChangeGateway } from './Features/MePasswordChange/Gateways/PzAccountSdkMePasswordChangeGateway.js';
import { PzAccountSdkMePictureDeleteGateway } from './Features/MePictureDelete/Gateways/PzAccountSdkMePictureDeleteGateway.js';
import {
  PzAccountSdkMePicturePresetSetDto,
  type PzAccountSdkMePicturePresetSetInput,
} from './Features/MePicturePresetSet/Dtos/PzAccountSdkMePicturePresetSetDto.js';
import { PzAccountSdkMePicturePresetSetGateway } from './Features/MePicturePresetSet/Gateways/PzAccountSdkMePicturePresetSetGateway.js';
import { PzAccountSdkMePictureUploadDto, type PzAccountSdkMePictureUploadInput } from './Features/MePictureUpload/Dtos/PzAccountSdkMePictureUploadDto.js';
import { PzAccountSdkMePictureUploadGateway } from './Features/MePictureUpload/Gateways/PzAccountSdkMePictureUploadGateway.js';
import { PzAccountSdkMeShowGateway } from './Features/MeShow/Gateways/PzAccountSdkMeShowGateway.js';
import { PzAccountSdkMeUpdateDto, type PzAccountSdkMeUpdateInput } from './Features/MeUpdate/Dtos/PzAccountSdkMeUpdateDto.js';
import { PzAccountSdkMeUpdateGateway } from './Features/MeUpdate/Gateways/PzAccountSdkMeUpdateGateway.js';
import type { PzAccountSdkPkceViewDto } from './Features/PkceCreate/Dtos/PzAccountSdkPkceViewDto.js';
import { PzAccountSdkPkceCreateService } from './Features/PkceCreate/Services/PzAccountSdkPkceCreateService.js';
import { PzAccountSdkAccessTokenDto, type PzAccountSdkAccessTokenInput } from './Features/Shared/Dtos/PzAccountSdkAccessTokenDto.js';
import type { PzAccountSdkMfaRecoveryCodesViewDto } from './Features/Shared/Dtos/PzAccountSdkMfaRecoveryCodesViewDto.js';
import type { PzAccountSdkResultDto } from './Features/Shared/Dtos/PzAccountSdkResultDto.js';
import type { PzAccountSdkTokenViewDto } from './Features/Shared/Dtos/PzAccountSdkTokenViewDto.js';
import type { PzAccountSdkUserProfileViewDto } from './Features/Shared/Dtos/PzAccountSdkUserProfileViewDto.js';
import {
  PzAccountSdkTokenExchangeCodeDto,
  type PzAccountSdkTokenExchangeCodeInput,
} from './Features/TokenExchangeCode/Dtos/PzAccountSdkTokenExchangeCodeDto.js';
import { PzAccountSdkTokenExchangeCodeGateway } from './Features/TokenExchangeCode/Gateways/PzAccountSdkTokenExchangeCodeGateway.js';
import { PzAccountSdkTokenPasswordDto, type PzAccountSdkTokenPasswordInput } from './Features/TokenPassword/Dtos/PzAccountSdkTokenPasswordDto.js';
import { PzAccountSdkTokenPasswordGateway } from './Features/TokenPassword/Gateways/PzAccountSdkTokenPasswordGateway.js';
import { PzAccountSdkTokenRefreshDto, type PzAccountSdkTokenRefreshInput } from './Features/TokenRefresh/Dtos/PzAccountSdkTokenRefreshDto.js';
import { PzAccountSdkTokenRefreshGateway } from './Features/TokenRefresh/Gateways/PzAccountSdkTokenRefreshGateway.js';
import { PzAccountSdkTokenRevokeDto, type PzAccountSdkTokenRevokeInput } from './Features/TokenRevoke/Dtos/PzAccountSdkTokenRevokeDto.js';
import { PzAccountSdkTokenRevokeGateway } from './Features/TokenRevoke/Gateways/PzAccountSdkTokenRevokeGateway.js';
import type { PzAccountSdkUserInfoViewDto } from './Features/UserInfoShow/Dtos/PzAccountSdkUserInfoViewDto.js';
import { PzAccountSdkUserInfoShowGateway } from './Features/UserInfoShow/Gateways/PzAccountSdkUserInfoShowGateway.js';
import { PzAccountSdkUserRegisterDto, type PzAccountSdkUserRegisterInput } from './Features/UserRegister/Dtos/PzAccountSdkUserRegisterDto.js';
import { PzAccountSdkUserRegisterGateway } from './Features/UserRegister/Gateways/PzAccountSdkUserRegisterGateway.js';
import {
  PzAccountSdkWebhookEventVerifyDto,
  type PzAccountSdkWebhookEventVerifyInput,
} from './Features/WebhookEventVerify/Dtos/PzAccountSdkWebhookEventVerifyDto.js';
import type { PzAccountSdkWebhookEventViewDto } from './Features/WebhookEventVerify/Dtos/PzAccountSdkWebhookEventViewDto.js';
import { PzAccountSdkWebhookEventVerifyGateway } from './Features/WebhookEventVerify/Gateways/PzAccountSdkWebhookEventVerifyGateway.js';
import { PzAccountSdkMemoryCache } from './Support/PzAccountSdkCache.js';
import { PzAccountSdkConfig, type PzAccountSdkConfigOptions } from './Support/PzAccountSdkConfig.js';
import { toDto } from './Support/PzAccountSdkDto.js';
import type { PzAccountSdkFetch } from './Support/PzAccountSdkHttp.js';
import { PzAccountSdkJwksProvider, type PzAccountSdkCacheOption } from './Support/PzAccountSdkJwksProvider.js';

/** Dependências de infraestrutura do client — ambas opcionais. */
export interface PzAccountSdkClientDependencies {
  /** Transporte HTTP. Padrão: o `fetch` global do Node. */
  fetch?: PzAccountSdkFetch | undefined;
  /**
   * Onde guardar o JWKS, ou uma função que o resolve na primeira
   * verificação. Padrão: memória do processo.
   */
  cache?: PzAccountSdkCacheOption | undefined;
}

/** Opções do client: configuração + dependências, num objeto só. */
export interface PzAccountSdkClientOptions extends PzAccountSdkConfigOptions, PzAccountSdkClientDependencies {}

/**
 * Client do Puzl Account.
 *
 * Sem estado além do cache do JWKS: pode (e deve) ser uma instância única
 * por aplicação. Cada operação cria a própria requisição, então o Bearer de
 * um usuário nunca vaza para a chamada seguinte.
 *
 * ```ts
 * const puzl = new PzAccountSdkClient({ issuer, clientId, clientSecret, redirectUri });
 * // ou: PzAccountSdkClientFactory.fromEnv()
 * ```
 */
export class PzAccountSdkClient implements PzAccountSdkClientInterface {
  readonly config: PzAccountSdkConfig;
  private readonly fetchFn: PzAccountSdkFetch;
  private readonly jwks: PzAccountSdkJwksProvider;

  constructor(config: PzAccountSdkConfig | PzAccountSdkClientOptions = {}, dependencies: PzAccountSdkClientDependencies = {}) {
    const options: PzAccountSdkClientDependencies = config instanceof PzAccountSdkConfig ? {} : config;

    this.config = config instanceof PzAccountSdkConfig ? config : PzAccountSdkConfig.from(config);
    // Resolvido a cada chamada: quem troca o `fetch` global (testes, APM) é respeitado.
    this.fetchFn = dependencies.fetch ?? options.fetch ?? ((request) => fetch(request));
    this.jwks = new PzAccountSdkJwksProvider(
      this.config,
      this.fetchFn,
      dependencies.cache ?? options.cache ?? new PzAccountSdkMemoryCache(),
    );
  }

  isConfigured(): boolean {
    return this.config.isConfigured();
  }

  pkceCreate(): PzAccountSdkPkceViewDto {
    return new PzAccountSdkPkceCreateService().execute();
  }

  authorizeUrl(input: PzAccountSdkAuthorizeUrlDto | PzAccountSdkAuthorizeUrlInput): string {
    return new PzAccountSdkAuthorizeUrlService(this.config).execute(
      toDto(PzAccountSdkAuthorizeUrlDto, PzAccountSdkAuthorizeUrlDto.from, input),
    );
  }

  logoutUrl(input: PzAccountSdkLogoutUrlDto | PzAccountSdkLogoutUrlInput = {}): string {
    return new PzAccountSdkLogoutUrlService(this.config).execute(
      toDto(PzAccountSdkLogoutUrlDto, PzAccountSdkLogoutUrlDto.from, input),
    );
  }

  accountUrl(page: PzAccountSdkAccountPageEnum | PzAccountSdkAccountPageValue): string {
    return new PzAccountSdkAccountUrlService(this.config).execute(PzAccountSdkAccountPageEnum.from(page));
  }

  discoveryShow(): Promise<PzAccountSdkDiscoveryViewDto> {
    return new PzAccountSdkDiscoveryShowGateway(this.config, this.fetchFn).execute();
  }

  tokenExchangeCode(input: PzAccountSdkTokenExchangeCodeDto | PzAccountSdkTokenExchangeCodeInput): Promise<PzAccountSdkTokenViewDto> {
    return this.run(() =>
      new PzAccountSdkTokenExchangeCodeGateway(this.config, this.fetchFn).execute(
        toDto(PzAccountSdkTokenExchangeCodeDto, PzAccountSdkTokenExchangeCodeDto.from, input),
      ),
    );
  }

  tokenRefresh(input: PzAccountSdkTokenRefreshDto | PzAccountSdkTokenRefreshInput): Promise<PzAccountSdkTokenViewDto> {
    return this.run(() =>
      new PzAccountSdkTokenRefreshGateway(this.config, this.fetchFn).execute(
        toDto(PzAccountSdkTokenRefreshDto, PzAccountSdkTokenRefreshDto.from, input),
      ),
    );
  }

  tokenPassword(input: PzAccountSdkTokenPasswordDto | PzAccountSdkTokenPasswordInput): Promise<PzAccountSdkTokenViewDto> {
    return this.run(() =>
      new PzAccountSdkTokenPasswordGateway(this.config, this.fetchFn).execute(
        toDto(PzAccountSdkTokenPasswordDto, PzAccountSdkTokenPasswordDto.from, input),
      ),
    );
  }

  tokenRevoke(input: PzAccountSdkTokenRevokeDto | PzAccountSdkTokenRevokeInput): Promise<PzAccountSdkResultDto> {
    return this.run(() =>
      new PzAccountSdkTokenRevokeGateway(this.config, this.fetchFn).execute(
        toDto(PzAccountSdkTokenRevokeDto, PzAccountSdkTokenRevokeDto.from, input),
      ),
    );
  }

  userInfoShow(input: PzAccountSdkAccessTokenDto | PzAccountSdkAccessTokenInput): Promise<PzAccountSdkUserInfoViewDto> {
    return this.run(() =>
      new PzAccountSdkUserInfoShowGateway(this.config, this.fetchFn).execute(this.accessToken(input)),
    );
  }

  idTokenVerify(input: PzAccountSdkIdTokenVerifyDto | PzAccountSdkIdTokenVerifyInput): Promise<PzAccountSdkIdentityViewDto> {
    return this.run(() =>
      new PzAccountSdkIdTokenVerifyGateway(this.config, this.fetchFn, this.jwks).execute(
        toDto(PzAccountSdkIdTokenVerifyDto, PzAccountSdkIdTokenVerifyDto.from, input),
      ),
    );
  }

  webhookEventVerify(
    input: PzAccountSdkWebhookEventVerifyDto | PzAccountSdkWebhookEventVerifyInput,
  ): Promise<PzAccountSdkWebhookEventViewDto> {
    return this.run(() =>
      new PzAccountSdkWebhookEventVerifyGateway(this.config, this.fetchFn, this.jwks).execute(
        toDto(PzAccountSdkWebhookEventVerifyDto, PzAccountSdkWebhookEventVerifyDto.from, input),
      ),
    );
  }

  userRegister(input: PzAccountSdkUserRegisterDto | PzAccountSdkUserRegisterInput): Promise<PzAccountSdkUserProfileViewDto> {
    return this.run(() =>
      new PzAccountSdkUserRegisterGateway(this.config, this.fetchFn).execute(
        toDto(PzAccountSdkUserRegisterDto, PzAccountSdkUserRegisterDto.from, input),
      ),
    );
  }

  meShow(input: PzAccountSdkAccessTokenDto | PzAccountSdkAccessTokenInput): Promise<PzAccountSdkUserProfileViewDto> {
    return this.run(() => new PzAccountSdkMeShowGateway(this.config, this.fetchFn).execute(this.accessToken(input)));
  }

  meUpdate(input: PzAccountSdkMeUpdateDto | PzAccountSdkMeUpdateInput): Promise<PzAccountSdkUserProfileViewDto> {
    return this.run(() =>
      new PzAccountSdkMeUpdateGateway(this.config, this.fetchFn).execute(
        toDto(PzAccountSdkMeUpdateDto, PzAccountSdkMeUpdateDto.from, input),
      ),
    );
  }

  mePasswordChange(input: PzAccountSdkMePasswordChangeDto | PzAccountSdkMePasswordChangeInput): Promise<PzAccountSdkResultDto> {
    return this.run(() =>
      new PzAccountSdkMePasswordChangeGateway(this.config, this.fetchFn).execute(
        toDto(PzAccountSdkMePasswordChangeDto, PzAccountSdkMePasswordChangeDto.from, input),
      ),
    );
  }

  meEmailChange(input: PzAccountSdkMeEmailChangeDto | PzAccountSdkMeEmailChangeInput): Promise<PzAccountSdkResultDto> {
    return this.run(() =>
      new PzAccountSdkMeEmailChangeGateway(this.config, this.fetchFn).execute(
        toDto(PzAccountSdkMeEmailChangeDto, PzAccountSdkMeEmailChangeDto.from, input),
      ),
    );
  }

  mePictureUpload(input: PzAccountSdkMePictureUploadDto | PzAccountSdkMePictureUploadInput): Promise<PzAccountSdkUserProfileViewDto> {
    return this.run(() =>
      new PzAccountSdkMePictureUploadGateway(this.config, this.fetchFn).execute(
        toDto(PzAccountSdkMePictureUploadDto, PzAccountSdkMePictureUploadDto.from, input),
      ),
    );
  }

  mePicturePresetSet(
    input: PzAccountSdkMePicturePresetSetDto | PzAccountSdkMePicturePresetSetInput,
  ): Promise<PzAccountSdkUserProfileViewDto> {
    return this.run(() =>
      new PzAccountSdkMePicturePresetSetGateway(this.config, this.fetchFn).execute(
        toDto(PzAccountSdkMePicturePresetSetDto, PzAccountSdkMePicturePresetSetDto.from, input),
      ),
    );
  }

  mePictureDelete(input: PzAccountSdkAccessTokenDto | PzAccountSdkAccessTokenInput): Promise<PzAccountSdkUserProfileViewDto> {
    return this.run(() =>
      new PzAccountSdkMePictureDeleteGateway(this.config, this.fetchFn).execute(this.accessToken(input)),
    );
  }

  meMfaShow(input: PzAccountSdkAccessTokenDto | PzAccountSdkAccessTokenInput): Promise<PzAccountSdkMfaStatusViewDto> {
    return this.run(() => new PzAccountSdkMeMfaShowGateway(this.config, this.fetchFn).execute(this.accessToken(input)));
  }

  meMfaEnroll(input: PzAccountSdkMeMfaEnrollDto | PzAccountSdkMeMfaEnrollInput): Promise<PzAccountSdkMfaEnrollViewDto> {
    return this.run(() =>
      new PzAccountSdkMeMfaEnrollGateway(this.config, this.fetchFn).execute(
        toDto(PzAccountSdkMeMfaEnrollDto, PzAccountSdkMeMfaEnrollDto.from, input),
      ),
    );
  }

  meMfaEnrollConfirm(
    input: PzAccountSdkMeMfaEnrollConfirmDto | PzAccountSdkMeMfaEnrollConfirmInput,
  ): Promise<PzAccountSdkMfaRecoveryCodesViewDto> {
    return this.run(() =>
      new PzAccountSdkMeMfaEnrollConfirmGateway(this.config, this.fetchFn).execute(
        toDto(PzAccountSdkMeMfaEnrollConfirmDto, PzAccountSdkMeMfaEnrollConfirmDto.from, input),
      ),
    );
  }

  meMfaDisable(input: PzAccountSdkMeMfaDisableDto | PzAccountSdkMeMfaDisableInput): Promise<PzAccountSdkResultDto> {
    return this.run(() =>
      new PzAccountSdkMeMfaDisableGateway(this.config, this.fetchFn).execute(
        toDto(PzAccountSdkMeMfaDisableDto, PzAccountSdkMeMfaDisableDto.from, input),
      ),
    );
  }

  meMfaRecoveryCodesRegenerate(
    input: PzAccountSdkMeMfaRecoveryCodesRegenerateDto | PzAccountSdkMeMfaRecoveryCodesRegenerateInput,
  ): Promise<PzAccountSdkMfaRecoveryCodesViewDto> {
    return this.run(() =>
      new PzAccountSdkMeMfaRecoveryCodesRegenerateGateway(this.config, this.fetchFn).execute(
        toDto(PzAccountSdkMeMfaRecoveryCodesRegenerateDto, PzAccountSdkMeMfaRecoveryCodesRegenerateDto.from, input),
      ),
    );
  }

  meConsentList(input: PzAccountSdkAccessTokenDto | PzAccountSdkAccessTokenInput): Promise<PzAccountSdkConsentListViewDto> {
    return this.run(() =>
      new PzAccountSdkMeConsentListGateway(this.config, this.fetchFn).execute(this.accessToken(input)),
    );
  }

  meConsentRevoke(input: PzAccountSdkMeConsentRevokeDto | PzAccountSdkMeConsentRevokeInput): Promise<PzAccountSdkResultDto> {
    return this.run(() =>
      new PzAccountSdkMeConsentRevokeGateway(this.config, this.fetchFn).execute(
        toDto(PzAccountSdkMeConsentRevokeDto, PzAccountSdkMeConsentRevokeDto.from, input),
      ),
    );
  }

  private accessToken(input: PzAccountSdkAccessTokenDto | PzAccountSdkAccessTokenInput): PzAccountSdkAccessTokenDto {
    return toDto(PzAccountSdkAccessTokenDto, PzAccountSdkAccessTokenDto.from, input);
  }

  /**
   * Toda operação de rede devolve uma Promise — inclusive quando a validação
   * da entrada ou da configuração falha antes do HTTP: o erro vira rejeição,
   * nunca uma exceção síncrona escondida no meio de um `await`.
   */
  private async run<T>(operation: () => Promise<T>): Promise<T> {
    return operation();
  }
}
