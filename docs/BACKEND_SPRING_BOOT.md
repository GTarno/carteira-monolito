# Plano do backend — Carteira API (Java + Spring Boot)

Este documento é o ponto de partida do backend, que vai morar em **outro repositório** (sugestão: `GTarno/carteira-api`). Ele foi escrito para ser lido sozinho, sem o histórico da conversa em que foi criado.

O frontend é este repositório (`GTarno/carteira-monolito`): uma SPA Angular 20 que hoje usa dados mockados. O contrato da API abaixo foi desenhado a partir dos modelos e serviços que o front já tem, para que a integração troque só a camada `data-access`.

---

## 1. Objetivos

1. Persistir os dados do usuário (hoje em memória/`localStorage`).
2. Isolamento por usuário: cada um vê só os próprios dados.
3. Tornar o **valor gasto** derivado dos **lançamentos**, em vez de digitado à mão.
4. Ser simples de rodar localmente e de implantar (TCC).

## 2. Stack

| Item | Escolha | Motivo |
|---|---|---|
| Linguagem | Java 21 (LTS) | Records, pattern matching, virtual threads |
| Framework | Spring Boot (versão estável mais recente no start.spring.io; 4.0.x no momento) | Padrão de mercado |
| Build | Maven (com `mvnw`) | Mais comum em cursos/tutoriais |
| Banco | PostgreSQL 16+ | Disponível no Heroku/Render/Railway |
| Migrações | Flyway | SQL versionado, simples de revisar |
| Persistência | Spring Data JPA (Hibernate) | |
| Validação | Bean Validation (`spring-boot-starter-validation`) | |
| Segurança | Spring Security + OAuth2 Resource Server (JWT HS256 com `NimbusJwtEncoder`) | Sem biblioteca JWT de terceiros |
| Documentação | springdoc-openapi (`/swagger-ui.html`) | O front consulta o contrato |
| Observabilidade | Actuator (`/actuator/health`) | Health check do deploy |
| Testes | JUnit 5, Spring Boot Test, Testcontainers (PostgreSQL), MockMvc | Testes contra banco real |

**Dependências no start.spring.io**: Spring Web, Validation, Spring Data JPA, PostgreSQL Driver, Flyway Migration, Spring Security, OAuth2 Resource Server, Spring Boot Actuator, Testcontainers, Docker Compose Support. Adicionar manualmente: `org.springdoc:springdoc-openapi-starter-webmvc-ui`.

## 3. Estrutura do projeto

Organização **por funcionalidade** (não por camada técnica):

```
carteira-api/
├── compose.yaml                      # Postgres local (Spring Docker Compose Support sobe sozinho)
├── system.properties                 # java.runtime.version=21 (Heroku)
├── Procfile                          # web: java -Dserver.port=$PORT -jar target/carteira-api.jar
└── src/main/java/br/com/gtarno/carteira/
    ├── CarteiraApiApplication.java
    ├── shared/
    │   ├── web/ApiExceptionHandler.java      # ProblemDetail (RFC 9457)
    │   ├── web/YearMonthConverter.java       # "2026-11" <-> java.time.YearMonth em @PathVariable/@RequestParam
    │   ├── security/SecurityConfig.java
    │   ├── security/CurrentUser.java         # obtém o userId do JWT
    │   └── money/BudgetStatus.java           # regra ok/limit/over
    ├── auth/        (AuthController, AuthService, RefreshToken*, dto/)
    ├── user/        (User, UserRepository, MeController)
    ├── category/    (Category, CategoryController, ...)
    ├── planning/    (BudgetItem, MonthlyBudget, PlanningController, PlanningService, dto/)
    ├── transaction/ (Transaction, TransactionController, ...)
    ├── bill/        (RecurringBill, BillPayment, BillController, ...)
    ├── installment/ (InstallmentPlan, InstallmentController, ...)
    ├── inventory/   (InventoryCategory, InventoryItem, ...)
    └── dashboard/   (DashboardController, DashboardService — só consultas)
```

