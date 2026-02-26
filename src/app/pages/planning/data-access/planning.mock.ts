import { MonthlyPlan, PlanItemDetail } from '../models/planning.models';
import { YearMonth, YearMonthUtils } from '../models/year-month.models';
import { ItemMonthlyTrend } from '../models/item-monthly-trend.model';

export const PLANNING_MOCKS: Map<string, MonthlyPlan> = new Map();

// Mês atual (Fevereiro 2026)
const currentMonth: YearMonth = { year: 2026, month: 2 };
const currentPlan: MonthlyPlan = {
  month: currentMonth,
  cards: [
    {
      id: 'contas',
      title: 'Contas',
      icon: 'receipt_long',
      plannedValue: 2500.00,
      items: [
        { name: 'Luz', value: 180.50 },
        { name: 'Condomínio', value: 450.00 },
        { name: 'Internet', value: 89.90 },
        { name: 'Financiamento', value: 1850.00 }
      ]
    },
    {
      id: 'cartao-credito',
      title: 'Cartão de crédito',
      icon: 'credit_card',
      plannedValue: 800.00,
      currentValue: 720.35
    },
    {
      id: 'alimentacao',
      title: 'Alimentação',
      icon: 'restaurant',
      plannedValue: 1200.00,
      items: [
        { name: 'Mercado', value: 650.80 },
        { name: 'Açougue', value: 185.00 },
        { name: 'Restaurantes', value: 420.50 }
      ]
    }
  ]
};

// Mês anterior (Janeiro 2026)
const previousMonth: YearMonth = { year: 2026, month: 1 };
const previousPlan: MonthlyPlan = {
  month: previousMonth,
  cards: [
    {
      id: 'contas',
      title: 'Contas',
      icon: 'receipt_long',
      plannedValue: 2500.00,
      items: [
        { name: 'Luz', value: 220.80 },
        { name: 'Condomínio', value: 450.00 },
        { name: 'Internet', value: 89.90 },
        { name: 'Financiamento', value: 1850.00 }
      ]
    },
    {
      id: 'cartao-credito',
      title: 'Cartão de crédito',
      icon: 'credit_card',
      plannedValue: 800.00,
      currentValue: 950.25
    },
    {
      id: 'alimentacao',
      title: 'Alimentação',
      icon: 'restaurant',
      plannedValue: 1200.00,
      items: [
        { name: 'Mercado', value: 780.50 },
        { name: 'Açougue', value: 200.00 },
        { name: 'Restaurantes', value: 380.00 }
      ]
    }
  ]
};

// Mês seguinte com dados diferentes (Março 2026)
const nextMonth: YearMonth = { year: 2026, month: 3 };
const nextPlan: MonthlyPlan = {
  month: nextMonth,
  cards: [
    {
      id: 'contas',
      title: 'Contas',
      icon: 'receipt_long',
      plannedValue: 2500.00,
      items: [
        { name: 'Luz', value: 0 }, // Ainda não veio a conta
        { name: 'Condomínio', value: 450.00 },
        { name: 'Internet', value: 89.90 },
        { name: 'Financiamento', value: 1850.00 }
      ]
    },
    {
      id: 'cartao-credito',
      title: 'Cartão de crédito',
      icon: 'credit_card',
      plannedValue: 800.00,
      currentValue: 120.80 // Início do mês
    },
    {
      id: 'alimentacao',
      title: 'Alimentação',
      icon: 'restaurant',
      plannedValue: 1200.00,
      items: [
        { name: 'Mercado', value: 0 }, // Ainda não foi feita compra grande
        { name: 'Açougue', value: 0 },
        { name: 'Restaurantes', value: 85.50 }
      ]
    }
  ]
};

// Meses anteriores para completar 12 meses de histórico
// Dezembro 2025
const dec2025: YearMonth = { year: 2025, month: 12 };
const dec2025Plan: MonthlyPlan = {
  month: dec2025,
  cards: [
    {
      id: 'contas',
      title: 'Contas', 
      icon: 'receipt_long',
      plannedValue: 2400.00,
      items: [
        { name: 'Luz', value: 195.30 },
        { name: 'Condomínio', value: 450.00 },
        { name: 'Internet', value: 89.90 },
        { name: 'Financiamento', value: 1850.00 }
      ]
    },
    {
      id: 'cartao-credito',
      title: 'Cartão de crédito',
      icon: 'credit_card', 
      plannedValue: 750.00,
      currentValue: 832.50
    },
    {
      id: 'alimentacao',
      title: 'Alimentação',
      icon: 'restaurant',
      plannedValue: 1100.00,
      items: [
        { name: 'Mercado', value: 580.40 },
        { name: 'Açougue', value: 175.80 },
        { name: 'Restaurantes', value: 320.90 }
      ]
    }
  ]
};

