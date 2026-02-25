import { MonthlyPlan } from '../models/planning.models';
import { YearMonth, YearMonthUtils } from '../models/year-month.models';

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