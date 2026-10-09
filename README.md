# @puzl/account-sdk

SDK Node.js de integração com o **Puzl Account**, o provedor OpenID Connect da Puzl ("Entrar com a Puzl"). Funciona em Node.js puro, NestJS ou qualquer outro framework, e serve tanto para quem usa `import` quanto para quem usa `require`, em TypeScript ou JavaScript.

É o mesmo SDK do [`puzl-account-sdk`](https://github.com/PuzlPlace/puzl-account-sdk) (Laravel): mesmas operações, mesmos DTOs, mesmos códigos de erro.

Ele cobre três frentes:

- **Login (OIDC):** authorization code com PKCE, password grant, refresh, revogação e userinfo, além da verificação do `id_token` pelo JWKS.
- **API da conta:** perfil, senha, e-mail, foto, MFA e aplicativos com acesso, sempre com o token do usuário.
- **Webhooks:** verificação dos eventos (SET, RFC 8417) que o Puzl Account envia ao produto.

O SDK não lança exceção por falha do Puzl Account. Toda operação retorna um DTO com `has_error`, e o produto decide o que fazer com a falha.

> 📘 Guia completo, passo a passo: [`docs/index.html`](docs/index.html).

---

## Instalação

O pacote é instalado direto do GitHub, pela tag de versão. Não há publicação no npm.

```bash
npm install github:PuzlPlace/puzl-account-sdk-node#semver:^1.0.0
```

Isso grava a dependência no `package.json`:

```json
"dependencies": {
  "@puzl/account-sdk": "github:PuzlPlace/puzl-account-sdk-node#semver:^1.0.0"
}
```

Depois disso, quem clonar o projeto só roda `npm install`. O `#semver:^1.0.0` funciona como o `^1.0` do Composer:

- aceita `1.x.y`;
- nunca aceita `2.0.0`;
- o `package-lock.json` fixa a versão exata.

**Repositório privado.** A máquina que instala precisa ter acesso de leitura ao repositório: o dev, o CI e o build do Docker. As opções são:

- SSH: `git+ssh://git@github.com/PuzlPlace/puzl-account-sdk-node.git#semver:^1.0.0`
- HTTPS com token, configurado uma vez:
  ```bash
  git config --global url."https://<TOKEN>@github.com/".insteadOf "https://github.com/"
  ```

**Requisitos:**

- Node.js 18.17 ou mais novo.
- Zero dependências de runtime.
- O NestJS (`@nestjs/common` 9 a 12) só é necessário para quem usa o subpath `@puzl/account-sdk/nestjs`.

## Configuração

| Variável | Opção | Padrão | Uso |
|---|---|---|---|
| `PUZL_ACCOUNT_ISSUER` | `issuer` | — | URL do provedor, sem barra final. Precisa ser idêntica ao `iss` dos tokens. |
| `PUZL_ACCOUNT_CLIENT_ID` | `clientId` | — | `client_id` do app. Também é o `aud` esperado no id_token e nos webhooks. |
| `PUZL_ACCOUNT_CLIENT_SECRET` | `clientSecret` | — | Dispensável só com `tokenAuthMethod: 'none'`. |
| `PUZL_ACCOUNT_REDIRECT_URI` | `redirectUri` | — | Callback padrão, registrado no client. |
| `PUZL_ACCOUNT_SCOPE` | `scope` | `openid email profile` | Inclua `offline_access` para receber refresh_token. |
| `PUZL_ACCOUNT_TOKEN_AUTH_METHOD` | `tokenAuthMethod` | `client_secret_post` | Também aceita `client_secret_basic` ou `none`. Tem de ser o método registrado no client. |
| `PUZL_ACCOUNT_TIMEOUT` | `timeout` | `10` | Segundos. |
| `PUZL_ACCOUNT_JWKS_CACHE_TTL` | `jwksCacheTtl` | `3600` | Segundos que o JWKS fica no cache. |
| `PUZL_ACCOUNT_LEEWAY` | `leeway` | `60` | Tolerância de relógio, em segundos, para `exp`, `iat` e `nbf`. |

Há duas formas de criar o client:

```ts
import { PzAccountSdkClient, PzAccountSdkClientFactory } from '@puzl/account-sdk';

const puzl = PzAccountSdkClientFactory.fromEnv(); // lê PUZL_ACCOUNT_* de process.env
// ou, explícito:
const puzl2 = new PzAccountSdkClient({ issuer, clientId, clientSecret, redirectUri });
```

Crie **uma instância por aplicação**. Ela não guarda estado além do cache do JWKS.

A configuração é validada na primeira chamada, não na criação do client. Se faltar alguma chave, a `PzAccountSdkConfigurationException` informa a variável exata. Para esconder o "Entrar com a Puzl" enquanto a integração não está configurada, use `puzl.isConfigured()`, que não lança exceção. Valores numéricos vazios ou inválidos voltam ao padrão.

## NestJS

```ts
import { PzAccountSdkClient, PzAccountSdkModule } from '@puzl/account-sdk/nestjs';

@Module({ imports: [PzAccountSdkModule.forRoot({ isGlobal: true })] }) // lê PUZL_ACCOUNT_* do ambiente
export class AppModule {}

// Ou a partir do ConfigService:
PzAccountSdkModule.forRootAsync({
  isGlobal: true,
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({ clientId: config.getOrThrow('PUZL_ACCOUNT_CLIENT_ID') }),
});

@Injectable()
export class AuthService {
  constructor(private readonly puzl: PzAccountSdkClient) {}
}
```

As opções passadas ao módulo vencem as variáveis de ambiente.

## Login: authorization code com PKCE

```ts
import { timingSafeEqual } from 'node:crypto';

const safeEqual = (a: string, b: string) =>
  Buffer.byteLength(a) === Buffer.byteLength(b) && timingSafeEqual(Buffer.from(a), Buffer.from(b));

// 1) Início: gerar os segredos, guardá-los NA SESSÃO deste navegador e redirecionar.
const pkce = puzl.pkceCreate();
req.session.puzlLogin = pkce.toArray();
res.redirect(puzl.authorizeUrl({ state: pkce.state, nonce: pkce.nonce, code_challenge: pkce.code_challenge }));

// 2) Callback: o state precisa ser o DESTA sessão (contra login CSRF). Uso único.
const login = req.session.puzlLogin;
delete req.session.puzlLogin;
if (!login || !safeEqual(login.state, String(req.query.state ?? ''))) return res.sendStatus(400);

const tokens = await puzl.tokenExchangeCode({ code: String(req.query.code), code_verifier: login.code_verifier });
if (tokens.has_error) { /* invalid_grant: code vencido/usado → recomeçar */ }

const identity = await puzl.idTokenVerify({ id_token: tokens.id_token, nonce: login.nonce, access_token: tokens.access_token });
if (identity.has_error) { /* ID_TOKEN_INVALID ou JWKS_UNAVAILABLE */ }

// Identifique o usuário por identity.sub (estável), nunca pelo e-mail.
```

O nonce é obrigatório em `idTokenVerify`: sem ele, o DTO lança `TypeError`. O único caso sem nonce é o password grant, que tem um construtor próprio: `PzAccountSdkIdTokenVerifyDto.forPasswordGrant(idToken, accessToken)`. Ao informar o `access_token`, o id_token precisa trazer um `at_hash` correspondente.

Outros pontos do fluxo:

- **Popup:** passe `redirect_uri` e `response_mode: 'web_message'`.
- **Escolha de conta:** `prompt: PzAccountSdkPromptEnum.SELECT_ACCOUNT`, ou `'select_account'`.
- **Cadastro:** `prompt: PzAccountSdkPromptEnum.CREATE`.
- **Logout:** `puzl.logoutUrl({ id_token_hint, post_logout_redirect_uri })`. A URI precisa estar registrada com `--kind=post_logout`.
- **Telas da conta:** `puzl.accountUrl(PzAccountSdkAccountPageEnum.PASSWORD)`. Também existem `HOME`, `PROFILE`, `PICTURE`, `LOGIN_METHODS`, `MFA_ENROLL` e `DELETE`.

## Operações

Toda operação aceita o DTO de entrada (`new PzAccountSdkTokenRefreshDto({...})`) ou um objeto simples com os mesmos campos (`{ refresh_token }`). Os campos usam snake_case, como no Puzl Account e no SDK PHP.

| Método | Endpoint | Sucesso |
|---|---|---|
| `pkceCreate()` · `authorizeUrl()` · `logoutUrl()` · `accountUrl()` | locais, sem HTTP, síncronos | — |
| `discoveryShow()` | GET `/.well-known/openid-configuration` | 200 |
| `tokenExchangeCode()` · `tokenRefresh()` · `tokenPassword()` | POST `/oauth/token` | 200 |
| `tokenRevoke()` | POST `/oauth/revoke` | 200 |
| `userInfoShow()` | GET `/oauth/userinfo` | 200 |
| `idTokenVerify()` · `webhookEventVerify()` | JWKS (com cache) | — |
| `userRegister()` | POST `/api/identity/users` (público) | 201 |
| `meShow()` · `meUpdate()` | GET/PUT `/api/identity/me` | 200 |
| `mePasswordChange()` | PUT `/api/identity/me/password` | 204 |
| `meEmailChange()` | POST `/api/identity/me/email` | 202 |
| `mePictureUpload()` · `mePicturePresetSet()` · `mePictureDelete()` | `/api/identity/me/picture*` | 200 |
| `meMfaShow()` · `meMfaEnroll()` · `meMfaEnrollConfirm()` · `meMfaDisable()` · `meMfaRecoveryCodesRegenerate()` | `/api/identity/me/mfa*` | 200/201/204 |
| `meConsentList()` · `meConsentRevoke()` | `/api/identity/me/consents*` | 200/204 |
| `meApplicationList()` | GET `/api/identity/me/applications` | 200 |

Comportamentos que exigem atenção:

- **Access token:** é opaco. Para saber se ainda vale, chame `userInfoShow`. `invalid_token` (401) significa vencido ou revogado; `invalid_grant` (400) significa que a conta ou o client deixou de existir.
- **Refresh token:** gira a cada uso. Guarde sempre o novo; reapresentar um token antigo derruba a família inteira.
- **`tokenPassword`:** só funciona se o client tiver o password grant habilitado. Senha errada e conta com MFA chegam iguais, como `invalid_grant`.
- **API `/me`:** quase todas as rotas exigem token de client first-party; caso contrário, retornam `FORBIDDEN`. As exceções são `meMfaShow` e `meEmailChange`.
- **`meUpdate`:** é um PUT completo, e opcional vazio apaga o valor. Parta da conta atual: `PzAccountSdkMeUpdateDto.fromUser(token, me.user, { name: 'Novo' })`, com o `me.user` de um `meShow` bem-sucedido.
- **`mePictureUpload`:** `contents` aceita `Buffer`, `Uint8Array` (ou outra view) ou `ArrayBuffer`. A extensão do `filename` define o Content-Type. Para ler do disco, use `PzAccountSdkMePictureUploadDto.fromPath(token, caminho)`.
- **Revogação de tokens:** trocar a senha ou desligar o MFA revoga os tokens do usuário.
- **`meApplicationList`:** apps em que o usuário está cadastrado. `is_first_party` separa os da Puzl (entram no primeiro login) dos de terceiros (saem quando o usuário revoga o acesso). Não é controle de acesso, e o próprio app que consulta aparece se o usuário já entrou nele.

## Webhooks

```ts
import express from 'express';
import { PzAccountSdkWebhookEventTypeEnum as Event } from '@puzl/account-sdk';

app.post('/webhooks/puzl', express.text({ type: 'application/secevent+jwt' }), async (req, res) => {
  const event = await puzl.webhookEventVerify({ token: req.body });

  if (event.has_error) return res.sendStatus(event.isServiceUnavailable() ? 503 : 401);

  // event.txn se repete nas reentregas: use como chave de idempotência.
  switch (event.getEventType()) {
    case Event.TOKENS_REVOKED:
    case Event.ACCOUNT_DISABLED: /* derrubar as sessões de event.sub */ break;
    case Event.ACCOUNT_DELETED:
    case Event.CONSENT_REVOKED: /* desvincular event.sub */ break;
    case Event.EMAIL_CHANGED: /* event.data.email */ break;
    default: // evento novo: responda 2xx e ignore
  }

  res.sendStatus(202);
});
```

## Tratamento de erro

Todo retorno estende `PzAccountSdkResultDto` e traz:

- os campos `has_error`, `error_code`, `error_message`, `errors` e `http_status`;
- os helpers `isSuccess()`, `getErrorCode()`, `isServiceUnavailable()`, `isRateLimited()` e `firstFieldError()`.

O `error_code` pode ter três origens:

- **API da conta:** em maiúsculas, como `EMAIL_ALREADY_EXISTS` ou `VALIDATION_ERROR`.
- **Protocolo OAuth:** na grafia das RFCs, como `invalid_grant` ou `invalid_client`.
- **O próprio SDK:** `ID_TOKEN_INVALID`, `WEBHOOK_TOKEN_INVALID` ou `JWKS_UNAVAILABLE`.

Ramifique por `getErrorCode()` e sempre trate um `default`. O método retorna um `PzAccountSdkErrorCodeEnum` ou `null`, e cada caso traz `httpStatus()` e `isClientFault()`. Um código novo do provedor chega como `null` e deve ser tratado como falha genérica.

Timeout ou falha de conexão chegam com `http_status` 504 ou 500, sem código. Por isso, cheque `isServiceUnavailable()`.

Rate limit (429) é detectado por `isRateLimited()`. Nos endpoints `/oauth/*`, o provedor o devolve como `invalid_request`. Trate como indisponibilidade temporária.

## Testes no seu projeto

```ts
import { PzAccountSdkClientFake } from '@puzl/account-sdk/testing';

const fake = new PzAccountSdkClientFake(); // nada sai para a rede
fake.respondWithError('tokenPassword', 'invalid_grant', 400);
fake.respond('idTokenVerify', { sub: '01J...', email: 'ana@e.test', email_verified: true });

// ... exercita o produto ...

expect(fake.callCount('tokenPassword')).toBe(1);

// NestJS:
Test.createTestingModule({ imports: [AppModule] }).overrideProvider(PzAccountSdkClient).useValue(fake);
```

O fake funciona assim:

- Sem nada programado, toda operação responde com sucesso plausível, usando `PzAccountSdkClientFake.FAKE_SUB`.
- Respostas enfileiradas são consumidas em ordem, e a última se repete.
- `respond()` aceita o DTO, um objeto com os campos ou uma função (síncrona ou `async`) da entrada.
- `respond()` recusa na hora um DTO de classe diferente da que a operação retorna.
- O fake estende `PzAccountSdkClient`, então entra direto onde o tipo pedido é o client. `lastInput('meShow')` já vem tipado com o DTO de entrada da operação.
- `fake.configured = false` faz `isConfigured()` responder `false`.

## Decisões de projeto

- **Transporte:** `fetch` nativo. Cada chamada cria a própria requisição, então Bearer e client_secret não vazam de uma operação para a outra. Dá para injetar outro com a opção `fetch` (proxy, APM, testes).
- **Respostas estranhas:** redirect não é seguido (levaria o client_secret junto), e um 2xx sem o corpo esperado (HTML de proxy, `data` ausente) vira erro 502, nunca um sucesso com campos vazios.
- **Sem retry:** retry é política de disponibilidade, e quem decide é o produto. O único cache é o do JWKS.
- **JWKS:**
  - Um `kid` desconhecido força nova busca, no máximo uma vez a cada 60 s e nunca logo depois de uma busca. Tokens forjados não viram requisições ao provedor.
  - Uma busca que falha fica lembrada por 30 s.
  - Verificações simultâneas esperam a mesma busca: nunca saem N requisições por causa de N logins ao mesmo tempo.
  - O cache padrão é a memória do processo. Para dividi-lo entre pods, passe `cache` com um adaptador de strings (Redis, por exemplo):
    ```ts
    const cache: PzAccountSdkCache = {
      get: (key) => redis.get(key),
      set: (key, value, ttl) => redis.set(key, value, 'EX', ttl),
      add: async (key, value, ttl) => (await redis.set(key, value, 'EX', ttl, 'NX')) === 'OK',
    };
    ```
  - O cache é melhor-esforço: se ele falhar, a verificação busca direto.
- **Algoritmo:** só RS256 é aceito, e o algoritmo é checado antes de qualquer chave ser consultada. A verificação usa `node:crypto`, sem bibliotecas de JWT.
- **DTOs:** escritos à mão.
  - Nos DTOs de **entrada**, senhas, tokens e códigos saem mascarados (`********`) em `toArray()`, `JSON.stringify` e `console.log`; o valor real fica na propriedade.
  - Os DTOs de **retorno** carregam os tokens emitidos. Não os mande para log.
- **Formatos:** o build gera ESM (`.js`) e CommonJS (`.cjs`), com tipos para os dois e campos de fallback (`main`, `types`, `typesVersions`) para TypeScript com `moduleResolution: node`. Use um estilo só no projeto (`import` ou `require`): misturar carrega duas cópias do SDK, e o NestJS não reconhece a classe de uma como token da outra.

## Versões e releases

| Branch | O que acontece |
|---|---|
| `master` | Desenvolvimento. Todo push e PR roda os testes. |
| `production` | Todo push com CI verde gera a próxima tag `vX.Y.Z` e a GitHub Release, sozinho. |

- Push em `production` sobe o **patch**. Para **minor** ou **major**, rode o workflow à mão na branch `production` (*Actions → Tests → Run workflow → bump*).
- A versão nunca é escrita à mão. No fonte, o `package.json` tem `0.0.0-development`.
- A tag aponta para um commit de release com o `dist/` compilado (o mesmo `.tgz` que o CI testou), a versão real e sem scripts nem devDependencies. É dele que o `npm install` via Git baixa o pacote pronto, sem instalar nada além dele.
- Para atualizar um produto: `npm update @puzl/account-sdk`, que respeita o `^`. Para trocar de major, edite a faixa no `package.json`.

## Desenvolvimento

```bash
npm ci
npm run check   # typecheck + testes + build + publint/attw
```

As ferramentas de desenvolvimento pedem Node 22+ (veja `.nvmrc`). A suíte roda sem rede: o `fetch` é falsificado, e os tokens são assinados nos testes com chaves RSA geradas na hora.

Para provar o pacote como o produto o recebe, rode:

```bash
npm run build && npm pack && scripts/package-smoke.sh puzl-account-sdk-0.0.0-development.tgz
```

Os cenários estão em [`tests/package/`](tests/package/README.md).
