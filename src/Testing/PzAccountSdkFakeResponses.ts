import { PzAccountSdkDiscoveryViewDto } from '../Features/DiscoveryShow/Dtos/PzAccountSdkDiscoveryViewDto.js';
import { PzAccountSdkIdentityViewDto } from '../Features/IdTokenVerify/Dtos/PzAccountSdkIdentityViewDto.js';
import { PzAccountSdkConsentListViewDto } from '../Features/MeConsentList/Dtos/PzAccountSdkConsentListViewDto.js';
import { PzAccountSdkMfaEnrollViewDto } from '../Features/MeMfaEnroll/Dtos/PzAccountSdkMfaEnrollViewDto.js';
import { PzAccountSdkMfaStatusViewDto } from '../Features/MeMfaShow/Dtos/PzAccountSdkMfaStatusViewDto.js';
import { PzAccountSdkMfaRecoveryCodesViewDto } from '../Features/Shared/Dtos/PzAccountSdkMfaRecoveryCodesViewDto.js';
import { PzAccountSdkResultDto } from '../Features/Shared/Dtos/PzAccountSdkResultDto.js';
import { PzAccountSdkTokenViewDto } from '../Features/Shared/Dtos/PzAccountSdkTokenViewDto.js';
import { PzAccountSdkUserProfileViewDto } from '../Features/Shared/Dtos/PzAccountSdkUserProfileViewDto.js';
import { PzAccountSdkUserInfoViewDto } from '../Features/UserInfoShow/Dtos/PzAccountSdkUserInfoViewDto.js';
import { PzAccountSdkWebhookEventViewDto } from '../Features/WebhookEventVerify/Dtos/PzAccountSdkWebhookEventViewDto.js';
import type { PzAccountSdkValues } from '../Support/PzAccountSdkValue.js';

/** Classe de retorno de uma operação: o construtor e o `from()`. */
interface ReturnDto<T extends PzAccountSdkResultDto = PzAccountSdkResultDto> {
  new (...args: never[]): T;
  from(values: unknown): T;
}

const RETURN_DTO = {
  discoveryShow: PzAccountSdkDiscoveryViewDto,
  tokenExchangeCode: PzAccountSdkTokenViewDto,
  tokenRefresh: PzAccountSdkTokenViewDto,
  tokenPassword: PzAccountSdkTokenViewDto,
  tokenRevoke: PzAccountSdkResultDto,
  userInfoShow: PzAccountSdkUserInfoViewDto,
  idTokenVerify: PzAccountSdkIdentityViewDto,
  webhookEventVerify: PzAccountSdkWebhookEventViewDto,
  userRegister: PzAccountSdkUserProfileViewDto,
  meShow: PzAccountSdkUserProfileViewDto,
  meUpdate: PzAccountSdkUserProfileViewDto,
  mePasswordChange: PzAccountSdkResultDto,
  meEmailChange: PzAccountSdkResultDto,
  mePictureUpload: PzAccountSdkUserProfileViewDto,
  mePicturePresetSet: PzAccountSdkUserProfileViewDto,
  mePictureDelete: PzAccountSdkUserProfileViewDto,
  meMfaShow: PzAccountSdkMfaStatusViewDto,
  meMfaEnroll: PzAccountSdkMfaEnrollViewDto,
  meMfaEnrollConfirm: PzAccountSdkMfaRecoveryCodesViewDto,
  meMfaDisable: PzAccountSdkResultDto,
  meMfaRecoveryCodesRegenerate: PzAccountSdkMfaRecoveryCodesViewDto,
  meConsentList: PzAccountSdkConsentListViewDto,
  meConsentRevoke: PzAccountSdkResultDto,
} satisfies Record<string, ReturnDto>;

/** Operações programáveis do fake (as que falam com o provedor). */
export type PzAccountSdkFakeMethod = keyof typeof RETURN_DTO;

/** DTO de retorno de cada operação programável. */
export type PzAccountSdkFakeReturn<M extends PzAccountSdkFakeMethod> = InstanceType<(typeof RETURN_DTO)[M]>;

/**
 * Tabelas e respostas padrão do `PzAccountSdkClientFake`.
 *
 * @internal
 */
