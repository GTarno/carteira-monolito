# Guia de UI

O app usa **Tailwind CSS v4 + DaisyUI v5**, com ícones **Lucide** e comportamentos (diálogos) do **Angular CDK**. Não há Angular Material.

## Estilos

- Tudo que é global está em `src/styles.css`: tema, fonte, overlays do CDK e o painel dos diálogos.
- Componentes são estilizados **com classes nos templates** (DaisyUI + utilitários do Tailwind). Evite criar `.scss`/`.css` de componente.
- Use só **cores semânticas** do tema: `bg-base-100/200/300`, `text-base-content`, `primary`, `success`, `warning`, `error`… Nada de hex fixo, para funcionar nos dois temas.
- Documentação dos componentes: <https://daisyui.com/components/>.

## Temas

- `forest` (escuro, padrão) e `emerald` (claro), alternados pelo botão da barra superior.
- `ThemeService` (`src/app/core/theme/theme.service.ts`) guarda a escolha no `localStorage` e aplica `data-theme` no `<html>`. Um script no `index.html` aplica o tema salvo antes do Angular iniciar, para não piscar.

## Rotas

- Todas as páginas são carregadas sob demanda (`loadComponent`/`loadChildren` em `app.routes.ts`). Áreas com várias páginas têm um arquivo de rotas próprio (`pages/*/*.routes.ts`).
- O Chart.js é registrado (`provideCharts`) só nas rotas com gráficos (Início e Planejamento), para não entrar no pacote inicial.
- Endereços desconhecidos caem na página 404 (`pages/not-found`).

## Ícones

```html
<app-icon name="wallet" />
<app-icon name="delete" [size]="16" label="Excluir" />
```

- Os nomes são **do app**, definidos em `src/app/shared/ui/icon/app-icons.ts` (`APP_ICONS`). Esses nomes são o que os dados guardam (categorias, itens, menu), então uma renomeação no Lucide não afeta nada.
- Para adicionar um ícone: escolha em <https://lucide.dev/icons>, importe o desenho do pacote `lucide` e registre em `APP_ICONS`. Não importe os componentes `Lucide<Nome>` do `@lucide/angular`: cada um traz uma cópia do template (~3,5 KB por ícone).
- Sem `label`, o ícone é decorativo (oculto para leitores de tela). A cor vem de `currentColor`.

## Mensagens (toast)

```ts
private readonly toast = inject(ToastService);
this.toast.success('Item salvo!');
this.toast.error('Erro ao salvar.');
```

Os toasts aparecem pelo `<app-toast-outlet>` no `AppComponent`.

## Diálogos

```ts
this.dialog.open<MeuDialogo, Dados, Resultado>(MeuDialogo, { data, ariaLabel: 'Editar item' })
  .closed.subscribe(resultado => { ... });
```

Para formulários mais longos, abra como **drawer** (painel lateral à direita, tela cheia no celular): `this.dialog.open(Form, { variant: 'drawer' })`. Exemplos: `src/app/pages/adicionar-gastos/ui/*-form`.

Para pedir confirmação (ex.: antes de excluir), use `confirm()`: emite `true` só se o usuário confirmar.

```ts
this.dialog.confirm({ title: 'Excluir item?', message: '...', confirmLabel: 'Excluir', danger: true })
  .pipe(filter(Boolean)).subscribe(() => excluir());
```

No componente do diálogo: `inject(DIALOG_DATA)` e `inject(DialogRef)` de `@angular/cdk/dialog`; feche com `ref.close(resultado)`. O `AppDialog` (`src/app/shared/ui/dialog`) aplica o painel e o fundo do tema. Exemplos: `src/app/pages/planning/ui/*-dialog`.

## Gráficos

- `app-doughnut-chart`, `app-bar-chart` e `app-line-chart` (`src/app/shared/components/*-chart`), com Chart.js via `ng2-charts`.
- As cores vêm de `src/app/shared/charts/chart-palette.ts`: uma paleta categórica **validada para daltonismo** nos dois temas. As cores do DaisyUI são quase todas verdes e não servem para distinguir séries.
- Regras:
  - use as cores na ordem e não cicle;
  - mostre sempre legenda ou rótulos (a cor nunca é a única pista);
  - um único eixo Y.
- Os gráficos detectam o tema pelo `data-theme` mais próximo e são redesenhados ao alternar.

## Orçamento e status

- Regra única: `getBudgetStatus(planejado, gasto)` em `planning.models.ts`: até 90% `ok`, até 100% `limit`, acima disso `over`.
- Aparência de cada status (rótulo, ícone, cores): `src/app/pages/planning/ui/budget-status.ts`. Status sempre com **rótulo e ícone**, nunca só cor.
- `app-budget-summary` (resumo com planejado, gasto e restante) e `app-budget-card` (card clicável de categoria/item).

## Meses

- `YearMonth` e suas funções ficam em `src/app/shared/utils/year-month.ts`: `formatYearMonthShort` ("Nov/2026"), `formatYearMonthLong` ("Novembro de 2026"), `addMonths`, `yearMonthKey`/`parseYearMonthKey` ("2026-11", usado em URLs e na API).
- Os nomes dos meses vêm do `Intl` (pt-BR), não de listas escritas à mão.

## Dados salvos no navegador

Enquanto não há API, o que o usuário cadastra fica no `localStorage` (helpers em `src/app/shared/utils/storage.utils.ts`, que nunca lançam erro):

| Chave | Conteúdo |
|---|---|
| `carteira.monthly-expenses` | Gastos mensais (`MonthlyExpensesStore`): alimentam as Contas do mês e o Planejamento |
| `carteira.installments` | Grandes compras cadastradas (carrossel de parcelamentos) |
| `bills-checklist` | Contas do mês atual e quais estão pagas |
| `carteira-theme` | Tema escolhido |

Imagens enviadas pelo usuário são reduzidas antes de salvar (`readImageAsDataUrl`, até 800 px em JPEG), porque o `localStorage` tem só ~5 MB.

## Valores em reais

- Exibição: pipe `currency` (o app já está em pt-BR/BRL) ou `formatBRL()` fora de templates.
- Entrada: `parseMoney()` aceita `1.234,56`, `1234,56` e `1234.56`; em formulários, use `moneyValidator()` (`src/app/shared/utils/money.utils.ts`).
