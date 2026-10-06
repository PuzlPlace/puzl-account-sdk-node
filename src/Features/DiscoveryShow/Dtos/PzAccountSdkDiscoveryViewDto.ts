import { pullString, pullStringList, valuesOf, type PzAccountSdkValues } from '../../../Support/PzAccountSdkDto.js';
import { PzAccountSdkResultDto, type PzAccountSdkResultFields } from '../../Shared/Dtos/PzAccountSdkResultDto.js';

export interface PzAccountSdkDiscoveryViewFields extends PzAccountSdkResultFields {
  issuer: string;
  authorization_endpoint: string;
  token_endpoint: string;
  userinfo_endpoint: string;
  revocation_endpoint: string;
  end_session_endpoint: string;
  jwks_uri: string;
  response_types_supported: string[];
  grant_types_supported: string[];
  scopes_supported: string[];
  claims_supported: string[];
  token_endpoint_auth_methods_supported: string[];
  code_challenge_methods_supported: string[];
  id_token_signing_alg_values_supported: string[];
}

/**
 * Documento de discovery do OIDC (`/.well-known/openid-configuration`).
 *
 * O SDK não depende dele — os endpoints são fixos e derivados do issuer —,
 * mas ele é útil para diagnóstico e para conferir o que o provedor suporta.
 */
export class PzAccountSdkDiscoveryViewDto extends PzAccountSdkResultDto {
  readonly issuer: string;
  readonly authorization_endpoint: string;
  readonly token_endpoint: string;
  readonly userinfo_endpoint: string;
  readonly revocation_endpoint: string;
  readonly end_session_endpoint: string;
  readonly jwks_uri: string;
  readonly response_types_supported: string[];
  readonly grant_types_supported: string[];
  readonly scopes_supported: string[];
  readonly claims_supported: string[];
  readonly token_endpoint_auth_methods_supported: string[];
  readonly code_challenge_methods_supported: string[];
  readonly id_token_signing_alg_values_supported: string[];

  constructor(props: Partial<PzAccountSdkDiscoveryViewFields> = {}) {
    super(props);
    this.issuer = props.issuer ?? '';
    this.authorization_endpoint = props.authorization_endpoint ?? '';
    this.token_endpoint = props.token_endpoint ?? '';
    this.userinfo_endpoint = props.userinfo_endpoint ?? '';
    this.revocation_endpoint = props.revocation_endpoint ?? '';
    this.end_session_endpoint = props.end_session_endpoint ?? '';
    this.jwks_uri = props.jwks_uri ?? '';
    this.response_types_supported = props.response_types_supported ?? [];
    this.grant_types_supported = props.grant_types_supported ?? [];
    this.scopes_supported = props.scopes_supported ?? [];
    this.claims_supported = props.claims_supported ?? [];
    this.token_endpoint_auth_methods_supported = props.token_endpoint_auth_methods_supported ?? [];
    this.code_challenge_methods_supported = props.code_challenge_methods_supported ?? [];
    this.id_token_signing_alg_values_supported = props.id_token_signing_alg_values_supported ?? [];
  }

  static override from(values: unknown): PzAccountSdkDiscoveryViewDto {
    const v = valuesOf(values);

    return new PzAccountSdkDiscoveryViewDto({
      ...PzAccountSdkResultDto.resultArgs(v),
      issuer: pullString(v, 'issuer'),
      authorization_endpoint: pullString(v, 'authorization_endpoint'),
      token_endpoint: pullString(v, 'token_endpoint'),
      userinfo_endpoint: pullString(v, 'userinfo_endpoint'),
      revocation_endpoint: pullString(v, 'revocation_endpoint'),
      end_session_endpoint: pullString(v, 'end_session_endpoint'),
      jwks_uri: pullString(v, 'jwks_uri'),
      response_types_supported: pullStringList(v, 'response_types_supported'),
      grant_types_supported: pullStringList(v, 'grant_types_supported'),
      scopes_supported: pullStringList(v, 'scopes_supported'),
      claims_supported: pullStringList(v, 'claims_supported'),
      token_endpoint_auth_methods_supported: pullStringList(v, 'token_endpoint_auth_methods_supported'),
      code_challenge_methods_supported: pullStringList(v, 'code_challenge_methods_supported'),
      id_token_signing_alg_values_supported: pullStringList(v, 'id_token_signing_alg_values_supported'),
    });
  }

  override toArray(): PzAccountSdkValues {
    return {
      ...super.toArray(),
      issuer: this.issuer,
      authorization_endpoint: this.authorization_endpoint,
      token_endpoint: this.token_endpoint,
      userinfo_endpoint: this.userinfo_endpoint,
      revocation_endpoint: this.revocation_endpoint,
      end_session_endpoint: this.end_session_endpoint,
      jwks_uri: this.jwks_uri,
      response_types_supported: this.response_types_supported,
      grant_types_supported: this.grant_types_supported,
      scopes_supported: this.scopes_supported,
      claims_supported: this.claims_supported,
      token_endpoint_auth_methods_supported: this.token_endpoint_auth_methods_supported,
      code_challenge_methods_supported: this.code_challenge_methods_supported,
      id_token_signing_alg_values_supported: this.id_token_signing_alg_values_supported,
    };
  }
}
