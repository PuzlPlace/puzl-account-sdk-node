Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const require_PzAccountSdkClient = require("./PzAccountSdkClient-DrGNxF0p.cjs");
/**
* Tabelas e respostas padrão do `PzAccountSdkClientFake`.
*
* @internal
*/
const PzAccountSdkFakeResponses = {
	/** Classe de retorno de cada operação programável — a ordem é a do contrato. */
	RETURN_DTO: {
		discoveryShow: require_PzAccountSdkClient.PzAccountSdkDiscoveryViewDto,
		tokenExchangeCode: require_PzAccountSdkClient.PzAccountSdkTokenViewDto,
		tokenRefresh: require_PzAccountSdkClient.PzAccountSdkTokenViewDto,
		tokenPassword: require_PzAccountSdkClient.PzAccountSdkTokenViewDto,
		tokenRevoke: require_PzAccountSdkClient.PzAccountSdkResultDto,
		userInfoShow: require_PzAccountSdkClient.PzAccountSdkUserInfoViewDto,
		idTokenVerify: require_PzAccountSdkClient.PzAccountSdkIdentityViewDto,
		webhookEventVerify: require_PzAccountSdkClient.PzAccountSdkWebhookEventViewDto,
		userRegister: require_PzAccountSdkClient.PzAccountSdkUserProfileViewDto,
		meShow: require_PzAccountSdkClient.PzAccountSdkUserProfileViewDto,
		meUpdate: require_PzAccountSdkClient.PzAccountSdkUserProfileViewDto,
		mePasswordChange: require_PzAccountSdkClient.PzAccountSdkResultDto,
		meEmailChange: require_PzAccountSdkClient.PzAccountSdkResultDto,
		mePictureUpload: require_PzAccountSdkClient.PzAccountSdkUserProfileViewDto,
		mePicturePresetSet: require_PzAccountSdkClient.PzAccountSdkUserProfileViewDto,
		mePictureDelete: require_PzAccountSdkClient.PzAccountSdkUserProfileViewDto,
		meMfaShow: require_PzAccountSdkClient.PzAccountSdkMfaStatusViewDto,
		meMfaEnroll: require_PzAccountSdkClient.PzAccountSdkMfaEnrollViewDto,
		meMfaEnrollConfirm: require_PzAccountSdkClient.PzAccountSdkMfaRecoveryCodesViewDto,
		meMfaDisable: require_PzAccountSdkClient.PzAccountSdkResultDto,
		meMfaRecoveryCodesRegenerate: require_PzAccountSdkClient.PzAccountSdkMfaRecoveryCodesViewDto,
		meConsentList: require_PzAccountSdkClient.PzAccountSdkConsentListViewDto,
		meConsentRevoke: require_PzAccountSdkClient.PzAccountSdkResultDto
	},
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
		meConsentRevoke: 204
	},
	FAKE_ISSUER: "https://account.pzaccountsdk.test",
	FAKE_CLIENT_ID: "fake-client-id",
	/** `sub` de todas as respostas padrão: um ULID fixo. */
	FAKE_SUB: "01JFAKE0000000000000000000",
	FAKE_EMAIL: "fake@pzaccountsdk.test",
	/**
	* Corpo de sucesso plausível para a operação. Nome e e-mail da entrada
	* ecoam na resposta, para o teste conferir o que foi enviado.
	*/
	success(method, values) {
		const { FAKE_ISSUER, FAKE_CLIENT_ID, FAKE_SUB, FAKE_EMAIL } = PzAccountSdkFakeResponses;
		const email = typeof values["email"] === "string" && values["email"] !== "" ? values["email"] : FAKE_EMAIL;
		const name = typeof values["name"] === "string" && values["name"] !== "" ? values["name"] : "Usuário Fake";
		const now = Math.floor(Date.now() / 1e3);
		const user = {
			id: 1,
			sub: FAKE_SUB,
			name,
			email,
			is_active: true,
			email_verified_at: "2026-01-01T00:00:00+00:00",
			birthdate: "1990-01-01",
			locale: "pt-BR",
			zoneinfo: "America/Sao_Paulo"
		};
		const claims = {
			sub: FAKE_SUB,
			email,
			email_verified: true,
			name
		};
		const token = {
			access_token: "fake-access-token",
			token_type: "Bearer",
			expires_in: 3600,
			scope: "openid email profile",
			id_token: "fake-id-token",
			refresh_token: method === "tokenPassword" ? "" : "fake-refresh-token"
		};
		const recoveryCodes = {
			recovery_codes: ["fake-recovery-1", "fake-recovery-2"],
			warning: "Guarde estes códigos."
		};
		switch (method) {
			case "discoveryShow": return {
				issuer: FAKE_ISSUER,
				authorization_endpoint: `${FAKE_ISSUER}/oauth/authorize`,
				token_endpoint: `${FAKE_ISSUER}/oauth/token`,
				userinfo_endpoint: `${FAKE_ISSUER}/oauth/userinfo`,
				revocation_endpoint: `${FAKE_ISSUER}/oauth/revoke`,
				end_session_endpoint: `${FAKE_ISSUER}/oauth/logout`,
				jwks_uri: `${FAKE_ISSUER}/.well-known/jwks.json`
			};
			case "tokenExchangeCode":
			case "tokenRefresh":
			case "tokenPassword": return token;
			case "userInfoShow": return claims;
			case "idTokenVerify": return {
				...claims,
				iat: now,
				exp: now + 3600,
				claims: {
					...claims,
					iss: FAKE_ISSUER,
					aud: FAKE_CLIENT_ID,
					nonce: values["nonce"] ?? ""
				}
			};
			case "webhookEventVerify": return {
				event_type: "tokens.revoked",
				event_uri: `${FAKE_ISSUER}/events/tokens-revoked`,
				sub: FAKE_SUB,
				txn: "fake-txn",
				jti: "fake-jti",
				iat: now,
				exp: now + 300
			};
			case "userRegister":
			case "meShow":
			case "meUpdate":
			case "mePictureUpload":
			case "mePicturePresetSet":
			case "mePictureDelete": return { user };
			case "meMfaShow": return {
				enabled: false,
				recovery_codes_remaining: 0
			};
			case "meMfaEnroll": return {
				secret: "FAKESECRETBASE32",
				otpauth_uri: `otpauth://totp/Puzl:${email}?secret=FAKESECRETBASE32&issuer=Puzl`,
				qr_svg: "<svg xmlns=\"http://www.w3.org/2000/svg\"/>"
			};
			case "meMfaEnrollConfirm":
			case "meMfaRecoveryCodesRegenerate": return recoveryCodes;
			case "meConsentList": return { consents: [] };
			default: return {};
		}
	}
};
//#endregion
//#region src/Testing/PzAccountSdkClientFake.ts
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
var PzAccountSdkClientFake = class PzAccountSdkClientFake extends require_PzAccountSdkClient.PzAccountSdkClient {
	static FAKE_ISSUER = PzAccountSdkFakeResponses.FAKE_ISSUER;
	static FAKE_CLIENT_ID = PzAccountSdkFakeResponses.FAKE_CLIENT_ID;
	/** `sub` de todas as respostas padrão: um ULID fixo. */
	static FAKE_SUB = PzAccountSdkFakeResponses.FAKE_SUB;
	static FAKE_EMAIL = PzAccountSdkFakeResponses.FAKE_EMAIL;
	static FAKE_CODE_VERIFIER = "fake-code-verifier-fake-code-verifier-fake-code-verifier";
	/** Operações locais: registradas em `calls()`, mas não programáveis. */
	static LOCAL_METHODS = [
		"pkceCreate",
		"authorizeUrl",
		"logoutUrl",
		"accountUrl"
	];
	/** O que `isConfigured()` responde. */
	configured = true;
	queue = /* @__PURE__ */ new Map();
	history = [];
	constructor() {
		super({
			issuer: PzAccountSdkFakeResponses.FAKE_ISSUER,
			clientId: PzAccountSdkFakeResponses.FAKE_CLIENT_ID,
			clientSecret: "fake-client-secret",
			redirectUri: "https://app.pzaccountsdk.test/auth/callback"
		}, { fetch: () => Promise.reject(/* @__PURE__ */ new Error("PzAccountSdkClientFake: o fake nunca faz requisições.")) });
	}
	/**
	* Programa a resposta de uma operação.
	*
	* Chamadas sucessivas formam uma fila; quando ela se esgota, a última
	* resposta se repete — assim um teste que chama o mesmo método N vezes não
	* precisa programar N respostas iguais.
	*/
	respond(method, response) {
		this.assertProgrammable(method);
		const expected = PzAccountSdkFakeResponses.RETURN_DTO[method];
		if (response instanceof require_PzAccountSdkClient.PzAccountSdkResultDto && !(response instanceof expected)) throw new TypeError(`PzAccountSdkClientFake: "${method}" devolve ${expected.name}, não ${response.constructor.name}.`);
		this.queue.set(method, [...this.queue.get(method) ?? [], response]);
		return this;
	}
	/**
	* Atalho para programar uma falha.
	*
	* @param errorCode valor de PzAccountSdkErrorCodeEnum, ou um código ainda
	*                  desconhecido, para exercitar esse caminho
	*/
	respondWithError(method, errorCode, httpStatus, message = "", errors = {}) {
		return this.respond(method, {
			has_error: true,
			error_code: errorCode,
			error_message: message,
			errors,
			http_status: httpStatus
		});
	}
	calls(method = null) {
		if (method === null) return [...this.history];
		this.assertKnownMethod(method);
		return this.history.filter((call) => call.method === method);
	}
	callCount(method = null) {
		return method === null ? this.history.length : this.calls(method).length;
	}
	/** Entrada da última chamada da operação, já como DTO, ou `null` se não houve. */
	lastInput(method) {
		return this.calls(method).at(-1)?.input ?? null;
	}
	/** Zera fila e histórico, para reaproveitar o dublê entre cenários. */
	reset() {
		this.queue = /* @__PURE__ */ new Map();
		this.history = [];
		return this;
	}
	/** Programável por `fake.configured = false`, para testar o produto sem a integração. */
	isConfigured() {
		return this.configured;
	}
	pkceCreate() {
		this.record("pkceCreate", null);
		return new require_PzAccountSdkClient.PzAccountSdkPkceViewDto({
			state: "fake-state",
			nonce: "fake-nonce",
			code_verifier: PzAccountSdkClientFake.FAKE_CODE_VERIFIER,
			code_challenge: require_PzAccountSdkClient.PzAccountSdkPkceCreateService.challengeFor(PzAccountSdkClientFake.FAKE_CODE_VERIFIER)
		});
	}
	authorizeUrl(input) {
		const dto = require_PzAccountSdkClient.toDto(require_PzAccountSdkClient.PzAccountSdkAuthorizeUrlDto, require_PzAccountSdkClient.PzAccountSdkAuthorizeUrlDto.from, input);
		this.record("authorizeUrl", dto);
		return super.authorizeUrl(dto);
	}
	logoutUrl(input = {}) {
		const dto = require_PzAccountSdkClient.toDto(require_PzAccountSdkClient.PzAccountSdkLogoutUrlDto, require_PzAccountSdkClient.PzAccountSdkLogoutUrlDto.from, input);
		this.record("logoutUrl", dto);
		return super.logoutUrl(dto);
	}
	accountUrl(page) {
		const enumPage = require_PzAccountSdkClient.PzAccountSdkAccountPageEnum.from(page);
		this.record("accountUrl", enumPage);
		return super.accountUrl(enumPage);
	}
	discoveryShow() {
		return this.resolve("discoveryShow", null);
	}
	tokenExchangeCode(input) {
		return this.resolve("tokenExchangeCode", () => require_PzAccountSdkClient.toDto(require_PzAccountSdkClient.PzAccountSdkTokenExchangeCodeDto, require_PzAccountSdkClient.PzAccountSdkTokenExchangeCodeDto.from, input));
	}
	tokenRefresh(input) {
		return this.resolve("tokenRefresh", () => require_PzAccountSdkClient.toDto(require_PzAccountSdkClient.PzAccountSdkTokenRefreshDto, require_PzAccountSdkClient.PzAccountSdkTokenRefreshDto.from, input));
	}
	tokenPassword(input) {
		return this.resolve("tokenPassword", () => require_PzAccountSdkClient.toDto(require_PzAccountSdkClient.PzAccountSdkTokenPasswordDto, require_PzAccountSdkClient.PzAccountSdkTokenPasswordDto.from, input));
	}
	tokenRevoke(input) {
		return this.resolve("tokenRevoke", () => require_PzAccountSdkClient.toDto(require_PzAccountSdkClient.PzAccountSdkTokenRevokeDto, require_PzAccountSdkClient.PzAccountSdkTokenRevokeDto.from, input));
	}
	userInfoShow(input) {
		return this.resolve("userInfoShow", () => this.tokenInput(input));
	}
	idTokenVerify(input) {
		return this.resolve("idTokenVerify", () => require_PzAccountSdkClient.toDto(require_PzAccountSdkClient.PzAccountSdkIdTokenVerifyDto, require_PzAccountSdkClient.PzAccountSdkIdTokenVerifyDto.from, input));
	}
	webhookEventVerify(input) {
		return this.resolve("webhookEventVerify", () => require_PzAccountSdkClient.toDto(require_PzAccountSdkClient.PzAccountSdkWebhookEventVerifyDto, require_PzAccountSdkClient.PzAccountSdkWebhookEventVerifyDto.from, input));
	}
	userRegister(input) {
		return this.resolve("userRegister", () => require_PzAccountSdkClient.toDto(require_PzAccountSdkClient.PzAccountSdkUserRegisterDto, require_PzAccountSdkClient.PzAccountSdkUserRegisterDto.from, input));
	}
	meShow(input) {
		return this.resolve("meShow", () => this.tokenInput(input));
	}
	meUpdate(input) {
		return this.resolve("meUpdate", () => require_PzAccountSdkClient.toDto(require_PzAccountSdkClient.PzAccountSdkMeUpdateDto, require_PzAccountSdkClient.PzAccountSdkMeUpdateDto.from, input));
	}
	mePasswordChange(input) {
		return this.resolve("mePasswordChange", () => require_PzAccountSdkClient.toDto(require_PzAccountSdkClient.PzAccountSdkMePasswordChangeDto, require_PzAccountSdkClient.PzAccountSdkMePasswordChangeDto.from, input));
	}
	meEmailChange(input) {
		return this.resolve("meEmailChange", () => require_PzAccountSdkClient.toDto(require_PzAccountSdkClient.PzAccountSdkMeEmailChangeDto, require_PzAccountSdkClient.PzAccountSdkMeEmailChangeDto.from, input));
	}
	mePictureUpload(input) {
		return this.resolve("mePictureUpload", () => require_PzAccountSdkClient.toDto(require_PzAccountSdkClient.PzAccountSdkMePictureUploadDto, require_PzAccountSdkClient.PzAccountSdkMePictureUploadDto.from, input));
	}
	mePicturePresetSet(input) {
		return this.resolve("mePicturePresetSet", () => require_PzAccountSdkClient.toDto(require_PzAccountSdkClient.PzAccountSdkMePicturePresetSetDto, require_PzAccountSdkClient.PzAccountSdkMePicturePresetSetDto.from, input));
	}
	mePictureDelete(input) {
		return this.resolve("mePictureDelete", () => this.tokenInput(input));
	}
	meMfaShow(input) {
		return this.resolve("meMfaShow", () => this.tokenInput(input));
	}
	meMfaEnroll(input) {
		return this.resolve("meMfaEnroll", () => require_PzAccountSdkClient.toDto(require_PzAccountSdkClient.PzAccountSdkMeMfaEnrollDto, require_PzAccountSdkClient.PzAccountSdkMeMfaEnrollDto.from, input));
	}
	meMfaEnrollConfirm(input) {
		return this.resolve("meMfaEnrollConfirm", () => require_PzAccountSdkClient.toDto(require_PzAccountSdkClient.PzAccountSdkMeMfaEnrollConfirmDto, require_PzAccountSdkClient.PzAccountSdkMeMfaEnrollConfirmDto.from, input));
	}
	meMfaDisable(input) {
		return this.resolve("meMfaDisable", () => require_PzAccountSdkClient.toDto(require_PzAccountSdkClient.PzAccountSdkMeMfaDisableDto, require_PzAccountSdkClient.PzAccountSdkMeMfaDisableDto.from, input));
	}
	meMfaRecoveryCodesRegenerate(input) {
		return this.resolve("meMfaRecoveryCodesRegenerate", () => require_PzAccountSdkClient.toDto(require_PzAccountSdkClient.PzAccountSdkMeMfaRecoveryCodesRegenerateDto, require_PzAccountSdkClient.PzAccountSdkMeMfaRecoveryCodesRegenerateDto.from, input));
	}
	meConsentList(input) {
		return this.resolve("meConsentList", () => this.tokenInput(input));
	}
	meConsentRevoke(input) {
		return this.resolve("meConsentRevoke", () => require_PzAccountSdkClient.toDto(require_PzAccountSdkClient.PzAccountSdkMeConsentRevokeDto, require_PzAccountSdkClient.PzAccountSdkMeConsentRevokeDto.from, input));
	}
	async resolve(method, input) {
		const dto = input === null ? null : input();
		this.record(method, dto);
		let response = this.nextResponse(method);
		if (response === void 0) return this.defaultSuccess(method, dto);
		if (typeof response === "function") response = await response(dto);
		if (response instanceof require_PzAccountSdkClient.PzAccountSdkResultDto) return response;
		const values = { ...response };
		if (!Object.hasOwn(values, "http_status") && !require_PzAccountSdkClient.isTruthy(values["has_error"])) values["http_status"] = PzAccountSdkFakeResponses.SUCCESS_STATUS[method];
		return PzAccountSdkFakeResponses.RETURN_DTO[method].from(values);
	}
	/** A próxima da fila; a última se repete. */
	nextResponse(method) {
		const queued = this.queue.get(method) ?? [];
		return queued.length <= 1 ? queued[0] : queued.shift();
	}
	defaultSuccess(method, input) {
		const values = PzAccountSdkFakeResponses.success(method, input instanceof require_PzAccountSdkClient.PzAccountSdkDto ? input.toArray() : {});
		return PzAccountSdkFakeResponses.RETURN_DTO[method].from({
			...values,
			has_error: false,
			http_status: PzAccountSdkFakeResponses.SUCCESS_STATUS[method]
		});
	}
	record(method, input) {
		this.history.push({
			method,
			input
		});
	}
	tokenInput(input) {
		return require_PzAccountSdkClient.toDto(require_PzAccountSdkClient.PzAccountSdkAccessTokenDto, require_PzAccountSdkClient.PzAccountSdkAccessTokenDto.from, input);
	}
	assertProgrammable(method) {
		if (!Object.hasOwn(PzAccountSdkFakeResponses.RETURN_DTO, method)) throw new TypeError(`PzAccountSdkClientFake: operação "${method}" não é programável. Esperado um de: ${Object.keys(PzAccountSdkFakeResponses.RETURN_DTO).join(", ")}.`);
	}
	assertKnownMethod(method) {
		const known = [...PzAccountSdkClientFake.LOCAL_METHODS, ...Object.keys(PzAccountSdkFakeResponses.RETURN_DTO)];
		if (!known.includes(method)) throw new TypeError(`PzAccountSdkClientFake: operação desconhecida "${method}". Esperado um de: ${known.join(", ")}.`);
	}
};
//#endregion
exports.PzAccountSdkClientFake = PzAccountSdkClientFake;
