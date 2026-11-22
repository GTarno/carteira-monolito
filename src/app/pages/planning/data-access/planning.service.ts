import { createId } from '../../../shared/utils/id.utils';
import { Injectable, inject } from '@angular/core';
import { Observable, Subject, of, delay, throwError } from 'rxjs';
import { MonthlyPlan, PlanCard, PlanItemDetail, PlanningItemCreate } from '../models/planning.models';
import { PlanningItemUpdate } from '../models/planning-item-update.model';
import { YearMonth, addMonths, compareYearMonths, currentYearMonth, formatYearMonthShort, parseYearMonthKey, yearMonthKey } from '../../../shared/utils/year-month';
import { ItemMonthlyTrend } from '../models/item-monthly-trend.model';
import { PLANNING_CATEGORIES, PlanningCategory, createPlanningSeed } from './planning.mock';
import { MonthlyExpensesStore } from '../../../core/expenses/monthly-expenses.store';
import { MonthlyExpense } from '../../../core/expenses/monthly-expense.model';

export interface PlanningItemsChange {
  month: YearMonth;
  categoryId: string;
}

/** Latência simulada enquanto não existe API. */
const MOCK_LATENCY_MS = 100;
const TREND_MONTHS = 12;

/**
 * Serviço de planejamento em memória.
 *
 * Fonte de verdade única: a lista de itens por mês. Os cards (totais por categoria),
 * a lista de meses e a tendência são todos derivados dela, então editar/adicionar
 * um item reflete automaticamente nos totais.
 */
@Injectable({
  providedIn: 'root'
})
export class PlanningService {
  private readonly categories: PlanningCategory[] = PLANNING_CATEGORIES;
  private readonly itemsByMonth = createPlanningSeed(currentYearMonth());
  private readonly itemsChangedSubject = new Subject<PlanningItemsChange>();

  /** Emite sempre que itens de uma categoria/mês são criados ou alterados. */
  readonly itemsChanged$: Observable<PlanningItemsChange> = this.itemsChangedSubject.asObservable();

  constructor() {
    // Gastos mensais cadastrados em "Adicionar gastos" (salvos no navegador)
    for (const expense of inject(MonthlyExpensesStore).expenses()) {
      this.applyMonthlyExpense(expense);
    }
  }

  /** Categorias do planejamento (ex.: para escolher onde um gasto se encaixa). */
  getCategories(): PlanningCategory[] {
    return this.categories;
  }

  /**
   * Inclui um gasto mensal como item da categoria escolhida, do mês de início em diante
   * (o planejado é o valor informado; o gasto começa em zero).
   */
  addMonthlyExpense(expense: MonthlyExpense): void {
    for (const month of this.applyMonthlyExpense(expense)) {
      this.itemsChangedSubject.next({ month, categoryId: expense.categoryId });
    }
  }

  /** Meses com dados, do mais recente para o mais antigo. */
  getAvailableMonths(): Observable<YearMonth[]> {
    const months = [...this.itemsByMonth.keys()]
      .map(key => parseYearMonthKey(key)!)
      .sort((a, b) => compareYearMonths(b, a));
    return this.respond(months);
  }

  getCurrentMonth(): YearMonth {
    return currentYearMonth();
  }

  getMonthlyPlan(month: YearMonth): Observable<MonthlyPlan> {
    const items = this.itemsByMonth.get(yearMonthKey(month));
    if (!items) {
      return throwError(() => new Error(`Plano não encontrado para ${formatYearMonthShort(month)}`));
    }

    const cards = this.categories.map(category => this.buildCard(category, items));
    return this.respond({ month, cards });
  }

  getItemsByCategory(month: YearMonth, categoryId: string): Observable<PlanItemDetail[]> {
    const items = this.itemsByMonth.get(yearMonthKey(month));
    if (!items || !this.findCategory(categoryId)) {
      return throwError(() => new Error(
        `Categoria ${categoryId} não encontrada no mês ${formatYearMonthShort(month)}`
      ));
    }
    return this.respond(items.filter(item => item.categoryId === categoryId));
  }

