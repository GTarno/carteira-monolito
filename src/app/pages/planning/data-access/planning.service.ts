import { Injectable } from '@angular/core';
import { Observable, of, delay, throwError, BehaviorSubject } from 'rxjs';
import { MonthlyPlan, PlanItemDetail, PlanningItemCreate } from '../models/planning.models';
import { PlanningItemUpdate } from '../models/planning-item-update.model';
import { YearMonth, YearMonthUtils } from '../models/year-month.models';
import { ItemMonthlyTrend } from '../models/item-monthly-trend.model';
import { PLANNING_MOCKS, getAllAvailableMonths, PLAN_ITEMS_MOCKS, ITEM_TREND_MOCKS } from './planning.mock';

@Injectable({
  providedIn: 'root'
})
export class PlanningService {

  // BehaviorSubject para notificar mudanças nos itens
  private itemsChangedSubject = new BehaviorSubject<{month: YearMonth; categoryId: string} | null>(null);

  /**
   * Retorna a lista de meses disponíveis para consulta
   */
  getAvailableMonths(): Observable<YearMonth[]> {
    return of(getAllAvailableMonths()).pipe(
      delay(100) // Simula latência de rede
    );
  }

  /**
   * Retorna o plano mensal para um mês específico
   */
  getMonthlyPlan(month: YearMonth): Observable<MonthlyPlan> {
    const key = YearMonthUtils.toKey(month);
    const plan = PLANNING_MOCKS.get(key);
    
    if (!plan) {
      return throwError(() => new Error(`Plano não encontrado para ${YearMonthUtils.toShortLabel(month)}`));
    }

    return of(plan).pipe(
      delay(150) // Simula latência de rede
    );
  }

  /**
   * Retorna o mês atual como padrão
   */
  getCurrentMonth(): YearMonth {
    return YearMonthUtils.getCurrentYearMonth();
  }

  /**
   * Verifica se um mês tem dados disponíveis
   */
  hasDataForMonth(month: YearMonth): boolean {
    return PLANNING_MOCKS.has(YearMonthUtils.toKey(month));
  }

  /**
   * Retorna os itens detalhados de uma categoria específica para um mês
   */
  getItemsByCategory(month: YearMonth, categoryId: string): Observable<PlanItemDetail[]> {
    const key = `${YearMonthUtils.toKey(month)}_${categoryId}`;
    const items = PLAN_ITEMS_MOCKS.get(key) || [];
    
    if (items.length === 0) {
      return throwError(() => new Error(`Itens não encontrados para a categoria ${categoryId} no mês ${YearMonthUtils.toShortLabel(month)}`));
    }

    return of(items).pipe(
      delay(100) // Simula latência de rede
    );
  }

  /**
   * Adiciona um novo item a uma categoria específica
   */
  addCategoryItem(month: YearMonth, payload: PlanningItemCreate): Observable<PlanItemDetail> {
    const key = `${YearMonthUtils.toKey(month)}_${payload.categoryId}`;
    const existingItems = PLAN_ITEMS_MOCKS.get(key) || [];
    
    // Criar novo item
    const newItem: PlanItemDetail = {
      id: `${payload.icon}_${Date.now()}`, // ID simples baseado em timestamp
      categoryId: payload.categoryId,
      name: payload.name,
      plannedValue: payload.plannedValue,
      realValue: 0, // Valor real inicial = 0
      icon: payload.icon
    };

    // Adicionar à lista existente
    const updatedItems = [...existingItems, newItem];
    PLAN_ITEMS_MOCKS.set(key, updatedItems);

    // Notificar mudança
    this.itemsChangedSubject.next({ month, categoryId: payload.categoryId });

    return of(newItem).pipe(
      delay(50) // Simula latência mínima
    );
  }

  /**
   * Observable para escutar mudanças nos itens
   */
  get itemsChanged$(): Observable<{month: YearMonth; categoryId: string} | null> {
    return this.itemsChangedSubject.asObservable();
  }

  /**
   * Retorna a tendência mensal de um item específico (últimos 12 meses)
   */
  getItemTrend(categoryId: string, itemId: string): Observable<ItemMonthlyTrend[]> {
    const key = `${categoryId}_${itemId}`;
    const trend = ITEM_TREND_MOCKS.get(key) || [];
    
    if (trend.length === 0) {
      return throwError(() => new Error(`Tendência não encontrada para o item ${itemId} da categoria ${categoryId}`));
    }

    return of(trend).pipe(
      delay(120) // Simula latência de rede
    );
  }

  /**
   * Retorna um item específico por ID
   */
  getItemById(month: YearMonth, categoryId: string, itemId: string): Observable<PlanItemDetail | null> {
    const key = `${YearMonthUtils.toKey(month)}_${categoryId}`;
    const items = PLAN_ITEMS_MOCKS.get(key) || [];
    const item = items.find(i => i.id === itemId);
    
    return of(item || null).pipe(
      delay(80)
    );
  }

  /**
   * Retorna os últimos N meses disponíveis
   */
  getRecentMonths(count: number = 6): Observable<YearMonth[]> {
    const allMonths = getAllAvailableMonths();
    const recentMonths = allMonths.slice(0, count);
    
    return of(recentMonths).pipe(
      delay(100)
    );
  }

  /**
   * Atualiza os valores de um item específico
   */
  updateItemValues(month: YearMonth, categoryId: string, itemId: string, update: PlanningItemUpdate): Observable<PlanItemDetail> {
    const key = `${YearMonthUtils.toKey(month)}_${categoryId}`;
    const items = PLAN_ITEMS_MOCKS.get(key) || [];
    
    const itemIndex = items.findIndex(item => item.id === itemId);
    
    if (itemIndex === -1) {
      return throwError(() => new Error(`Item ${itemId} não encontrado na categoria ${categoryId}`));
    }

    // Atualizar o item
    const updatedItem = {
      ...items[itemIndex],
      plannedValue: update.plannedValue,
      realValue: update.realValue
    };

    // Atualizar a lista no mock
    const updatedItems = [...items];
    updatedItems[itemIndex] = updatedItem;
    PLAN_ITEMS_MOCKS.set(key, updatedItems);

    // Notificar mudança
    this.itemsChangedSubject.next({ month, categoryId });

    return of(updatedItem).pipe(
      delay(100) // Simula latência de rede
    );
  }
}