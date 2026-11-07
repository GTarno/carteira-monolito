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
- Testes: **5 de 14 falhavam** (locale `pt` só registrado no `main.ts`, providers faltando nos specs). Corrigido na Fase 0.
- Bug de fuso horário no checklist de contas (vencimento aparece um dia antes em UTC-3).
- Planejamento com mês fixo (fev/2026) e totais de card desconectados dos itens.
- ~40 `console.log` de depuração e subscriptions sem teardown.
- Lógica duplicada: status do orçamento (3x), resize dos gráficos (3x), formatação de moeda (4 formas), nomes de meses.
- CSS com cores fixas repetidas (`#1976d2` 35x), mais de 50 media queries sem padrão e `about.css` morto.
- Três sistemas de ícones (FA Free via CDN, regras de FA Pro, `mat-icon`).
- PrimeNG inteiro configurado para um único carrossel; nenhuma rota com lazy loading.

## Backend

O backend será feito em **Java + Spring Boot, em um repositório separado** (sugestão: `GTarno/carteira-api`). O plano completo, com modelo de dados, contrato da API alinhado aos modelos do front, segurança, deploy e roteiro por etapas, está em [`BACKEND_SPRING_BOOT.md`](./BACKEND_SPRING_BOOT.md).

Neste repositório fica apenas a integração do front com a API ([#13](https://github.com/GTarno/carteira-monolito/issues/13)) e o proxy `/api` no `server.js`.

## Fases

### Fase 0 — Estabilizar o front ✅
- [x] [#15](https://github.com/GTarno/carteira-monolito/issues/15) Testes falhando (locale, providers)
- [x] [#16](https://github.com/GTarno/carteira-monolito/issues/16) Bug de fuso horário nas contas
- [x] [#17](https://github.com/GTarno/carteira-monolito/issues/17) Planejamento: mês fixo e totais inconsistentes
- [x] [#18](https://github.com/GTarno/carteira-monolito/issues/18) Remover `console.log` e vazamentos de subscription

### Fases 1 a 3 — Backend (repositório `carteira-api`)
Seguir o roteiro da seção 11 de [`BACKEND_SPRING_BOOT.md`](./BACKEND_SPRING_BOOT.md). As issues [#8](https://github.com/GTarno/carteira-monolito/issues/8) a [#12](https://github.com/GTarno/carteira-monolito/issues/12) descrevem os mesmos módulos e podem ser recriadas no novo repositório. No front, a integração é a [#13](https://github.com/GTarno/carteira-monolito/issues/13), e a [#19](https://github.com/GTarno/carteira-monolito/issues/19) (regras de domínio centralizadas) facilita essa troca.

### Fase 4 — Qualidade contínua do frontend (em paralelo, quando houver folga)
- [#20](https://github.com/GTarno/carteira-monolito/issues/20) Componentes de gráfico e `ChartService`
- [#21](https://github.com/GTarno/carteira-monolito/issues/21) Control flow, `inject()`, signals, `OnPush`
- [#22](https://github.com/GTarno/carteira-monolito/issues/22) Design tokens, breakpoints e SCSS
- [#23](https://github.com/GTarno/carteira-monolito/issues/23) Ícones
- [#24](https://github.com/GTarno/carteira-monolito/issues/24) Lazy loading, rota 404, bundle
- [#25](https://github.com/GTarno/carteira-monolito/issues/25) UX e acessibilidade

## Decisões em aberto

Ver a seção 12 de [`BACKEND_SPRING_BOOT.md`](./BACKEND_SPRING_BOOT.md). No front: remover ou não o PrimeNG (recomendado remover, já que só o carrossel usa).