// Novembro 2025
const nov2025: YearMonth = { year: 2025, month: 11 };
const nov2025Plan: MonthlyPlan = {
  month: nov2025,
  cards: [
    {
      id: 'contas',
      title: 'Contas',
      icon: 'receipt_long',
      plannedValue: 2400.00,
      items: [
        { name: 'Luz', value: 167.80 },
        { name: 'Condomínio', value: 450.00 },
        { name: 'Internet', value: 89.90 },
        { name: 'Financiamento', value: 1850.00 }
      ]
    },
    {
      id: 'cartao-credito',
      title: 'Cartão de crédito',
      icon: 'credit_card',
      plannedValue: 750.00,
      currentValue: 698.45
    },
    {
      id: 'alimentacao',
      title: 'Alimentação',
      icon: 'restaurant',
      plannedValue: 1100.00,
      items: [
        { name: 'Mercado', value: 612.20 },
        { name: 'Açougue', value: 189.50 },
        { name: 'Restaurantes', value: 287.30 }
      ]
    }
  ]
};

// Outubro 2025
const oct2025: YearMonth = { year: 2025, month: 10 };
const oct2025Plan: MonthlyPlan = {
  month: oct2025,
  cards: [
    {
      id: 'contas',
      title: 'Contas',
      icon: 'receipt_long',
      plannedValue: 2400.00,
      items: [
        { name: 'Luz', value: 201.60 },
        { name: 'Condomínio', value: 450.00 },
        { name: 'Internet', value: 89.90 },
        { name: 'Financiamento', value: 1850.00 }
      ]
    },
    {
      id: 'cartao-credito',
      title: 'Cartão de crédito',
      icon: 'credit_card',
      plannedValue: 750.00,
      currentValue: 756.80
    },
    {
      id: 'alimentacao',
      title: 'Alimentação',
      icon: 'restaurant',
      plannedValue: 1100.00,
      items: [
        { name: 'Mercado', value: 634.70 },
        { name: 'Açougue', value: 203.40 },
        { name: 'Restaurantes', value: 298.60 }
      ]
    }
  ]
};

// Setembro 2025
const sep2025: YearMonth = { year: 2025, month: 9 };
const sep2025Plan: MonthlyPlan = {
  month: sep2025,
  cards: [
    {
      id: 'contas',
      title: 'Contas',
      icon: 'receipt_long',
      plannedValue: 2400.00,
      items: [
        { name: 'Luz', value: 156.90 },
        { name: 'Condomínio', value: 450.00 },
        { name: 'Internet', value: 89.90 },
        { name: 'Financiamento', value: 1850.00 }
      ]
    },
    {
      id: 'cartao-credito',
      title: 'Cartão de crédito',
      icon: 'credit_card',
      plannedValue: 750.00,
      currentValue: 623.75
    },
    {
      id: 'alimentacao',
      title: 'Alimentação',
      icon: 'restaurant',
      plannedValue: 1100.00,
      items: [
        { name: 'Mercado', value: 591.30 },
        { name: 'Açougue', value: 167.20 },
        { name: 'Restaurantes', value: 345.80 }
      ]
    }
  ]
};

// Adicionar os meses principais
PLANNING_MOCKS.set(YearMonthUtils.toKey(currentMonth), currentPlan);
PLANNING_MOCKS.set(YearMonthUtils.toKey(previousMonth), previousPlan);
PLANNING_MOCKS.set(YearMonthUtils.toKey(nextMonth), nextPlan);
PLANNING_MOCKS.set(YearMonthUtils.toKey(dec2025), dec2025Plan);
PLANNING_MOCKS.set(YearMonthUtils.toKey(nov2025), nov2025Plan);
PLANNING_MOCKS.set(YearMonthUtils.toKey(oct2025), oct2025Plan);
PLANNING_MOCKS.set(YearMonthUtils.toKey(sep2025), sep2025Plan);

export function getAllAvailableMonths(): YearMonth[] {
  console.log('getAllAvailableMonths called');
  const months: YearMonth[] = [
    { year: 2026, month: 3 },  // Março 2026
    { year: 2026, month: 2 },  // Fevereiro 2026 (atual)
    { year: 2026, month: 1 },  // Janeiro 2026
    { year: 2025, month: 12 }, // Dezembro 2025
    { year: 2025, month: 11 }, // Novembro 2025
    { year: 2025, month: 10 }, // Outubro 2025
    { year: 2025, month: 9 }   // Setembro 2025
  ];
  
  console.log('Available months:', months);
  return months;
}