Convenções:
- **DTOs como `record`**, nunca expor entidades JPA na API.
- Controller fino → Service (regras + `@Transactional`) → Repository.
- Todo método de service recebe o `userId` e toda query filtra por ele.
- IDs `UUID`. Datas `LocalDate`/`YearMonth`; instantes `OffsetDateTime` (UTC).
- Dinheiro em `BigDecimal` com escala 2 (`NUMERIC(12,2)` no banco), arredondamento `HALF_EVEN`. A API trafega números com 2 casas.

## 4. Modelo de dados

```
users ──< categories ──< budget_items ──< monthly_budgets
  │            │                │
  │            └──< transactions >┘ (budget_item opcional)
  │                    ▲        ▲
  ├──< recurring_bills ┘        │ (bill_payments liga conta+mês ao lançamento)
  ├──< installment_plans ───────┘ (uma transação por parcela)
  ├──< inventory_categories ──< inventory_items
  └──< refresh_tokens
```

`src/main/resources/db/migration/V1__init.sql` (ponto de partida):

```sql
create table users (
  id            uuid primary key,
  name          varchar(120) not null,
  email         varchar(254) not null unique,
  password_hash varchar(100) not null,
  created_at    timestamptz  not null default now()
);

create table refresh_tokens (
  id          uuid primary key,
  user_id     uuid not null references users(id) on delete cascade,
  token_hash  varchar(100) not null unique,
  expires_at  timestamptz not null,
  revoked_at  timestamptz
);

-- Categorias do planejamento (cards: "Contas", "Alimentação"...)
create table categories (
  id         uuid primary key,
  user_id    uuid not null references users(id) on delete cascade,
  name       varchar(80) not null,
  icon       varchar(60) not null,           -- nome do ícone (ex.: 'receipt_long'), nunca classe CSS
  color      varchar(9),
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

-- Itens recorrentes do planejamento ("Luz", "Mercado"...)
create table budget_items (
  id          uuid primary key,
  user_id     uuid not null references users(id) on delete cascade,
  category_id uuid not null references categories(id) on delete cascade,
  name        varchar(80) not null,
  icon        varchar(60),
  archived_at timestamptz
);

-- Valor planejado de um item em um mês (reference_month = dia 1 do mês)
create table monthly_budgets (
  id              uuid primary key,
  user_id         uuid not null references users(id) on delete cascade,
  budget_item_id  uuid not null references budget_items(id) on delete cascade,
  reference_month date not null check (extract(day from reference_month) = 1),
  planned_amount  numeric(12,2) not null check (planned_amount >= 0),
  unique (budget_item_id, reference_month)
);

create table recurring_bills (
  id             uuid primary key,
  user_id        uuid not null references users(id) on delete cascade,
  name           varchar(80) not null,
  amount         numeric(12,2) not null check (amount > 0),
  due_day        smallint not null check (due_day between 1 and 31),
  category_id    uuid references categories(id) on delete set null,
  budget_item_id uuid references budget_items(id) on delete set null,
  active         boolean not null default true,
  created_at     timestamptz not null default now()
);

create table installment_plans (
  id                 uuid primary key,
  user_id            uuid not null references users(id) on delete cascade,
  title              varchar(120) not null,
  total_amount       numeric(12,2) not null check (total_amount > 0),
  installments_count smallint not null check (installments_count between 1 and 120),
  first_due_date     date not null,
  image_url          varchar(500),
  category_id        uuid references categories(id) on delete set null,
  created_at         timestamptz not null default now()
);

create table transactions (
  id                  uuid primary key,
  user_id             uuid not null references users(id) on delete cascade,
  type                varchar(10) not null check (type in ('EXPENSE', 'INCOME')),
  source              varchar(12) not null check (source in ('MANUAL', 'BILL', 'INSTALLMENT')),
  description         varchar(160) not null,
  amount              numeric(12,2) not null check (amount > 0),
  occurred_on         date not null,
  category_id         uuid references categories(id) on delete set null,
  budget_item_id      uuid references budget_items(id) on delete set null,
  installment_plan_id uuid references installment_plans(id) on delete cascade,
  installment_number  smallint,
  created_at          timestamptz not null default now()
);
create index ix_transactions_user_date on transactions (user_id, occurred_on);
create index ix_transactions_item on transactions (budget_item_id, occurred_on);

create table bill_payments (
  id              uuid primary key,
  bill_id         uuid not null references recurring_bills(id) on delete cascade,
  reference_month date not null,
  paid_at         timestamptz not null default now(),
  transaction_id  uuid not null unique references transactions(id) on delete cascade,
  unique (bill_id, reference_month)
);

create table inventory_categories (
  id          uuid primary key,
  user_id     uuid not null references users(id) on delete cascade,
  name        varchar(80) not null,
  description varchar(300),
  image_url   varchar(500)
);

create table inventory_items (
  id          uuid primary key,
  user_id     uuid not null references users(id) on delete cascade,
  category_id uuid not null references inventory_categories(id) on delete cascade,
  title       varchar(160) not null,
  author      varchar(120),
  notes       varchar(1000),
  created_at  timestamptz not null default now()
);
```