  getItemById(month: YearMonth, categoryId: string, itemId: string): Observable<PlanItemDetail | null> {
    return this.respond(this.findItem(month, categoryId, itemId) ?? null);
  }

  /** Valores gastos do item nos últimos 12 meses, terminando em `endMonth`. */
  getItemTrend(categoryId: string, itemId: string, endMonth: YearMonth = this.getCurrentMonth()): Observable<ItemMonthlyTrend[]> {
    const trend: ItemMonthlyTrend[] = [];
    for (let offset = -(TREND_MONTHS - 1); offset <= 0; offset++) {
      const month = addMonths(endMonth, offset);
      const item = this.findItem(month, categoryId, itemId);
      if (item) {
        trend.push({ month: yearMonthKey(month), value: item.realValue });
      }
    }
    return this.respond(trend);
  }

  addCategoryItem(month: YearMonth, payload: PlanningItemCreate): Observable<PlanItemDetail> {
    const key = yearMonthKey(month);
    const items = this.itemsByMonth.get(key);
    if (!items || !this.findCategory(payload.categoryId)) {
      return throwError(() => new Error('Não é possível adicionar itens a este mês/categoria'));
    }

    const newItem: PlanItemDetail = {
      id: createId(),
      categoryId: payload.categoryId,
      name: payload.name,
      plannedValue: payload.plannedValue,
      realValue: 0,
      icon: payload.icon
    };

    this.itemsByMonth.set(key, [...items, newItem]);
    this.itemsChangedSubject.next({ month, categoryId: payload.categoryId });
    return this.respond(newItem);
  }

  updateItemValues(month: YearMonth, categoryId: string, itemId: string, update: PlanningItemUpdate): Observable<PlanItemDetail> {
    const key = yearMonthKey(month);
    const items = this.itemsByMonth.get(key) ?? [];
    const target = this.findItem(month, categoryId, itemId);

    if (!target) {
      return throwError(() => new Error(`Item ${itemId} não encontrado na categoria ${categoryId}`));
    }

    const updatedItem: PlanItemDetail = {
      ...target,
      plannedValue: update.plannedValue,
      realValue: update.realValue
    };

    this.itemsByMonth.set(key, items.map(item => item === target ? updatedItem : item));
    this.itemsChangedSubject.next({ month, categoryId });
    return this.respond(updatedItem);
  }

  /** Aplica o gasto aos meses a partir de `startMonth`; retorna os meses alterados. */
  private applyMonthlyExpense(expense: MonthlyExpense): YearMonth[] {
    const category = this.findCategory(expense.categoryId);
    if (!category) return [];

    const changed: YearMonth[] = [];
    for (const [key, items] of this.itemsByMonth) {
      if (key < expense.startMonth || items.some(item => item.id === expense.id)) continue;
      this.itemsByMonth.set(key, [...items, {
        id: expense.id,
        categoryId: category.id,
        name: expense.name,
        icon: category.icon,
        plannedValue: expense.plannedValue,
        realValue: 0
      }]);
      changed.push(parseYearMonthKey(key)!);
    }
    return changed;
  }

  private buildCard(category: PlanningCategory, monthItems: PlanItemDetail[]): PlanCard {
    const items = monthItems.filter(item => item.categoryId === category.id);
    return {
      id: category.id,
      title: category.title,
      icon: category.icon,
      plannedValue: items.reduce((sum, item) => sum + item.plannedValue, 0),
      currentValue: items.reduce((sum, item) => sum + item.realValue, 0),
      items: items.map(item => ({ name: item.name, value: item.realValue }))
    };
  }

  private findCategory(categoryId: string): PlanningCategory | undefined {
    return this.categories.find(category => category.id === categoryId);
  }

  private findItem(month: YearMonth, categoryId: string, itemId: string): PlanItemDetail | undefined {
    return this.itemsByMonth
      .get(yearMonthKey(month))
      ?.find(item => item.categoryId === categoryId && item.id === itemId);
  }


  private respond<T>(value: T): Observable<T> {
    return of(value).pipe(delay(MOCK_LATENCY_MS));
  }
}