// Dados detalhados dos itens por categoria e mês
export const PLAN_ITEMS_MOCKS: Map<string, PlanItemDetail[]> = new Map();

// Fevereiro 2026 - Itens detalhados
const feb2026_contas: PlanItemDetail[] = [
  {
    id: 'luz_feb2026',
    categoryId: 'contas',
    name: 'Luz',
    plannedValue: 200.00,
    realValue: 180.50,
    icon: 'lightbulb'
  },
  {
    id: 'condominio_feb2026',
    categoryId: 'contas',
    name: 'Condomínio',
    plannedValue: 450.00,
    realValue: 450.00,
    icon: 'apartment'
  },
  {
    id: 'internet_feb2026',
    categoryId: 'contas',
    name: 'Internet',
    plannedValue: 100.00,
    realValue: 89.90,
    icon: 'wifi'
  },
  {
    id: 'financiamento_feb2026',
    categoryId: 'contas',
    name: 'Financiamento',
    plannedValue: 1850.00,
    realValue: 1850.00,
    icon: 'home'
  }
];

const feb2026_cartao: PlanItemDetail[] = [
  {
    id: 'fatura_feb2026',
    categoryId: 'cartao-credito',
    name: 'Fatura Atual',
    plannedValue: 800.00,
    realValue: 720.35,
    icon: 'credit_card'
  }
];

const feb2026_alimentacao: PlanItemDetail[] = [
  {
    id: 'mercado_feb2026',
    categoryId: 'alimentacao',
    name: 'Mercado',
    plannedValue: 700.00,
    realValue: 650.80,
    icon: 'shopping_cart'
  },
  {
    id: 'acougue_feb2026',
    categoryId: 'alimentacao',
    name: 'Açougue',
    plannedValue: 200.00,
    realValue: 185.00,
    icon: 'restaurant'
  },
  {
    id: 'restaurantes_feb2026',
    categoryId: 'alimentacao',
    name: 'Restaurantes',
    plannedValue: 300.00,
    realValue: 420.50,
    icon: 'dinner_dining'
  }
];

// Janeiro 2026 - Itens detalhados
const jan2026_contas: PlanItemDetail[] = [
  {
    id: 'luz_jan2026',
    categoryId: 'contas',
    name: 'Luz',
    plannedValue: 200.00,
    realValue: 220.80,
    icon: 'lightbulb'
  },
  {
    id: 'condominio_jan2026',
    categoryId: 'contas',
    name: 'Condomínio',
    plannedValue: 450.00,
    realValue: 450.00,
    icon: 'apartment'
  },
  {
    id: 'internet_jan2026',
    categoryId: 'contas',
    name: 'Internet',
    plannedValue: 100.00,
    realValue: 89.90,
    icon: 'wifi'
  },
  {
    id: 'financiamento_jan2026',
    categoryId: 'contas',
    name: 'Financiamento',
    plannedValue: 1850.00,
    realValue: 1850.00,
    icon: 'home'
  }
];

const jan2026_cartao: PlanItemDetail[] = [
  {
    id: 'fatura_jan2026',
    categoryId: 'cartao-credito',
    name: 'Fatura Atual',
    plannedValue: 800.00,
    realValue: 950.25,
    icon: 'credit_card'
  }
];

const jan2026_alimentacao: PlanItemDetail[] = [
  {
    id: 'mercado_jan2026',
    categoryId: 'alimentacao',
    name: 'Mercado',
    plannedValue: 700.00,
    realValue: 780.50,
    icon: 'shopping_cart'
  },
  {
    id: 'acougue_jan2026',
    categoryId: 'alimentacao',
    name: 'Açougue',
    plannedValue: 200.00,
    realValue: 200.00,
    icon: 'restaurant'
  },
  {
    id: 'restaurantes_jan2026',
    categoryId: 'alimentacao',
    name: 'Restaurantes',
    plannedValue: 300.00,
    realValue: 380.00,
    icon: 'dinner_dining'
  }
];