## 5. Regras de negócio

| Regra | Detalhe |
|---|---|
| Valor gasto de um item no mês | `soma(transactions.amount)` com `type = EXPENSE`, `budget_item_id` = item e `occurred_on` dentro do mês |
| Totais do card (categoria) | soma dos itens da categoria no mês (planejado e gasto) |
| Status do orçamento | `planned = 0 → ok`; `gasto/planejado > 1 → over`; `> 0.9 → limit`; senão `ok` (mesma regra de `getBudgetStatus` no front) |
| Meses disponíveis | meses com `monthly_budgets` ou `transactions` do usuário, mais o mês atual |
| Copiar planejamento | `POST .../copy-from/{mes}` copia os `monthly_budgets` de outro mês (sem sobrescrever os existentes) |
| Vencimento da conta no mês | `min(due_day, último dia do mês)`. Datas sempre como `LocalDate` (sem fuso) |
| Pagar conta | cria `transaction` (`source = BILL`, data = vencimento do mês) + `bill_payment`, numa transação de banco |
| Desmarcar pagamento | apaga o `bill_payment` e a `transaction` ligada |
| Parcelamento | no cadastro gera N transações (`source = INSTALLMENT`), uma por mês a partir de `first_due_date`. Parcela = `total / N` arredondada para baixo em centavos; a diferença vai para a **última** parcela |
| Parcelas pagas | parcelas com `occurred_on <= hoje` |
| Editar/excluir lançamento gerado | só pela entidade dona (conta ou parcelamento); `PATCH/DELETE /transactions/{id}` aceita apenas `source = MANUAL` |
| Saldo (`valorEmCaixa` da Home) | `soma(INCOME) - soma(EXPENSE)` com `occurred_on <= hoje` |

## 6. Contrato da API

- Prefixo: `/api/v1`. JSON em `camelCase`. Mês sempre como `"yyyy-MM"` (o mesmo formato de `YearMonthUtils.toKey` no front). Datas `"yyyy-MM-dd"`.
- Todas as rotas, exceto `/auth/**`, `/actuator/health` e a documentação, exigem `Authorization: Bearer <accessToken>`.
- Erros no formato **ProblemDetail**:

```json
{
  "type": "about:blank",
  "title": "Dados inválidos",
  "status": 400,
  "detail": "Um ou mais campos são inválidos.",
  "instance": "/api/v1/transactions",
  "errors": [{ "field": "amount", "message": "deve ser maior que 0" }]
}
```

### 6.1 Autenticação e usuário

| Método | Rota | Corpo / resposta |
|---|---|---|
| POST | `/auth/register` | `{ name, email, password }` → `201 { accessToken, expiresIn, user }` |
| POST | `/auth/login` | `{ email, password }` → `{ accessToken, expiresIn, user }` + cookie `refresh_token` (`HttpOnly; Secure; SameSite=Strict; Path=/api/v1/auth`) |
| POST | `/auth/refresh` | (cookie) → novo `accessToken` e novo refresh (rotação; o anterior é revogado) |
| POST | `/auth/logout` | revoga o refresh e apaga o cookie |
| GET / PATCH | `/me` | `{ id, name, email }` |

