import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule, CurrencyPipe, AsyncPipe } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatOptionModule } from '@angular/material/core';

import { BehaviorSubject, Observable, combineLatest, EMPTY } from 'rxjs';
import { switchMap, map, catchError, startWith, shareReplay, distinctUntilChanged } from 'rxjs/operators';

import { PlanningService } from './data-access/planning.service';
import { PlanCard, MonthlyPlan, PlanCardStatus, PlanningUtils } from './models/planning.models';
import { YearMonth, YearMonthUtils } from './models/year-month.models';
import { PlannedVsSpentMeterComponent } from './ui/planned-vs-spent-meter/planned-vs-spent-meter.component';

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
    PlannedVsSpentMeterComponent
  ],
  templateUrl: './planning.page.html',
  styleUrls: ['./planning.page.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class PlanningPage implements OnInit, OnDestroy {
  // State Management - Garantir que fev/2026 seja o padrão
  private selectedMonthSubject = new BehaviorSubject<YearMonth>({
    year: 2026,
    month: 2
  });
  private errorSubject = new BehaviorSubject<string | null>(null);

  // Public Observables  
  selectedMonth$ = this.selectedMonthSubject.asObservable().pipe(
    distinctUntilChanged((a, b) => YearMonthUtils.equals(a, b))
  );

months$!: Observable<YearMonth[]>;
  plan$!: Observable<MonthlyPlan>;

  cards$!: Observable<PlanCard[]>;
  plannedTotal$!: Observable<number>;
  spentTotal$!: Observable<number>;
  isLoading$!: Observable<boolean>;

  error$ = this.errorSubject.asObservable();

  // Computed values for template
  private currentPlan: MonthlyPlan | null = null;
  private currentPlannedTotal = 0;
  private currentSpentTotal = 0;

  constructor(private planningService: PlanningService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    console.log('PlanningPage ngOnInit called');
    
    // Inicializar observables após injeção de dependência
    this.months$ = this.planningService.getAvailableMonths().pipe(
      catchError(error => {
        console.error('Erro ao carregar meses:', error);
        this.errorSubject.next('Erro ao carregar lista de meses disponíveis');
        return EMPTY;
      }),
      shareReplay(1)
    );

    this.plan$ = this.selectedMonth$.pipe(
      switchMap(month => 
        this.planningService.getMonthlyPlan(month).pipe(
          catchError(error => {
            console.error('Erro ao carregar plano:', error);
            this.errorSubject.next(`Erro ao carregar dados para ${YearMonthUtils.toShortLabel(month)}`);
            return EMPTY;
          })
        )
      ),
      shareReplay(1)
    );

    this.cards$ = this.plan$.pipe(
      map(plan => plan?.cards || [])
    );

    this.plannedTotal$ = this.plan$.pipe(
      map(plan => plan ? PlanningUtils.getTotalPlanned(plan) : 0),
      startWith(0)
    );

    this.spentTotal$ = this.plan$.pipe(
      map(plan => plan ? PlanningUtils.getTotalSpent(plan) : 0),
      startWith(0)
    );

    this.isLoading$ = combineLatest([
      this.months$.pipe(startWith(null)),
      this.plan$.pipe(startWith(null))
    ]).pipe(
      map(([months, plan]) => {
        console.log('Loading state:', { months: !!months, plan: !!plan });
        return false; // Simplificando para sempre mostrar conteúdo
      })
    );
    
    // Subscribe to updates for template methods
    this.plan$.subscribe(plan => {
      console.log('Plan received:', plan);
      this.currentPlan = plan;
      this.cdr.detectChanges();
    });

    this.plannedTotal$.subscribe(total => {
      console.log('Planned total:', total);
      this.currentPlannedTotal = total;
    });

    this.spentTotal$.subscribe(total => {
      console.log('Spent total:', total);
      this.currentSpentTotal = total;
    });

    this.months$.subscribe(months => {
      console.log('Months received:', months);
    });

    // Clear any existing errors
    this.errorSubject.next(null);
  }

  ngOnDestroy(): void {
    this.selectedMonthSubject.complete();
    this.errorSubject.complete();
  }

  // Event Handlers
  onMonthSelected(month: YearMonth): void {
    this.errorSubject.next(null); // Clear previous errors
    this.selectedMonthSubject.next(month);
  }

  onCardClick(card: PlanCard): void {
    const currentMonth = this.selectedMonthSubject.value;
    console.log('Card clicked:', {
      cardId: card.id,
      cardTitle: card.title,
      month: YearMonthUtils.toShortLabel(currentMonth),
      status: this.getCardStatus(card),
      realValue: this.getRealValue(card),
      plannedValue: card.plannedValue
    });

    // TODO: Implementar navegação para detalhes do card
    // this.router.navigate(['/card-details', card.id], { 
    //   queryParams: { month: YearMonthUtils.toKey(currentMonth) }
    // });
  }

  retryLoad(): void {
    this.errorSubject.next(null);
    // Force reload by re-emitting current month
    const currentMonth = this.selectedMonthSubject.value;
    this.selectedMonthSubject.next({ ...currentMonth });
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

  // Summary Methods
  getRemaining(): number {
    return this.currentPlannedTotal - this.currentSpentTotal;
  }

  getRemainingClass(): string {
    const remaining = this.getRemaining();
    if (remaining < 0) return 'negative';
    if (remaining > 0) return 'positive';
    return '';
  }

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

    return `${card.title}, ${progress}% utilizado, valor real ${realValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}, ${statusText}`;
  }

  // Compare function for mat-select
  compareYearMonths(a: YearMonth, b: YearMonth): boolean {
    if (!a || !b) return false;
    return YearMonthUtils.equals(a, b);
  }
}