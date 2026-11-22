import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, finalize, of, switchMap, tap } from 'rxjs';

import { PlanningService } from './data-access/planning.service';
import { MonthlyPlan, getCardSpent, getPlanPlanned, getPlanSpent } from './models/planning.models';
import { YearMonth, formatYearMonthLong, parseYearMonthKey, yearMonthKey } from '../../shared/utils/year-month';
import { BudgetSummaryComponent } from './ui/budget-summary/budget-summary.component';
import { BudgetCardComponent } from './ui/budget-card/budget-card.component';
import { IconComponent } from '../../shared/ui/icon/icon.component';
import { CurrencyPipe } from '@angular/common';

/** Planejamento do mês: seletor de mês, resumo e cards por categoria. */
@Component({
  selector: 'app-planning-page',
  imports: [BudgetSummaryComponent, BudgetCardComponent, IconComponent, CurrencyPipe],
  templateUrl: './planning.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlanningPage {
  private readonly planningService = inject(PlanningService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  /** Mês selecionado: `?month=yyyy-mm` da URL ou o mês atual. */
  protected readonly selectedMonth = signal<YearMonth>(
    parseYearMonthKey(this.route.snapshot.queryParamMap.get('month')) ?? this.planningService.getCurrentMonth()
  );
  private readonly reloadCount = signal(0);

  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  protected readonly months = toSignal(
    this.planningService.getAvailableMonths().pipe(
      catchError(() => {
        this.error.set('Erro ao carregar a lista de meses.');
        return of([] as YearMonth[]);
      })
    ),
    { initialValue: [] as YearMonth[] }
  );

  protected readonly plan = toSignal(
    toObservable(computed(() => ({ month: this.selectedMonth(), reload: this.reloadCount() }))).pipe(
      tap(() => {
        this.loading.set(true);
        this.error.set(null);
      }),
      switchMap(({ month }) =>
        this.planningService.getMonthlyPlan(month).pipe(
          catchError(() => {
            this.error.set(`Não há dados de planejamento para ${formatYearMonthLong(month)}.`);
            return of(null);
          }),
          finalize(() => this.loading.set(false))
        )
      )
    ),
    { initialValue: null as MonthlyPlan | null }
  );

  protected readonly cards = computed(() => this.plan()?.cards ?? []);
  protected readonly plannedTotal = computed(() => {
    const plan = this.plan();
    return plan ? getPlanPlanned(plan) : 0;
  });
  protected readonly spentTotal = computed(() => {
    const plan = this.plan();
    return plan ? getPlanSpent(plan) : 0;
  });

  protected readonly selectedKey = computed(() => yearMonthKey(this.selectedMonth()));
  protected readonly selectedLabel = computed(() => formatYearMonthLong(this.selectedMonth()));

  protected readonly monthOptions = computed(() =>
    this.months().map(month => ({ key: yearMonthKey(month), label: formatYearMonthLong(month) }))
  );

  protected readonly cardSpent = getCardSpent;

  onMonthChange(key: string): void {
    const month = parseYearMonthKey(key);
    if (!month) return;
    this.selectedMonth.set(month);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { month: key },
      replaceUrl: true
    });
  }

  retry(): void {
    this.reloadCount.update(count => count + 1);
  }
}