Senhas com `BCryptPasswordEncoder`. Access token de 15 min; refresh de 7 dias, guardado no banco **como hash**. Login com erro genérico ("e-mail ou senha inválidos").

### 6.2 Categorias e Planejamento

Substitui `src/app/pages/planning/data-access/planning.service.ts`.

| Método | Rota | Resposta / corpo | Método atual no front |
|---|---|---|---|
| GET | `/categories` | `[{ id, name, icon, color }]` | — |
| POST / PATCH / DELETE | `/categories[/{id}]` | `{ name, icon, color? }` | — |
| GET | `/planning/months` | `["2026-12", "2026-11", ...]` (mais recente primeiro) | `getAvailableMonths()` |
| GET | `/planning/{month}` | `MonthlyPlan` (abaixo) | `getMonthlyPlan()` |
| GET | `/planning/{month}/categories/{categoryId}/items` | `PlanItemDetail[]` | `getItemsByCategory()` |
| GET | `/planning/{month}/items/{itemId}` | `PlanItemDetail` | `getItemById()` |
| POST | `/planning/{month}/categories/{categoryId}/items` | `{ name, icon, plannedValue }` → `201 PlanItemDetail` | `addCategoryItem()` |
| PATCH | `/planning/{month}/items/{itemId}` | `{ plannedValue }` → `PlanItemDetail` | `updateItemValues()` (só planejado) |
| GET | `/planning/items/{itemId}/trend?end=2026-11&months=12` | `[{ month: "2025-12", value: 176.76 }]` | `getItemTrend()` |
| POST | `/planning/{month}/copy-from/{sourceMonth}` | `204` | — |

```json
// GET /api/v1/planning/2026-11
{
  "month": "2026-11",
  "totals": { "planned": 4600.00, "spent": 4502.35, "remaining": 97.65, "status": "limit" },
  "cards": [
    {
      "id": "1b0e…",
      "title": "Contas",
      "icon": "receipt_long",
      "plannedValue": 2600.00,
      "currentValue": 2566.66,
      "status": "limit",
      "items": [{ "name": "Luz", "value": 176.76 }]
    }
  ]
}

// PlanItemDetail
{ "id": "…", "categoryId": "…", "name": "Luz", "icon": "lightbulb", "plannedValue": 200.00, "realValue": 176.76, "status": "ok" }
```

> Mudança no front: o diálogo "Editar item" passa a editar só o **planejado**. O gasto vem dos lançamentos (6.3).

### 6.3 Lançamentos

| Método | Rota | Corpo / resposta |
|---|---|---|
| GET | `/transactions?from=&to=&type=&categoryId=&budgetItemId=&page=0&size=20&sort=occurredOn,desc` | página do Spring (`content`, `totalElements`, …) |
| POST | `/transactions` | `{ type, description, amount, occurredOn, categoryId?, budgetItemId? }` → `201` |
| PATCH / DELETE | `/transactions/{id}` | só `source = MANUAL` (senão `409`) |

### 6.4 Contas mensais (checklist da Home)

Substitui `bills-checklist.service.ts`. A resposta é igual ao modelo `Bill` do front.

| Método | Rota | Corpo / resposta |
|---|---|---|
| GET | `/bills?month=2026-11` | `[{ id, name, amount, dueDate: "2026-11-10", isPaid, paidAt }]` |
| POST | `/bills` | `{ name, amount, dueDay, categoryId?, budgetItemId? }` |
| PATCH / DELETE | `/bills/{id}` | DELETE desativa (`active = false`), mantendo o histórico |
| PUT | `/bills/{id}/payments/{month}` | marca como paga (idempotente) |
| DELETE | `/bills/{id}/payments/{month}` | desmarca |

O "Resetar mês" do front deixa de existir: cada mês tem seus próprios pagamentos.

### 6.5 Parcelamentos (carrossel da Home)

