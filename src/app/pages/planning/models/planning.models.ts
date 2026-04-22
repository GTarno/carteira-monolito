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

export class PlanningUtils {
  static getRealValue(card: PlanCard): number {
    if (card.items && card.items.length > 0) {
      return card.items.reduce((sum, item) => sum + item.value, 0);
    }
    return card.currentValue ?? 0;
  }

  static getCardStatus(card: PlanCard): PlanCardStatus {
    const realValue = PlanningUtils.getRealValue(card);
    if (card.plannedValue === 0) return 'ok';
    
    const ratio = realValue / card.plannedValue;
    if (ratio > 1) return 'over';
    if (ratio > 0.9) return 'limit';
    return 'ok';
  }

  static getCardProgress(card: PlanCard): number {
    if (card.plannedValue === 0) return 0;
    return Math.min(PlanningUtils.getRealValue(card) / card.plannedValue, 1);
  }

  static getCardExcess(card: PlanCard): number {
    const realValue = PlanningUtils.getRealValue(card);
    return Math.max(realValue - card.plannedValue, 0);
  }

  static getTotalPlanned(plan: MonthlyPlan): number {
    return plan.cards.reduce((sum, card) => sum + card.plannedValue, 0);
  }

  static getTotalSpent(plan: MonthlyPlan): number {
    return plan.cards.reduce((sum, card) => sum + PlanningUtils.getRealValue(card), 0);
  }

  static getOverallStatus(plan: MonthlyPlan): PlanCardStatus {
    const totalPlanned = PlanningUtils.getTotalPlanned(plan);
    const totalSpent = PlanningUtils.getTotalSpent(plan);
    
    if (totalPlanned === 0) return 'ok';
    
    const ratio = totalSpent / totalPlanned;
    if (ratio > 1) return 'over';
    if (ratio > 0.9) return 'limit';
    return 'ok';
  }

  static getOverallProgress(plan: MonthlyPlan): number {
    const totalPlanned = PlanningUtils.getTotalPlanned(plan);
    const totalSpent = PlanningUtils.getTotalSpent(plan);
    
    if (totalPlanned === 0) return 0;
    return Math.min(totalSpent / totalPlanned, 1);
  }

  static getOverallExcess(plan: MonthlyPlan): number {
    const totalPlanned = PlanningUtils.getTotalPlanned(plan);
    const totalSpent = PlanningUtils.getTotalSpent(plan);
    return Math.max(totalSpent - totalPlanned, 0);
  }

  // Métodos para itens individuais
  static getItemStatus(plannedValue: number, realValue: number): PlanCardStatus {
    if (plannedValue === 0) return 'ok';
    
    const ratio = realValue / plannedValue;
    if (ratio > 1) return 'over';
    if (ratio > 0.9) return 'limit';
    return 'ok';
  }

  static getItemProgress(plannedValue: number, realValue: number): number {
    if (plannedValue === 0) return 0;
    return Math.min(realValue / plannedValue, 1);
  }

  static getItemExcess(plannedValue: number, realValue: number): number {
    return Math.max(realValue - plannedValue, 0);
  }
}