// Março 2026 - Itens detalhados (início de mês)
const mar2026_contas: PlanItemDetail[] = [
  {
    id: 'luz_mar2026',
    categoryId: 'contas',
    name: 'Luz',
    plannedValue: 200.00,
    realValue: 0,
    icon: 'lightbulb'
  },
  {
    id: 'condominio_mar2026',
    categoryId: 'contas',
    name: 'Condomínio',
    plannedValue: 450.00,
    realValue: 450.00,
    icon: 'apartment'
  },
  {
    id: 'internet_mar2026',
    categoryId: 'contas',
    name: 'Internet',
    plannedValue: 100.00,
    realValue: 89.90,
    icon: 'wifi'
  },
  {
    id: 'financiamento_mar2026',
    categoryId: 'contas',
    name: 'Financiamento',
    plannedValue: 1850.00,
    realValue: 1850.00,
    icon: 'home'
  }
];

const mar2026_cartao: PlanItemDetail[] = [
  {
    id: 'fatura_mar2026',
    categoryId: 'cartao-credito',
    name: 'Fatura Atual',
    plannedValue: 800.00,
    realValue: 120.80,
    icon: 'credit_card'
  }
];

const mar2026_alimentacao: PlanItemDetail[] = [
  {
    id: 'mercado_mar2026',
    categoryId: 'alimentacao',
    name: 'Mercado',
    plannedValue: 700.00,
    realValue: 0,
    icon: 'shopping_cart'
  },
  {
    id: 'acougue_mar2026',
    categoryId: 'alimentacao',
    name: 'Açougue',
    plannedValue: 200.00,
    realValue: 0,
    icon: 'restaurant'
  },
  {
    id: 'restaurantes_mar2026',
    categoryId: 'alimentacao',
    name: 'Restaurantes',
    plannedValue: 300.00,
    realValue: 85.50,
    icon: 'dinner_dining'
  }
];

// Adicionar os dados de itens detalhados
PLAN_ITEMS_MOCKS.set('2026-02_contas', feb2026_contas);
PLAN_ITEMS_MOCKS.set('2026-02_cartao-credito', feb2026_cartao);
PLAN_ITEMS_MOCKS.set('2026-02_alimentacao', feb2026_alimentacao);

PLAN_ITEMS_MOCKS.set('2026-01_contas', jan2026_contas);
PLAN_ITEMS_MOCKS.set('2026-01_cartao-credito', jan2026_cartao);
PLAN_ITEMS_MOCKS.set('2026-01_alimentacao', jan2026_alimentacao);

PLAN_ITEMS_MOCKS.set('2026-03_contas', mar2026_contas);
PLAN_ITEMS_MOCKS.set('2026-03_cartao-credito', mar2026_cartao);
PLAN_ITEMS_MOCKS.set('2026-03_alimentacao', mar2026_alimentacao);

// Dados de tendência mensal dos itens (últimos 12 meses)
export const ITEM_TREND_MOCKS: Map<string, ItemMonthlyTrend[]> = new Map();

// Helper function para gerar tendência realística
function generateTrendData(baseValue: number, variation: number = 0.2): ItemMonthlyTrend[] {
  const months = [
    '2025-03', '2025-04', '2025-05', '2025-06', '2025-07', '2025-08',
    '2025-09', '2025-10', '2025-11', '2025-12', '2026-01', '2026-02'
  ];
  
  return months.map((month, index) => {
    // Variação gradual + ruído aleatório
    const trend = 1 + (index * 0.02); // Crescimento de 2% ao mês
    const noise = (Math.random() - 0.5) * variation; // Ruído ±10%
    const value = Math.max(0, baseValue * trend * (1 + noise));
    
    return {
      month,
      value: Math.round(value * 100) / 100 // Arredondar para 2 casas decimais
    };
  });
}

// Tendências dos itens de Contas
ITEM_TREND_MOCKS.set('contas_luz_feb2026', generateTrendData(180, 0.15));
ITEM_TREND_MOCKS.set('contas_condominio_feb2026', generateTrendData(450, 0.05));
ITEM_TREND_MOCKS.set('contas_internet_feb2026', generateTrendData(90, 0.10));
ITEM_TREND_MOCKS.set('contas_financiamento_feb2026', generateTrendData(1850, 0.02));

// Tendências dos itens de Cartão
ITEM_TREND_MOCKS.set('cartao-credito_fatura_feb2026', generateTrendData(720, 0.25));

// Tendências dos itens de Alimentação
ITEM_TREND_MOCKS.set('alimentacao_mercado_feb2026', generateTrendData(650, 0.20));
ITEM_TREND_MOCKS.set('alimentacao_acougue_feb2026', generateTrendData(185, 0.18));
ITEM_TREND_MOCKS.set('alimentacao_restaurantes_feb2026', generateTrendData(420, 0.30));