Substitui `installments.service.ts`. Os campos `amount`, `paid`, `total` e `currency` mantêm o formato do `InstallmentPlan` do front.

| Método | Rota | Corpo / resposta |
|---|---|---|
| GET | `/installments` | `[{ id, title, amount, currency: "BRL", paid, total, imageUrl, totalAmount, nextDueDate }]` (`amount` = valor da parcela) |
| POST | `/installments` | `{ title, totalAmount, installmentsCount, firstDueDate, imageUrl?, categoryId? }` → gera as parcelas |
| PATCH / DELETE | `/installments/{id}` | alterar valor/quantidade regera as parcelas futuras |

### 6.6 Inventário

Substitui `inventory.service.ts`. Mesmos campos de `InventoryCategory` e `InventoryItem`.

| Método | Rota |
|---|---|
| GET / POST | `/inventory/categories` |
| PATCH / DELETE | `/inventory/categories/{id}` |
| GET / POST | `/inventory/categories/{id}/items` |
| PATCH / DELETE | `/inventory/items/{id}` |

`imageUrl`: aceitar apenas `https://`.

### 6.7 Dashboard (Home)

Substitui os dados fixos de `persona.component.ts` e `expenses.component.ts`.

| Rota | Resposta (formato atual do front) |
|---|---|
| `GET /dashboard/summary?month=` | `{ userName, balance, monthSpent, monthPlanned }` |
| `GET /dashboard/expenses-by-category?month=` | `[{ category, amount, color }]` (`ExpenseCategory`) |
| `GET /dashboard/planned-vs-actual?end=&months=6` | `[{ month: "2026-06", actual, budget }]` (`MonthlyBudget`; o front formata o rótulo) |
| `GET /dashboard/weekly-trend?month=&categoryIds=` | `{ labels: [...], datasets: [{ label, data, color }] }` (`TrendData`) |

## 7. Segurança

- `SecurityConfig`: stateless, CSRF desabilitado para `/api/**` (Bearer token), `permitAll` só para `/api/v1/auth/**`, `/actuator/health`, `/v3/api-docs/**`, `/swagger-ui/**` (desligar a documentação em produção).
- CORS: só a origem do front (`APP_CORS_ALLOWED_ORIGINS`), com `allowCredentials(true)` por causa do cookie. Dispensável se o front fizer proxy (ver seção 9).
- Limite de tentativas em `/auth/login` (ex.: Bucket4j, ou um contador simples em memória por IP/e-mail).
- Teste obrigatório: o usuário A recebe **404** ao acessar um recurso do usuário B (não 403, para não revelar que existe).

## 8. Configuração

`application.yml` (valores via variáveis de ambiente):

```yaml
spring:
  datasource:
    url: ${JDBC_DATABASE_URL:jdbc:postgresql://localhost:5432/carteira}
    username: ${JDBC_DATABASE_USERNAME:carteira}
    password: ${JDBC_DATABASE_PASSWORD:carteira}
  jpa:
    open-in-view: false
    hibernate.ddl-auto: validate      # o schema é do Flyway
  jackson:
    default-property-inclusion: non_null
app:
  jwt:
    secret: ${APP_JWT_SECRET}          # >= 32 bytes, nunca commitado
    access-ttl: 15m
    refresh-ttl: 7d
  cors:
    allowed-origins: ${APP_CORS_ALLOWED_ORIGINS:http://localhost:4200}
```

No Heroku, o buildpack Java define `JDBC_DATABASE_URL`, `JDBC_DATABASE_USERNAME` e `JDBC_DATABASE_PASSWORD` a partir do Heroku Postgres.

Perfil `demo`: um `CommandLineRunner` cria o usuário `demo@carteira.app` com os mesmos dados dos mocks atuais do front (categorias Contas / Cartão de crédito / Alimentação, contas do mês, parcelamentos, inventário). Útil para apresentação.

## 9. Deploy e integração com o front

