import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, AsyncPipe } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatOptionModule } from '@angular/material/core';

import { BehaviorSubject, Observable, Subject, combineLatest, of } from 'rxjs';
import { switchMap, map, catchError, shareReplay, distinctUntilChanged, tap, finalize, startWith } from 'rxjs/operators';

import { PlanningService } from './data-access/planning.service';
import { PlanCard, MonthlyPlan, PlanCardStatus, PlanningUtils } from './models/planning.models';
import { formatBRL } from '../../core/i18n/locale';
import { YearMonth, YearMonthUtils } from './models/year-month.models';
import { PlannedVsSpentMeterComponent } from './ui/planned-vs-spent-meter/planned-vs-spent-meter.component';
import { SummaryHeaderCardComponent } from '../../shared/components/summary-header-card/summary-header-card.component';

@Component({
  selector: 'app-planning-page',
  standalone: true,
  imports: [
    CommonModule,
    AsyncPipe,
    ReactiveFormsModule,
    FormsModule,
    CurrencyPipe,
    MatCardModule,
    MatSelectModule,
    MatFormFieldModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatOptionModule,
    PlannedVsSpentMeterComponent,
    SummaryHeaderCardComponent
  ],
  templateUrl: './planning.page.html',
  styleUrls: ['./planning.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlanningPage {
  private readonly planningService = inject(PlanningService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  /** Mês inicial: `?month=yyyy-mm` da URL ou o mês atual. */
  private readonly selectedMonthSubject = new BehaviorSubject<YearMonth>(this.getInitialMonth());
  private readonly errorSubject = new BehaviorSubject<string | null>(null);
  private readonly loadingSubject = new BehaviorSubject<boolean>(true);
  private readonly reloadSubject = new Subject<void>();

  readonly selectedMonth$ = this.selectedMonthSubject.pipe(
    distinctUntilChanged((a, b) => YearMonthUtils.equals(a, b))
  );

  readonly months$: Observable<YearMonth[]> = this.planningService.getAvailableMonths().pipe(
    catchError(() => {
      this.errorSubject.next('Erro ao carregar lista de meses disponíveis');
      return of([]);
    }),
    shareReplay(1)
  );

  readonly plan$: Observable<MonthlyPlan | null> = combineLatest([
    this.selectedMonth$,
    this.reloadSubject.pipe(startWith(undefined))
  ]).pipe(
    map(([month]) => month),
    tap(() => {
      this.loadingSubject.next(true);
      this.errorSubject.next(null);
    }),
    switchMap(month =>
      this.planningService.getMonthlyPlan(month).pipe(
        catchError(() => {
          this.errorSubject.next(`Não há dados de planejamento para ${YearMonthUtils.toLongLabel(month)}`);
          return of(null);
        }),
        finalize(() => this.loadingSubject.next(false))
      )
    ),
    shareReplay(1)
  );

  readonly cards$: Observable<PlanCard[]> = this.plan$.pipe(map(plan => plan?.cards ?? []));
  readonly plannedTotal$ = this.plan$.pipe(map(plan => plan ? PlanningUtils.getTotalPlanned(plan) : 0));
  readonly spentTotal$ = this.plan$.pipe(map(plan => plan ? PlanningUtils.getTotalSpent(plan) : 0));
  readonly remaining$ = combineLatest([this.plannedTotal$, this.spentTotal$]).pipe(
    map(([planned, spent]) => planned - spent)
  );

  readonly isLoading$ = this.loadingSubject.asObservable();
  readonly error$ = this.errorSubject.asObservable();

  // Event Handlers
  onMonthSelected(month: YearMonth): void {
    this.selectedMonthSubject.next(month);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { month: YearMonthUtils.toKey(month) },
      replaceUrl: true
    });
  }

  onCardClick(card: PlanCard): void {
    this.router.navigate(['/planejamentos', card.id], {
      queryParams: { month: YearMonthUtils.toKey(this.selectedMonthSubject.value) }
    });
  }

  retryLoad(): void {
    this.reloadSubject.next();
  }

  private getInitialMonth(): YearMonth {
    return YearMonthUtils.parseKey(this.route.snapshot.queryParamMap.get('month'))
      ?? this.planningService.getCurrentMonth();
  }

  // Template Helper Methods
  getMonthLabel(month: YearMonth): string {
    return YearMonthUtils.toShortLabel(month);
  }

  getSelectedMonthLabel(): string {
    const currentMonth = this.selectedMonthSubject.value;
    return YearMonthUtils.toLongLabel(currentMonth);
  }

  trackByCardId(index: number, card: PlanCard): string {
    return card.id;
  }

  // Card Utility Methods
  getCardStatus(card: PlanCard): PlanCardStatus {
    return PlanningUtils.getCardStatus(card);
  }

  getCardStatusClass(card: PlanCard): string {
    const status = this.getCardStatus(card);
    return `card-${status}`;
  }

  getCardProgress(card: PlanCard): number {
    return PlanningUtils.getCardProgress(card);
  }

  getRealValue(card: PlanCard): number {
    return PlanningUtils.getRealValue(card);
  }

  getCardExcess(card: PlanCard): number {
    return PlanningUtils.getCardExcess(card);
  }

  // Summary Methods - removidos pois agora estão no componente reutilizável
  // getRemaining() e getRemainingClass() não são mais necessários

  // Accessibility Methods
  onCardKeydown(event: KeyboardEvent, card: PlanCard): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.onCardClick(card);
    }
  }

  getCardAriaLabel(card: PlanCard): string {
    const status = this.getCardStatus(card);
    const realValue = this.getRealValue(card);
    const progress = Math.round(this.getCardProgress(card) * 100);
    
    let statusText = '';
    switch (status) {
      case 'ok':
        statusText = 'dentro do planejado';
        break;
      case 'limit':
        statusText = 'próximo ao limite';
        break;
      case 'over':
        statusText = 'excedeu o planejado';
        break;
    }

    return `${card.title}, ${progress}% utilizado, valor real ${formatBRL(realValue)}, ${statusText}`;
  }

  // Compare function for mat-select
  compareYearMonths(a: YearMonth, b: YearMonth): boolean {
    if (!a || !b) return false;
    return YearMonthUtils.equals(a, b);
  }
}