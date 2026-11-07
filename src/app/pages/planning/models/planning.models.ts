import { YearMonth } from './year-month.models';

export interface PlanItem {
  name: string;
  value: number;
}

export interface PlanCard {
  id: string;
  title: string;
  icon: string;
  plannedValue: number;
  items?: PlanItem[];
  currentValue?: number;
}

export interface MonthlyPlan {
  month: YearMonth;
  cards: PlanCard[];
}

export interface PlanItemDetail {
  id: string;
  categoryId: string;
  name: string;
  plannedValue: number;
  realValue: number;
  icon?: string;
}

export interface PlanningItemCreate {
  categoryId: string;
  name: string;
  plannedValue: number;
  icon: string;
}

export type PlanCardStatus = 'ok' | 'limit' | 'over';

/** A partir de qual fração do planejado o gasto é considerado "no limite". */
export const BUDGET_WARNING_RATIO = 0.9;

/** Regra única de status do orçamento: ok (até 90%), limit (até 100%), over (acima de 100%). */
export function getBudgetStatus(plannedValue: number, realValue: number): PlanCardStatus {
  if (plannedValue <= 0) return 'ok';
  const ratio = realValue / plannedValue;
  if (ratio > 1) return 'over';
  if (ratio > BUDGET_WARNING_RATIO) return 'limit';
  return 'ok';
}

/** Fração utilizada do planejado, limitada a 1. */
export function getBudgetProgress(plannedValue: number, realValue: number): number {
  if (plannedValue <= 0) return 0;
  return Math.min(realValue / plannedValue, 1);
}

/** Quanto o gasto passou do planejado (0 se não passou). */
export function getBudgetExcess(plannedValue: number, realValue: number): number {
  return Math.max(realValue - plannedValue, 0);
}

export class PlanningUtils {
  static getRealValue(card: PlanCard): number {
    if (card.items && card.items.length > 0) {
      return card.items.reduce((sum, item) => sum + item.value, 0);
    }
    return card.currentValue ?? 0;
  }

  static getCardStatus(card: PlanCard): PlanCardStatus {
    return getBudgetStatus(card.plannedValue, PlanningUtils.getRealValue(card));
  }

  static getCardProgress(card: PlanCard): number {
    return getBudgetProgress(card.plannedValue, PlanningUtils.getRealValue(card));
  }

  static getCardExcess(card: PlanCard): number {
    return getBudgetExcess(card.plannedValue, PlanningUtils.getRealValue(card));
  }

  static getTotalPlanned(plan: MonthlyPlan): number {
    return plan.cards.reduce((sum, card) => sum + card.plannedValue, 0);
  }

  static getTotalSpent(plan: MonthlyPlan): number {
    return plan.cards.reduce((sum, card) => sum + PlanningUtils.getRealValue(card), 0);
  }

  static getOverallStatus(plan: MonthlyPlan): PlanCardStatus {
    return getBudgetStatus(PlanningUtils.getTotalPlanned(plan), PlanningUtils.getTotalSpent(plan));
  }

  static getOverallProgress(plan: MonthlyPlan): number {
    return getBudgetProgress(PlanningUtils.getTotalPlanned(plan), PlanningUtils.getTotalSpent(plan));
  }

  static getOverallExcess(plan: MonthlyPlan): number {
    return getBudgetExcess(PlanningUtils.getTotalPlanned(plan), PlanningUtils.getTotalSpent(plan));
  }

  static getItemStatus(plannedValue: number, realValue: number): PlanCardStatus {
    return getBudgetStatus(plannedValue, realValue);
  }

  static getItemProgress(plannedValue: number, realValue: number): number {
    return getBudgetProgress(plannedValue, realValue);
  }

  static getItemExcess(plannedValue: number, realValue: number): number {
    return getBudgetExcess(plannedValue, realValue);
  }
}
