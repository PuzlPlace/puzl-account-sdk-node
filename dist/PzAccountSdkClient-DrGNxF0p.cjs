let node_http = require("node:http");
let node_crypto = require("node:crypto");
let node_fs = require("node:fs");
let node_path = require("node:path");
//#region src/Enum/PzAccountSdkEnum.ts
/**
* Base dos enums do SDK — o equivalente ao `enum: string` do PHP.
*
* Cada caso é uma instância única (`PzAccountSdkPromptEnum.LOGIN`), com
* `name` e `value`, e cada enum expõe `cases()`, `from()` e `tryFrom()`.
* Onde o SDK recebe um enum, também aceita o valor cru (`'login'`), para
* quem escreve JavaScript puro.
*/
var PzAccountSdkEnum = class {
	name;
	value;
	constructor(name, value) {
		this.name = name;
		this.value = value;
	}
	toString() {
		return this.value;
	}
	toJSON() {
		return this.value;
	}
};
/**
* Monta `cases`, `from` e `tryFrom` de um enum a partir da lista de casos.
*
* @internal
*/
function enumLookup(enumName, cases) {
	const byValue = new Map(cases.map((c) => [c.value, c]));
	const tryFrom = (value) => {
		if (typeof value === "string") return byValue.get(value) ?? null;
		if (value instanceof PzAccountSdkEnum || typeof value === "object" && value !== null && "value" in value) {
			const raw = value.value;
			return typeof raw === "string" ? byValue.get(raw) ?? null : null;
		}
		return null;
	};
	const from = (value) => {
		const found = tryFrom(value);
		if (found === null) throw new TypeError(`"${String(value)}" não é um valor válido de ${enumName}.`);
		return found;
	};
	return {
		cases: () => cases,
		from,
		tryFrom
	};
}
//#endregion
//#region src/Enum/PzAccountSdkAccountPageEnum.ts
/**
* Telas da conta no Puzl Account para onde o produto pode mandar o usuário.
* O valor é o caminho a partir do issuer.
*/
var PzAccountSdkAccountPageEnum = class PzAccountSdkAccountPageEnum extends PzAccountSdkEnum {
	static HOME = new PzAccountSdkAccountPageEnum("HOME", "/");
	static PROFILE = new PzAccountSdkAccountPageEnum("PROFILE", "/account/profile");
	static PICTURE = new PzAccountSdkAccountPageEnum("PICTURE", "/account/picture");
	static PASSWORD = new PzAccountSdkAccountPageEnum("PASSWORD", "/account/password");
	static LOGIN_METHODS = new PzAccountSdkAccountPageEnum("LOGIN_METHODS", "/account/login-methods");
	static MFA_ENROLL = new PzAccountSdkAccountPageEnum("MFA_ENROLL", "/account/mfa/enroll");
	static DELETE = new PzAccountSdkAccountPageEnum("DELETE", "/account/delete");
	static lookup = enumLookup("PzAccountSdkAccountPageEnum", [
		PzAccountSdkAccountPageEnum.HOME,
		PzAccountSdkAccountPageEnum.PROFILE,
		PzAccountSdkAccountPageEnum.PICTURE,
		PzAccountSdkAccountPageEnum.PASSWORD,
		PzAccountSdkAccountPageEnum.LOGIN_METHODS,
		PzAccountSdkAccountPageEnum.MFA_ENROLL,
		PzAccountSdkAccountPageEnum.DELETE
	]);
	static cases() {
		return PzAccountSdkAccountPageEnum.lookup.cases();
	}
	static from(value) {
		return PzAccountSdkAccountPageEnum.lookup.from(value);
	}
	static tryFrom(value) {
		return PzAccountSdkAccountPageEnum.lookup.tryFrom(value);
	}
};
//#endregion
//#region src/Features/AccountUrl/Services/PzAccountSdkAccountUrlService.ts
/**
* URL de uma tela da conta no Puzl Account (editar perfil, trocar senha).
*
* Local, sem HTTP. A sessão do usuário no provedor é que decide se ele vê a
* tela direto ou passa antes pelo login.
*
* @internal
*/
var PzAccountSdkAccountUrlService = class {
	config;
	constructor(config) {
		this.config = config;
	}
	execute(page) {
		this.config.assertUsable();
		return this.config.issuer + page.value;
	}
};
//#endregion
//#region src/Enum/PzAccountSdkPromptEnum.ts
/**
* Valores aceitos no parâmetro `prompt` do /oauth/authorize.
*/
var PzAccountSdkPromptEnum = class PzAccountSdkPromptEnum extends PzAccountSdkEnum {
	/** Não mostra tela nenhuma: sem sessão no provedor, volta com `login_required`. */
	static NONE = new PzAccountSdkPromptEnum("NONE", "none");
	/** Pede a senha de novo, mesmo havendo sessão. */
	static LOGIN = new PzAccountSdkPromptEnum("LOGIN", "login");
	/** Mostra a tela de consentimento mesmo já havendo um. */
	static CONSENT = new PzAccountSdkPromptEnum("CONSENT", "consent");
	/** Mostra a escolha de conta. */
	static SELECT_ACCOUNT = new PzAccountSdkPromptEnum("SELECT_ACCOUNT", "select_account");
	/** Abre direto o cadastro em vez do login ("Criar conta Puzl"). */
	static CREATE = new PzAccountSdkPromptEnum("CREATE", "create");
	static lookup = enumLookup("PzAccountSdkPromptEnum", [
		PzAccountSdkPromptEnum.NONE,
		PzAccountSdkPromptEnum.LOGIN,
		PzAccountSdkPromptEnum.CONSENT,
		PzAccountSdkPromptEnum.SELECT_ACCOUNT,
		PzAccountSdkPromptEnum.CREATE
	]);
	static cases() {
		return PzAccountSdkPromptEnum.lookup.cases();
	}
	static from(value) {
		return PzAccountSdkPromptEnum.lookup.from(value);
	}
	static tryFrom(value) {
		return PzAccountSdkPromptEnum.lookup.tryFrom(value);
	}
};
//#endregion
//#region src/Support/PzAccountSdkValue.ts
function isRecord(value) {
	return typeof value === "object" && value !== null;
}
/** `is_scalar()` do PHP: string, número finito ou booleano. */
function isScalar(value) {
	return typeof value === "string" || typeof value === "boolean" || typeof value === "number" && Number.isFinite(value);
}
/** `(string) $scalar` do PHP: `true` vira "1", `false` vira "". */
function scalarToString(value) {
	if (typeof value === "boolean") return value ? "1" : "";
	return String(value);
}
const NUMERIC = /^[ \t\n\r\v\f]*[+-]?(\d+(\.\d*)?|\.\d+)([eE][+-]?\d+)?[ \t\n\r\v\f]*$/;
/** `is_numeric()` do PHP: número, ou string que representa um número. */
function isNumeric(value) {
	if (typeof value === "number") return Number.isFinite(value);
	return typeof value === "string" && NUMERIC.test(value);
}
/** `(int) $numeric` do PHP: trunca na direção do zero. */
function toInt(value) {
	return Math.trunc(Number(value));
}
/** Verdade no sentido do PHP: "", "0", 0 e array vazio são falsos. */
function isTruthy(value) {
	if (value === void 0 || value === null || value === false || value === "" || value === "0" || value === 0) return false;
	if (Array.isArray(value)) return value.length > 0;
	if (isRecord(value) && Object.getPrototypeOf(value) === Object.prototype) return Object.keys(value).length > 0;
	return true;
}
/** `rawurlencode()` do PHP (RFC 3986): só `A-Za-z0-9-_.~` passam. */
function rawUrlEncode(value) {
	return encodeURIComponent(value).replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
}
/** `http_build_query(..., PHP_QUERY_RFC3986)`, já sem os valores vazios. */
function buildQuery(params) {
	return Object.entries(params).filter(([, value]) => value !== "").map(([key, value]) => `${rawUrlEncode(key)}=${rawUrlEncode(value)}`).join("&");
}
//#endregion
//#region src/Support/PzAccountSdkDto.ts
/**
* Base dos DTOs.
*
* Cada DTO tem um `static from(values)`, que aceita qualquer coisa (resposta
* crua do provedor, objeto vindo de JavaScript sem tipos) e aplica as regras
* de coerção abaixo — as mesmas do SDK PHP. Ausente e `null` viram o valor
* neutro do tipo: `''`, `0`, `false`, `[]`.
*
* `toArray()` devolve um objeto simples; `toJSON()` e o `console.log` usam o
* mesmo formato — com os segredos mascarados nos DTOs de entrada.
*/
var PzAccountSdkDto = class {
	toJSON() {
		return this.toArray();
	}
	toJson() {
		return JSON.stringify(this.toArray());
	}
	/** `console.log(dto)` mostra o `toArray()`, nunca um segredo cru. */
	[Symbol.for("nodejs.util.inspect.custom")]() {
		return this.toArray();
	}
};
/** Objeto de entrada do `from()`: qualquer coisa que não seja objeto vira `{}`. */
function valuesOf(values) {
	return isRecord(values) ? values : {};
}
function pullString(values, key) {
	const value = values[key];
	return isScalar(value) ? scalarToString(value) : "";
}
function pullInt(values, key) {
	const value = values[key];
	return isNumeric(value) ? toInt(value) : 0;
}
function pullBool(values, key) {
	return isTruthy(values[key]);
}
/** Objeto ou lista; qualquer outra coisa vira objeto vazio. */
function pullArray(values, key) {
	const value = values[key];
	return isRecord(value) ? value : {};
}
/**
* Lista de strings: descarta o que não for escalar, para que um item
* inesperado no JSON não vire `[object Object]` no consumidor.
*/
function pullStringList(values, key) {
	return Object.values(pullArray(values, key)).filter(isScalar).map(scalarToString);
}
/**
* Credencial para `toArray()`: os DTOs de entrada mascaram senhas, tokens
* e códigos, porque `toArray()`/`toJSON()` costumam terminar em log. O
* valor real continua na propriedade. Vazio fica vazio, para o log dizer
* se o campo veio.
*/
function mask(value) {
	return value === "" ? "" : "********";
}
/**
* A instância do DTO, se já for uma; senão, o `from()` do objeto simples.
*
* @internal
*/
function toDto(dto, from, input) {
	return input instanceof dto ? input : from(input);
}
//#endregion
//#region src/Features/AuthorizeUrl/Dtos/PzAccountSdkAuthorizeUrlDto.ts
/**
* Entrada de `authorizeUrl`.
*
* `state`, `nonce` e `code_challenge` vêm de `pkceCreate()`. Os demais são
* opcionais: string vazia ou `null` significa "não enviar" — e, para
* `redirect_uri` e `scope`, "usar o da configuração".
*/
var PzAccountSdkAuthorizeUrlDto = class PzAccountSdkAuthorizeUrlDto extends PzAccountSdkDto {
	state;
	nonce;
	code_challenge;
	redirect_uri;
	scope;
	prompt;
	login_hint;
	response_mode;
	constructor(props) {
		super();
		this.state = props.state;
		this.nonce = props.nonce;
		this.code_challenge = props.code_challenge;
		this.redirect_uri = props.redirect_uri ?? "";
		this.scope = props.scope ?? "";
		this.prompt = PzAccountSdkPromptEnum.tryFrom(props.prompt);
		this.login_hint = props.login_hint ?? "";
		this.response_mode = props.response_mode ?? "";
	}
	static from(values) {
		const v = valuesOf(values);
		return new PzAccountSdkAuthorizeUrlDto({
			state: pullString(v, "state"),
			nonce: pullString(v, "nonce"),
			code_challenge: pullString(v, "code_challenge"),
			redirect_uri: pullString(v, "redirect_uri"),
			scope: pullString(v, "scope"),
			prompt: PzAccountSdkPromptEnum.tryFrom(v["prompt"]),
			login_hint: pullString(v, "login_hint"),
			response_mode: pullString(v, "response_mode")
		});
	}
	toArray() {
		return {
			state: this.state,
			nonce: this.nonce,
			code_challenge: this.code_challenge,
			redirect_uri: this.redirect_uri,
			scope: this.scope,
			prompt: this.prompt?.value ?? null,
			login_hint: this.login_hint,
			response_mode: this.response_mode
		};
	}
};
//#endregion
//#region src/Features/AuthorizeUrl/Services/PzAccountSdkAuthorizeUrlService.ts
/**
* Monta a URL do /oauth/authorize para onde o navegador é mandado.
*
* Local, sem HTTP. PKCE é sempre S256 — o Puzl Account não aceita `plain`.
*
* @internal
*/
var PzAccountSdkAuthorizeUrlService = class PzAccountSdkAuthorizeUrlService {
	config;
	static ENDPOINT = "/oauth/authorize";
	constructor(config) {
		this.config = config;
	}
	execute(input) {
		let redirectUri = input.redirect_uri;
		if (redirectUri === "") {
			this.config.assertRedirectUsable();
			redirectUri = this.config.redirectUri;
		}
		this.config.assertUsable();
		const query = buildQuery({
			response_type: "code",
			client_id: this.config.clientId,
			redirect_uri: redirectUri,
			scope: input.scope !== "" ? input.scope : this.config.scope,
			state: input.state,
			nonce: input.nonce,
			code_challenge: input.code_challenge,
			code_challenge_method: "S256",
			prompt: input.prompt?.value ?? "",
			login_hint: input.login_hint,
			response_mode: input.response_mode
		});
		return `${this.config.issuer}${PzAccountSdkAuthorizeUrlService.ENDPOINT}?${query}`;
	}
};
//#endregion
//#region src/Enum/PzAccountSdkErrorCodeEnum.ts
/**
* Códigos de erro que chegam em `PzAccountSdkResultDto.error_code`.
*
* Três origens convivem aqui, cada uma com sua grafia:
*
* - API da conta (`/api/identity/*`): campo `code` do envelope de erro,
*   em MAIÚSCULAS (ex.: `EMAIL_ALREADY_EXISTS`).
* - Protocolo OAuth (`/oauth/*`): campo `error` das RFCs 6749/7009, em
*   minúsculas (ex.: `invalid_grant`).
* - O próprio SDK, quando a falha é detectada do lado de cá: id_token ou
*   webhook que não passou na verificação, JWKS inacessível.
*
* O código é contrato estável; a mensagem é traduzida e pode mudar sem aviso.
* Ramifique sempre por este enum.
*
* Nunca tipe uma propriedade de DTO com ele: um código novo do Puzl Account,
* ainda desconhecido por esta versão do SDK, precisa chegar ao consumidor
* como string crua. Por isso o DTO guarda `error_code: string` e expõe
* `getErrorCode()`, que devolve `null` para o que não reconhece.
*/
var PzAccountSdkErrorCodeEnum = class PzAccountSdkErrorCodeEnum extends PzAccountSdkEnum {
	status;
	clientFault;
	constructor(name, value, status, clientFault) {
		super(name, value);
		this.status = status;
		this.clientFault = clientFault;
	}
	/** 422 — falha de validação; detalhes em `errors` */
	static VALIDATION_ERROR = new PzAccountSdkErrorCodeEnum("VALIDATION_ERROR", "VALIDATION_ERROR", 422, true);
	/** 401 — access token ausente, vencido ou revogado */
	static UNAUTHENTICATED = new PzAccountSdkErrorCodeEnum("UNAUTHENTICATED", "UNAUTHENTICATED", 401, true);
	/** 403 — o token não foi emitido para um client first-party */
	static FORBIDDEN = new PzAccountSdkErrorCodeEnum("FORBIDDEN", "FORBIDDEN", 403, false);
	/** 404 — rota ou registro inexistente */
	static NOT_FOUND = new PzAccountSdkErrorCodeEnum("NOT_FOUND", "NOT_FOUND", 404, false);
	/** 405 — método HTTP não aceito pela rota */
	static METHOD_NOT_ALLOWED = new PzAccountSdkErrorCodeEnum("METHOD_NOT_ALLOWED", "METHOD_NOT_ALLOWED", 405, false);
	/** 406 — regra de negócio sem código específico */
	static BUSINESS_ERROR = new PzAccountSdkErrorCodeEnum("BUSINESS_ERROR", "BUSINESS_ERROR", 406, true);
	/** 429 — rate limit estourado */
	static TOO_MANY_REQUESTS = new PzAccountSdkErrorCodeEnum("TOO_MANY_REQUESTS", "TOO_MANY_REQUESTS", 429, true);
	/** 503 — falha não categorizada no Puzl Account */
	static SERVICE_UNAVAILABLE = new PzAccountSdkErrorCodeEnum("SERVICE_UNAVAILABLE", "SERVICE_UNAVAILABLE", 503, false);
	/** 409 — e-mail já cadastrado em outra conta */
	static EMAIL_ALREADY_EXISTS = new PzAccountSdkErrorCodeEnum("EMAIL_ALREADY_EXISTS", "EMAIL_ALREADY_EXISTS", 409, true);
	/** 403 — conta desativada */
	static USER_INACTIVE = new PzAccountSdkErrorCodeEnum("USER_INACTIVE", "USER_INACTIVE", 403, true);
	/** 401 — a senha atual informada não confere */
	static INVALID_CURRENT_PASSWORD = new PzAccountSdkErrorCodeEnum("INVALID_CURRENT_PASSWORD", "INVALID_CURRENT_PASSWORD", 401, true);
	/** 404 — conta inexistente */
	static USER_NOT_FOUND = new PzAccountSdkErrorCodeEnum("USER_NOT_FOUND", "USER_NOT_FOUND", 404, false);
	/** 429 — senha atual errada vezes demais: conferência bloqueada por um tempo */
	static CURRENT_PASSWORD_LOCKED = new PzAccountSdkErrorCodeEnum("CURRENT_PASSWORD_LOCKED", "CURRENT_PASSWORD_LOCKED", 429, true);
	/** 409 — a conta não tem senha (entra com Google/Apple) */
	static CURRENT_PASSWORD_NOT_SET = new PzAccountSdkErrorCodeEnum("CURRENT_PASSWORD_NOT_SET", "CURRENT_PASSWORD_NOT_SET", 409, true);
	/** 409 — já existe um pedido de troca de e-mail em aberto */
	static EMAIL_CHANGE_ALREADY_REQUESTED = new PzAccountSdkErrorCodeEnum("EMAIL_CHANGE_ALREADY_REQUESTED", "EMAIL_CHANGE_ALREADY_REQUESTED", 409, true);
	/** 404 — não há consentimento ativo para o client informado */
	static CONSENT_NOT_FOUND = new PzAccountSdkErrorCodeEnum("CONSENT_NOT_FOUND", "CONSENT_NOT_FOUND", 404, true);
	/** 409 — MFA já está ligado */
	static MFA_ALREADY_ENABLED = new PzAccountSdkErrorCodeEnum("MFA_ALREADY_ENABLED", "MFA_ALREADY_ENABLED", 409, true);
	/** 409 — MFA não está ligado */
	static MFA_NOT_ENABLED = new PzAccountSdkErrorCodeEnum("MFA_NOT_ENABLED", "MFA_NOT_ENABLED", 409, true);
	/** 404 — não há cadastro de MFA pendente para confirmar */
	static MFA_ENROLLMENT_NOT_FOUND = new PzAccountSdkErrorCodeEnum("MFA_ENROLLMENT_NOT_FOUND", "MFA_ENROLLMENT_NOT_FOUND", 404, true);
	/** 401 — código TOTP recusado */
	static MFA_INVALID_CODE = new PzAccountSdkErrorCodeEnum("MFA_INVALID_CODE", "MFA_INVALID_CODE", 401, true);
	/** 401 — código de recuperação recusado */
	static MFA_RECOVERY_CODE_INVALID = new PzAccountSdkErrorCodeEnum("MFA_RECOVERY_CODE_INVALID", "MFA_RECOVERY_CODE_INVALID", 401, true);
	/** 429 — códigos errados demais: MFA bloqueado por um tempo */
	static MFA_LOCKED = new PzAccountSdkErrorCodeEnum("MFA_LOCKED", "MFA_LOCKED", 429, true);
	/**
	* 400 — parâmetro ausente ou malformado.
	*
	* Atenção: o rate limit dos endpoints `/oauth/*` também chega com este
	* código, mas com status 429 — use `isRateLimited()` para separar.
	*/
	static INVALID_REQUEST = new PzAccountSdkErrorCodeEnum("INVALID_REQUEST", "invalid_request", 400, false);
	/** 401 — client_id/client_secret inválidos ou método de autenticação diferente do registrado */
	static INVALID_CLIENT = new PzAccountSdkErrorCodeEnum("INVALID_CLIENT", "invalid_client", 401, false);
	/**
	* 400 — code, refresh_token ou credencial do usuário inválidos.
	*
	* No password grant é a resposta tanto para senha errada quanto para
	* conta com MFA — o provedor não diferencia, de propósito.
	*/
	static INVALID_GRANT = new PzAccountSdkErrorCodeEnum("INVALID_GRANT", "invalid_grant", 400, true);
	/** 400 — o client não pode usar este grant (ex.: password grant não habilitado) */
	static UNAUTHORIZED_CLIENT = new PzAccountSdkErrorCodeEnum("UNAUTHORIZED_CLIENT", "unauthorized_client", 400, false);
	/** 400 — grant_type desconhecido */
	static UNSUPPORTED_GRANT_TYPE = new PzAccountSdkErrorCodeEnum("UNSUPPORTED_GRANT_TYPE", "unsupported_grant_type", 400, false);
	/** 400 — escopo pedido não permitido para o client */
	static INVALID_SCOPE = new PzAccountSdkErrorCodeEnum("INVALID_SCOPE", "invalid_scope", 400, false);
	/**
	* 401 — access token inválido no /oauth/userinfo (RFC 6750).
	*
	* O provedor manda esse código só no header WWW-Authenticate; o SDK o
	* preenche ao ver um 401 sem corpo.
	*/
	static INVALID_TOKEN = new PzAccountSdkErrorCodeEnum("INVALID_TOKEN", "invalid_token", 401, true);
	/** 500 — falha interna no provedor */
	static SERVER_ERROR = new PzAccountSdkErrorCodeEnum("SERVER_ERROR", "server_error", 500, false);
	/** 503 — provedor temporariamente indisponível */
	static TEMPORARILY_UNAVAILABLE = new PzAccountSdkErrorCodeEnum("TEMPORARILY_UNAVAILABLE", "temporarily_unavailable", 503, false);
	/**
	* O id_token não passou na verificação: assinatura, emissor, audiência,
	* expiração, nonce, at_hash ou `sub` ausente. O SDK não detalha qual —
	* o motivo vai só em `error_message`, para log.
	*/
	static ID_TOKEN_INVALID = new PzAccountSdkErrorCodeEnum("ID_TOKEN_INVALID", "ID_TOKEN_INVALID", 401, true);
	/** O token do webhook (SET) não passou na verificação. */
	static WEBHOOK_TOKEN_INVALID = new PzAccountSdkErrorCodeEnum("WEBHOOK_TOKEN_INVALID", "WEBHOOK_TOKEN_INVALID", 401, false);
	/**
	* Não deu para obter as chaves públicas (JWKS). O token pode estar
	* perfeito: trate como indisponibilidade, não como credencial inválida.
	*/
	static JWKS_UNAVAILABLE = new PzAccountSdkErrorCodeEnum("JWKS_UNAVAILABLE", "JWKS_UNAVAILABLE", 503, false);
	static lookup = enumLookup("PzAccountSdkErrorCodeEnum", [
		PzAccountSdkErrorCodeEnum.VALIDATION_ERROR,
		PzAccountSdkErrorCodeEnum.UNAUTHENTICATED,
		PzAccountSdkErrorCodeEnum.FORBIDDEN,
		PzAccountSdkErrorCodeEnum.NOT_FOUND,
		PzAccountSdkErrorCodeEnum.METHOD_NOT_ALLOWED,
		PzAccountSdkErrorCodeEnum.BUSINESS_ERROR,
		PzAccountSdkErrorCodeEnum.TOO_MANY_REQUESTS,
		PzAccountSdkErrorCodeEnum.SERVICE_UNAVAILABLE,
		PzAccountSdkErrorCodeEnum.EMAIL_ALREADY_EXISTS,
		PzAccountSdkErrorCodeEnum.USER_INACTIVE,
		PzAccountSdkErrorCodeEnum.INVALID_CURRENT_PASSWORD,
		PzAccountSdkErrorCodeEnum.USER_NOT_FOUND,
		PzAccountSdkErrorCodeEnum.CURRENT_PASSWORD_LOCKED,
		PzAccountSdkErrorCodeEnum.CURRENT_PASSWORD_NOT_SET,
		PzAccountSdkErrorCodeEnum.EMAIL_CHANGE_ALREADY_REQUESTED,
		PzAccountSdkErrorCodeEnum.CONSENT_NOT_FOUND,
		PzAccountSdkErrorCodeEnum.MFA_ALREADY_ENABLED,
		PzAccountSdkErrorCodeEnum.MFA_NOT_ENABLED,
		PzAccountSdkErrorCodeEnum.MFA_ENROLLMENT_NOT_FOUND,
		PzAccountSdkErrorCodeEnum.MFA_INVALID_CODE,
		PzAccountSdkErrorCodeEnum.MFA_RECOVERY_CODE_INVALID,
		PzAccountSdkErrorCodeEnum.MFA_LOCKED,
		PzAccountSdkErrorCodeEnum.INVALID_REQUEST,
		PzAccountSdkErrorCodeEnum.INVALID_CLIENT,
		PzAccountSdkErrorCodeEnum.INVALID_GRANT,
		PzAccountSdkErrorCodeEnum.UNAUTHORIZED_CLIENT,
		PzAccountSdkErrorCodeEnum.UNSUPPORTED_GRANT_TYPE,
		PzAccountSdkErrorCodeEnum.INVALID_SCOPE,
		PzAccountSdkErrorCodeEnum.INVALID_TOKEN,
		PzAccountSdkErrorCodeEnum.SERVER_ERROR,
		PzAccountSdkErrorCodeEnum.TEMPORARILY_UNAVAILABLE,
		PzAccountSdkErrorCodeEnum.ID_TOKEN_INVALID,
		PzAccountSdkErrorCodeEnum.WEBHOOK_TOKEN_INVALID,
		PzAccountSdkErrorCodeEnum.JWKS_UNAVAILABLE
	]);
	static cases() {
		return PzAccountSdkErrorCodeEnum.lookup.cases();
	}
	static from(value) {
		return PzAccountSdkErrorCodeEnum.lookup.from(value);
	}
	static tryFrom(value) {
		return PzAccountSdkErrorCodeEnum.lookup.tryFrom(value);
	}
	/**
	* Separa o que é culpa de quem chamou — credencial do usuário final, dado
	* inválido, excesso de tentativas — do que é erro de configuração do
	* produto ou de infraestrutura.
	*
	* Repassar ao usuário final um `invalid_client` (credencial do APP) como
	* se fosse culpa dele derruba a sessão de quem não tem nada a ver com isso.
	*/
	isClientFault() {
		return this.clientFault;
	}
	/** Status HTTP com que este código chega (ou, nos do SDK, o que ele atribui). */
	httpStatus() {
		return this.status;
	}
};
//#endregion
//#region src/Exception/PzAccountSdkException.ts
/**
* Raiz das exceções do SDK.
*
* Falha do Puzl Account NÃO passa por aqui: erro de credencial, validação ou
* indisponibilidade chega no retorno, em `PzAccountSdkResultDto.has_error`.
* O que herda desta classe é erro de integração — configuração ausente,
* uso indevido da API do SDK.
*/
var PzAccountSdkException = class extends Error {
	constructor(message) {
		super(message);
		this.name = new.target.name;
	}
};
//#endregion
//#region src/Exception/PzAccountSdkConfigurationException.ts
/**
* Configuração ausente ou inválida no projeto que instalou o SDK.
*
* A mensagem cita a opção e a variável de ambiente exatas: quem vê o erro
* normalmente está integrando o pacote pela primeira vez, e "config inválida"
* sem o nome da chave transforma um ajuste de trinta segundos numa caça ao
* tesouro.
*/
var PzAccountSdkConfigurationException = class PzAccountSdkConfigurationException extends PzAccountSdkException {
	/**
	* @param optionKey opção do client (ex.: 'clientId')
	* @param envKey variável de ambiente correspondente (ex.: 'PUZL_ACCOUNT_CLIENT_ID')
	*/
	static missing(optionKey, envKey) {
		return new PzAccountSdkConfigurationException(`PzAccountSdk: a configuração "${optionKey}" está vazia. Defina ${envKey} no .env do projeto.`);
	}
	static invalid(optionKey, envKey, accepted) {
		return new PzAccountSdkConfigurationException(`PzAccountSdk: a configuração "${optionKey}" tem um valor inválido. Defina ${envKey} com um de: ${accepted}.`);
	}
};
//#endregion
//#region src/Support/PzAccountSdkConfig.ts
/** Variável de ambiente de cada opção — usada por `fromEnv()` e nas mensagens de erro. */
const PZ_ACCOUNT_SDK_ENV_KEYS = {
	issuer: "PUZL_ACCOUNT_ISSUER",
	clientId: "PUZL_ACCOUNT_CLIENT_ID",
	clientSecret: "PUZL_ACCOUNT_CLIENT_SECRET",
	redirectUri: "PUZL_ACCOUNT_REDIRECT_URI",
	scope: "PUZL_ACCOUNT_SCOPE",
	tokenAuthMethod: "PUZL_ACCOUNT_TOKEN_AUTH_METHOD",
	timeout: "PUZL_ACCOUNT_TIMEOUT",
	jwksCacheTtl: "PUZL_ACCOUNT_JWKS_CACHE_TTL",
	leeway: "PUZL_ACCOUNT_LEEWAY"
};
/**
* Configuração do SDK, imutável e validada sob demanda.
*
* A validação é preguiçosa de propósito — acontece na primeira chamada ao
* Puzl Account, não na criação do client. Uma API que instalou o pacote mas
* ainda não configurou o Puzl Account continua subindo normalmente; quem paga
* o preço é quem tentar usar, e aí o erro é explícito.
*/
var PzAccountSdkConfig = class PzAccountSdkConfig {
	static AUTH_METHOD_POST = "client_secret_post";
	static AUTH_METHOD_BASIC = "client_secret_basic";
	static AUTH_METHOD_NONE = "none";
	static AUTH_METHODS = [
		"client_secret_post",
		"client_secret_basic",
		"none"
	];
	static DEFAULT_SCOPE = "openid email profile";
	static DEFAULT_TIMEOUT = 10;
	static DEFAULT_JWKS_CACHE_TTL = 3600;
	static DEFAULT_LEEWAY = 60;
	issuer;
	clientId;
	redirectUri;
	scope;
	tokenAuthMethod;
	timeout;
	jwksCacheTtl;
	leeway;
	constructor(values) {
		this.issuer = values.issuer;
		this.clientId = values.clientId;
		this.redirectUri = values.redirectUri;
		this.scope = values.scope;
		this.tokenAuthMethod = values.tokenAuthMethod;
		this.timeout = values.timeout;
		this.jwksCacheTtl = values.jwksCacheTtl;
		this.leeway = values.leeway;
		Object.defineProperty(this, "clientSecret", {
			value: values.clientSecret,
			enumerable: false
		});
		Object.freeze(this);
	}
	/** Constrói a partir das opções, normalizando cada valor. */
	static from(options = {}) {
		const values = isRecord(options) ? options : {};
		const scope = PzAccountSdkConfig.str(values, "scope");
		const authMethod = PzAccountSdkConfig.str(values, "tokenAuthMethod");
		const leeway = values["leeway"];
		return new PzAccountSdkConfig({
			issuer: PzAccountSdkConfig.str(values, "issuer").replace(/\/+$/, ""),
			clientId: PzAccountSdkConfig.str(values, "clientId"),
			clientSecret: PzAccountSdkConfig.str(values, "clientSecret"),
			redirectUri: PzAccountSdkConfig.str(values, "redirectUri"),
			scope: scope !== "" ? scope : PzAccountSdkConfig.DEFAULT_SCOPE,
			tokenAuthMethod: authMethod !== "" ? authMethod : PzAccountSdkConfig.AUTH_METHOD_POST,
			timeout: PzAccountSdkConfig.positiveInt(values, "timeout", PzAccountSdkConfig.DEFAULT_TIMEOUT),
			jwksCacheTtl: PzAccountSdkConfig.positiveInt(values, "jwksCacheTtl", PzAccountSdkConfig.DEFAULT_JWKS_CACHE_TTL),
			leeway: isNumeric(leeway) && toInt(leeway) >= 0 ? toInt(leeway) : PzAccountSdkConfig.DEFAULT_LEEWAY
		});
	}
	/**
	* Lê as variáveis `PUZL_ACCOUNT_*` (por padrão, de `process.env`).
	* Opções explícitas em `overrides` vencem o ambiente.
	*/
	static fromEnv(env = process.env, overrides = {}) {
		const options = {};
		for (const [option, envKey] of Object.entries(PZ_ACCOUNT_SDK_ENV_KEYS)) options[option] = env[envKey];
		return PzAccountSdkConfig.from({
			...options,
			...PzAccountSdkConfig.defined(overrides)
		});
	}
	/**
	* O mínimo para falar com o Puzl Account está preenchido? Serve para o
	* produto esconder o "Entrar com a Puzl" enquanto a integração não está
	* configurada, sem precisar capturar exceção.
	*/
	isConfigured() {
		if (this.issuer === "" || this.clientId === "" || !PzAccountSdkConfig.AUTH_METHODS.includes(this.tokenAuthMethod)) return false;
		return this.tokenAuthMethod === PzAccountSdkConfig.AUTH_METHOD_NONE || this.clientSecret !== "";
	}
	/**
	* Exige o mínimo para falar com o Puzl Account: issuer e clientId.
	*
	* @throws PzAccountSdkConfigurationException
	*/
	assertUsable() {
		for (const key of ["issuer", "clientId"]) if (this[key] === "") throw PzAccountSdkConfigurationException.missing(key, PZ_ACCOUNT_SDK_ENV_KEYS[key]);
	}
	/**
	* Exige o necessário para o client se autenticar no /oauth/token e no
	* /oauth/revoke: método válido e, se não for `none`, o clientSecret.
	*
	* @throws PzAccountSdkConfigurationException
	*/
	assertClientAuthUsable() {
		this.assertUsable();
		if (!PzAccountSdkConfig.AUTH_METHODS.includes(this.tokenAuthMethod)) throw PzAccountSdkConfigurationException.invalid("tokenAuthMethod", PZ_ACCOUNT_SDK_ENV_KEYS.tokenAuthMethod, PzAccountSdkConfig.AUTH_METHODS.join(", "));
		if (this.tokenAuthMethod !== PzAccountSdkConfig.AUTH_METHOD_NONE && this.clientSecret === "") throw PzAccountSdkConfigurationException.missing("clientSecret", PZ_ACCOUNT_SDK_ENV_KEYS.clientSecret);
	}
	/**
	* Exige a redirectUri — só quando quem chama não informou uma própria.
	*
	* @throws PzAccountSdkConfigurationException
	*/
	assertRedirectUsable() {
		this.assertUsable();
		if (this.redirectUri === "") throw PzAccountSdkConfigurationException.missing("redirectUri", PZ_ACCOUNT_SDK_ENV_KEYS.redirectUri);
	}
	jwksUri() {
		return `${this.issuer}/.well-known/jwks.json`;
	}
	/**
	* `null`, `undefined` e ausência viram string vazia — é o que os
	* `assert*()` sabem reconhecer como "faltando".
	*/
	static str(values, key) {
		const value = values[key];
		return isScalar(value) ? scalarToString(value).trim() : "";
	}
	static positiveInt(values, key, fallback) {
		const value = values[key];
		return isNumeric(value) && toInt(value) > 0 ? toInt(value) : fallback;
	}
	static defined(options) {
		return Object.fromEntries(Object.entries(options).filter(([, value]) => value !== void 0));
	}
};
//#endregion
//#region src/Support/PzAccountSdkHttp.ts
/**
* Resposta já lida, no formato que os gateways esperam. Falha de rede não
* vira exceção: vira uma resposta sintética 504/500, como no PzRequest do
* SDK PHP.
*/
var PzAccountSdkResponse = class {
	statusCode;
	statusText;
	content;
	constructor(statusCode, statusText, content) {
		this.statusCode = statusCode;
		this.statusText = statusText;
		this.content = content;
	}
	/**
	* Corpo como objeto. JSON que não é objeto (HTML do nginx, corpo vazio,
	* escalar) vira `{ content: corpo }` — nunca exceção.
	*/
	/** O corpo é um objeto JSON? Um 2xx sem isso não é resposta do Puzl Account. */
	isJsonObject() {
		try {
			const decoded = JSON.parse(this.content);
			return isRecord(decoded) && !Array.isArray(decoded);
		} catch {
			return false;
		}
	}
	getArrayContent() {
		try {
			const decoded = JSON.parse(this.content);
			if (isRecord(decoded)) return decoded;
		} catch {}
		return { content: this.content };
	}
};
/** Maior atraso que um timer do Node aceita (~24,8 dias), em segundos. */
const MAX_TIMEOUT = 2147483;
/**
* Uma requisição ao Puzl Account. Cada chamada do SDK cria uma nova: assim o
* Bearer de uma operação nunca vaza para a próxima.
*
* @internal
*/
var PzAccountSdkRequest = class {
	fetchFn;
	timeout;
	headers = { Accept: "application/json" };
	formUrlEncoded = false;
	constructor(fetchFn, timeout) {
		this.fetchFn = fetchFn;
		this.timeout = timeout;
	}
	withBearer(token) {
		this.headers["Authorization"] = `Bearer ${token}`;
		return this;
	}
	withBasicAuth(username, password) {
		this.headers["Authorization"] = `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`;
		return this;
	}
	asFormUrlEncoded() {
		this.formUrlEncoded = true;
		return this;
	}
	get(url) {
		return this.send("GET", url, void 0);
	}
	delete(url) {
		return this.send("DELETE", url, void 0);
	}
	post(url, body) {
		return this.send("POST", url, body);
	}
	put(url, body) {
		return this.send("PUT", url, body);
	}
	async send(method, url, body) {
		try {
			const request = new Request(url, {
				method,
				headers: this.requestHeaders(body),
				body: this.encode(body),
				signal: AbortSignal.timeout(Math.min(this.timeout, MAX_TIMEOUT) * 1e3),
				redirect: "manual"
			});
			const response = await this.fetchFn(request);
			const content = await response.text();
			return new PzAccountSdkResponse(response.status, response.statusText !== "" ? response.statusText : node_http.STATUS_CODES[response.status] ?? "", content);
		} catch (error) {
			return this.failure(error);
		}
	}
	requestHeaders(body) {
		const headers = { ...this.headers };
		if (body !== void 0 && !(body instanceof FormData)) headers["Content-Type"] = this.formUrlEncoded ? "application/x-www-form-urlencoded" : "application/json";
		return headers;
	}
	encode(body) {
		if (body === void 0 || body instanceof FormData) return body;
		if (this.formUrlEncoded) {
			const params = new URLSearchParams();
			for (const [key, value] of Object.entries(body)) params.append(key, String(value));
			return params.toString();
		}
		return JSON.stringify(body);
	}
	/**
	* Timeout e falha de conexão (DNS, recusa, TLS) viram 504; qualquer outra
	* coisa, 500 — sem código de erro, para `isServiceUnavailable()` pegar.
	*/
	failure(error) {
		const message = error instanceof Error ? error.message : String(error);
		const name = error instanceof Error ? error.name : "";
		const cause = error instanceof Error ? error.cause : void 0;
		const network = error instanceof TypeError && (message === "fetch failed" || typeof cause?.code === "string");
		if (name === "TimeoutError" || name === "AbortError" || network) return new PzAccountSdkResponse(504, `Connection timed out after ${this.timeout} seconds`, message);
		return new PzAccountSdkResponse(500, "Uncategorised exception occurred.", message);
	}
};
//#endregion
//#region src/Features/Shared/Gateways/PzAccountSdkBaseGateway.ts
/**
* Base dos gateways: monta a requisição e traduz a resposta em objeto para o
* `from()` do DTO de retorno.
*
* O Puzl Account fala dois "dialetos", e cada gateway escolhe o seu:
*
* - API da conta (`/api/identity/*`): JSON, Bearer do usuário, envelope
*   `{error, message, data}` no sucesso e `{code, message, errors}` no erro.
* - Protocolo (`/oauth/*`): form-urlencoded, autenticação do client, corpo
*   cru no sucesso e `{error, error_description}` (RFC 6749) no erro.
*
* @internal
*/
var PzAccountSdkBaseGateway = class {
	config;
	fetchFn;
	constructor(config, fetchFn) {
		this.config = config;
		this.fetchFn = fetchFn;
	}
	/** Uma requisição nova por chamada: credencial nenhuma vaza para a próxima. */
	http() {
		return new PzAccountSdkRequest(this.fetchFn, this.config.timeout);
	}
	url(path) {
		return this.config.issuer + path;
	}
	/**
	* Requisição para a API da conta. Sem `accessToken`, segue sem
	* Authorization — é o caso do cadastro, que é público.
	*/
	apiRequest(accessToken = "") {
		this.config.assertUsable();
		const request = this.http();
		return accessToken !== "" ? request.withBearer(accessToken) : request;
	}
	/**
	* Requisição para os endpoints de protocolo que o client autentica
	* (/oauth/token, /oauth/revoke): corpo form-urlencoded.
	*/
	oauthRequest() {
		this.config.assertClientAuthUsable();
		return this.http().asFormUrlEncoded();
	}
	/**
	* Aplica a autenticação do client conforme `tokenAuthMethod` e devolve o
	* corpo final. O provedor exige o MESMO método registrado no client.
	*/
	withClientAuth(request, body) {
		if (this.config.tokenAuthMethod === PzAccountSdkConfig.AUTH_METHOD_BASIC) {
			request.withBasicAuth(rawUrlEncode(this.config.clientId), rawUrlEncode(this.config.clientSecret));
			return body;
		}
		if (this.config.tokenAuthMethod === PzAccountSdkConfig.AUTH_METHOD_NONE) return {
			...body,
			client_id: this.config.clientId
		};
		return {
			...body,
			client_id: this.config.clientId,
			client_secret: this.config.clientSecret
		};
	}
	buildSuccess(response) {
		return {
			has_error: false,
			error_code: "",
			error_message: "",
			errors: [],
			http_status: response.statusCode
		};
	}
	/** Erro no envelope da API da conta: `{code, message, errors}`. */
	buildApiError(response) {
		const content = response.getArrayContent();
		const message = this.stringFrom(content, "message");
		return {
			has_error: true,
			error_code: this.stringFrom(content, "code"),
			error_message: message !== "" && message !== "0" ? message : response.statusText,
			errors: isRecord(content["errors"]) ? content["errors"] : [],
			http_status: response.statusCode
		};
	}
	/**
	* Erro no formato das RFCs: `{error, error_description}`.
	*
	* Um 401 sem corpo é o /oauth/userinfo recusando o token — o código
	* (`invalid_token`) vai só no header WWW-Authenticate; o SDK o
	* reconstrói aqui.
	*/
	buildOauthError(response) {
		const content = response.getArrayContent();
		let code = this.stringFrom(content, "error");
		const description = this.stringFrom(content, "error_description");
		if (code === "" && response.statusCode === 401) code = PzAccountSdkErrorCodeEnum.INVALID_TOKEN.value;
		return {
			has_error: true,
			error_code: code,
			error_message: description !== "" && description !== "0" ? description : response.statusText,
			errors: [],
			http_status: response.statusCode
		};
	}
	/**
	* Sucesso de uma operação resolvida localmente (verificação de JWT), sem
	* resposta HTTP por trás. O 200 é convenção do SDK.
	*/
	buildLocalSuccess() {
		return {
			has_error: false,
			error_code: "",
			error_message: "",
			errors: [],
			http_status: 200
		};
	}
	/** Erro detectado pelo próprio SDK, sem resposta HTTP por trás. */
	buildLocalError(code, message) {
		return {
			has_error: true,
			error_code: code.value,
			error_message: message,
			errors: [],
			http_status: code.httpStatus()
		};
	}
	/**
	* Um 2xx de endpoint de protocolo precisa trazer um objeto JSON. HTML de
	* proxy, corpo vazio ou lixo não podem virar "sucesso" com campos vazios —
	* quem confere só `has_error` deixaria passar um token inexistente.
	*/
	hasBody(response) {
		return response.isJsonObject();
	}
	/** Idem para a API da conta: o envelope precisa trazer `data`. */
	hasData(response) {
		return response.isJsonObject() && isRecord(response.getArrayContent()["data"]);
	}
	/**
	* Resposta que não veio do Puzl Account (ou veio quebrada): erro sem
	* código, com status 502, para `isServiceUnavailable()` pegar.
	*/
	buildInvalidResponse(response) {
		return {
			has_error: true,
			error_code: "",
			error_message: `Resposta inesperada do Puzl Account (HTTP ${response.statusCode}).`,
			errors: [],
			http_status: 502
		};
	}
	/** `data` do envelope da API da conta. */
	responseData(response) {
		const data = response.getArrayContent()["data"];
		return isRecord(data) ? data : {};
	}
	/** Corpo cru — o formato dos endpoints de protocolo. */
	responseBody(response) {
		return response.getArrayContent();
	}
	stringFrom(content, key) {
		const value = content[key];
		return isScalar(value) ? scalarToString(value) : "";
	}
};
//#endregion
//#region src/Features/Shared/Dtos/PzAccountSdkResultDto.ts
/**
* Base de todo retorno do SDK.
*
* Nenhuma operação lança exceção por falha do Puzl Account: credencial
* errada, validação, indisponibilidade — tudo chega aqui, em `has_error`.
*/
var PzAccountSdkResultDto = class PzAccountSdkResultDto extends PzAccountSdkDto {
	has_error;
	error_code;
	error_message;
	errors;
	http_status;
	constructor(props = {}) {
		super();
		this.has_error = props.has_error ?? false;
		this.error_code = props.error_code ?? "";
		this.error_message = props.error_message ?? "";
		this.errors = props.errors ?? {};
		this.http_status = props.http_status ?? 0;
	}
	static from(values) {
		return new PzAccountSdkResultDto(PzAccountSdkResultDto.resultArgs(valuesOf(values)));
	}
	/**
	* Os cinco campos de resultado, para os DTOs de retorno espalharem no
	* próprio construtor: `new Dto({ ...PzAccountSdkResultDto.resultArgs(v), campo })`.
	*/
	static resultArgs(values) {
		return {
			has_error: pullBool(values, "has_error"),
			error_code: pullString(values, "error_code"),
			error_message: pullString(values, "error_message"),
			errors: PzAccountSdkResultDto.pullFieldErrors(values),
			http_status: pullInt(values, "http_status")
		};
	}
	toArray() {
		return {
			has_error: this.has_error,
			error_code: this.error_code,
			error_message: this.error_message,
			errors: this.errors,
			http_status: this.http_status
		};
	}
	isSuccess() {
		return !this.has_error;
	}
	/**
	* Código do erro como enum, ou `null` quando não houve erro ou quando o
	* Puzl Account devolveu um código que esta versão do SDK ainda não conhece.
	*
	* Um `null` inesperado significa "código novo": trate como falha genérica,
	* nunca como sucesso.
	*/
	getErrorCode() {
		return PzAccountSdkErrorCodeEnum.tryFrom(this.error_code);
	}
	/**
	* Indisponibilidade do Puzl Account: timeout, falha de conexão ou 5xx.
	*
	* Decidido pelo status, e não pelo `error_code`, porque timeout e falha de
	* conexão nem chegam ao Puzl Account — o transporte devolve 504/500
	* sintéticos, sem corpo e portanto sem código.
	*/
	isServiceUnavailable() {
		return this.has_error && this.http_status >= 500;
	}
	/**
	* Rate limit do Puzl Account (429).
	*
	* Decidido pelo status: nos endpoints `/oauth/*` o 429 chega com
	* `error_code` `invalid_request`, que sozinho pareceria erro de quem chamou.
	* Trate como indisponibilidade temporária.
	*/
	isRateLimited() {
		return this.has_error && this.http_status === 429;
	}
	/**
	* Primeira mensagem de erro de campo, ou `null` quando não há nenhuma.
	*
	* Atalho para o caso comum de um 422: mostrar ao usuário a primeira coisa
	* que o Puzl Account reclamou.
	*/
	firstFieldError() {
		for (const messages of Object.values(this.errors)) for (const message of messages) if (message !== "") return message;
		return null;
	}
	/**
	* Normaliza o `errors` do Puzl Account para `{ campo: ['mensagem', ...] }`.
	*
	* O handler devolve `[]` (lista vazia) quando não há erro de campo e um
	* mapa quando há; ambos passam por aqui sem surpresa.
	*/
	static pullFieldErrors(values) {
		const normalized = {};
		for (const [field, messages] of Object.entries(pullArray(values, "errors"))) normalized[field] = (messages === null || messages === void 0 ? [] : isRecord(messages) ? Object.values(messages) : [messages]).filter(isScalar).map(scalarToString);
		return normalized;
	}
};
//#endregion
//#region src/Features/DiscoveryShow/Dtos/PzAccountSdkDiscoveryViewDto.ts
/**
* Documento de discovery do OIDC (`/.well-known/openid-configuration`).
*
* O SDK não depende dele — os endpoints são fixos e derivados do issuer —,
* mas ele é útil para diagnóstico e para conferir o que o provedor suporta.
*/
var PzAccountSdkDiscoveryViewDto = class PzAccountSdkDiscoveryViewDto extends PzAccountSdkResultDto {
	issuer;
	authorization_endpoint;
	token_endpoint;
	userinfo_endpoint;
	revocation_endpoint;
	end_session_endpoint;
	jwks_uri;
	response_types_supported;
	grant_types_supported;
	scopes_supported;
	claims_supported;
	token_endpoint_auth_methods_supported;
	code_challenge_methods_supported;
	id_token_signing_alg_values_supported;
	constructor(props = {}) {
		super(props);
		this.issuer = props.issuer ?? "";
		this.authorization_endpoint = props.authorization_endpoint ?? "";
		this.token_endpoint = props.token_endpoint ?? "";
		this.userinfo_endpoint = props.userinfo_endpoint ?? "";
		this.revocation_endpoint = props.revocation_endpoint ?? "";
		this.end_session_endpoint = props.end_session_endpoint ?? "";
		this.jwks_uri = props.jwks_uri ?? "";
		this.response_types_supported = props.response_types_supported ?? [];
		this.grant_types_supported = props.grant_types_supported ?? [];
		this.scopes_supported = props.scopes_supported ?? [];
		this.claims_supported = props.claims_supported ?? [];
		this.token_endpoint_auth_methods_supported = props.token_endpoint_auth_methods_supported ?? [];
		this.code_challenge_methods_supported = props.code_challenge_methods_supported ?? [];
		this.id_token_signing_alg_values_supported = props.id_token_signing_alg_values_supported ?? [];
	}
	static from(values) {
		const v = valuesOf(values);
		return new PzAccountSdkDiscoveryViewDto({
			...PzAccountSdkResultDto.resultArgs(v),
			issuer: pullString(v, "issuer"),
			authorization_endpoint: pullString(v, "authorization_endpoint"),
			token_endpoint: pullString(v, "token_endpoint"),
			userinfo_endpoint: pullString(v, "userinfo_endpoint"),
			revocation_endpoint: pullString(v, "revocation_endpoint"),
			end_session_endpoint: pullString(v, "end_session_endpoint"),
			jwks_uri: pullString(v, "jwks_uri"),
			response_types_supported: pullStringList(v, "response_types_supported"),
			grant_types_supported: pullStringList(v, "grant_types_supported"),
			scopes_supported: pullStringList(v, "scopes_supported"),
			claims_supported: pullStringList(v, "claims_supported"),
			token_endpoint_auth_methods_supported: pullStringList(v, "token_endpoint_auth_methods_supported"),
			code_challenge_methods_supported: pullStringList(v, "code_challenge_methods_supported"),
			id_token_signing_alg_values_supported: pullStringList(v, "id_token_signing_alg_values_supported")
		});
	}
	toArray() {
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
			id_token_signing_alg_values_supported: this.id_token_signing_alg_values_supported
		};
	}
};
//#endregion
//#region src/Features/DiscoveryShow/Gateways/PzAccountSdkDiscoveryShowGateway.ts
/**
* GET /.well-known/openid-configuration — público, 200 no sucesso.
*
* @internal
*/
var PzAccountSdkDiscoveryShowGateway = class PzAccountSdkDiscoveryShowGateway extends PzAccountSdkBaseGateway {
	static ENDPOINT = "/.well-known/openid-configuration";
	async execute() {
		this.config.assertUsable();
		const response = await this.http().get(this.url(PzAccountSdkDiscoveryShowGateway.ENDPOINT));
		if (response.statusCode === 200) {
			if (!this.hasBody(response)) return PzAccountSdkDiscoveryViewDto.from(this.buildInvalidResponse(response));
			return PzAccountSdkDiscoveryViewDto.from({
				...this.responseBody(response),
				...this.buildSuccess(response)
			});
		}
		return PzAccountSdkDiscoveryViewDto.from(this.buildOauthError(response));
	}
};
//#endregion
//#region src/Features/IdTokenVerify/Dtos/PzAccountSdkIdTokenVerifyDto.ts
/**
* Entrada de `idTokenVerify`.
*
* - `nonce`: o gerado por `pkceCreate()` para esta tentativa. É OBRIGATÓRIO:
*   sem ele, um id_token de outro login seria aceito. A única exceção é o
*   password grant, que não tem nonce — use `forPasswordGrant()`, que deixa a
*   dispensa explícita em vez de acidental.
* - `access_token`: quando informado, o id_token precisa trazer `at_hash` e
*   ele precisa corresponder — prova que os dois saíram da mesma emissão.
*/
var PzAccountSdkIdTokenVerifyDto = class PzAccountSdkIdTokenVerifyDto extends PzAccountSdkDto {
	id_token;
	nonce;
	access_token;
	require_nonce;
	/**
	* @throws TypeError nonce vazio sem dispensa explícita — é erro de
	*                   integração, não token inválido
	*/
	constructor(props) {
		super();
		this.id_token = props.id_token;
		this.nonce = props.nonce;
		this.access_token = props.access_token ?? "";
		this.require_nonce = props.require_nonce ?? true;
		if (this.require_nonce && this.nonce === "") throw new TypeError("PzAccountSdk: idTokenVerify exige o nonce da tentativa de login. No password grant, use PzAccountSdkIdTokenVerifyDto.forPasswordGrant().");
	}
	/** Verificação do id_token devolvido pelo password grant, que não carrega nonce. */
	static forPasswordGrant(idToken, accessToken = "") {
		return new PzAccountSdkIdTokenVerifyDto({
			id_token: idToken,
			nonce: "",
			access_token: accessToken,
			require_nonce: false
		});
	}
	static from(values) {
		const v = valuesOf(values);
		return new PzAccountSdkIdTokenVerifyDto({
			id_token: pullString(v, "id_token"),
			nonce: pullString(v, "nonce"),
			access_token: pullString(v, "access_token"),
			require_nonce: v["require_nonce"] === void 0 || v["require_nonce"] === null ? true : isTruthy(v["require_nonce"])
		});
	}
	/** Tokens mascarados: `toArray()` e `toJSON()` podem acabar em log. */
	toArray() {
		return {
			id_token: mask(this.id_token),
			nonce: this.nonce,
			access_token: mask(this.access_token),
			require_nonce: this.require_nonce
		};
	}
};
//#endregion
//#region src/Exception/PzAccountSdkJwksUnavailableException.ts
/**
* As chaves públicas (JWKS) do Puzl Account não puderam ser obtidas.
*
* Uso interno: nunca escapa do SDK. Os gateways de verificação a capturam e
* devolvem `JWKS_UNAVAILABLE` no DTO de retorno, como qualquer outra falha.
*
* @internal
*/
var PzAccountSdkJwksUnavailableException = class PzAccountSdkJwksUnavailableException extends PzAccountSdkException {
	static fromStatus(statusCode, statusText) {
		return new PzAccountSdkJwksUnavailableException(`PzAccountSdk: não foi possível obter o JWKS do Puzl Account (HTTP ${statusCode} ${statusText}).`);
	}
	static recentFailure(seconds) {
		return new PzAccountSdkJwksUnavailableException(`PzAccountSdk: o JWKS do Puzl Account falhou há menos de ${seconds} segundos; nova tentativa em seguida.`);
	}
	static invalidKeySet(reason) {
		return new PzAccountSdkJwksUnavailableException(`PzAccountSdk: o JWKS do Puzl Account é inválido: ${reason}`);
	}
};
//#endregion
//#region src/Support/PzAccountSdkHashEquals.ts
/**
* `hash_equals()` do PHP: compara em tempo constante, para não vazar por
* timing quanto do valor esperado já bate.
*
* @internal
*/
function hashEquals(known, user) {
	const a = Buffer.from(known);
	const b = Buffer.from(user);
	return a.length === b.length && (0, node_crypto.timingSafeEqual)(a, b);
}
//#endregion
//#region src/Support/PzAccountSdkJwt.ts
/**
* Erro de verificação de JWT: token malformado, assinatura inválida, datas
* fora da janela. É o `UnexpectedValueException` do SDK PHP — os gateways o
* convertem em resultado, nunca o deixam escapar.
*
* @internal
*/
var PzAccountSdkJwtException = class extends Error {
	name = "PzAccountSdkJwtException";
};
const SUPPORTED_ALGS = ["RS256"];
const MIN_RSA_BITS = 2048;
/**
* Alfabeto estrito do base64url. O decodificador do Node ignora caractere
* inválido em silêncio: sem esta checagem, `token + "!!"` também validaria.
*/
const BASE64URL = /^[A-Za-z0-9_-]*$/;
function base64UrlEncode(value) {
	return Buffer.from(value).toString("base64url");
}
function base64UrlDecode(value) {
	return Buffer.from(value, "base64url");
}
function sha256(value) {
	return (0, node_crypto.createHash)("sha256").update(value).digest();
}
function decodeJson(segment) {
	try {
		return JSON.parse(base64UrlDecode(segment).toString("utf8"));
	} catch {
		return null;
	}
}
/**
* Lê o header sem verificar nada — serve só para escolher a chave e recusar
* cedo o algoritmo errado.
*/
function jwtHeader(jwt) {
	const segments = jwt.split(".");
	const header = segments.length === 3 ? decodeJson(segments[0] ?? "") : null;
	return isRecord(header) && !Array.isArray(header) ? header : null;
}
/**
* Converte o JWKS em chaves públicas, indexadas por `kid` (ou pela posição,
* quando a chave não tem `kid`). Chaves de tipo não suportado são ignoradas.
*
* @throws PzAccountSdkJwtException conjunto inválido
*/
function parseKeySet(jwks, defaultAlg) {
	const keys = /* @__PURE__ */ new Map();
	const list = jwks["keys"];
	if (!isRecord(list)) throw new PzAccountSdkJwtException("JWK Set did not contain any keys");
	Object.entries(list).forEach(([index, jwk]) => {
		if (!isRecord(jwk)) throw new PzAccountSdkJwtException("JWK must be an object");
		if (jwk["kty"] === void 0 || jwk["kty"] === "") throw new PzAccountSdkJwtException("JWK must contain a \"kty\" parameter");
		if (jwk["kty"] !== "RSA") return;
		if (jwk["d"] !== void 0) throw new PzAccountSdkJwtException("RSA private keys are not supported");
		if (typeof jwk["n"] !== "string" || typeof jwk["e"] !== "string") throw new PzAccountSdkJwtException("RSA keys must contain values for both \"n\" and \"e\"");
		let key;
		try {
			key = (0, node_crypto.createPublicKey)({
				key: {
					kty: "RSA",
					n: jwk["n"],
					e: jwk["e"]
				},
				format: "jwk"
			});
		} catch (error) {
			throw new PzAccountSdkJwtException(`invalid RSA key: ${error.message}`);
		}
		const kid = isScalar(jwk["kid"]) && scalarToString(jwk["kid"]) !== "" ? scalarToString(jwk["kid"]) : index;
		const alg = typeof jwk["alg"] === "string" && jwk["alg"] !== "" ? jwk["alg"] : defaultAlg;
		keys.set(kid, {
			alg,
			key
		});
	});
	if (keys.size === 0) throw new PzAccountSdkJwtException("No supported algorithms found in JWK Set");
	return keys;
}
/**
* Verifica assinatura e datas (`nbf`, `iat`, `exp`, com tolerância de
* `leeway` segundos) e devolve os claims. Emissor, audiência e o resto ficam
* com quem chama, que sabe o que esperar.
*
* @throws PzAccountSdkJwtException
*/
function jwtDecode(jwt, key, leeway, now = Date.now() / 1e3) {
	const segments = jwt.split(".");
	if (segments.length !== 3) throw new PzAccountSdkJwtException("Wrong number of segments");
	if (!segments.every((segment) => BASE64URL.test(segment))) throw new PzAccountSdkJwtException("Invalid base64url encoding");
	const [headB64 = "", bodyB64 = "", cryptoB64 = ""] = segments;
	const header = decodeJson(headB64);
	if (!isRecord(header) || Array.isArray(header)) throw new PzAccountSdkJwtException("Invalid header encoding");
	const payload = decodeJson(bodyB64);
	if (payload === null) throw new PzAccountSdkJwtException("Invalid claims encoding");
	if (!isRecord(payload) || Array.isArray(payload)) throw new PzAccountSdkJwtException("Payload must be a JSON object");
	for (const claim of [
		"iat",
		"nbf",
		"exp"
	]) if (payload[claim] !== void 0 && payload[claim] !== null && !isNumeric(payload[claim])) throw new PzAccountSdkJwtException(`Payload ${claim} must be a number`);
	const alg = header["alg"];
	if (typeof alg !== "string" || alg === "") throw new PzAccountSdkJwtException("Empty algorithm");
	if (!SUPPORTED_ALGS.includes(alg)) throw new PzAccountSdkJwtException("Algorithm not supported");
	if (key.alg !== alg) throw new PzAccountSdkJwtException("Incorrect key for this algorithm");
	if ((key.key.asymmetricKeyDetails?.modulusLength ?? 0) < MIN_RSA_BITS) throw new PzAccountSdkJwtException("Provided key is too short");
	if (!(0, node_crypto.verify)("RSA-SHA256", Buffer.from(`${headB64}.${bodyB64}`), key.key, base64UrlDecode(cryptoB64))) throw new PzAccountSdkJwtException("Signature verification failed");
	const nbf = payload["nbf"] ?? void 0;
	const iat = payload["iat"] ?? void 0;
	const exp = payload["exp"] ?? void 0;
	if (nbf !== void 0 && Math.floor(Number(nbf)) > now + leeway) throw new PzAccountSdkJwtException(`Cannot handle token with nbf prior to ${isoDate(Number(nbf))}`);
	if (nbf === void 0 && iat !== void 0 && Math.floor(Number(iat)) > now + leeway) throw new PzAccountSdkJwtException(`Cannot handle token with iat prior to ${isoDate(Number(iat))}`);
	if (exp !== void 0 && now - leeway >= Number(exp)) throw new PzAccountSdkJwtException("Expired token");
	return payload;
}
function isoDate(seconds) {
	const date = /* @__PURE__ */ new Date(Math.floor(seconds) * 1e3);
	return Number.isNaN(date.getTime()) ? String(seconds) : date.toISOString();
}
//#endregion
//#region src/Features/Shared/Gateways/PzAccountSdkJwtBaseGateway.ts
/**
* Base da verificação de JWTs do Puzl Account (id_token e webhook).
*
* A assinatura e as datas ficam com o `PzAccountSdkJwksProvider`; aqui ficam
* as checagens de claims comuns aos dois: emissor e audiência. Cada falha é
* uma `PzAccountSdkJwtException` com o motivo — o gateway a converte em
* resultado, nunca a deixa escapar.
*
* @internal
*/
var PzAccountSdkJwtBaseGateway = class extends PzAccountSdkBaseGateway {
	jwks;
	constructor(config, fetchFn, jwks) {
		super(config, fetchFn);
		this.jwks = jwks;
	}
	assertIssuer(claims) {
		if (claims["iss"] !== this.config.issuer) throw new PzAccountSdkJwtException("iss diferente do issuer configurado.");
	}
	/**
	* `aud` pode ser string ou lista. Com mais de uma audiência, o OIDC exige
	* `azp`; e, presente, ele precisa ser o client_id (Core 3.1.3.7) — senão o
	* token foi feito para outro app.
	*/
	assertAudience(claims) {
		const audience = claims["aud"];
		const audiences = Array.isArray(audience) ? audience : [audience ?? null];
		if (!audiences.includes(this.config.clientId)) throw new PzAccountSdkJwtException("aud não contém o client_id configurado.");
		const azp = claims["azp"] ?? null;
		if ((audiences.length > 1 || azp !== null) && azp !== this.config.clientId) throw new PzAccountSdkJwtException("azp ausente ou diferente do client_id.");
	}
	assertNonEmptyString(claims, claim) {
		const value = claims[claim];
		if (typeof value !== "string" || value === "") throw new PzAccountSdkJwtException(`claim "${claim}" ausente.`);
	}
	assertNumeric(claims, claim) {
		if (!isNumeric(claims[claim])) throw new PzAccountSdkJwtException(`claim "${claim}" ausente.`);
	}
};
//#endregion
//#region src/Features/Shared/Dtos/PzAccountSdkAddressDto.ts
/**
* Endereço da conta — formato do claim `address` do OIDC (Core 5.1.1).
*
* Serve tanto de entrada (`meUpdate`) quanto de saída (conta, userinfo,
* id_token). Campo não informado é string vazia.
*/
var PzAccountSdkAddressDto = class PzAccountSdkAddressDto extends PzAccountSdkDto {
	street_address;
	locality;
	region;
	postal_code;
	country;
	constructor(props = {}) {
		super();
		this.street_address = props.street_address ?? "";
		this.locality = props.locality ?? "";
		this.region = props.region ?? "";
		this.postal_code = props.postal_code ?? "";
		this.country = props.country ?? "";
	}
	static from(values) {
		const v = valuesOf(values);
		return new PzAccountSdkAddressDto({
			street_address: pullString(v, "street_address"),
			locality: pullString(v, "locality"),
			region: pullString(v, "region"),
			postal_code: pullString(v, "postal_code"),
			country: pullString(v, "country")
		});
	}
	/** O endereço em `values[key]`, ou `null` quando ausente — o provedor manda `null` para conta sem endereço. */
	static fromNullable(values, key) {
		const value = values[key];
		if (value instanceof PzAccountSdkAddressDto) return value;
		return isRecord(value) ? PzAccountSdkAddressDto.from(value) : null;
	}
	toArray() {
		return {
			street_address: this.street_address,
			locality: this.locality,
			region: this.region,
			postal_code: this.postal_code,
			country: this.country
		};
	}
};
//#endregion
//#region src/Features/IdTokenVerify/Dtos/PzAccountSdkIdentityViewDto.ts
/**
* Identidade extraída de um id_token JÁ VERIFICADO.
*
* Identifique o usuário pelo `sub`, que é estável — nunca pelo e-mail. Hoje
* é o ULID público da conta (26 caracteres); se o client for configurado como
* `pairwise` no Puzl Account, passa a ser um identificador próprio deste app
* (e deixa de bater com o `sub` de `meShow`). Só use o `email` para vincular
* uma conta existente quando `email_verified` for `true`.
*
* Claims de perfil dependem dos escopos; o ausente vira valor neutro. Todos os
* claims crus ficam em `claims`.
*/
var PzAccountSdkIdentityViewDto = class PzAccountSdkIdentityViewDto extends PzAccountSdkResultDto {
	sub;
	email;
	email_verified;
	name;
	birthdate;
	gender;
	picture;
	locale;
	zoneinfo;
	updated_at;
	phone_number;
	phone_number_verified;
	address;
	auth_time;
	acr;
	amr;
	iat;
	exp;
	claims;
	constructor(props = {}) {
		super(props);
		this.sub = props.sub ?? "";
		this.email = props.email ?? "";
		this.email_verified = props.email_verified ?? false;
		this.name = props.name ?? "";
		this.birthdate = props.birthdate ?? "";
		this.gender = props.gender ?? "";
		this.picture = props.picture ?? "";
		this.locale = props.locale ?? "";
		this.zoneinfo = props.zoneinfo ?? "";
		this.updated_at = props.updated_at ?? 0;
		this.phone_number = props.phone_number ?? "";
		this.phone_number_verified = props.phone_number_verified ?? false;
		this.address = props.address ?? null;
		this.auth_time = props.auth_time ?? 0;
		this.acr = props.acr ?? "";
		this.amr = props.amr ?? [];
		this.iat = props.iat ?? 0;
		this.exp = props.exp ?? 0;
		this.claims = props.claims ?? {};
	}
	static from(values) {
		const v = valuesOf(values);
		const claims = v["claims"];
		return new PzAccountSdkIdentityViewDto({
			...PzAccountSdkResultDto.resultArgs(v),
			sub: pullString(v, "sub"),
			email: pullString(v, "email"),
			email_verified: v["email_verified"] === true,
			name: pullString(v, "name"),
			birthdate: pullString(v, "birthdate"),
			gender: pullString(v, "gender"),
			picture: pullString(v, "picture"),
			locale: pullString(v, "locale"),
			zoneinfo: pullString(v, "zoneinfo"),
			updated_at: pullInt(v, "updated_at"),
			phone_number: pullString(v, "phone_number"),
			phone_number_verified: v["phone_number_verified"] === true,
			address: PzAccountSdkAddressDto.fromNullable(v, "address"),
			auth_time: pullInt(v, "auth_time"),
			acr: pullString(v, "acr"),
			amr: pullStringList(v, "amr"),
			iat: pullInt(v, "iat"),
			exp: pullInt(v, "exp"),
			claims: isRecord(claims) ? claims : {}
		});
	}
	/** O usuário provou um segundo fator nesta autenticação? */
	isMultiFactor() {
		return this.acr === "urn:puzl:accounts:acr:mfa";
	}
	toArray() {
		return {
			...super.toArray(),
			sub: this.sub,
			email: this.email,
			email_verified: this.email_verified,
			name: this.name,
			birthdate: this.birthdate,
			gender: this.gender,
			picture: this.picture,
			locale: this.locale,
			zoneinfo: this.zoneinfo,
			updated_at: this.updated_at,
			phone_number: this.phone_number,
			phone_number_verified: this.phone_number_verified,
			address: this.address?.toArray() ?? null,
			auth_time: this.auth_time,
			acr: this.acr,
			amr: this.amr,
			iat: this.iat,
			exp: this.exp,
			claims: this.claims
		};
	}
};
//#endregion
//#region src/Features/IdTokenVerify/Gateways/PzAccountSdkIdTokenVerifyGateway.ts
/**
* Verifica um id_token (OIDC Core 3.1.3.7) contra o JWKS do Puzl Account.
*
* Confere, nesta ordem: RS256 e assinatura pela chave do `kid`; exp/iat com
* `leeway`; `iss`; `aud`/`azp`; `sub`; ausência de `events` (um token de
* webhook não pode se passar por id_token); `nonce` (obrigatório, salvo
* password grant); e `at_hash` (quando o access_token é informado).
*
* Sem HTTP, exceto quando o JWKS não está em cache.
*
* @internal
*/
var PzAccountSdkIdTokenVerifyGateway = class extends PzAccountSdkJwtBaseGateway {
	async execute(input) {
		this.config.assertUsable();
		let claims;
		try {
			claims = await this.jwks.decode(input.id_token.trim());
			this.assertClaims(claims, input);
		} catch (error) {
			if (error instanceof PzAccountSdkJwksUnavailableException) return PzAccountSdkIdentityViewDto.from(this.buildLocalError(PzAccountSdkErrorCodeEnum.JWKS_UNAVAILABLE, error.message));
			if (error instanceof PzAccountSdkJwtException) return PzAccountSdkIdentityViewDto.from(this.buildLocalError(PzAccountSdkErrorCodeEnum.ID_TOKEN_INVALID, `id_token inválido: ${error.message}`));
			throw error;
		}
		return PzAccountSdkIdentityViewDto.from({
			...claims,
			claims,
			...this.buildLocalSuccess()
		});
	}
	assertClaims(claims, input) {
		this.assertIssuer(claims);
		this.assertAudience(claims);
		this.assertNonEmptyString(claims, "sub");
		this.assertNumeric(claims, "exp");
		this.assertNumeric(claims, "iat");
		if (Object.hasOwn(claims, "events")) throw new PzAccountSdkJwtException("o token é um evento de webhook, não um id_token.");
		if (input.require_nonce) {
			const nonce = claims["nonce"];
			if (typeof nonce !== "string" || !hashEquals(input.nonce, nonce)) throw new PzAccountSdkJwtException("nonce diferente do esperado.");
		}
		if (input.access_token !== "") {
			const atHash = claims["at_hash"];
			const expected = base64UrlEncode(sha256(input.access_token).subarray(0, 16));
			if (typeof atHash !== "string" || !hashEquals(expected, atHash)) throw new PzAccountSdkJwtException("at_hash ausente ou diferente do access_token.");
		}
	}
};
//#endregion
//#region src/Features/LogoutUrl/Dtos/PzAccountSdkLogoutUrlDto.ts
/**
* Entrada de `logoutUrl` (RP-initiated logout).
*
* `post_logout_redirect_uri` precisa estar registrada no client com
* `--kind=post_logout`. Sem `id_token_hint`, o provedor pede confirmação ao
* usuário antes de encerrar a sessão.
*/
var PzAccountSdkLogoutUrlDto = class PzAccountSdkLogoutUrlDto extends PzAccountSdkDto {
	id_token_hint;
	post_logout_redirect_uri;
	state;
	constructor(props = {}) {
		super();
		this.id_token_hint = props.id_token_hint ?? "";
		this.post_logout_redirect_uri = props.post_logout_redirect_uri ?? "";
		this.state = props.state ?? "";
	}
	static from(values) {
		const v = valuesOf(values);
		return new PzAccountSdkLogoutUrlDto({
			id_token_hint: pullString(v, "id_token_hint"),
			post_logout_redirect_uri: pullString(v, "post_logout_redirect_uri"),
			state: pullString(v, "state")
		});
	}
	toArray() {
		return {
			id_token_hint: mask(this.id_token_hint),
			post_logout_redirect_uri: this.post_logout_redirect_uri,
			state: this.state
		};
	}
};
//#endregion
//#region src/Features/LogoutUrl/Services/PzAccountSdkLogoutUrlService.ts
/**
* Monta a URL do /oauth/logout, que encerra a sessão no Puzl Account e
* devolve o navegador ao produto.
*
* Local, sem HTTP. Encerrar a sessão no provedor não revoga tokens já
* emitidos — para isso use `tokenRevoke`.
*
* @internal
*/
var PzAccountSdkLogoutUrlService = class PzAccountSdkLogoutUrlService {
	config;
	static ENDPOINT = "/oauth/logout";
	constructor(config) {
		this.config = config;
	}
	execute(input) {
		this.config.assertUsable();
		const query = buildQuery({
			id_token_hint: input.id_token_hint,
			post_logout_redirect_uri: input.post_logout_redirect_uri,
			client_id: this.config.clientId,
			state: input.state
		});
		return `${this.config.issuer}${PzAccountSdkLogoutUrlService.ENDPOINT}?${query}`;
	}
};
//#endregion
//#region src/Features/MeConsentList/Dtos/PzAccountSdkConsentViewDto.ts
/** Um aplicativo a que o usuário deu acesso à conta. */
var PzAccountSdkConsentViewDto = class PzAccountSdkConsentViewDto extends PzAccountSdkDto {
	client_id;
	client_name;
	logo_uri;
	client_uri;
	scopes;
	granted_at;
	constructor(props = {}) {
		super();
		this.client_id = props.client_id ?? "";
		this.client_name = props.client_name ?? "";
		this.logo_uri = props.logo_uri ?? "";
		this.client_uri = props.client_uri ?? "";
		this.scopes = props.scopes ?? [];
		this.granted_at = props.granted_at ?? "";
	}
	static from(values) {
		const v = valuesOf(values);
		return new PzAccountSdkConsentViewDto({
			client_id: pullString(v, "client_id"),
			client_name: pullString(v, "client_name"),
			logo_uri: pullString(v, "logo_uri"),
			client_uri: pullString(v, "client_uri"),
			scopes: pullStringList(v, "scopes"),
			granted_at: pullString(v, "granted_at")
		});
	}
	toArray() {
		return {
			client_id: this.client_id,
			client_name: this.client_name,
			logo_uri: this.logo_uri,
			client_uri: this.client_uri,
			scopes: this.scopes,
			granted_at: this.granted_at
		};
	}
};
//#endregion
//#region src/Features/MeConsentList/Dtos/PzAccountSdkConsentListViewDto.ts
/** Aplicativos com acesso à conta do usuário. */
var PzAccountSdkConsentListViewDto = class PzAccountSdkConsentListViewDto extends PzAccountSdkResultDto {
	consents;
	constructor(props = {}) {
		super(props);
		this.consents = props.consents ?? [];
	}
	static from(values) {
		const v = valuesOf(values);
		const consents = [];
		for (const item of Object.values(pullArray(v, "consents"))) if (item instanceof PzAccountSdkConsentViewDto) consents.push(item);
		else if (isRecord(item)) consents.push(PzAccountSdkConsentViewDto.from(item));
		return new PzAccountSdkConsentListViewDto({
			...PzAccountSdkResultDto.resultArgs(v),
			consents
		});
	}
	toArray() {
		return {
			...super.toArray(),
			consents: this.consents.map((consent) => consent.toArray())
		};
	}
};
//#endregion
//#region src/Features/MeConsentList/Gateways/PzAccountSdkMeConsentListGateway.ts
/**
* GET /api/identity/me/consents — Bearer de client first-party, 200 no
* sucesso.
*
* @internal
*/
var PzAccountSdkMeConsentListGateway = class PzAccountSdkMeConsentListGateway extends PzAccountSdkBaseGateway {
	static ENDPOINT = "/api/identity/me/consents";
	async execute(input) {
		const response = await this.apiRequest(input.access_token).get(this.url(PzAccountSdkMeConsentListGateway.ENDPOINT));
		if (response.statusCode === 200) {
			if (!this.hasData(response)) return PzAccountSdkConsentListViewDto.from(this.buildInvalidResponse(response));
			return PzAccountSdkConsentListViewDto.from({
				...this.buildSuccess(response),
				consents: this.responseData(response)
			});
		}
		return PzAccountSdkConsentListViewDto.from(this.buildApiError(response));
	}
};
//#endregion
//#region src/Features/MeConsentRevoke/Dtos/PzAccountSdkMeConsentRevokeDto.ts
/**
* Entrada de `meConsentRevoke` — tira o acesso de um aplicativo à conta.
*/
var PzAccountSdkMeConsentRevokeDto = class PzAccountSdkMeConsentRevokeDto extends PzAccountSdkDto {
	access_token;
	client_id;
	constructor(props) {
		super();
		this.access_token = props.access_token;
		this.client_id = props.client_id;
	}
	static from(values) {
		const v = valuesOf(values);
		return new PzAccountSdkMeConsentRevokeDto({
			access_token: pullString(v, "access_token"),
			client_id: pullString(v, "client_id")
		});
	}
	/** Credenciais mascaradas: `toArray()` e `toJSON()` podem acabar em log. O valor real fica na propriedade. */
	toArray() {
		return {
			access_token: mask(this.access_token),
			client_id: this.client_id
		};
	}
};
//#endregion
//#region src/Features/MeConsentRevoke/Gateways/PzAccountSdkMeConsentRevokeGateway.ts
/**
* DELETE /api/identity/me/consents/{clientId} — Bearer de client first-party,
* 204 no sucesso; 404 `CONSENT_NOT_FOUND` quando não há consentimento ativo.
*
* O aplicativo afetado recebe o webhook `consent.revoked`.
*
* @internal
*/
var PzAccountSdkMeConsentRevokeGateway = class PzAccountSdkMeConsentRevokeGateway extends PzAccountSdkBaseGateway {
	static ENDPOINT = "/api/identity/me/consents/";
	async execute(input) {
		const response = await this.apiRequest(input.access_token).delete(this.url(PzAccountSdkMeConsentRevokeGateway.ENDPOINT + rawUrlEncode(input.client_id)));
		return PzAccountSdkResultDto.from(response.statusCode === 204 ? this.buildSuccess(response) : this.buildApiError(response));
	}
};
//#endregion
//#region src/Features/MeEmailChange/Dtos/PzAccountSdkMeEmailChangeDto.ts
/**
* Entrada de `meEmailChange` — pede a troca do e-mail da conta.
*
* `code` (TOTP ou código de recuperação) é exigido só de conta com MFA.
*/
var PzAccountSdkMeEmailChangeDto = class PzAccountSdkMeEmailChangeDto extends PzAccountSdkDto {
	access_token;
	email;
	current_password;
	code;
	constructor(props) {
		super();
		this.access_token = props.access_token;
		this.email = props.email;
		this.current_password = props.current_password;
		this.code = props.code ?? "";
	}
	static from(values) {
		const v = valuesOf(values);
		return new PzAccountSdkMeEmailChangeDto({
			access_token: pullString(v, "access_token"),
			email: pullString(v, "email"),
			current_password: pullString(v, "current_password"),
			code: pullString(v, "code")
		});
	}
	/** Credenciais mascaradas: `toArray()` e `toJSON()` podem acabar em log. O valor real fica na propriedade. */
	toArray() {
		return {
			access_token: mask(this.access_token),
			email: this.email,
			current_password: mask(this.current_password),
			code: mask(this.code)
		};
	}
};
//#endregion
//#region src/Features/MeEmailChange/Gateways/PzAccountSdkMeEmailChangeGateway.ts
/**
* POST /api/identity/me/email — Bearer (inclusive de terceiros), 202 no
* sucesso.
*
* 202 porque a troca ainda não aconteceu: o usuário confirma pelo link
* enviado ao e-mail ANTIGO. Quando confirmar, o produto recebe o webhook
* `email.changed`.
*
* @internal
*/
var PzAccountSdkMeEmailChangeGateway = class PzAccountSdkMeEmailChangeGateway extends PzAccountSdkBaseGateway {
	static ENDPOINT = "/api/identity/me/email";
	async execute(input) {
		const body = {
			email: input.email,
			current_password: input.current_password
		};
		if (input.code !== "") body["code"] = input.code;
		const response = await this.apiRequest(input.access_token).post(this.url(PzAccountSdkMeEmailChangeGateway.ENDPOINT), body);
		return PzAccountSdkResultDto.from(response.statusCode === 202 ? this.buildSuccess(response) : this.buildApiError(response));
	}
};
//#endregion
//#region src/Features/MeMfaDisable/Dtos/PzAccountSdkMeMfaDisableDto.ts
/**
* Entrada de `meMfaDisable` — senha atual e um código do app autenticador
* (ou de recuperação).
*/
var PzAccountSdkMeMfaDisableDto = class PzAccountSdkMeMfaDisableDto extends PzAccountSdkDto {
	access_token;
	current_password;
	code;
	constructor(props) {
		super();
		this.access_token = props.access_token;
		this.current_password = props.current_password;
		this.code = props.code;
	}
	static from(values) {
		const v = valuesOf(values);
		return new PzAccountSdkMeMfaDisableDto({
			access_token: pullString(v, "access_token"),
			current_password: pullString(v, "current_password"),
			code: pullString(v, "code")
		});
	}
	/** Credenciais mascaradas: `toArray()` e `toJSON()` podem acabar em log. O valor real fica na propriedade. */
	toArray() {
		return {
			access_token: mask(this.access_token),
			current_password: mask(this.current_password),
			code: mask(this.code)
		};
	}
};
//#endregion
//#region src/Features/MeMfaDisable/Gateways/PzAccountSdkMeMfaDisableGateway.ts
/**
* POST /api/identity/me/mfa/disable — Bearer de client first-party, 204 no
* sucesso.
*
* Desligar o MFA revoga os tokens do usuário (evento `tokens.revoked`).
*
* @internal
*/
var PzAccountSdkMeMfaDisableGateway = class PzAccountSdkMeMfaDisableGateway extends PzAccountSdkBaseGateway {
	static ENDPOINT = "/api/identity/me/mfa/disable";
	async execute(input) {
		const response = await this.apiRequest(input.access_token).post(this.url(PzAccountSdkMeMfaDisableGateway.ENDPOINT), {
			current_password: input.current_password,
			code: input.code
		});
		return PzAccountSdkResultDto.from(response.statusCode === 204 ? this.buildSuccess(response) : this.buildApiError(response));
	}
};
//#endregion
//#region src/Features/MeMfaEnroll/Dtos/PzAccountSdkMeMfaEnrollDto.ts
/**
* Entrada de `meMfaEnroll` — começa a ligar o MFA; pede a senha atual.
*/
var PzAccountSdkMeMfaEnrollDto = class PzAccountSdkMeMfaEnrollDto extends PzAccountSdkDto {
	access_token;
	current_password;
	constructor(props) {
		super();
		this.access_token = props.access_token;
		this.current_password = props.current_password;
	}
	static from(values) {
		const v = valuesOf(values);
		return new PzAccountSdkMeMfaEnrollDto({
			access_token: pullString(v, "access_token"),
			current_password: pullString(v, "current_password")
		});
	}
	/** Credenciais mascaradas: `toArray()` e `toJSON()` podem acabar em log. O valor real fica na propriedade. */
	toArray() {
		return {
			access_token: mask(this.access_token),
			current_password: mask(this.current_password)
		};
	}
};
//#endregion
//#region src/Features/MeMfaEnroll/Dtos/PzAccountSdkMfaEnrollViewDto.ts
/**
* Segredo TOTP para o usuário cadastrar no app autenticador.
*
* O MFA só liga depois de `meMfaEnrollConfirm` com um código gerado a partir
* deste segredo. Não persista o segredo no produto.
*/
var PzAccountSdkMfaEnrollViewDto = class PzAccountSdkMfaEnrollViewDto extends PzAccountSdkResultDto {
	secret;
	otpauth_uri;
	qr_svg;
	constructor(props = {}) {
		super(props);
		this.secret = props.secret ?? "";
		this.otpauth_uri = props.otpauth_uri ?? "";
		this.qr_svg = props.qr_svg ?? "";
	}
	static from(values) {
		const v = valuesOf(values);
		return new PzAccountSdkMfaEnrollViewDto({
			...PzAccountSdkResultDto.resultArgs(v),
			secret: pullString(v, "secret"),
			otpauth_uri: pullString(v, "otpauth_uri"),
			qr_svg: pullString(v, "qr_svg")
		});
	}
	toArray() {
		return {
			...super.toArray(),
			secret: this.secret,
			otpauth_uri: this.otpauth_uri,
			qr_svg: this.qr_svg
		};
	}
};
//#endregion
//#region src/Features/MeMfaEnroll/Gateways/PzAccountSdkMeMfaEnrollGateway.ts
/**
* POST /api/identity/me/mfa/enroll — Bearer de client first-party, 201 no
* sucesso.
*
* @internal
*/
var PzAccountSdkMeMfaEnrollGateway = class PzAccountSdkMeMfaEnrollGateway extends PzAccountSdkBaseGateway {
	static ENDPOINT = "/api/identity/me/mfa/enroll";
	async execute(input) {
		const response = await this.apiRequest(input.access_token).post(this.url(PzAccountSdkMeMfaEnrollGateway.ENDPOINT), { current_password: input.current_password });
		if (response.statusCode === 201) {
			if (!this.hasData(response)) return PzAccountSdkMfaEnrollViewDto.from(this.buildInvalidResponse(response));
			return PzAccountSdkMfaEnrollViewDto.from({
				...this.responseData(response),
				...this.buildSuccess(response)
			});
		}
		return PzAccountSdkMfaEnrollViewDto.from(this.buildApiError(response));
	}
};
//#endregion
//#region src/Features/MeMfaEnrollConfirm/Dtos/PzAccountSdkMeMfaEnrollConfirmDto.ts
/**
* Entrada de `meMfaEnrollConfirm` — o código de 6 dígitos do app autenticador.
*/
var PzAccountSdkMeMfaEnrollConfirmDto = class PzAccountSdkMeMfaEnrollConfirmDto extends PzAccountSdkDto {
	access_token;
	code;
	constructor(props) {
		super();
		this.access_token = props.access_token;
		this.code = props.code;
	}
	static from(values) {
		const v = valuesOf(values);
		return new PzAccountSdkMeMfaEnrollConfirmDto({
			access_token: pullString(v, "access_token"),
			code: pullString(v, "code")
		});
	}
	/** Credenciais mascaradas: `toArray()` e `toJSON()` podem acabar em log. O valor real fica na propriedade. */
	toArray() {
		return {
			access_token: mask(this.access_token),
			code: mask(this.code)
		};
	}
};
//#endregion
//#region src/Features/Shared/Dtos/PzAccountSdkMfaRecoveryCodesViewDto.ts
/**
* Códigos de recuperação do MFA: `meMfaEnrollConfirm` e
* `meMfaRecoveryCodesRegenerate`.
*
* Os códigos aparecem UMA vez. Mostre ao usuário e não persista.
*/
var PzAccountSdkMfaRecoveryCodesViewDto = class PzAccountSdkMfaRecoveryCodesViewDto extends PzAccountSdkResultDto {
	recovery_codes;
	warning;
	constructor(props = {}) {
		super(props);
		this.recovery_codes = props.recovery_codes ?? [];
		this.warning = props.warning ?? "";
	}
	static from(values) {
		const v = valuesOf(values);
		return new PzAccountSdkMfaRecoveryCodesViewDto({
			...PzAccountSdkResultDto.resultArgs(v),
			recovery_codes: pullStringList(v, "recovery_codes"),
			warning: pullString(v, "warning")
		});
	}
	toArray() {
		return {
			...super.toArray(),
			recovery_codes: this.recovery_codes,
			warning: this.warning
		};
	}
};
//#endregion
//#region src/Features/MeMfaEnrollConfirm/Gateways/PzAccountSdkMeMfaEnrollConfirmGateway.ts
/**
* POST /api/identity/me/mfa/enroll/confirm — Bearer de client first-party,
* 201 no sucesso, com os códigos de recuperação.
*
* @internal
*/
var PzAccountSdkMeMfaEnrollConfirmGateway = class PzAccountSdkMeMfaEnrollConfirmGateway extends PzAccountSdkBaseGateway {
	static ENDPOINT = "/api/identity/me/mfa/enroll/confirm";
	async execute(input) {
		const response = await this.apiRequest(input.access_token).post(this.url(PzAccountSdkMeMfaEnrollConfirmGateway.ENDPOINT), { code: input.code });
		if (response.statusCode === 201) {
			if (!this.hasData(response)) return PzAccountSdkMfaRecoveryCodesViewDto.from(this.buildInvalidResponse(response));
			return PzAccountSdkMfaRecoveryCodesViewDto.from({
				...this.responseData(response),
				...this.buildSuccess(response)
			});
		}
		return PzAccountSdkMfaRecoveryCodesViewDto.from(this.buildApiError(response));
	}
};
//#endregion
//#region src/Features/MeMfaRecoveryCodesRegenerate/Dtos/PzAccountSdkMeMfaRecoveryCodesRegenerateDto.ts
/**
* Entrada de `meMfaRecoveryCodesRegenerate` — senha atual e um código do app
* autenticador (ou de recuperação).
*/
var PzAccountSdkMeMfaRecoveryCodesRegenerateDto = class PzAccountSdkMeMfaRecoveryCodesRegenerateDto extends PzAccountSdkDto {
	access_token;
	current_password;
	code;
	constructor(props) {
		super();
		this.access_token = props.access_token;
		this.current_password = props.current_password;
		this.code = props.code;
	}
	static from(values) {
		const v = valuesOf(values);
		return new PzAccountSdkMeMfaRecoveryCodesRegenerateDto({
			access_token: pullString(v, "access_token"),
			current_password: pullString(v, "current_password"),
			code: pullString(v, "code")
		});
	}
	/** Credenciais mascaradas: `toArray()` e `toJSON()` podem acabar em log. O valor real fica na propriedade. */
	toArray() {
		return {
			access_token: mask(this.access_token),
			current_password: mask(this.current_password),
			code: mask(this.code)
		};
	}
};
//#endregion
//#region src/Features/MeMfaRecoveryCodesRegenerate/Gateways/PzAccountSdkMeMfaRecoveryCodesRegenerateGateway.ts
/**
* POST /api/identity/me/mfa/recovery-codes — Bearer de client first-party,
* 201 no sucesso. Os códigos anteriores deixam de valer.
*
* @internal
*/
var PzAccountSdkMeMfaRecoveryCodesRegenerateGateway = class PzAccountSdkMeMfaRecoveryCodesRegenerateGateway extends PzAccountSdkBaseGateway {
	static ENDPOINT = "/api/identity/me/mfa/recovery-codes";
	async execute(input) {
		const response = await this.apiRequest(input.access_token).post(this.url(PzAccountSdkMeMfaRecoveryCodesRegenerateGateway.ENDPOINT), {
			current_password: input.current_password,
			code: input.code
		});
		if (response.statusCode === 201) {
			if (!this.hasData(response)) return PzAccountSdkMfaRecoveryCodesViewDto.from(this.buildInvalidResponse(response));
			return PzAccountSdkMfaRecoveryCodesViewDto.from({
				...this.responseData(response),
				...this.buildSuccess(response)
			});
		}
		return PzAccountSdkMfaRecoveryCodesViewDto.from(this.buildApiError(response));
	}
};
//#endregion
//#region src/Features/MeMfaShow/Dtos/PzAccountSdkMfaStatusViewDto.ts
/** Situação do MFA (TOTP) da conta. */
var PzAccountSdkMfaStatusViewDto = class PzAccountSdkMfaStatusViewDto extends PzAccountSdkResultDto {
	enabled;
	confirmed_at;
	recovery_codes_remaining;
	constructor(props = {}) {
		super(props);
		this.enabled = props.enabled ?? false;
		this.confirmed_at = props.confirmed_at ?? "";
		this.recovery_codes_remaining = props.recovery_codes_remaining ?? 0;
	}
	static from(values) {
		const v = valuesOf(values);
		return new PzAccountSdkMfaStatusViewDto({
			...PzAccountSdkResultDto.resultArgs(v),
			enabled: pullBool(v, "enabled"),
			confirmed_at: pullString(v, "confirmed_at"),
			recovery_codes_remaining: pullInt(v, "recovery_codes_remaining")
		});
	}
	toArray() {
		return {
			...super.toArray(),
			enabled: this.enabled,
			confirmed_at: this.confirmed_at,
			recovery_codes_remaining: this.recovery_codes_remaining
		};
	}
};
//#endregion
//#region src/Features/MeMfaShow/Gateways/PzAccountSdkMeMfaShowGateway.ts
/**
* GET /api/identity/me/mfa — Bearer (inclusive de terceiros), 200 no sucesso.
*
* @internal
*/
var PzAccountSdkMeMfaShowGateway = class PzAccountSdkMeMfaShowGateway extends PzAccountSdkBaseGateway {
	static ENDPOINT = "/api/identity/me/mfa";
	async execute(input) {
		const response = await this.apiRequest(input.access_token).get(this.url(PzAccountSdkMeMfaShowGateway.ENDPOINT));
		if (response.statusCode === 200) {
			if (!this.hasData(response)) return PzAccountSdkMfaStatusViewDto.from(this.buildInvalidResponse(response));
			return PzAccountSdkMfaStatusViewDto.from({
				...this.responseData(response),
				...this.buildSuccess(response)
			});
		}
		return PzAccountSdkMfaStatusViewDto.from(this.buildApiError(response));
	}
};
//#endregion
//#region src/Features/MePasswordChange/Dtos/PzAccountSdkMePasswordChangeDto.ts
/**
* Entrada de `mePasswordChange`.
*
* `code` (TOTP ou código de recuperação) é exigido só de conta com MFA. A
* `password_confirmation` é preenchida pelo SDK.
*/
var PzAccountSdkMePasswordChangeDto = class PzAccountSdkMePasswordChangeDto extends PzAccountSdkDto {
	access_token;
	current_password;
	password;
	code;
	constructor(props) {
		super();
		this.access_token = props.access_token;
		this.current_password = props.current_password;
		this.password = props.password;
		this.code = props.code ?? "";
	}
	static from(values) {
		const v = valuesOf(values);
		return new PzAccountSdkMePasswordChangeDto({
			access_token: pullString(v, "access_token"),
			current_password: pullString(v, "current_password"),
			password: pullString(v, "password"),
			code: pullString(v, "code")
		});
	}
	/** Credenciais mascaradas: `toArray()` e `toJSON()` podem acabar em log. O valor real fica na propriedade. */
	toArray() {
		return {
			access_token: mask(this.access_token),
			current_password: mask(this.current_password),
			password: mask(this.password),
			code: mask(this.code)
		};
	}
};
//#endregion
//#region src/Features/MePasswordChange/Gateways/PzAccountSdkMePasswordChangeGateway.ts
/**
* PUT /api/identity/me/password — Bearer de client first-party, 204 no
* sucesso.
*
* Trocar a senha revoga os tokens do usuário (evento `tokens.revoked`): o
* access token usado aqui deixa de valer.
*
* @internal
*/
var PzAccountSdkMePasswordChangeGateway = class PzAccountSdkMePasswordChangeGateway extends PzAccountSdkBaseGateway {
	static ENDPOINT = "/api/identity/me/password";
	async execute(input) {
		const body = {
			current_password: input.current_password,
			password: input.password,
			password_confirmation: input.password
		};
		if (input.code !== "") body["code"] = input.code;
		const response = await this.apiRequest(input.access_token).put(this.url(PzAccountSdkMePasswordChangeGateway.ENDPOINT), body);
		return PzAccountSdkResultDto.from(response.statusCode === 204 ? this.buildSuccess(response) : this.buildApiError(response));
	}
};
//#endregion
//#region src/Features/Shared/Dtos/PzAccountSdkUserViewDto.ts
/**
* A conta do usuário como a API do Puzl Account a devolve.
*
* Identifique o usuário no produto pelo `sub` (ULID público de 26
* caracteres, estável) — nunca pelo `id`, que é interno do provedor, nem pelo
* e-mail, que muda. Atenção: para um client `pairwise`, o `sub` do id_token e
* do userinfo é outro; esta API devolve sempre o público.
*
* Datas chegam como string ISO 8601; campo ausente é string vazia.
*/
var PzAccountSdkUserViewDto = class PzAccountSdkUserViewDto extends PzAccountSdkDto {
	id;
	sub;
	name;
	email;
	is_active;
	email_verified_at;
	birthdate;
	gender;
	phone_number;
	phone_number_verified_at;
	locale;
	zoneinfo;
	picture;
	address;
	mfa_enabled;
	deleted_at;
	constructor(props = {}) {
		super();
		this.id = props.id ?? 0;
		this.sub = props.sub ?? "";
		this.name = props.name ?? "";
		this.email = props.email ?? "";
		this.is_active = props.is_active ?? false;
		this.email_verified_at = props.email_verified_at ?? "";
		this.birthdate = props.birthdate ?? "";
		this.gender = props.gender ?? "";
		this.phone_number = props.phone_number ?? "";
		this.phone_number_verified_at = props.phone_number_verified_at ?? "";
		this.locale = props.locale ?? "";
		this.zoneinfo = props.zoneinfo ?? "";
		this.picture = props.picture ?? "";
		this.address = props.address ?? null;
		this.mfa_enabled = props.mfa_enabled ?? false;
		this.deleted_at = props.deleted_at ?? "";
	}
	static from(values) {
		const v = valuesOf(values);
		return new PzAccountSdkUserViewDto({
			id: pullInt(v, "id"),
			sub: pullString(v, "sub"),
			name: pullString(v, "name"),
			email: pullString(v, "email"),
			is_active: pullBool(v, "is_active"),
			email_verified_at: pullString(v, "email_verified_at"),
			birthdate: pullString(v, "birthdate"),
			gender: pullString(v, "gender"),
			phone_number: pullString(v, "phone_number"),
			phone_number_verified_at: pullString(v, "phone_number_verified_at"),
			locale: pullString(v, "locale"),
			zoneinfo: pullString(v, "zoneinfo"),
			picture: pullString(v, "picture"),
			address: PzAccountSdkAddressDto.fromNullable(v, "address"),
			mfa_enabled: pullBool(v, "mfa_enabled"),
			deleted_at: pullString(v, "deleted_at")
		});
	}
	isEmailVerified() {
		return this.email_verified_at !== "";
	}
	toArray() {
		return {
			id: this.id,
			sub: this.sub,
			name: this.name,
			email: this.email,
			is_active: this.is_active,
			email_verified_at: this.email_verified_at,
			birthdate: this.birthdate,
			gender: this.gender,
			phone_number: this.phone_number,
			phone_number_verified_at: this.phone_number_verified_at,
			locale: this.locale,
			zoneinfo: this.zoneinfo,
			picture: this.picture,
			address: this.address?.toArray() ?? null,
			mfa_enabled: this.mfa_enabled,
			deleted_at: this.deleted_at
		};
	}
};
//#endregion
//#region src/Features/Shared/Dtos/PzAccountSdkUserProfileViewDto.ts
/**
* Retorno das operações que devolvem a conta: `userRegister`, `meShow`,
* `meUpdate` e as operações de foto.
*
* `user` só vem preenchido no sucesso.
*/
var PzAccountSdkUserProfileViewDto = class PzAccountSdkUserProfileViewDto extends PzAccountSdkResultDto {
	user;
	constructor(props = {}) {
		super(props);
		this.user = props.user ?? null;
	}
	static from(values) {
		const v = valuesOf(values);
		const user = v["user"];
		return new PzAccountSdkUserProfileViewDto({
			...PzAccountSdkResultDto.resultArgs(v),
			user: user instanceof PzAccountSdkUserViewDto ? user : isRecord(user) ? PzAccountSdkUserViewDto.from(user) : null
		});
	}
	toArray() {
		return {
			...super.toArray(),
			user: this.user?.toArray() ?? null
		};
	}
};
//#endregion
//#region src/Features/MePictureDelete/Gateways/PzAccountSdkMePictureDeleteGateway.ts
/**
* DELETE /api/identity/me/picture — Bearer de client first-party, 200 no
* sucesso, com a conta já sem foto.
*
* @internal
*/
var PzAccountSdkMePictureDeleteGateway = class PzAccountSdkMePictureDeleteGateway extends PzAccountSdkBaseGateway {
	static ENDPOINT = "/api/identity/me/picture";
	async execute(input) {
		const response = await this.apiRequest(input.access_token).delete(this.url(PzAccountSdkMePictureDeleteGateway.ENDPOINT));
		if (response.statusCode === 200) {
			if (!this.hasData(response)) return PzAccountSdkUserProfileViewDto.from(this.buildInvalidResponse(response));
			return PzAccountSdkUserProfileViewDto.from({
				...this.buildSuccess(response),
				user: this.responseData(response)
			});
		}
		return PzAccountSdkUserProfileViewDto.from(this.buildApiError(response));
	}
};
//#endregion
//#region src/Enum/PzAccountSdkPicturePresetEnum.ts
/**
* Ilustrações prontas que o usuário pode escolher como foto da conta.
*
* Espelha `UserPicturePresetEnum` do Puzl Account. Um preset novo no provedor
* exige nova versão do SDK.
*/
var PzAccountSdkPicturePresetEnum = class PzAccountSdkPicturePresetEnum extends PzAccountSdkEnum {
	static PUZZLE = new PzAccountSdkPicturePresetEnum("PUZZLE", "puzzle");
	static ROCKET = new PzAccountSdkPicturePresetEnum("ROCKET", "rocket");
	static STAR = new PzAccountSdkPicturePresetEnum("STAR", "star");
	static LEAF = new PzAccountSdkPicturePresetEnum("LEAF", "leaf");
	static SUN = new PzAccountSdkPicturePresetEnum("SUN", "sun");
	static MOON = new PzAccountSdkPicturePresetEnum("MOON", "moon");
	static MOUNTAIN = new PzAccountSdkPicturePresetEnum("MOUNTAIN", "mountain");
	static WAVE = new PzAccountSdkPicturePresetEnum("WAVE", "wave");
	static CAT = new PzAccountSdkPicturePresetEnum("CAT", "cat");
	static FOX = new PzAccountSdkPicturePresetEnum("FOX", "fox");
	static OWL = new PzAccountSdkPicturePresetEnum("OWL", "owl");
	static ROBOT = new PzAccountSdkPicturePresetEnum("ROBOT", "robot");
	static MIXER_TRUCK = new PzAccountSdkPicturePresetEnum("MIXER_TRUCK", "mixer_truck");
	static HARD_HAT = new PzAccountSdkPicturePresetEnum("HARD_HAT", "hard_hat");
	static CRANE = new PzAccountSdkPicturePresetEnum("CRANE", "crane");
	static BRICKS = new PzAccountSdkPicturePresetEnum("BRICKS", "bricks");
	static LASER_SWORD = new PzAccountSdkPicturePresetEnum("LASER_SWORD", "laser_sword");
	static DROID = new PzAccountSdkPicturePresetEnum("DROID", "droid");
	static SPACE_HELMET = new PzAccountSdkPicturePresetEnum("SPACE_HELMET", "space_helmet");
	static RING_WORLD = new PzAccountSdkPicturePresetEnum("RING_WORLD", "ring_world");
	static ELECTRIC_GUITAR = new PzAccountSdkPicturePresetEnum("ELECTRIC_GUITAR", "electric_guitar");
	static ROCK_HAND = new PzAccountSdkPicturePresetEnum("ROCK_HAND", "rock_hand");
	static lookup = enumLookup("PzAccountSdkPicturePresetEnum", [
		PzAccountSdkPicturePresetEnum.PUZZLE,
		PzAccountSdkPicturePresetEnum.ROCKET,
		PzAccountSdkPicturePresetEnum.STAR,
		PzAccountSdkPicturePresetEnum.LEAF,
		PzAccountSdkPicturePresetEnum.SUN,
		PzAccountSdkPicturePresetEnum.MOON,
		PzAccountSdkPicturePresetEnum.MOUNTAIN,
		PzAccountSdkPicturePresetEnum.WAVE,
		PzAccountSdkPicturePresetEnum.CAT,
		PzAccountSdkPicturePresetEnum.FOX,
		PzAccountSdkPicturePresetEnum.OWL,
		PzAccountSdkPicturePresetEnum.ROBOT,
		PzAccountSdkPicturePresetEnum.MIXER_TRUCK,
		PzAccountSdkPicturePresetEnum.HARD_HAT,
		PzAccountSdkPicturePresetEnum.CRANE,
		PzAccountSdkPicturePresetEnum.BRICKS,
		PzAccountSdkPicturePresetEnum.LASER_SWORD,
		PzAccountSdkPicturePresetEnum.DROID,
		PzAccountSdkPicturePresetEnum.SPACE_HELMET,
		PzAccountSdkPicturePresetEnum.RING_WORLD,
		PzAccountSdkPicturePresetEnum.ELECTRIC_GUITAR,
		PzAccountSdkPicturePresetEnum.ROCK_HAND
	]);
	static cases() {
		return PzAccountSdkPicturePresetEnum.lookup.cases();
	}
	static from(value) {
		return PzAccountSdkPicturePresetEnum.lookup.from(value);
	}
	static tryFrom(value) {
		return PzAccountSdkPicturePresetEnum.lookup.tryFrom(value);
	}
};
//#endregion
//#region src/Features/MePicturePresetSet/Dtos/PzAccountSdkMePicturePresetSetDto.ts
/**
* Entrada de `mePicturePresetSet` — troca a foto por uma ilustração pronta.
*
* Preset desconhecido lança `TypeError` já aqui: é erro de integração, e
* mandá-lo ao provedor só trocaria a exceção por um 422.
*/
var PzAccountSdkMePicturePresetSetDto = class PzAccountSdkMePicturePresetSetDto extends PzAccountSdkDto {
	access_token;
	preset;
	constructor(props) {
		super();
		this.access_token = props.access_token;
		this.preset = PzAccountSdkPicturePresetEnum.from(props.preset);
	}
	static from(values) {
		const v = valuesOf(values);
		return new PzAccountSdkMePicturePresetSetDto({
			access_token: pullString(v, "access_token"),
			preset: PzAccountSdkPicturePresetEnum.tryFrom(v["preset"]) ?? pullString(v, "preset")
		});
	}
	toArray() {
		return {
			access_token: mask(this.access_token),
			preset: this.preset.value
		};
	}
};
//#endregion
//#region src/Features/MePicturePresetSet/Gateways/PzAccountSdkMePicturePresetSetGateway.ts
/**
* PUT /api/identity/me/picture/preset — Bearer de client first-party, 200 no
* sucesso.
*
* @internal
*/
var PzAccountSdkMePicturePresetSetGateway = class PzAccountSdkMePicturePresetSetGateway extends PzAccountSdkBaseGateway {
	static ENDPOINT = "/api/identity/me/picture/preset";
	async execute(input) {
		const response = await this.apiRequest(input.access_token).put(this.url(PzAccountSdkMePicturePresetSetGateway.ENDPOINT), { preset: input.preset.value });
		if (response.statusCode === 200) {
			if (!this.hasData(response)) return PzAccountSdkUserProfileViewDto.from(this.buildInvalidResponse(response));
			return PzAccountSdkUserProfileViewDto.from({
				...this.buildSuccess(response),
				user: this.responseData(response)
			});
		}
		return PzAccountSdkUserProfileViewDto.from(this.buildApiError(response));
	}
};
//#endregion
//#region src/Features/MePictureUpload/Dtos/PzAccountSdkMePictureUploadDto.ts
/**
* Entrada de `mePictureUpload`.
*
* `contents` são os bytes da imagem (jpg, png ou webp, até 5 MB). A extensão
* de `filename` define o Content-Type da parte — mande com a extensão certa.
*
* O nome é saneado aqui: ele costuma vir do navegador (`file.originalname`
* no multer) e vai para o header da parte multipart. Fica só
* `[A-Za-z0-9._-]`; vazio vira `picture` — sem nome, o servidor nem
* reconheceria a parte como arquivo.
*/
var PzAccountSdkMePictureUploadDto = class PzAccountSdkMePictureUploadDto extends PzAccountSdkDto {
	static MIME_TYPES = {
		jpg: "image/jpeg",
		jpeg: "image/jpeg",
		png: "image/png",
		webp: "image/webp",
		gif: "image/gif"
	};
	access_token;
	contents;
	filename;
	constructor(props) {
		super();
		this.access_token = props.access_token;
		this.contents = PzAccountSdkMePictureUploadDto.toBuffer(props.contents);
		this.filename = PzAccountSdkMePictureUploadDto.sanitize(props.filename ?? "");
	}
	/**
	* Lê a imagem do disco. Sem `filename`, usa o nome do arquivo.
	*
	* @throws TypeError arquivo inexistente ou ilegível
	*/
	static fromPath(accessToken, path, filename = "") {
		let contents;
		try {
			if (!(0, node_fs.existsSync)(path) || !(0, node_fs.statSync)(path).isFile()) throw new Error("not a file");
			contents = (0, node_fs.readFileSync)(path);
		} catch {
			throw new TypeError(`PzAccountSdk: não foi possível ler a imagem em "${path}".`);
		}
		return new PzAccountSdkMePictureUploadDto({
			access_token: accessToken,
			contents,
			filename: filename !== "" ? filename : (0, node_path.basename)(path)
		});
	}
	static from(values) {
		const v = valuesOf(values);
		return new PzAccountSdkMePictureUploadDto({
			access_token: pullString(v, "access_token"),
			contents: v["contents"],
			filename: pullString(v, "filename")
		});
	}
	/** Content-Type da parte, pela extensão do nome. */
	mimeType() {
		const extension = this.filename.includes(".") ? (this.filename.split(".").pop() ?? "").toLowerCase() : "";
		return PzAccountSdkMePictureUploadDto.MIME_TYPES[extension] ?? "";
	}
	/** Os bytes da imagem ficam de fora (só o tamanho) e o token vai mascarado. */
	toArray() {
		return {
			access_token: mask(this.access_token),
			filename: this.filename,
			size: this.contents.length
		};
	}
	/** Mesmo saneamento do SDK PHP: `basename`, só `[A-Za-z0-9._-]`, sem `.`/`_` nas pontas. */
	static sanitize(filename) {
		const path = filename.replaceAll("\\", "/").replace(/\/+$/, "");
		const safe = path.slice(path.lastIndexOf("/") + 1).replace(/[^A-Za-z0-9._-]+/g, "_").replace(/^[._]+|[._]+$/g, "");
		return safe !== "" ? safe : "picture";
	}
	/**
	* Bytes de qualquer formato binário. String só por compatibilidade com o
	* SDK PHP, como bytes crus (latin1) — texto UTF-8 se corromperia, por isso
	* ela fica fora do tipo. Qualquer outra coisa é erro de integração: mandar
	* 0 bytes em silêncio seria pior.
	*
	* @throws TypeError conteúdo em formato não suportado
	*/
	static toBuffer(contents) {
		if (Buffer.isBuffer(contents)) return contents;
		if (ArrayBuffer.isView(contents)) return Buffer.from(contents.buffer, contents.byteOffset, contents.byteLength);
		if (contents instanceof ArrayBuffer || Object.prototype.toString.call(contents) === "[object ArrayBuffer]") return Buffer.from(contents);
		if (typeof contents === "string") return Buffer.from(contents, "latin1");
		throw new TypeError("PzAccountSdk: \"contents\" da foto precisa ser Buffer, Uint8Array ou ArrayBuffer.");
	}
};
//#endregion
//#region src/Features/MePictureUpload/Gateways/PzAccountSdkMePictureUploadGateway.ts
/**
* POST /api/identity/me/picture (multipart) — Bearer de client first-party,
* 200 no sucesso, com a conta já com a foto nova.
*
* @internal
*/
var PzAccountSdkMePictureUploadGateway = class PzAccountSdkMePictureUploadGateway extends PzAccountSdkBaseGateway {
	static ENDPOINT = "/api/identity/me/picture";
	async execute(input) {
		const form = new FormData();
		const type = input.mimeType();
		form.append("picture", new Blob([input.contents], type !== "" ? { type } : {}), input.filename);
		const response = await this.apiRequest(input.access_token).post(this.url(PzAccountSdkMePictureUploadGateway.ENDPOINT), form);
		if (response.statusCode === 200) {
			if (!this.hasData(response)) return PzAccountSdkUserProfileViewDto.from(this.buildInvalidResponse(response));
			return PzAccountSdkUserProfileViewDto.from({
				...this.buildSuccess(response),
				user: this.responseData(response)
			});
		}
		return PzAccountSdkUserProfileViewDto.from(this.buildApiError(response));
	}
};
//#endregion
//#region src/Features/MeShow/Gateways/PzAccountSdkMeShowGateway.ts
/**
* GET /api/identity/me — Bearer de client first-party, 200 no sucesso.
*
* @internal
*/
var PzAccountSdkMeShowGateway = class PzAccountSdkMeShowGateway extends PzAccountSdkBaseGateway {
	static ENDPOINT = "/api/identity/me";
	async execute(input) {
		const response = await this.apiRequest(input.access_token).get(this.url(PzAccountSdkMeShowGateway.ENDPOINT));
		if (response.statusCode === 200) {
			if (!this.hasData(response)) return PzAccountSdkUserProfileViewDto.from(this.buildInvalidResponse(response));
			return PzAccountSdkUserProfileViewDto.from({
				...this.buildSuccess(response),
				user: this.responseData(response)
			});
		}
		return PzAccountSdkUserProfileViewDto.from(this.buildApiError(response));
	}
};
//#endregion
//#region src/Enum/PzAccountSdkGenderEnum.ts
/**
* Valores aceitos no campo `gender` da conta.
*
* Os DTOs guardam a string crua (vazia quando não informado); use
* `tryFrom()` para ramificar.
*/
var PzAccountSdkGenderEnum = class PzAccountSdkGenderEnum extends PzAccountSdkEnum {
	static FEMALE = new PzAccountSdkGenderEnum("FEMALE", "female");
	static MALE = new PzAccountSdkGenderEnum("MALE", "male");
	static OTHER = new PzAccountSdkGenderEnum("OTHER", "other");
	static PREFER_NOT_TO_SAY = new PzAccountSdkGenderEnum("PREFER_NOT_TO_SAY", "prefer_not_to_say");
	static lookup = enumLookup("PzAccountSdkGenderEnum", [
		PzAccountSdkGenderEnum.FEMALE,
		PzAccountSdkGenderEnum.MALE,
		PzAccountSdkGenderEnum.OTHER,
		PzAccountSdkGenderEnum.PREFER_NOT_TO_SAY
	]);
	static cases() {
		return PzAccountSdkGenderEnum.lookup.cases();
	}
	static from(value) {
		return PzAccountSdkGenderEnum.lookup.from(value);
	}
	static tryFrom(value) {
		return PzAccountSdkGenderEnum.lookup.tryFrom(value);
	}
};
//#endregion
//#region src/Features/MeUpdate/Dtos/PzAccountSdkMeUpdateDto.ts
/**
* Entrada de `meUpdate` — PUT COMPLETO do perfil.
*
* Campo opcional vazio é enviado como `null` e APAGA o valor na conta. Para
* mudar só um campo, parta da conta atual: `fromUser(token, user, { name: 'Novo' })`.
*
* O `email` precisa ser o atual: troca de e-mail é `meEmailChange`.
*/
var PzAccountSdkMeUpdateDto = class PzAccountSdkMeUpdateDto extends PzAccountSdkDto {
	access_token;
	name;
	email;
	birthdate;
	locale;
	zoneinfo;
	gender;
	phone_number;
	address;
	constructor(props) {
		super();
		this.access_token = props.access_token;
		this.name = props.name;
		this.email = props.email;
		this.birthdate = props.birthdate;
		this.locale = props.locale;
		this.zoneinfo = props.zoneinfo;
		this.gender = typeof props.gender === "string" ? props.gender : PzAccountSdkGenderEnum.tryFrom(props.gender)?.value ?? "";
		this.phone_number = props.phone_number ?? "";
		this.address = PzAccountSdkAddressDto.fromNullable({ address: props.address }, "address");
	}
	static from(values) {
		const v = valuesOf(values);
		return new PzAccountSdkMeUpdateDto({
			access_token: pullString(v, "access_token"),
			name: pullString(v, "name"),
			email: pullString(v, "email"),
			birthdate: pullString(v, "birthdate"),
			locale: pullString(v, "locale"),
			zoneinfo: pullString(v, "zoneinfo"),
			gender: PzAccountSdkGenderEnum.tryFrom(v["gender"]) ?? pullString(v, "gender"),
			phone_number: pullString(v, "phone_number"),
			address: PzAccountSdkAddressDto.fromNullable(v, "address")
		});
	}
	/**
	* Parte da conta atual (de `meShow`) e aplica só as mudanças — o jeito
	* seguro de editar um campo sem apagar os outros. `changes.address` aceita
	* o DTO, um objeto, ou `null` para apagar o endereço.
	*/
	static fromUser(accessToken, user, changes = {}) {
		return PzAccountSdkMeUpdateDto.from({
			...user.toArray(),
			address: user.address,
			...changes,
			access_token: accessToken
		});
	}
	toArray() {
		return {
			access_token: mask(this.access_token),
			name: this.name,
			email: this.email,
			birthdate: this.birthdate,
			locale: this.locale,
			zoneinfo: this.zoneinfo,
			gender: this.gender,
			phone_number: this.phone_number,
			address: this.address?.toArray() ?? null
		};
	}
};
//#endregion
//#region src/Features/MeUpdate/Gateways/PzAccountSdkMeUpdateGateway.ts
/**
* PUT /api/identity/me — Bearer de client first-party, 200 no sucesso.
*
* @internal
*/
var PzAccountSdkMeUpdateGateway = class PzAccountSdkMeUpdateGateway extends PzAccountSdkBaseGateway {
	static ENDPOINT = "/api/identity/me";
	async execute(input) {
		const response = await this.apiRequest(input.access_token).put(this.url(PzAccountSdkMeUpdateGateway.ENDPOINT), {
			name: input.name,
			email: input.email,
			birthdate: input.birthdate,
			gender: input.gender !== "" ? input.gender : null,
			phone_number: input.phone_number !== "" ? input.phone_number : null,
			locale: input.locale,
			zoneinfo: input.zoneinfo,
			address: input.address?.toArray() ?? null
		});
		if (response.statusCode === 200) {
			if (!this.hasData(response)) return PzAccountSdkUserProfileViewDto.from(this.buildInvalidResponse(response));
			return PzAccountSdkUserProfileViewDto.from({
				...this.buildSuccess(response),
				user: this.responseData(response)
			});
		}
		return PzAccountSdkUserProfileViewDto.from(this.buildApiError(response));
	}
};
//#endregion
//#region src/Features/PkceCreate/Dtos/PzAccountSdkPkceViewDto.ts
/**
* Segredos de uma tentativa de login (Authorization Code + PKCE S256).
*
* - `state`: protege o retorno contra CSRF — confira-o no callback.
* - `nonce`: amarra o id_token a esta tentativa — passe-o ao `idTokenVerify`.
* - `code_verifier`: fica no servidor do produto, nunca vai ao navegador;
*   é exigido no `tokenExchangeCode`.
* - `code_challenge`: vai na URL de authorize.
*
* Guarde `state`, `nonce` e `code_verifier` (cache/sessão) até o callback, e
* use cada um uma única vez.
*/
var PzAccountSdkPkceViewDto = class PzAccountSdkPkceViewDto extends PzAccountSdkDto {
	state;
	nonce;
	code_verifier;
	code_challenge;
	constructor(props) {
		super();
		this.state = props.state;
		this.nonce = props.nonce;
		this.code_verifier = props.code_verifier;
		this.code_challenge = props.code_challenge;
	}
	static from(values) {
		const v = valuesOf(values);
		return new PzAccountSdkPkceViewDto({
			state: pullString(v, "state"),
			nonce: pullString(v, "nonce"),
			code_verifier: pullString(v, "code_verifier"),
			code_challenge: pullString(v, "code_challenge")
		});
	}
	/** Tipado: dá para guardar na sessão e ler de volta sem conversão. */
	toArray() {
		return {
			state: this.state,
			nonce: this.nonce,
			code_verifier: this.code_verifier,
			code_challenge: this.code_challenge
		};
	}
};
//#endregion
//#region src/Features/PkceCreate/Services/PzAccountSdkPkceCreateService.ts
/**
* Gera state, nonce e o par code_verifier/code_challenge (RFC 7636, S256).
*
* Local, sem HTTP. Tudo sai de `randomBytes` em base64url.
*
* @internal
*/
var PzAccountSdkPkceCreateService = class PzAccountSdkPkceCreateService {
	/** 32 bytes → 43 caracteres em base64url. */
	static STATE_BYTES = 32;
	/** 64 bytes → 86 caracteres: dentro dos 43..128 que a RFC 7636 exige. */
	static VERIFIER_BYTES = 64;
	execute() {
		const verifier = PzAccountSdkPkceCreateService.random(PzAccountSdkPkceCreateService.VERIFIER_BYTES);
		return new PzAccountSdkPkceViewDto({
			state: PzAccountSdkPkceCreateService.random(PzAccountSdkPkceCreateService.STATE_BYTES),
			nonce: PzAccountSdkPkceCreateService.random(PzAccountSdkPkceCreateService.STATE_BYTES),
			code_verifier: verifier,
			code_challenge: PzAccountSdkPkceCreateService.challengeFor(verifier)
		});
	}
	/** S256: base64url(sha256(verifier)), sem padding. */
	static challengeFor(codeVerifier) {
		return base64UrlEncode(sha256(codeVerifier));
	}
	static random(bytes) {
		return base64UrlEncode((0, node_crypto.randomBytes)(bytes));
	}
};
//#endregion
//#region src/Features/Shared/Dtos/PzAccountSdkAccessTokenDto.ts
/**
* Entrada das operações que só precisam do access token do usuário:
* `userInfoShow`, `meShow`, `mePictureDelete`, `meMfaShow` e `meConsentList`.
*
* O SDK não guarda sessão: o token é do usuário, e quem o armazena é o produto.
*/
var PzAccountSdkAccessTokenDto = class PzAccountSdkAccessTokenDto extends PzAccountSdkDto {
	access_token;
	constructor(props) {
		super();
		this.access_token = props.access_token;
	}
	static from(values) {
		const v = valuesOf(values);
		return new PzAccountSdkAccessTokenDto({ access_token: pullString(v, "access_token") });
	}
	toArray() {
		return { access_token: mask(this.access_token) };
	}
};
//#endregion
//#region src/Features/TokenExchangeCode/Dtos/PzAccountSdkTokenExchangeCodeDto.ts
/**
* Entrada de `tokenExchangeCode`.
*
* `redirect_uri` precisa ser a MESMA usada na URL de authorize; vazio usa a
* da configuração. O `code` vale 60 segundos e uma única vez.
*/
var PzAccountSdkTokenExchangeCodeDto = class PzAccountSdkTokenExchangeCodeDto extends PzAccountSdkDto {
	code;
	code_verifier;
	redirect_uri;
	constructor(props) {
		super();
		this.code = props.code;
		this.code_verifier = props.code_verifier;
		this.redirect_uri = props.redirect_uri ?? "";
	}
	static from(values) {
		const v = valuesOf(values);
		return new PzAccountSdkTokenExchangeCodeDto({
			code: pullString(v, "code"),
			code_verifier: pullString(v, "code_verifier"),
			redirect_uri: pullString(v, "redirect_uri")
		});
	}
	toArray() {
		return {
			code: mask(this.code),
			code_verifier: mask(this.code_verifier),
			redirect_uri: this.redirect_uri
		};
	}
};
//#endregion
//#region src/Features/Shared/Dtos/PzAccountSdkTokenViewDto.ts
/**
* Resposta do /oauth/token: `tokenExchangeCode`, `tokenRefresh` e
* `tokenPassword`.
*
* - `access_token` é opaco: valide-o chamando `userInfoShow`, nunca
*   decodificando.
* - `id_token` é um JWT RS256: passe-o por `idTokenVerify` antes de confiar
*   em qualquer claim.
* - `refresh_token` só vem com o escopo `offline_access`, e GIRA a cada uso —
*   guarde sempre o novo. Reusar o antigo derruba a família inteira.
*/
var PzAccountSdkTokenViewDto = class PzAccountSdkTokenViewDto extends PzAccountSdkResultDto {
	access_token;
	token_type;
	expires_in;
	scope;
	id_token;
	refresh_token;
	constructor(props = {}) {
		super(props);
		this.access_token = props.access_token ?? "";
		this.token_type = props.token_type ?? "";
		this.expires_in = props.expires_in ?? 0;
		this.scope = props.scope ?? "";
		this.id_token = props.id_token ?? "";
		this.refresh_token = props.refresh_token ?? "";
	}
	static from(values) {
		const v = valuesOf(values);
		return new PzAccountSdkTokenViewDto({
			...PzAccountSdkResultDto.resultArgs(v),
			access_token: pullString(v, "access_token"),
			token_type: pullString(v, "token_type"),
			expires_in: pullInt(v, "expires_in"),
			scope: pullString(v, "scope"),
			id_token: pullString(v, "id_token"),
			refresh_token: pullString(v, "refresh_token")
		});
	}
	hasIdToken() {
		return this.id_token !== "";
	}
	hasRefreshToken() {
		return this.refresh_token !== "";
	}
	toArray() {
		return {
			...super.toArray(),
			access_token: this.access_token,
			token_type: this.token_type,
			expires_in: this.expires_in,
			scope: this.scope,
			id_token: this.id_token,
			refresh_token: this.refresh_token
		};
	}
};
//#endregion
//#region src/Features/Shared/Gateways/PzAccountSdkTokenBaseGateway.ts
/**
* Base dos três grants do /oauth/token: authorization_code, refresh_token e
* password.
*
* @internal
*/
var PzAccountSdkTokenBaseGateway = class PzAccountSdkTokenBaseGateway extends PzAccountSdkBaseGateway {
	static ENDPOINT = "/oauth/token";
	/** @param params parâmetros do grant; vazios não são enviados */
	async requestToken(params) {
		const request = this.oauthRequest();
		const body = this.withClientAuth(request, Object.fromEntries(Object.entries(params).filter(([, value]) => value !== "")));
		const response = await request.post(this.url(PzAccountSdkTokenBaseGateway.ENDPOINT), body);
		if (response.statusCode === 200) {
			if (!this.hasBody(response)) return PzAccountSdkTokenViewDto.from(this.buildInvalidResponse(response));
			return PzAccountSdkTokenViewDto.from({
				...this.responseBody(response),
				...this.buildSuccess(response)
			});
		}
		return PzAccountSdkTokenViewDto.from(this.buildOauthError(response));
	}
};
//#endregion
//#region src/Features/TokenExchangeCode/Gateways/PzAccountSdkTokenExchangeCodeGateway.ts
/**
* POST /oauth/token, grant `authorization_code` com PKCE — autenticação do
* client, 200 no sucesso.
*
* @internal
*/
var PzAccountSdkTokenExchangeCodeGateway = class extends PzAccountSdkTokenBaseGateway {
	execute(input) {
		let redirectUri = input.redirect_uri;
		if (redirectUri === "") {
			this.config.assertRedirectUsable();
			redirectUri = this.config.redirectUri;
		}
		return this.requestToken({
			grant_type: "authorization_code",
			code: input.code,
			redirect_uri: redirectUri,
			code_verifier: input.code_verifier
		});
	}
};
//#endregion
//#region src/Features/TokenPassword/Dtos/PzAccountSdkTokenPasswordDto.ts
/**
* Entrada de `tokenPassword` — login com e-mail e senha digitados no próprio
* produto.
*
* `scope` vazio usa o da configuração.
*/
var PzAccountSdkTokenPasswordDto = class PzAccountSdkTokenPasswordDto extends PzAccountSdkDto {
	username;
	password;
	scope;
	constructor(props) {
		super();
		this.username = props.username;
		this.password = props.password;
		this.scope = props.scope ?? "";
	}
	static from(values) {
		const v = valuesOf(values);
		return new PzAccountSdkTokenPasswordDto({
			username: pullString(v, "username"),
			password: pullString(v, "password"),
			scope: pullString(v, "scope")
		});
	}
	toArray() {
		return {
			username: this.username,
			password: mask(this.password),
			scope: this.scope
		};
	}
};
//#endregion
//#region src/Features/TokenPassword/Gateways/PzAccountSdkTokenPasswordGateway.ts
/**
* POST /oauth/token, grant `password` — autenticação do client, 200 no
* sucesso.
*
* Só funciona para client first-party e confidencial habilitado com
* `php artisan oidc:client:password-grant`; fora disso, `unauthorized_client`.
* Não devolve refresh_token. Senha errada e conta com MFA chegam iguais, como
* `invalid_grant` — para conta com MFA, mande o usuário ao fluxo de redirect.
*
* @internal
*/
var PzAccountSdkTokenPasswordGateway = class extends PzAccountSdkTokenBaseGateway {
	execute(input) {
		return this.requestToken({
			grant_type: "password",
			username: input.username,
			password: input.password,
			scope: input.scope !== "" ? input.scope : this.config.scope
		});
	}
};
//#endregion
//#region src/Features/TokenRefresh/Dtos/PzAccountSdkTokenRefreshDto.ts
/**
* Entrada de `tokenRefresh`.
*
* `scope` só pode reduzir o que foi concedido; vazio mantém os escopos.
*/
var PzAccountSdkTokenRefreshDto = class PzAccountSdkTokenRefreshDto extends PzAccountSdkDto {
	refresh_token;
	scope;
	constructor(props) {
		super();
		this.refresh_token = props.refresh_token;
		this.scope = props.scope ?? "";
	}
	static from(values) {
		const v = valuesOf(values);
		return new PzAccountSdkTokenRefreshDto({
			refresh_token: pullString(v, "refresh_token"),
			scope: pullString(v, "scope")
		});
	}
	toArray() {
		return {
			refresh_token: mask(this.refresh_token),
			scope: this.scope
		};
	}
};
//#endregion
//#region src/Features/TokenRefresh/Gateways/PzAccountSdkTokenRefreshGateway.ts
/**
* POST /oauth/token, grant `refresh_token` — autenticação do client, 200 no
* sucesso.
*
* O refresh token SEMPRE gira: a resposta traz um novo, e o antigo morre.
* Reapresentar um já usado é tratado como roubo e derruba a família inteira.
*
* @internal
*/
var PzAccountSdkTokenRefreshGateway = class extends PzAccountSdkTokenBaseGateway {
	execute(input) {
		return this.requestToken({
			grant_type: "refresh_token",
			refresh_token: input.refresh_token,
			scope: input.scope
		});
	}
};
//#endregion
//#region src/Enum/PzAccountSdkTokenTypeHintEnum.ts
/**
* Dica do tipo de token no /oauth/revoke (RFC 7009).
*/
var PzAccountSdkTokenTypeHintEnum = class PzAccountSdkTokenTypeHintEnum extends PzAccountSdkEnum {
	static ACCESS_TOKEN = new PzAccountSdkTokenTypeHintEnum("ACCESS_TOKEN", "access_token");
	/** Revogar o refresh token derruba a família inteira e os access tokens dela. */
	static REFRESH_TOKEN = new PzAccountSdkTokenTypeHintEnum("REFRESH_TOKEN", "refresh_token");
	static lookup = enumLookup("PzAccountSdkTokenTypeHintEnum", [PzAccountSdkTokenTypeHintEnum.ACCESS_TOKEN, PzAccountSdkTokenTypeHintEnum.REFRESH_TOKEN]);
	static cases() {
		return PzAccountSdkTokenTypeHintEnum.lookup.cases();
	}
	static from(value) {
		return PzAccountSdkTokenTypeHintEnum.lookup.from(value);
	}
	static tryFrom(value) {
		return PzAccountSdkTokenTypeHintEnum.lookup.tryFrom(value);
	}
};
//#endregion
//#region src/Features/TokenRevoke/Dtos/PzAccountSdkTokenRevokeDto.ts
/**
* Entrada de `tokenRevoke` (RFC 7009).
*
* A dica só acelera a busca no provedor; sem ela, ele procura nos dois tipos.
*/
var PzAccountSdkTokenRevokeDto = class PzAccountSdkTokenRevokeDto extends PzAccountSdkDto {
	token;
	token_type_hint;
	constructor(props) {
		super();
		this.token = props.token;
		this.token_type_hint = PzAccountSdkTokenTypeHintEnum.tryFrom(props.token_type_hint);
	}
	static from(values) {
		const v = valuesOf(values);
		return new PzAccountSdkTokenRevokeDto({
			token: pullString(v, "token"),
			token_type_hint: PzAccountSdkTokenTypeHintEnum.tryFrom(v["token_type_hint"])
		});
	}
	toArray() {
		return {
			token: mask(this.token),
			token_type_hint: this.token_type_hint?.value ?? null
		};
	}
};
//#endregion
//#region src/Features/TokenRevoke/Gateways/PzAccountSdkTokenRevokeGateway.ts
/**
* POST /oauth/revoke — autenticação do client, 200 no sucesso.
*
* Pela RFC 7009 o provedor responde 200 até para token desconhecido ou já
* vencido: o único erro real é `invalid_client`. Revogar o refresh token
* derruba a família e os access tokens emitidos a partir dela.
*
* @internal
*/
var PzAccountSdkTokenRevokeGateway = class PzAccountSdkTokenRevokeGateway extends PzAccountSdkBaseGateway {
	static ENDPOINT = "/oauth/revoke";
	async execute(input) {
		const request = this.oauthRequest();
		const params = {
			token: input.token,
			token_type_hint: input.token_type_hint?.value ?? ""
		};
		const body = this.withClientAuth(request, Object.fromEntries(Object.entries(params).filter(([, value]) => value !== "")));
		const response = await request.post(this.url(PzAccountSdkTokenRevokeGateway.ENDPOINT), body);
		return PzAccountSdkResultDto.from(response.statusCode === 200 ? this.buildSuccess(response) : this.buildOauthError(response));
	}
};
//#endregion
//#region src/Features/UserInfoShow/Dtos/PzAccountSdkUserInfoViewDto.ts
/**
* Claims do /oauth/userinfo.
*
* O provedor OMITE o claim cujo escopo o token não tem (nunca manda `null`);
* aqui o ausente vira valor neutro: string vazia, `false`, `0` ou `null` no
* endereço. Use `hasClaim()` quando precisar distinguir.
*/
var PzAccountSdkUserInfoViewDto = class PzAccountSdkUserInfoViewDto extends PzAccountSdkResultDto {
	/** Claims de perfil que o Puzl Account pode devolver. */
	static CLAIMS = [
		"sub",
		"email",
		"email_verified",
		"name",
		"birthdate",
		"gender",
		"picture",
		"locale",
		"zoneinfo",
		"updated_at",
		"phone_number",
		"phone_number_verified",
		"address"
	];
	sub;
	email;
	email_verified;
	name;
	birthdate;
	gender;
	picture;
	locale;
	zoneinfo;
	updated_at;
	phone_number;
	phone_number_verified;
	address;
	present_claims;
	constructor(props = {}) {
		super(props);
		this.sub = props.sub ?? "";
		this.email = props.email ?? "";
		this.email_verified = props.email_verified ?? false;
		this.name = props.name ?? "";
		this.birthdate = props.birthdate ?? "";
		this.gender = props.gender ?? "";
		this.picture = props.picture ?? "";
		this.locale = props.locale ?? "";
		this.zoneinfo = props.zoneinfo ?? "";
		this.updated_at = props.updated_at ?? 0;
		this.phone_number = props.phone_number ?? "";
		this.phone_number_verified = props.phone_number_verified ?? false;
		this.address = props.address ?? null;
		this.present_claims = props.present_claims ?? [];
	}
	static from(values) {
		const v = valuesOf(values);
		return new PzAccountSdkUserInfoViewDto({
			...PzAccountSdkResultDto.resultArgs(v),
			sub: pullString(v, "sub"),
			email: pullString(v, "email"),
			email_verified: v["email_verified"] === true,
			name: pullString(v, "name"),
			birthdate: pullString(v, "birthdate"),
			gender: pullString(v, "gender"),
			picture: pullString(v, "picture"),
			locale: pullString(v, "locale"),
			zoneinfo: pullString(v, "zoneinfo"),
			updated_at: pullInt(v, "updated_at"),
			phone_number: pullString(v, "phone_number"),
			phone_number_verified: v["phone_number_verified"] === true,
			address: PzAccountSdkAddressDto.fromNullable(v, "address"),
			present_claims: Object.hasOwn(v, "present_claims") ? pullStringList(v, "present_claims") : PzAccountSdkUserInfoViewDto.CLAIMS.filter((claim) => Object.hasOwn(v, claim))
		});
	}
	/** O claim veio na resposta? (Não veio = o token não tem o escopo.) */
	hasClaim(claim) {
		return this.present_claims.includes(claim);
	}
	toArray() {
		return {
			...super.toArray(),
			sub: this.sub,
			email: this.email,
			email_verified: this.email_verified,
			name: this.name,
			birthdate: this.birthdate,
			gender: this.gender,
			picture: this.picture,
			locale: this.locale,
			zoneinfo: this.zoneinfo,
			updated_at: this.updated_at,
			phone_number: this.phone_number,
			phone_number_verified: this.phone_number_verified,
			address: this.address?.toArray() ?? null,
			present_claims: this.present_claims
		};
	}
};
//#endregion
//#region src/Features/UserInfoShow/Gateways/PzAccountSdkUserInfoShowGateway.ts
/**
* GET /oauth/userinfo — Bearer do usuário, 200 no sucesso.
*
* Como o access token é opaco, é também a forma de saber se ele ainda vale:
* 401 (`invalid_token`) significa vencido, revogado ou inexistente.
*
* @internal
*/
var PzAccountSdkUserInfoShowGateway = class PzAccountSdkUserInfoShowGateway extends PzAccountSdkBaseGateway {
	static ENDPOINT = "/oauth/userinfo";
	async execute(input) {
		this.config.assertUsable();
		const response = await this.http().withBearer(input.access_token).get(this.url(PzAccountSdkUserInfoShowGateway.ENDPOINT));
		if (response.statusCode === 200) {
			if (!this.hasBody(response)) return PzAccountSdkUserInfoViewDto.from(this.buildInvalidResponse(response));
			return PzAccountSdkUserInfoViewDto.from({
				...this.responseBody(response),
				...this.buildSuccess(response)
			});
		}
		return PzAccountSdkUserInfoViewDto.from(this.buildOauthError(response));
	}
};
//#endregion
//#region src/Features/UserRegister/Dtos/PzAccountSdkUserRegisterDto.ts
/**
* Entrada de `userRegister` — cria uma conta Puzl.
*
* A `password_confirmation` é preenchida pelo SDK. `birthdate` (Y-m-d) é
* obrigatória e precisa indicar maioridade. Opcionais vazios não são enviados.
*/
var PzAccountSdkUserRegisterDto = class PzAccountSdkUserRegisterDto extends PzAccountSdkDto {
	name;
	email;
	password;
	birthdate;
	phone_number;
	locale;
	zoneinfo;
	constructor(props) {
		super();
		this.name = props.name;
		this.email = props.email;
		this.password = props.password;
		this.birthdate = props.birthdate;
		this.phone_number = props.phone_number ?? "";
		this.locale = props.locale ?? "";
		this.zoneinfo = props.zoneinfo ?? "";
	}
	static from(values) {
		const v = valuesOf(values);
		return new PzAccountSdkUserRegisterDto({
			name: pullString(v, "name"),
			email: pullString(v, "email"),
			password: pullString(v, "password"),
			birthdate: pullString(v, "birthdate"),
			phone_number: pullString(v, "phone_number"),
			locale: pullString(v, "locale"),
			zoneinfo: pullString(v, "zoneinfo")
		});
	}
	/** Credenciais mascaradas: `toArray()` e `toJSON()` podem acabar em log. O valor real fica na propriedade. */
	toArray() {
		return {
			name: this.name,
			email: this.email,
			password: mask(this.password),
			birthdate: this.birthdate,
			phone_number: this.phone_number,
			locale: this.locale,
			zoneinfo: this.zoneinfo
		};
	}
};
//#endregion
//#region src/Features/UserRegister/Gateways/PzAccountSdkUserRegisterGateway.ts
/**
* POST /api/identity/users — público (sem token), 201 no sucesso.
*
* Cadastrar não autentica: a resposta traz a conta, não tokens. Para entrar
* em seguida, siga o fluxo de login normal.
*
* @internal
*/
var PzAccountSdkUserRegisterGateway = class PzAccountSdkUserRegisterGateway extends PzAccountSdkBaseGateway {
	static ENDPOINT = "/api/identity/users";
	async execute(input) {
		const body = {
			name: input.name,
			email: input.email,
			password: input.password,
			password_confirmation: input.password,
			birthdate: input.birthdate
		};
		for (const optional of [
			"phone_number",
			"locale",
			"zoneinfo"
		]) if (input[optional] !== "") body[optional] = input[optional];
		const response = await this.apiRequest().post(this.url(PzAccountSdkUserRegisterGateway.ENDPOINT), body);
		if (response.statusCode === 201) {
			if (!this.hasData(response)) return PzAccountSdkUserProfileViewDto.from(this.buildInvalidResponse(response));
			return PzAccountSdkUserProfileViewDto.from({
				...this.buildSuccess(response),
				user: this.responseData(response)
			});
		}
		return PzAccountSdkUserProfileViewDto.from(this.buildApiError(response));
	}
};
//#endregion
//#region src/Features/WebhookEventVerify/Dtos/PzAccountSdkWebhookEventVerifyDto.ts
/**
* Entrada de `webhookEventVerify`: o corpo cru do POST que o Puzl Account
* enviou (`Content-Type: application/secevent+jwt`). No Express, leia com
* `express.text({ type: 'application/secevent+jwt' })` e passe `req.body`.
*/
var PzAccountSdkWebhookEventVerifyDto = class PzAccountSdkWebhookEventVerifyDto extends PzAccountSdkDto {
	token;
	constructor(props) {
		super();
		this.token = props.token;
	}
	static from(values) {
		return new PzAccountSdkWebhookEventVerifyDto({ token: pullString(valuesOf(values), "token") });
	}
	toArray() {
		return { token: mask(this.token) };
	}
};
//#endregion
//#region src/Enum/PzAccountSdkWebhookEventTypeEnum.ts
/**
* Eventos que o Puzl Account entrega por webhook.
*
* O DTO guarda o tipo como string crua: um evento novo do provedor precisa
* chegar ao produto em vez de virar outro caso silenciosamente. Use
* `PzAccountSdkWebhookEventViewDto.getEventType()`, que devolve `null` para
* o que esta versão do SDK não conhece.
*/
var PzAccountSdkWebhookEventTypeEnum = class PzAccountSdkWebhookEventTypeEnum extends PzAccountSdkEnum {
	/** O usuário revogou o acesso do aplicativo à conta dele. */
	static CONSENT_REVOKED = new PzAccountSdkWebhookEventTypeEnum("CONSENT_REVOKED", "consent.revoked");
	/** A conta foi desativada. */
	static ACCOUNT_DISABLED = new PzAccountSdkWebhookEventTypeEnum("ACCOUNT_DISABLED", "account.disabled");
	/** A conta foi excluída. */
	static ACCOUNT_DELETED = new PzAccountSdkWebhookEventTypeEnum("ACCOUNT_DELETED", "account.deleted");
	/** Os tokens do usuário foram revogados (troca de senha, MFA desligado, recuperação...). */
	static TOKENS_REVOKED = new PzAccountSdkWebhookEventTypeEnum("TOKENS_REVOKED", "tokens.revoked");
	/** O e-mail da conta mudou. `data` traz `email` e `email_verified`. */
	static EMAIL_CHANGED = new PzAccountSdkWebhookEventTypeEnum("EMAIL_CHANGED", "email.changed");
	static lookup = enumLookup("PzAccountSdkWebhookEventTypeEnum", [
		PzAccountSdkWebhookEventTypeEnum.CONSENT_REVOKED,
		PzAccountSdkWebhookEventTypeEnum.ACCOUNT_DISABLED,
		PzAccountSdkWebhookEventTypeEnum.ACCOUNT_DELETED,
		PzAccountSdkWebhookEventTypeEnum.TOKENS_REVOKED,
		PzAccountSdkWebhookEventTypeEnum.EMAIL_CHANGED
	]);
	static cases() {
		return PzAccountSdkWebhookEventTypeEnum.lookup.cases();
	}
	static from(value) {
		return PzAccountSdkWebhookEventTypeEnum.lookup.from(value);
	}
	static tryFrom(value) {
		return PzAccountSdkWebhookEventTypeEnum.lookup.tryFrom(value);
	}
};
//#endregion
//#region src/Features/WebhookEventVerify/Dtos/PzAccountSdkWebhookEventViewDto.ts
/**
* Evento de webhook JÁ VERIFICADO (Security Event Token, RFC 8417).
*
* - `txn` identifica o evento e se repete nas reentregas: use-o como chave de
*   idempotência. `jti` muda a cada tentativa.
* - `sub` é o usuário afetado.
* - `data` é vazio em todos os eventos, exceto `email.changed`, que traz
*   `email` e `email_verified`.
*/
var PzAccountSdkWebhookEventViewDto = class PzAccountSdkWebhookEventViewDto extends PzAccountSdkResultDto {
	event_type;
	event_uri;
	sub;
	txn;
	jti;
	iat;
	exp;
	data;
	constructor(props = {}) {
		super(props);
		this.event_type = props.event_type ?? "";
		this.event_uri = props.event_uri ?? "";
		this.sub = props.sub ?? "";
		this.txn = props.txn ?? "";
		this.jti = props.jti ?? "";
		this.iat = props.iat ?? 0;
		this.exp = props.exp ?? 0;
		this.data = props.data ?? {};
	}
	static from(values) {
		const v = valuesOf(values);
		return new PzAccountSdkWebhookEventViewDto({
			...PzAccountSdkResultDto.resultArgs(v),
			event_type: pullString(v, "event_type"),
			event_uri: pullString(v, "event_uri"),
			sub: pullString(v, "sub"),
			txn: pullString(v, "txn"),
			jti: pullString(v, "jti"),
			iat: pullInt(v, "iat"),
			exp: pullInt(v, "exp"),
			data: pullArray(v, "data")
		});
	}
	/**
	* Tipo do evento como enum, ou `null` quando houve erro ou o evento é
	* novo demais para esta versão do SDK — responda 2xx e ignore.
	*/
	getEventType() {
		return PzAccountSdkWebhookEventTypeEnum.tryFrom(this.event_type);
	}
	toArray() {
		return {
			...super.toArray(),
			event_type: this.event_type,
			event_uri: this.event_uri,
			sub: this.sub,
			txn: this.txn,
			jti: this.jti,
			iat: this.iat,
			exp: this.exp,
			data: this.data
		};
	}
};
//#endregion
//#region src/Features/WebhookEventVerify/Gateways/PzAccountSdkWebhookEventVerifyGateway.ts
/**
* Verifica um webhook do Puzl Account: um SET (RFC 8417) assinado em RS256
* com a mesma chave do id_token, conferido contra o JWKS.
*
* Confere assinatura, exp/iat (com `leeway`), `iss`, `aud`, `sub`, `jti`,
* `txn` e exatamente um evento em `events`, sob `{issuer}/events/`.
*
* Sem HTTP, exceto quando o JWKS não está em cache.
*
* @internal
*/
var PzAccountSdkWebhookEventVerifyGateway = class PzAccountSdkWebhookEventVerifyGateway extends PzAccountSdkJwtBaseGateway {
	async execute(input) {
		this.config.assertUsable();
		let claims;
		let event;
		try {
			claims = await this.jwks.decode(input.token.trim());
			event = this.assertClaims(claims);
		} catch (error) {
			if (error instanceof PzAccountSdkJwksUnavailableException) return PzAccountSdkWebhookEventViewDto.from(this.buildLocalError(PzAccountSdkErrorCodeEnum.JWKS_UNAVAILABLE, error.message));
			if (error instanceof PzAccountSdkJwtException) return PzAccountSdkWebhookEventViewDto.from(this.buildLocalError(PzAccountSdkErrorCodeEnum.WEBHOOK_TOKEN_INVALID, `token de webhook inválido: ${error.message}`));
			throw error;
		}
		return PzAccountSdkWebhookEventViewDto.from({
			...event,
			sub: claims["sub"],
			txn: claims["txn"],
			jti: claims["jti"],
			iat: claims["iat"],
			exp: claims["exp"],
			...this.buildLocalSuccess()
		});
	}
	assertClaims(claims) {
		this.assertIssuer(claims);
		this.assertAudience(claims);
		for (const claim of [
			"sub",
			"jti",
			"txn"
		]) this.assertNonEmptyString(claims, claim);
		this.assertNumeric(claims, "iat");
		this.assertNumeric(claims, "exp");
		const events = claims["events"];
		if (!isRecord(events) || Object.keys(events).length !== 1) throw new PzAccountSdkJwtException("\"events\" precisa trazer exatamente um evento.");
		const uri = Object.keys(events)[0] ?? "";
		const prefix = `${this.config.issuer}/events/`;
		if (!uri.startsWith(prefix) || uri.length === prefix.length) throw new PzAccountSdkJwtException("URI de evento fora de {issuer}/events/.");
		const data = events[uri];
		if (!isRecord(data)) throw new PzAccountSdkJwtException("dados do evento precisam ser um objeto.");
		return {
			event_type: PzAccountSdkWebhookEventVerifyGateway.eventTypeFromUri(uri.slice(prefix.length)),
			event_uri: uri,
			data
		};
	}
	/**
	* A URI usa hífen (consent-revoked); o tipo público usa ponto
	* (consent.revoked). Os conhecidos saem da tabela do enum — o provedor
	* troca todo ponto por hífen —; um evento novo cai na troca simples.
	*/
	static eventTypeFromUri(slug) {
		for (const eventType of PzAccountSdkWebhookEventTypeEnum.cases()) if (eventType.value.replaceAll(".", "-") === slug) return eventType.value;
		return slug.replaceAll("-", ".");
	}
};
//#endregion
//#region src/Support/PzAccountSdkCache.ts
/** Cache em memória, com expiração. É o padrão do client. */
var PzAccountSdkMemoryCache = class {
	items = /* @__PURE__ */ new Map();
	get(key) {
		const item = this.items.get(key);
		if (item === void 0) return;
		if (item.expiresAt <= Date.now()) {
			this.items.delete(key);
			return;
		}
		return item.value;
	}
	set(key, value, ttlSeconds) {
		this.items.set(key, {
			value,
			expiresAt: Date.now() + ttlSeconds * 1e3
		});
	}
	add(key, value, ttlSeconds) {
		if (this.get(key) !== void 0) return false;
		this.set(key, value, ttlSeconds);
		return true;
	}
};
//#endregion
//#region src/Support/PzAccountSdkJwksProvider.ts
/**
* Verifica a assinatura de JWTs emitidos pelo Puzl Account (id_token e
* webhooks) contra o JWKS publicado em `{issuer}/.well-known/jwks.json`.
*
* - Só aceita RS256. `alg: none`, HS256 e afins são recusados antes de
*   qualquer chave ser consultada — é a defesa clássica contra confusão de
*   algoritmo.
* - O JWKS fica no cache por `jwksCacheTtl` segundos.
* - Um `kid` desconhecido indica rotação de chave: o JWKS é buscado de novo,
*   mas no máximo uma vez a cada REFRESH_COOLDOWN segundos, e nunca logo após
*   uma busca feita na mesma verificação. Sem esse freio, cada token forjado
*   com `kid` inventado viraria uma requisição ao provedor.
* - Uma busca que falha fica lembrada por FAILURE_COOLDOWN segundos: com o
*   provedor fora do ar, as verificações seguintes falham na hora em vez de
*   esperar o timeout uma a uma.
* - O cache é melhor-esforço: se ele próprio falhar (Redis fora, por
*   exemplo), a verificação segue buscando direto no provedor.
*
* Só a assinatura e as datas (exp/iat/nbf, com `leeway`) são conferidas aqui.
* Emissor, audiência e o resto ficam com o gateway, que sabe o que esperar.
*
* @internal
*/
var PzAccountSdkJwksProvider = class PzAccountSdkJwksProvider {
	config;
	fetchFn;
	static SUPPORTED_ALG = "RS256";
	/** Intervalo mínimo, em segundos, entre duas buscas forçadas do JWKS. */
	static REFRESH_COOLDOWN = 60;
	/** Por quantos segundos uma busca que falhou impede nova tentativa. */
	static FAILURE_COOLDOWN = 30;
	cacheStore;
	cacheResolver;
	cacheResolving = null;
	/**
	* Busca em andamento. Num processo Node, várias verificações correm ao
	* mesmo tempo: todas esperam a MESMA busca, em vez de uma por requisição
	* (cache frio, TTL vencido) — e, na rotação de chave, ninguém desiste
	* enquanto a busca forçada ainda não terminou.
	*/
	fetching = null;
	refreshing = null;
	constructor(config, fetchFn, cache) {
		this.config = config;
		this.fetchFn = fetchFn;
		this.cacheStore = typeof cache === "function" ? null : cache;
		this.cacheResolver = typeof cache === "function" ? cache : null;
	}
	/**
	* Confere assinatura e datas e devolve os claims.
	*
	* @throws PzAccountSdkJwtException token malformado, assinatura inválida ou vencido
	* @throws PzAccountSdkJwksUnavailableException JWKS inacessível ou inválido
	*/
	async decode(jwt) {
		const kid = this.kidFromHeader(jwt);
		let [keys, justFetched] = await this.keys();
		if (!keys.has(kid) && !justFetched) keys = await this.refreshedKeys() ?? keys;
		const key = keys.get(kid);
		if (key === void 0) throw new PzAccountSdkJwtException("kid desconhecido no JWKS.");
		return jwtDecode(jwt, key, this.config.leeway);
	}
	/**
	* Lê o header sem confiar nele: serve só para escolher a chave e recusar
	* cedo o algoritmo errado. A assinatura é conferida depois, pela chave.
	*/
	kidFromHeader(jwt) {
		if (jwt.split(".").length !== 3) throw new PzAccountSdkJwtException("JWT malformado: esperados três segmentos.");
		const header = jwtHeader(jwt);
		if (header === null) throw new PzAccountSdkJwtException("JWT malformado: header ilegível.");
		if (header["alg"] !== PzAccountSdkJwksProvider.SUPPORTED_ALG) throw new PzAccountSdkJwtException(`Algoritmo não aceito: apenas ${PzAccountSdkJwksProvider.SUPPORTED_ALG}.`);
		const kid = header["kid"];
		if (typeof kid !== "string" || kid === "") throw new PzAccountSdkJwtException("JWT sem kid no header.");
		return kid;
	}
	/** Chaves do cache ou, na falta delas, do provedor — e se acabaram de ser buscadas. */
	async keys() {
		const cached = PzAccountSdkJwksProvider.decodeCached(await this.cacheGet(this.cacheKey()));
		if (cached !== null) try {
			return [this.parse(cached), false];
		} catch (error) {
			if (!(error instanceof PzAccountSdkJwksUnavailableException)) throw error;
		}
		if (this.fetching === null) {
			const failed = await this.cacheGet(this.failureKey());
			if (failed !== null && failed !== void 0) throw PzAccountSdkJwksUnavailableException.recentFailure(PzAccountSdkJwksProvider.FAILURE_COOLDOWN);
		}
		return [await this.fetchAndStore(), true];
	}
	/**
	* Busca forçada por causa de `kid` desconhecido, ou `null` quando o freio
	* está ativo — aí a verificação segue com as chaves que já tem.
	*/
	refreshedKeys() {
		this.refreshing ??= (async () => {
			if (!await this.cacheAdd(this.cooldownKey(), PzAccountSdkJwksProvider.REFRESH_COOLDOWN)) return null;
			return this.fetchAndStore();
		})().finally(() => {
			this.refreshing = null;
		});
		return this.refreshing;
	}
	/** Uma busca por vez: quem chega durante uma busca espera por ela. */
	fetchAndStore() {
		this.fetching ??= this.fetchFromProvider().finally(() => {
			this.fetching = null;
		});
		return this.fetching;
	}
	async fetchFromProvider() {
		let jwks;
		let keys;
		try {
			const response = await new PzAccountSdkRequest(this.fetchFn, this.config.timeout).get(this.config.jwksUri());
			if (response.statusCode !== 200) throw PzAccountSdkJwksUnavailableException.fromStatus(response.statusCode, response.statusText);
			jwks = response.getArrayContent();
			keys = this.parse(jwks);
		} catch (error) {
			if (error instanceof PzAccountSdkJwksUnavailableException) await this.cachePut(this.failureKey(), "1", PzAccountSdkJwksProvider.FAILURE_COOLDOWN);
			throw error;
		}
		await this.cachePut(this.cacheKey(), JSON.stringify(jwks), this.config.jwksCacheTtl);
		return keys;
	}
	/** O JWKS guardado volta como objeto — aceita a string JSON ou o objeto já decodificado. */
	static decodeCached(cached) {
		if (typeof cached === "string") try {
			const decoded = JSON.parse(cached);
			return isRecord(decoded) ? decoded : null;
		} catch {
			return null;
		}
		return isRecord(cached) ? cached : null;
	}
	parse(jwks) {
		const list = jwks["keys"];
		if (!isRecord(list) || Object.keys(list).length === 0) throw PzAccountSdkJwksUnavailableException.invalidKeySet("sem chaves em \"keys\".");
		try {
			return parseKeySet(jwks, PzAccountSdkJwksProvider.SUPPORTED_ALG);
		} catch (error) {
			throw PzAccountSdkJwksUnavailableException.invalidKeySet(error.message);
		}
	}
	/**
	* O store é resolvido só na primeira verificação: um store mal configurado
	* não pode derrubar as operações que nem usam o JWKS. A resolução é única,
	* mesmo com verificações simultâneas; se ela falhar por infraestrutura, o
	* JWKS passa a viver na memória do processo.
	*/
	cache() {
		if (this.cacheStore !== null) return Promise.resolve(this.cacheStore);
		const resolver = this.cacheResolver;
		this.cacheResolving ??= Promise.resolve().then(resolver).then((store) => store, (error) => {
			if (error instanceof PzAccountSdkException) {
				this.cacheResolving = null;
				throw error;
			}
			return new PzAccountSdkMemoryCache();
		}).then((store) => {
			this.cacheStore = store;
			this.cacheResolver = null;
			return store;
		});
		return this.cacheResolving;
	}
	cacheGet(key) {
		return this.bestEffort(async () => (await this.cache()).get(key), null);
	}
	async cachePut(key, value, ttl) {
		await this.bestEffort(async () => (await this.cache()).set(key, value, ttl), false);
	}
	/** Sem cache funcionando, o freio não tem onde ficar: libera a busca. */
	async cacheAdd(key, ttl) {
		return Boolean(await this.bestEffort(async () => {
			const cache = await this.cache();
			if (cache.add !== void 0) return cache.add(key, "1", ttl);
			const current = await cache.get(key);
			if (current !== null && current !== void 0) return false;
			await cache.set(key, "1", ttl);
			return true;
		}, true));
	}
	/**
	* Executa uma operação de cache engolindo falha de infraestrutura. Erro de
	* configuração do SDK continua subindo.
	*/
	async bestEffort(operation, fallback) {
		try {
			return await operation();
		} catch (error) {
			if (error instanceof PzAccountSdkException) throw error;
			return fallback;
		}
	}
	cacheKey() {
		return `pzaccountsdk:jwks:${(0, node_crypto.createHash)("md5").update(this.config.jwksUri()).digest("hex")}`;
	}
	cooldownKey() {
		return `${this.cacheKey()}:refreshed`;
	}
	failureKey() {
		return `${this.cacheKey()}:failed`;
	}
};
//#endregion
//#region src/PzAccountSdkClient.ts
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
var PzAccountSdkClient = class {
	config;
	fetchFn;
	jwks;
	constructor(config = {}, dependencies = {}) {
		const options = config instanceof PzAccountSdkConfig ? {} : config;
		this.config = config instanceof PzAccountSdkConfig ? config : PzAccountSdkConfig.from(config);
		this.fetchFn = dependencies.fetch ?? options.fetch ?? ((request) => fetch(request));
		this.jwks = new PzAccountSdkJwksProvider(this.config, this.fetchFn, dependencies.cache ?? options.cache ?? new PzAccountSdkMemoryCache());
	}
	isConfigured() {
		return this.config.isConfigured();
	}
	pkceCreate() {
		return new PzAccountSdkPkceCreateService().execute();
	}
	authorizeUrl(input) {
		return new PzAccountSdkAuthorizeUrlService(this.config).execute(toDto(PzAccountSdkAuthorizeUrlDto, PzAccountSdkAuthorizeUrlDto.from, input));
	}
	logoutUrl(input = {}) {
		return new PzAccountSdkLogoutUrlService(this.config).execute(toDto(PzAccountSdkLogoutUrlDto, PzAccountSdkLogoutUrlDto.from, input));
	}
	accountUrl(page) {
		return new PzAccountSdkAccountUrlService(this.config).execute(PzAccountSdkAccountPageEnum.from(page));
	}
	discoveryShow() {
		return new PzAccountSdkDiscoveryShowGateway(this.config, this.fetchFn).execute();
	}
	tokenExchangeCode(input) {
		return this.run(() => new PzAccountSdkTokenExchangeCodeGateway(this.config, this.fetchFn).execute(toDto(PzAccountSdkTokenExchangeCodeDto, PzAccountSdkTokenExchangeCodeDto.from, input)));
	}
	tokenRefresh(input) {
		return this.run(() => new PzAccountSdkTokenRefreshGateway(this.config, this.fetchFn).execute(toDto(PzAccountSdkTokenRefreshDto, PzAccountSdkTokenRefreshDto.from, input)));
	}
	tokenPassword(input) {
		return this.run(() => new PzAccountSdkTokenPasswordGateway(this.config, this.fetchFn).execute(toDto(PzAccountSdkTokenPasswordDto, PzAccountSdkTokenPasswordDto.from, input)));
	}
	tokenRevoke(input) {
		return this.run(() => new PzAccountSdkTokenRevokeGateway(this.config, this.fetchFn).execute(toDto(PzAccountSdkTokenRevokeDto, PzAccountSdkTokenRevokeDto.from, input)));
	}
	userInfoShow(input) {
		return this.run(() => new PzAccountSdkUserInfoShowGateway(this.config, this.fetchFn).execute(this.accessToken(input)));
	}
	idTokenVerify(input) {
		return this.run(() => new PzAccountSdkIdTokenVerifyGateway(this.config, this.fetchFn, this.jwks).execute(toDto(PzAccountSdkIdTokenVerifyDto, PzAccountSdkIdTokenVerifyDto.from, input)));
	}
	webhookEventVerify(input) {
		return this.run(() => new PzAccountSdkWebhookEventVerifyGateway(this.config, this.fetchFn, this.jwks).execute(toDto(PzAccountSdkWebhookEventVerifyDto, PzAccountSdkWebhookEventVerifyDto.from, input)));
	}
	userRegister(input) {
		return this.run(() => new PzAccountSdkUserRegisterGateway(this.config, this.fetchFn).execute(toDto(PzAccountSdkUserRegisterDto, PzAccountSdkUserRegisterDto.from, input)));
	}
	meShow(input) {
		return this.run(() => new PzAccountSdkMeShowGateway(this.config, this.fetchFn).execute(this.accessToken(input)));
	}
	meUpdate(input) {
		return this.run(() => new PzAccountSdkMeUpdateGateway(this.config, this.fetchFn).execute(toDto(PzAccountSdkMeUpdateDto, PzAccountSdkMeUpdateDto.from, input)));
	}
	mePasswordChange(input) {
		return this.run(() => new PzAccountSdkMePasswordChangeGateway(this.config, this.fetchFn).execute(toDto(PzAccountSdkMePasswordChangeDto, PzAccountSdkMePasswordChangeDto.from, input)));
	}
	meEmailChange(input) {
		return this.run(() => new PzAccountSdkMeEmailChangeGateway(this.config, this.fetchFn).execute(toDto(PzAccountSdkMeEmailChangeDto, PzAccountSdkMeEmailChangeDto.from, input)));
	}
	mePictureUpload(input) {
		return this.run(() => new PzAccountSdkMePictureUploadGateway(this.config, this.fetchFn).execute(toDto(PzAccountSdkMePictureUploadDto, PzAccountSdkMePictureUploadDto.from, input)));
	}
	mePicturePresetSet(input) {
		return this.run(() => new PzAccountSdkMePicturePresetSetGateway(this.config, this.fetchFn).execute(toDto(PzAccountSdkMePicturePresetSetDto, PzAccountSdkMePicturePresetSetDto.from, input)));
	}
	mePictureDelete(input) {
		return this.run(() => new PzAccountSdkMePictureDeleteGateway(this.config, this.fetchFn).execute(this.accessToken(input)));
	}
	meMfaShow(input) {
		return this.run(() => new PzAccountSdkMeMfaShowGateway(this.config, this.fetchFn).execute(this.accessToken(input)));
	}
	meMfaEnroll(input) {
		return this.run(() => new PzAccountSdkMeMfaEnrollGateway(this.config, this.fetchFn).execute(toDto(PzAccountSdkMeMfaEnrollDto, PzAccountSdkMeMfaEnrollDto.from, input)));
	}
	meMfaEnrollConfirm(input) {
		return this.run(() => new PzAccountSdkMeMfaEnrollConfirmGateway(this.config, this.fetchFn).execute(toDto(PzAccountSdkMeMfaEnrollConfirmDto, PzAccountSdkMeMfaEnrollConfirmDto.from, input)));
	}
	meMfaDisable(input) {
		return this.run(() => new PzAccountSdkMeMfaDisableGateway(this.config, this.fetchFn).execute(toDto(PzAccountSdkMeMfaDisableDto, PzAccountSdkMeMfaDisableDto.from, input)));
	}
	meMfaRecoveryCodesRegenerate(input) {
		return this.run(() => new PzAccountSdkMeMfaRecoveryCodesRegenerateGateway(this.config, this.fetchFn).execute(toDto(PzAccountSdkMeMfaRecoveryCodesRegenerateDto, PzAccountSdkMeMfaRecoveryCodesRegenerateDto.from, input)));
	}
	meConsentList(input) {
		return this.run(() => new PzAccountSdkMeConsentListGateway(this.config, this.fetchFn).execute(this.accessToken(input)));
	}
	meConsentRevoke(input) {
		return this.run(() => new PzAccountSdkMeConsentRevokeGateway(this.config, this.fetchFn).execute(toDto(PzAccountSdkMeConsentRevokeDto, PzAccountSdkMeConsentRevokeDto.from, input)));
	}
	accessToken(input) {
		return toDto(PzAccountSdkAccessTokenDto, PzAccountSdkAccessTokenDto.from, input);
	}
	/**
	* Toda operação de rede devolve uma Promise — inclusive quando a validação
	* da entrada ou da configuração falha antes do HTTP: o erro vira rejeição,
	* nunca uma exceção síncrona escondida no meio de um `await`.
	*/
	async run(operation) {
		return operation();
	}
};
//#endregion
Object.defineProperty(exports, "PZ_ACCOUNT_SDK_ENV_KEYS", {
	enumerable: true,
	get: function() {
		return PZ_ACCOUNT_SDK_ENV_KEYS;
	}
});
Object.defineProperty(exports, "PzAccountSdkAccessTokenDto", {
	enumerable: true,
	get: function() {
		return PzAccountSdkAccessTokenDto;
	}
});
Object.defineProperty(exports, "PzAccountSdkAccountPageEnum", {
	enumerable: true,
	get: function() {
		return PzAccountSdkAccountPageEnum;
	}
});
Object.defineProperty(exports, "PzAccountSdkAddressDto", {
	enumerable: true,
	get: function() {
		return PzAccountSdkAddressDto;
	}
});
Object.defineProperty(exports, "PzAccountSdkAuthorizeUrlDto", {
	enumerable: true,
	get: function() {
		return PzAccountSdkAuthorizeUrlDto;
	}
});
Object.defineProperty(exports, "PzAccountSdkClient", {
	enumerable: true,
	get: function() {
		return PzAccountSdkClient;
	}
});
Object.defineProperty(exports, "PzAccountSdkConfig", {
	enumerable: true,
	get: function() {
		return PzAccountSdkConfig;
	}
});
Object.defineProperty(exports, "PzAccountSdkConfigurationException", {
	enumerable: true,
	get: function() {
		return PzAccountSdkConfigurationException;
	}
});
Object.defineProperty(exports, "PzAccountSdkConsentListViewDto", {
	enumerable: true,
	get: function() {
		return PzAccountSdkConsentListViewDto;
	}
});
Object.defineProperty(exports, "PzAccountSdkConsentViewDto", {
	enumerable: true,
	get: function() {
		return PzAccountSdkConsentViewDto;
	}
});
Object.defineProperty(exports, "PzAccountSdkDiscoveryViewDto", {
	enumerable: true,
	get: function() {
		return PzAccountSdkDiscoveryViewDto;
	}
});
Object.defineProperty(exports, "PzAccountSdkDto", {
	enumerable: true,
	get: function() {
		return PzAccountSdkDto;
	}
});
Object.defineProperty(exports, "PzAccountSdkEnum", {
	enumerable: true,
	get: function() {
		return PzAccountSdkEnum;
	}
});
Object.defineProperty(exports, "PzAccountSdkErrorCodeEnum", {
	enumerable: true,
	get: function() {
		return PzAccountSdkErrorCodeEnum;
	}
});
Object.defineProperty(exports, "PzAccountSdkException", {
	enumerable: true,
	get: function() {
		return PzAccountSdkException;
	}
});
Object.defineProperty(exports, "PzAccountSdkGenderEnum", {
	enumerable: true,
	get: function() {
		return PzAccountSdkGenderEnum;
	}
});
Object.defineProperty(exports, "PzAccountSdkIdTokenVerifyDto", {
	enumerable: true,
	get: function() {
		return PzAccountSdkIdTokenVerifyDto;
	}
});
Object.defineProperty(exports, "PzAccountSdkIdentityViewDto", {
	enumerable: true,
	get: function() {
		return PzAccountSdkIdentityViewDto;
	}
});
Object.defineProperty(exports, "PzAccountSdkLogoutUrlDto", {
	enumerable: true,
	get: function() {
		return PzAccountSdkLogoutUrlDto;
	}
});
Object.defineProperty(exports, "PzAccountSdkMeConsentRevokeDto", {
	enumerable: true,
	get: function() {
		return PzAccountSdkMeConsentRevokeDto;
	}
});
Object.defineProperty(exports, "PzAccountSdkMeEmailChangeDto", {
	enumerable: true,
	get: function() {
		return PzAccountSdkMeEmailChangeDto;
	}
});
Object.defineProperty(exports, "PzAccountSdkMeMfaDisableDto", {
	enumerable: true,
	get: function() {
		return PzAccountSdkMeMfaDisableDto;
	}
});
Object.defineProperty(exports, "PzAccountSdkMeMfaEnrollConfirmDto", {
	enumerable: true,
	get: function() {
		return PzAccountSdkMeMfaEnrollConfirmDto;
	}
});
Object.defineProperty(exports, "PzAccountSdkMeMfaEnrollDto", {
	enumerable: true,
	get: function() {
		return PzAccountSdkMeMfaEnrollDto;
	}
});
Object.defineProperty(exports, "PzAccountSdkMeMfaRecoveryCodesRegenerateDto", {
	enumerable: true,
	get: function() {
		return PzAccountSdkMeMfaRecoveryCodesRegenerateDto;
	}
});
Object.defineProperty(exports, "PzAccountSdkMePasswordChangeDto", {
	enumerable: true,
	get: function() {
		return PzAccountSdkMePasswordChangeDto;
	}
});
Object.defineProperty(exports, "PzAccountSdkMePicturePresetSetDto", {
	enumerable: true,
	get: function() {
		return PzAccountSdkMePicturePresetSetDto;
	}
});
Object.defineProperty(exports, "PzAccountSdkMePictureUploadDto", {
	enumerable: true,
	get: function() {
		return PzAccountSdkMePictureUploadDto;
	}
});
Object.defineProperty(exports, "PzAccountSdkMeUpdateDto", {
	enumerable: true,
	get: function() {
		return PzAccountSdkMeUpdateDto;
	}
});
Object.defineProperty(exports, "PzAccountSdkMemoryCache", {
	enumerable: true,
	get: function() {
		return PzAccountSdkMemoryCache;
	}
});
Object.defineProperty(exports, "PzAccountSdkMfaEnrollViewDto", {
	enumerable: true,
	get: function() {
		return PzAccountSdkMfaEnrollViewDto;
	}
});
Object.defineProperty(exports, "PzAccountSdkMfaRecoveryCodesViewDto", {
	enumerable: true,
	get: function() {
		return PzAccountSdkMfaRecoveryCodesViewDto;
	}
});
Object.defineProperty(exports, "PzAccountSdkMfaStatusViewDto", {
	enumerable: true,
	get: function() {
		return PzAccountSdkMfaStatusViewDto;
	}
});
Object.defineProperty(exports, "PzAccountSdkPicturePresetEnum", {
	enumerable: true,
	get: function() {
		return PzAccountSdkPicturePresetEnum;
	}
});
Object.defineProperty(exports, "PzAccountSdkPkceCreateService", {
	enumerable: true,
	get: function() {
		return PzAccountSdkPkceCreateService;
	}
});
Object.defineProperty(exports, "PzAccountSdkPkceViewDto", {
	enumerable: true,
	get: function() {
		return PzAccountSdkPkceViewDto;
	}
});
Object.defineProperty(exports, "PzAccountSdkPromptEnum", {
	enumerable: true,
	get: function() {
		return PzAccountSdkPromptEnum;
	}
});
Object.defineProperty(exports, "PzAccountSdkResultDto", {
	enumerable: true,
	get: function() {
		return PzAccountSdkResultDto;
	}
});
Object.defineProperty(exports, "PzAccountSdkTokenExchangeCodeDto", {
	enumerable: true,
	get: function() {
		return PzAccountSdkTokenExchangeCodeDto;
	}
});
Object.defineProperty(exports, "PzAccountSdkTokenPasswordDto", {
	enumerable: true,
	get: function() {
		return PzAccountSdkTokenPasswordDto;
	}
});
Object.defineProperty(exports, "PzAccountSdkTokenRefreshDto", {
	enumerable: true,
	get: function() {
		return PzAccountSdkTokenRefreshDto;
	}
});
Object.defineProperty(exports, "PzAccountSdkTokenRevokeDto", {
	enumerable: true,
	get: function() {
		return PzAccountSdkTokenRevokeDto;
	}
});
Object.defineProperty(exports, "PzAccountSdkTokenTypeHintEnum", {
	enumerable: true,
	get: function() {
		return PzAccountSdkTokenTypeHintEnum;
	}
});
Object.defineProperty(exports, "PzAccountSdkTokenViewDto", {
	enumerable: true,
	get: function() {
		return PzAccountSdkTokenViewDto;
	}
});
Object.defineProperty(exports, "PzAccountSdkUserInfoViewDto", {
	enumerable: true,
	get: function() {
		return PzAccountSdkUserInfoViewDto;
	}
});
Object.defineProperty(exports, "PzAccountSdkUserProfileViewDto", {
	enumerable: true,
	get: function() {
		return PzAccountSdkUserProfileViewDto;
	}
});
Object.defineProperty(exports, "PzAccountSdkUserRegisterDto", {
	enumerable: true,
	get: function() {
		return PzAccountSdkUserRegisterDto;
	}
});
Object.defineProperty(exports, "PzAccountSdkUserViewDto", {
	enumerable: true,
	get: function() {
		return PzAccountSdkUserViewDto;
	}
});
Object.defineProperty(exports, "PzAccountSdkWebhookEventTypeEnum", {
	enumerable: true,
	get: function() {
		return PzAccountSdkWebhookEventTypeEnum;
	}
});
Object.defineProperty(exports, "PzAccountSdkWebhookEventVerifyDto", {
	enumerable: true,
	get: function() {
		return PzAccountSdkWebhookEventVerifyDto;
	}
});
Object.defineProperty(exports, "PzAccountSdkWebhookEventViewDto", {
	enumerable: true,
	get: function() {
		return PzAccountSdkWebhookEventViewDto;
	}
});
Object.defineProperty(exports, "isTruthy", {
	enumerable: true,
	get: function() {
		return isTruthy;
	}
});
Object.defineProperty(exports, "toDto", {
	enumerable: true,
	get: function() {
		return toDto;
	}
});