export const PzAccountSdkFakeResponses = {
  /** Classe de retorno de cada operação programável — a ordem é a do contrato. */
  RETURN_DTO,

  /** Status HTTP do sucesso de cada operação, o mesmo do provedor. */
  SUCCESS_STATUS: {
    discoveryShow: 200,
    tokenExchangeCode: 200,
    tokenRefresh: 200,
    tokenPassword: 200,
    tokenRevoke: 200,
    userInfoShow: 200,
    idTokenVerify: 200,
    webhookEventVerify: 200,
    userRegister: 201,
    meShow: 200,
    meUpdate: 200,
    mePasswordChange: 204,
    meEmailChange: 202,
    mePictureUpload: 200,
    mePicturePresetSet: 200,
    mePictureDelete: 200,
    meMfaShow: 200,
    meMfaEnroll: 201,
    meMfaEnrollConfirm: 201,
    meMfaDisable: 204,
    meMfaRecoveryCodesRegenerate: 201,
    meConsentList: 200,
    meConsentRevoke: 204,
  },

  FAKE_ISSUER: 'https://account.pzaccountsdk.test',
  FAKE_CLIENT_ID: 'fake-client-id',
  /** `sub` de todas as respostas padrão: um ULID fixo. */
  FAKE_SUB: '01JFAKE0000000000000000000',
  FAKE_EMAIL: 'fake@pzaccountsdk.test',

  /**
   * Corpo de sucesso plausível para a operação. Nome e e-mail da entrada
   * ecoam na resposta, para o teste conferir o que foi enviado.
   */
  success(method: PzAccountSdkFakeMethod, values: PzAccountSdkValues): PzAccountSdkValues {
    const { FAKE_ISSUER, FAKE_CLIENT_ID, FAKE_SUB, FAKE_EMAIL } = PzAccountSdkFakeResponses;
    const email = typeof values['email'] === 'string' && values['email'] !== '' ? values['email'] : FAKE_EMAIL;
    const name = typeof values['name'] === 'string' && values['name'] !== '' ? values['name'] : 'Usuário Fake';
    const now = Math.floor(Date.now() / 1000);

    const user = {
      id: 1,
      sub: FAKE_SUB,
      name,
      email,
      is_active: true,
      email_verified_at: '2026-01-01T00:00:00+00:00',
      birthdate: '1990-01-01',
      locale: 'pt-BR',
      zoneinfo: 'America/Sao_Paulo',
    };
    const claims = { sub: FAKE_SUB, email, email_verified: true, name };
    const token = {
      access_token: 'fake-access-token',
      token_type: 'Bearer',
      expires_in: 3600,
      scope: 'openid email profile',
      id_token: 'fake-id-token',
      refresh_token: method === 'tokenPassword' ? '' : 'fake-refresh-token',
    };
    const recoveryCodes = { recovery_codes: ['fake-recovery-1', 'fake-recovery-2'], warning: 'Guarde estes códigos.' };

    switch (method) {
      case 'discoveryShow':
        return {
          issuer: FAKE_ISSUER,
          authorization_endpoint: `${FAKE_ISSUER}/oauth/authorize`,
          token_endpoint: `${FAKE_ISSUER}/oauth/token`,
          userinfo_endpoint: `${FAKE_ISSUER}/oauth/userinfo`,
          revocation_endpoint: `${FAKE_ISSUER}/oauth/revoke`,
          end_session_endpoint: `${FAKE_ISSUER}/oauth/logout`,
          jwks_uri: `${FAKE_ISSUER}/.well-known/jwks.json`,
        };
      case 'tokenExchangeCode':
      case 'tokenRefresh':
      case 'tokenPassword':
        return token;
      case 'userInfoShow':
        return claims;
      case 'idTokenVerify':
        return {
          ...claims,
          iat: now,
          exp: now + 3600,
          claims: { ...claims, iss: FAKE_ISSUER, aud: FAKE_CLIENT_ID, nonce: values['nonce'] ?? '' },
        };
      case 'webhookEventVerify':
        return {
          event_type: 'tokens.revoked',
          event_uri: `${FAKE_ISSUER}/events/tokens-revoked`,
          sub: FAKE_SUB,
          txn: 'fake-txn',
          jti: 'fake-jti',
          iat: now,
          exp: now + 300,
        };
      case 'userRegister':
      case 'meShow':
      case 'meUpdate':
      case 'mePictureUpload':
      case 'mePicturePresetSet':
      case 'mePictureDelete':
        return { user };
      case 'meMfaShow':
        return { enabled: false, recovery_codes_remaining: 0 };
      case 'meMfaEnroll':
        return {
          secret: 'FAKESECRETBASE32',
          otpauth_uri: `otpauth://totp/Puzl:${email}?secret=FAKESECRETBASE32&issuer=Puzl`,
          qr_svg: '<svg xmlns="http://www.w3.org/2000/svg"/>',
        };
      case 'meMfaEnrollConfirm':
      case 'meMfaRecoveryCodesRegenerate':
        return recoveryCodes;
      case 'meConsentList':
        return { consents: [] };
      default:
        return {};
    }
  },
} as const;