- **API**: app próprio no Heroku (`carteira-api`) com Heroku Postgres, `system.properties` com `java.runtime.version=21` e o `Procfile` da seção 3. As migrações do Flyway rodam no startup.
- **Front (este repositório)**: o `server.js` (Express) passa a fazer **proxy de `/api` para a API** (`http-proxy-middleware`, alvo em `API_URL`). Assim o navegador fala com uma única origem: sem CORS e com o cookie de refresh em `SameSite=Strict`.
- **Desenvolvimento**: Angular em `:4200` com `proxy.conf.json` (`/api` → `http://localhost:8080`); API em `:8080` com `./mvnw spring-boot:run` (o Docker Compose Support sobe o Postgres).
- Mudanças no front para a integração: issue [#13](https://github.com/GTarno/carteira-monolito/issues/13) (HttpClient, interceptors de auth/erro, troca dos mocks módulo a módulo).

## 10. Testes e CI

- **Unitários**: `BudgetStatus`, cálculo de parcelas (arredondamento e última parcela), vencimento no fim do mês (31 → 30/28/29).
- **Integração** (`@SpringBootTest` + Testcontainers + MockMvc): um teste por endpoint no caminho feliz, validação (400), não autenticado (401), isolamento entre usuários (404).
- **Repositórios** (`@DataJpaTest` + Testcontainers): as queries de agregação do planejamento e do dashboard.
- **CI** (GitHub Actions): `actions/setup-java` (temurin 21, cache maven) → `./mvnw -B verify`. Os runners Ubuntu já têm Docker para o Testcontainers. O deploy roda só na `main`, depois do `verify`.

## 11. Roteiro de implementação

Cada etapa termina com testes passando e o Swagger atualizado.

**Etapa 1 — Esqueleto**
- [ ] Gerar projeto no start.spring.io (seção 2), criar repositório `carteira-api`
- [ ] `compose.yaml` com Postgres; `V1__init.sql` (seção 4)
- [ ] `ApiExceptionHandler` com ProblemDetail; `YearMonthConverter`
- [ ] springdoc + Actuator health
- [ ] Workflow de CI com `./mvnw verify`

**Etapa 2 — Autenticação**
- [ ] Entidade `User`, registro e login, JWT (encoder/decoder Nimbus), refresh com rotação
- [ ] `CurrentUser` para obter o `userId`; testes de 401 e de isolamento

**Etapa 3 — Núcleo financeiro**
- [ ] Categorias (CRUD)
- [ ] Lançamentos (CRUD de `MANUAL`)
- [ ] Planejamento: itens, valores planejados, mês com totais/status, tendência, copiar mês

**Etapa 4 — Contas e parcelamentos**
- [ ] Contas recorrentes + pagamento/desmarcação por mês (gera/remove lançamento)
- [ ] Parcelamentos com geração das parcelas

**Etapa 5 — Inventário e Dashboard**
- [ ] CRUD de inventário
- [ ] Endpoints de agregação do dashboard

**Etapa 6 — Entrega**
- [ ] Perfil `demo` com seed
- [ ] Deploy no Heroku (API + Postgres) e proxy `/api` no `server.js` do front
- [ ] Integração do front (#13)

## 12. Decisões em aberto

1. **Receitas**: o modelo já prevê `type = INCOME`. Falta definir no front onde o usuário lança receitas (necessário para o saldo da Home).
2. **Hospedagem**: Heroku (mesmo lugar do front) ou Render/Railway (têm plano gratuito de Postgres).
3. **Imagens** (parcelamentos/inventário): só URL por enquanto; upload fica para depois.

## 13. Como começar a nova sessão

Sugestão de mensagem para abrir a sessão no repositório novo:

> Crie o backend descrito em `docs/BACKEND_SPRING_BOOT.md` do repositório GTarno/carteira-monolito (copie o arquivo para este repositório). Comece pela Etapa 1 do roteiro: projeto Spring Boot com Maven e Java 21, Postgres via Docker Compose, migração `V1__init.sql`, tratamento de erros com ProblemDetail, springdoc, Actuator e workflow de CI. Rode `./mvnw verify` antes de fazer commit.
