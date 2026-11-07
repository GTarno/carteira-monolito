import { Component, ChangeDetectionStrategy, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule, CurrencyPipe, AsyncPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { BehaviorSubject, Observable, combineLatest, of } from 'rxjs';
import { switchMap, map, catchError, shareReplay, startWith, filter, take, finalize } from 'rxjs/operators';

import { PlanningService } from '../../data-access/planning.service';
import { PlanItemDetail, getBudgetStatus } from '../../models/planning.models';
import { PlanningItemUpdate, EditPlanningItemDialogData } from '../../models/planning-item-update.model';
import { YearMonth, YearMonthUtils } from '../../models/year-month.models';
import { ItemMonthlyTrend } from '../../models/item-monthly-trend.model';
import { SummaryHeaderCardComponent, HeaderStatus } from '../../../../shared/components/summary-header-card/summary-header-card.component';
import { LineChartComponent } from '../../../../shared/components/line-chart/line-chart.component';
import { EditPlanningItemDialogComponent } from '../../ui/edit-planning-item-dialog/edit-planning-item-dialog.component';
import { TrendData } from '../../../../shared/types/chart.types';

type ItemStatus = 'ok' | 'limit' | 'over' | 'default';

const STATUS_COLORS: Record<ItemStatus, string> = {
  ok: '#4caf50',
  limit: '#ff9800',
  over: '#f44336',
  default: '#1976d2'
};

@Component({
  selector: 'app-planning-item-detail',
  standalone: true,
  imports: [
    CommonModule,
    AsyncPipe,
    CurrencyPipe,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatDialogModule,
    MatSnackBarModule,
    SummaryHeaderCardComponent,
    LineChartComponent
  ],
  templateUrl: './planning-item-detail.page.html',
  styleUrls: ['./planning-item-detail.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlanningItemDetailPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly planningService = inject(PlanningService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly destroyRef = inject(DestroyRef);

  readonly categoryId = this.route.snapshot.paramMap.get('categoryId') ?? '';
  readonly itemId = this.route.snapshot.paramMap.get('itemId') ?? '';
  readonly month: YearMonth = YearMonthUtils.parseKey(this.route.snapshot.queryParamMap.get('month'))
    ?? this.planningService.getCurrentMonth();

  private readonly errorSubject = new BehaviorSubject<string | null>(null);
  private readonly loadingSubject = new BehaviorSubject<boolean>(true);
  readonly error$ = this.errorSubject.asObservable();
  readonly isLoading$ = this.loadingSubject.asObservable();

  /** Recarrega quando itens desta categoria/mês mudam (ex.: após editar). */
  private readonly refresh$ = this.planningService.itemsChanged$.pipe(
    filter(change => change.categoryId === this.categoryId && YearMonthUtils.equals(change.month, this.month)),
    startWith(null)
  );

  readonly item$: Observable<PlanItemDetail | null> = this.refresh$.pipe(
    switchMap(() => this.planningService.getItemById(this.month, this.categoryId, this.itemId).pipe(
      map(item => {
        this.errorSubject.next(item ? null : 'Item não encontrado neste mês.');
        return item;
      }),
      catchError(() => {
        this.errorSubject.next('Erro ao carregar item.');
        return of(null);
      }),
      finalize(() => this.loadingSubject.next(false))
    )),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  readonly categoryInfo$: Observable<{ title: string; icon: string } | null> =
    this.planningService.getMonthlyPlan(this.month).pipe(
      map(plan => {
        const card = plan.cards.find(c => c.id === this.categoryId);
        return card ? { title: card.title, icon: card.icon } : null;
      }),
      catchError(() => of(null)),
      shareReplay({ bufferSize: 1, refCount: true })
    );

  readonly trend$: Observable<ItemMonthlyTrend[]> = this.refresh$.pipe(
    switchMap(() => this.planningService.getItemTrend(this.categoryId, this.itemId, this.month)),
    catchError(() => of([])),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  readonly totalPlanned$ = this.item$.pipe(map(item => item?.plannedValue ?? 0));
  readonly totalSpent$ = this.item$.pipe(map(item => item?.realValue ?? 0));
  readonly remaining$ = combineLatest([this.totalPlanned$, this.totalSpent$]).pipe(
    map(([planned, spent]) => planned - spent)
  );

  private readonly itemStatus$: Observable<ItemStatus> = this.item$.pipe(
    map(item => this.getItemStatus(item)),
    startWith('default' as ItemStatus)
  );

  readonly headerStatus$: Observable<HeaderStatus> = this.itemStatus$.pipe(map(status => status as HeaderStatus));
  readonly statusConfig$ = this.itemStatus$.pipe(map(status => this.getStatusConfig(status)));

  readonly chartData$: Observable<TrendData> = combineLatest([this.trend$, this.itemStatus$]).pipe(
    map(([trend, status]) => this.toChartData(trend, status))
  );

  private toChartData(trend: ItemMonthlyTrend[], status: ItemStatus): TrendData {
    return {
      labels: trend.map(point => YearMonthUtils.toShortLabel(YearMonthUtils.fromKey(point.month))),
      datasets: trend.length === 0 ? [] : [{
        label: 'Valor Gasto',
        data: trend.map(point => point.value),
        color: STATUS_COLORS[status]
      }]
    };
  }

  // Navigation Methods
  goBack(): void {
    this.router.navigate(['/planejamentos', this.categoryId], {
      queryParams: { month: YearMonthUtils.toKey(this.month) }
    });
  }

  // Template Helper Methods
  getMonthLabel(): string {
    return YearMonthUtils.toLongLabel(this.month);
  }

  getItemIcon(item: PlanItemDetail | null): string {
    return item?.icon || 'receipt';
  }

  getItemName(item: PlanItemDetail | null): string {
    return item?.name || 'Item';
  }

  // Edit Dialog
  onEditClick(): void {
    this.item$.pipe(
      take(1),
      filter((item): item is PlanItemDetail => !!item),
      switchMap(item => {
        const data: EditPlanningItemDialogData = {
          itemName: item.name,
          plannedValue: item.plannedValue,
          realValue: item.realValue
        };
        return this.dialog.open(EditPlanningItemDialogComponent, {
          data,
          width: '450px',
          maxWidth: '95vw',
          autoFocus: true,
          restoreFocus: true
        }).afterClosed();
      }),
      filter((update): update is PlanningItemUpdate => !!update),
      switchMap(update => this.planningService.updateItemValues(this.month, this.categoryId, this.itemId, update)),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      // Os dados são recarregados automaticamente via itemsChanged$
      next: () => this.snackBar.open('Item atualizado com sucesso!', 'Fechar', { duration: 3000 }),
      error: () => this.snackBar.open('Erro ao atualizar item. Tente novamente.', 'Fechar', { duration: 5000 })
    });
  }

  // Status Helper Methods
  private getItemStatus(item: PlanItemDetail | null): ItemStatus {
    if (!item || item.plannedValue <= 0) return 'default';
    return getBudgetStatus(item.plannedValue, item.realValue);
  }

  private getStatusConfig(status: ItemStatus): {icon: string; label: string; className: string} {
    switch (status) {
      case 'ok':
        return {
          icon: 'check_circle',
          label: 'Dentro do orçamento',
          className: 'status-ok'
        };
      case 'limit':
        return {
          icon: 'warning',
          label: 'Próximo do limite',
          className: 'status-limit'
        };
      case 'over':
        return {
          icon: 'error',
          label: 'Acima do orçamento',
          className: 'status-over'
        };
      default:
        return {
          icon: 'help',
          label: 'Carregando...',
          className: 'status-default'
        };
    }
  }
}