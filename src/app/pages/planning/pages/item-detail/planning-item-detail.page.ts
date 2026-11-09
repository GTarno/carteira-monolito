import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, filter, finalize, map, of, startWith, switchMap, take } from 'rxjs';

import { PlanningService } from '../../data-access/planning.service';
import { PlanItemDetail } from '../../models/planning.models';
import { EditPlanningItemDialogData, PlanningItemUpdate } from '../../models/planning-item-update.model';
import { YearMonth, YearMonthUtils } from '../../models/year-month.models';
import { ItemMonthlyTrend } from '../../models/item-monthly-trend.model';
import { BudgetSummaryComponent } from '../../ui/budget-summary/budget-summary.component';
import { EditPlanningItemDialogComponent } from '../../ui/edit-planning-item-dialog/edit-planning-item-dialog.component';
import { LineChartComponent } from '../../../../shared/components/line-chart/line-chart.component';
import { TrendData } from '../../../../shared/types/chart.types';
import { AppDialog } from '../../../../shared/ui/dialog/app-dialog.service';
import { ToastService } from '../../../../shared/ui/toast/toast.service';
import { IconComponent } from '../../../../shared/ui/icon/icon.component';

/** Detalhe de um item do planejamento: valores do mês, edição e tendência de 12 meses. */
@Component({
  selector: 'app-planning-item-detail',
  imports: [RouterLink, BudgetSummaryComponent, LineChartComponent, IconComponent],
  templateUrl: './planning-item-detail.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlanningItemDetailPage {
  private readonly route = inject(ActivatedRoute);
  private readonly planningService = inject(PlanningService);
  private readonly dialog = inject(AppDialog);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  readonly categoryId = this.route.snapshot.paramMap.get('categoryId') ?? '';
  readonly itemId = this.route.snapshot.paramMap.get('itemId') ?? '';
  readonly month: YearMonth = YearMonthUtils.parseKey(this.route.snapshot.queryParamMap.get('month'))
    ?? this.planningService.getCurrentMonth();

  protected readonly monthKey = YearMonthUtils.toKey(this.month);
  protected readonly monthLabel = YearMonthUtils.toLongLabel(this.month);

  protected readonly loading = signal(true);

  /** Recarrega quando itens desta categoria/mês mudam (ex.: após editar). */
  private readonly refresh$ = this.planningService.itemsChanged$.pipe(
    filter(change => change.categoryId === this.categoryId && YearMonthUtils.equals(change.month, this.month)),
    startWith(null)
  );

  protected readonly item = toSignal(
    this.refresh$.pipe(
      switchMap(() => this.planningService.getItemById(this.month, this.categoryId, this.itemId).pipe(
        catchError(() => of(null)),
        finalize(() => this.loading.set(false))
      ))
    ),
    { initialValue: null as PlanItemDetail | null }
  );

  protected readonly category = toSignal(
    this.planningService.getMonthlyPlan(this.month).pipe(
      map(plan => plan.cards.find(card => card.id === this.categoryId) ?? null),
      catchError(() => of(null))
    ),
    { initialValue: null }
  );

  private readonly trend = toSignal(
    this.refresh$.pipe(
      switchMap(() => this.planningService.getItemTrend(this.categoryId, this.itemId, this.month)),
      catchError(() => of([] as ItemMonthlyTrend[]))
    ),
    { initialValue: [] as ItemMonthlyTrend[] }
  );

  protected readonly chartData = computed<TrendData>(() => {
    const trend = this.trend();
    return {
      labels: trend.map(point => YearMonthUtils.toShortLabel(YearMonthUtils.fromKey(point.month))),
      datasets: trend.length ? [{ label: 'Valor gasto', data: trend.map(point => point.value) }] : []
    };
  });

  onEdit(): void {
    const item = this.item();
    if (!item) return;

    const data: EditPlanningItemDialogData = {
      itemName: item.name,
      plannedValue: item.plannedValue,
      realValue: item.realValue
    };

    this.dialog.open<EditPlanningItemDialogComponent, EditPlanningItemDialogData, PlanningItemUpdate>(
      EditPlanningItemDialogComponent,
      { data, ariaLabel: `Editar ${item.name}` }
    ).closed.pipe(
      take(1),
      filter((update): update is PlanningItemUpdate => !!update),
      switchMap(update => this.planningService.updateItemValues(this.month, this.categoryId, this.itemId, update)),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      // Os dados são recarregados automaticamente via itemsChanged$
      next: () => this.toast.success('Item atualizado com sucesso!'),
      error: () => this.toast.error('Erro ao atualizar item. Tente novamente.')
    });
  }
}
