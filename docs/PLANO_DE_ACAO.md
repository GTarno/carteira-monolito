# Plano de ação — Carteira Monolito

## Propósito do projeto

App de **gestão financeira pessoal** (TCC) em Angular 20 + Angular Material, com deploy no Heroku via GitHub Actions. Módulos atuais:

| Módulo | O que faz | Fonte de dados hoje |
|---|---|---|
| Home / Dashboard | Saldo, acesso rápido, gráficos, checklist de contas, carrossel de parcelamentos | Dados fixos no componente, mocks e `localStorage` |
| Planejamentos | Orçamento mensal por categoria → itens → detalhe com tendência de 12 meses | `planning.mock.ts` (em memória) |
| Adicionar gastos | Escolher entre gasto mensal e grande compra | Só a tela, sem ação |
| Inventário | Categorias e itens pessoais (livros, discos…) | Mocks em memória |
| Sobre | Informações do projeto | Estático |

**Não existe backend.** O `server.js` só serve o build da SPA. Nada é persistido entre dispositivos.

## Diagnóstico (resumo)

- Build de produção passa, com bundle inicial de **1,57 MB** e 6 arquivos SCSS acima do budget.
- Testes: **5 de 14 falham** (locale `pt` só registrado no `main.ts`, providers faltando nos specs).
- Bug de fuso horário no checklist de contas (vencimento aparece um dia antes em UTC-3).
- Planejamento com mês fixo (fev/2026) e totais de card desconectados dos itens.
- ~40 `console.log` de depuração e subscriptions sem teardown.
- Lógica duplicada: status do orçamento (3x), resize dos gráficos (3x), formatação de moeda (4 formas), nomes de meses.
- CSS com cores fixas repetidas (`#1976d2` 35x), mais de 50 media queries sem padrão e `about.css` morto.
- Três sistemas de ícones (FA Free via CDN, regras de FA Pro, `mat-icon`).
- PrimeNG inteiro configurado para um único carrossel; nenhuma rota com lazy loading.

## Arquitetura proposta do backend

Monólito em um único dyno: Express 5 serve `/api/*` e a SPA.

- **Stack**: Node 20, TypeScript, Express 5, PostgreSQL (Heroku Postgres), Prisma, Zod, JWT, Vitest + Supertest.
- **Domínio**: o "valor real" do planejamento passa a ser a soma dos **lançamentos** do mês. Contas mensais e parcelas de compras geram lançamentos automaticamente.
- **Dinheiro em centavos** (inteiro). Toda tabela tem `userId`.

Detalhes no épico [#5](https://github.com/GTarno/carteira-monolito/issues/5).

## Fases

### Fase 0 — Estabilizar o que existe (curta, antes do backend)
- [#15](https://github.com/GTarno/carteira-monolito/issues/15) Testes falhando (locale, providers) — **primeiro**, para o CI/deploy ficarem verdes
- [#16](https://github.com/GTarno/carteira-monolito/issues/16) Bug de fuso horário nas contas
- [#17](https://github.com/GTarno/carteira-monolito/issues/17) Planejamento: mês fixo e totais inconsistentes
- [#18](https://github.com/GTarno/carteira-monolito/issues/18) Remover `console.log` e vazamentos de subscription

### Fase 1 — Fundação do backend
- [#6](https://github.com/GTarno/carteira-monolito/issues/6) Servidor TypeScript com `/api`
- [#7](https://github.com/GTarno/carteira-monolito/issues/7) PostgreSQL + Prisma, modelo e seed
- [#8](https://github.com/GTarno/carteira-monolito/issues/8) Autenticação
- [#14](https://github.com/GTarno/carteira-monolito/issues/14) Validação, testes de API, OpenAPI e CI

### Fase 2 — Núcleo financeiro
- [#9](https://github.com/GTarno/carteira-monolito/issues/9) API de Planejamentos
- [#10](https://github.com/GTarno/carteira-monolito/issues/10) API de Lançamentos + tela "Adicionar gastos"
- [#13](https://github.com/GTarno/carteira-monolito/issues/13) Integração do front (HttpClient, interceptors), módulo a módulo
- [#19](https://github.com/GTarno/carteira-monolito/issues/19) Centralizar regras de domínio (ajuda a compartilhar com o backend)

### Fase 3 — Demais módulos
- [#11](https://github.com/GTarno/carteira-monolito/issues/11) Contas mensais e Parcelamentos
- [#12](https://github.com/GTarno/carteira-monolito/issues/12) Inventário e Dashboard

### Fase 4 — Qualidade contínua do frontend (em paralelo, quando houver folga)
- [#20](https://github.com/GTarno/carteira-monolito/issues/20) Componentes de gráfico e `ChartService`
- [#21](https://github.com/GTarno/carteira-monolito/issues/21) Control flow, `inject()`, signals, `OnPush`
- [#22](https://github.com/GTarno/carteira-monolito/issues/22) Design tokens, breakpoints e SCSS
- [#23](https://github.com/GTarno/carteira-monolito/issues/23) Ícones
- [#24](https://github.com/GTarno/carteira-monolito/issues/24) Lazy loading, rota 404, bundle
- [#25](https://github.com/GTarno/carteira-monolito/issues/25) UX e acessibilidade

## Decisões em aberto

1. **ORM**: Prisma (recomendado: migrations e tipos prontos) ou Drizzle/TypeORM.
2. **Parcelas**: gerar todos os lançamentos no cadastro (recomendado) ou calcular sob demanda.
3. **Multiusuário desde o início** (recomendado, pois o custo de adicionar depois é alto) ou modo usuário único para a apresentação do TCC.
4. **PrimeNG**: manter ou remover (recomendado remover; só o carrossel usa).
