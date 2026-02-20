# Componentes de Gráfico Modularizados

Esta documentação detalha a modularização dos gráficos realizada no projeto, que separou o código monolítico em componentes reutilizáveis e bem estruturados.

## 🏗️ Arquitetura dos Componentes

### Estrutura de Pastas

```
src/app/
├── shared/
│   ├── components/
│   │   ├── doughnut-chart/
│   │   │   ├── doughnut-chart.component.ts
│   │   │   └── doughnut-chart.component.scss
│   │   ├── bar-chart/
│   │   │   ├── bar-chart.component.ts
│   │   │   └── bar-chart.component.scss
│   │   └── line-chart/
│   │       ├── line-chart.component.ts
│   │       └── line-chart.component.scss
│   ├── types/
│   │   └── chart.types.ts
│   └── index.ts
└── core/
    └── services/
        └── chart.service.ts
```

## 📊 Componentes Disponíveis

### 1. DoughnutChartComponent

Exibe dados categorizados em formato de rosca com legendas e totais.

**Propriedades:**
- `@Input() data: ExpenseCategory[]` - Dados das categorias
- `@Input() title?: string` - Título do gráfico
- `@Input() height: string` - Altura do container (padrão: '400px')
- `@Input() showLegend: boolean` - Exibir legenda (padrão: true)
- `@Input() showTotal: boolean` - Exibir total (padrão: true)
- `@Input() showActions: boolean` - Exibir botões de ação (padrão: false)
- `@Input() actionLabel: string` - Texto do botão de ação

**Eventos:**
- `@Output() chartClick` - Clique no gráfico
- `@Output() chartHover` - Hover no gráfico
- `@Output() actionClick` - Clique no botão de ação

**Uso:**
```html
<app-doughnut-chart
  [data]="expenseCategories"
  title="Gastos por Categoria"
  [showTotal]="true"
  [showActions]="true"
  actionLabel="Simular Novo Gasto"
  (chartClick)="onChartClick($event)"
  (actionClick)="onExpenseAction()">
</app-doughnut-chart>
```

### 2. BarChartComponent

Exibe comparações entre dados reais e orçamentos em formato de barras.

**Propriedades:**
- `@Input() data: MonthlyBudget[]` - Dados mensais de orçamento
- `@Input() title?: string` - Título do gráfico
- `@Input() height: string` - Altura do container (padrão: '400px')
- `@Input() showLegend: boolean` - Exibir legenda (padrão: true)
- `@Input() showSummary: boolean` - Exibir resumo estatístico (padrão: true)
- `@Input() showActions: boolean` - Exibir botões de ação (padrão: false)
- `@Input() actionLabel: string` - Texto do botão de ação

**Eventos:**
- `@Output() chartClick` - Clique no gráfico
- `@Output() chartHover` - Hover no gráfico
- `@Output() actionClick` - Clique no botão de ação

**Uso:**
```html
<app-bar-chart
  [data]="monthlyBudgets"
  title="Gastos Mensais vs Orçamento"
  [showSummary]="true"
  [showActions]="true"
  actionLabel="Adicionar Mês"
  (chartClick)="onChartClick($event)"
  (actionClick)="onMonthlyAction()">
</app-bar-chart>
```

### 3. LineChartComponent

Exibe tendências temporais com múltiplas séries de dados.

**Propriedades:**
- `@Input() trendData: TrendData | null` - Dados de tendência
- `@Input() title?: string` - Título do gráfico
- `@Input() height: string` - Altura do container (padrão: '400px')
- `@Input() showLegend: boolean` - Exibir legenda (padrão: true)
- `@Input() showMetrics: boolean` - Exibir métricas (padrão: true)
- `@Input() showActions: boolean` - Exibir botões de ação (padrão: false)
- `@Input() actionLabel: string` - Texto do botão de ação

**Eventos:**
- `@Output() chartClick` - Clique no gráfico
- `@Output() chartHover` - Hover no gráfico
- `@Output() actionClick` - Clique no botão de ação

**Uso:**
```html
<app-line-chart
  [trendData]="trendData"
  title="Tendência Semanal por Categoria"
  [showMetrics]="true"
  [showActions]="true"
  actionLabel="Adicionar Semana"
  (chartClick)="onChartClick($event)"
  (actionClick)="onTrendAction()">
</app-line-chart>
```

## 🔧 Interfaces e Tipos

### ExpenseCategory
```typescript
interface ExpenseCategory {
  category: string;
  amount: number;
  color?: string;
}
```

### MonthlyBudget
```typescript
interface MonthlyBudget {
  month: string;
  actual: number;
  budget: number;
}
```

### TrendData
```typescript
interface TrendData {
  labels: string[];
  datasets: TrendDataset[];
}

interface TrendDataset {
  label: string;
  data: number[];
  color?: string;
}
```

### ChartInteractionEvent
```typescript
interface ChartInteractionEvent {
  event?: ChartEvent;
  active?: object[];
}
```

## 🎨 Características do Design

### Responsividade
- Todos os componentes são totalmente responsivos
- Breakpoint em 768px para dispositivos móveis
- Ajuste automático de altura e layout

### Temas e Cores
- Paleta de cores consistente entre componentes
- Cores customizáveis por dataset
- Modo escuro preparado para implementação futura

### Interatividade
- Eventos de clique e hover
- Botões de ação contextuais
- Tooltips formatados em português brasileiro

## 🚀 Vantagens da Modularização

### ✅ Reutilização
- Componentes podem ser usados em qualquer parte da aplicação
- Interface consistente entre diferentes tipos de gráfico
- Configuração flexível através de inputs

### ✅ Manutenibilidade
- Código organizado e separado por responsabilidade
- Fácil adicionar novos tipos de gráfico
- Styling isolado por componente

### ✅ Testabilidade
- Cada componente pode ser testado independentemente
- Mocking facilitado através de interfaces bem definidas
- Separação clara entre lógica e apresentação

### ✅ Performance
- Componentes carregam apenas o necessário
- Change detection otimizada
- Lazy loading possível

## 📝 Exemplo de Uso Completo

```typescript
// Component
export class DashboardComponent {
  public expenses: ExpenseCategory[] = [
    { category: 'Alimentação', amount: 1200, color: '#FF6384' },
    { category: 'Transporte', amount: 800, color: '#36A2EB' }
  ];

  public onChartClick(event: ChartInteractionEvent): void {
    console.log('Chart interaction:', event);
  }

  public addExpense(): void {
    // Lógica para adicionar nova despesa
  }
}
```

```html
<!-- Template -->
<app-doughnut-chart
  [data]="expenses"
  title="Minhas Despesas"
  [showActions]="true"
  actionLabel="Adicionar Despesa"
  (chartClick)="onChartClick($event)"
  (actionClick)="addExpense()">
</app-doughnut-chart>
```

## 📚 Próximos Passos

### Funcionalidades Futuras
1. **Modo Escuro** - Suporte completo a temas escuros
2. **Exportação** - Exportar gráficos como PNG/PDF
3. **Animações** - Transições suaves entre estados
4. **Drill-down** - Navegação hierárquica nos dados
5. **Real-time** - Atualização automática com WebSockets

### Novos Tipos de Gráfico
1. **Radar Chart** - Para comparações multidimensionais
2. **Scatter Plot** - Para correlações
3. **Gauge Chart** - Para KPIs e metas
4. **Tree Map** - Para dados hierárquicos

Esta modularização estabelece uma base sólida e extensível para a visualização de dados na aplicação, seguindo as melhores práticas do Angular e design patterns modernos.