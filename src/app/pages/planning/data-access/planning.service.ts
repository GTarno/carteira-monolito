import { Injectable } from '@angular/core';
import { Observable, of, delay, throwError } from 'rxjs';
import { MonthlyPlan } from '../models/planning.models';
import { YearMonth, YearMonthUtils } from '../models/year-month.models';
import { PLANNING_MOCKS, getAllAvailableMonths } from './planning.mock';

@Injectable({
  providedIn: 'root'
})
export class PlanningService {

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
   * Retorna os últimos N meses disponíveis
   */
  getRecentMonths(count: number = 6): Observable<YearMonth[]> {
    const allMonths = getAllAvailableMonths();
    const recentMonths = allMonths.slice(0, count);
    
    return of(recentMonths).pipe(
      delay(100)
    );
  }
}