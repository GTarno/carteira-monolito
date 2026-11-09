import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, filter, finalize, map, of, startWith, switchMap } from 'rxjs';

import { PlanningService } from '../../data-access/planning.service';
import { PlanItemDetail, PlanningItemCreate } from '../../models/planning.models';
import { YearMonth, YearMonthUtils } from '../../models/year-month.models';
import { AddPlanningItemDialogComponent } from '../../ui/add-planning-item-dialog/add-planning-item-dialog.component';
import { BudgetSummaryComponent } from '../../ui/budget-summary/budget-summary.component';
import { BudgetCardComponent } from '../../ui/budget-card/budget-card.component';
import { AppDialog } from '../../../../shared/ui/dialog/app-dialog.service';
import { ToastService } from '../../../../shared/ui/toast/toast.service';
import { IconComponent } from '../../../../shared/ui/icon/icon.component';

/** Itens de uma categoria do planejamento no mês escolhido. */
@Component({
  selector: 'app-planning-category-items',
  imports: [RouterLink, BudgetSummaryComponent, BudgetCardComponent, IconComponent],
  templateUrl: './planning-category-items.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlanningCategoryItemsPage {
  private readonly route = inject(ActivatedRoute);
  private readonly planningService = inject(PlanningService);
  private readonly dialog = inject(AppDialog);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  readonly categoryId = this.route.snapshot.paramMap.get('categoryId') ?? '';
  readonly month: YearMonth = YearMonthUtils.parseKey(this.route.snapshot.queryParamMap.get('month'))
    ?? this.planningService.getCurrentMonth();

  protected readonly monthKey = YearMonthUtils.toKey(this.month);
  protected readonly monthLabel = YearMonthUtils.toLongLabel(this.month);

  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  /** Recarrega quando itens desta categoria/mês mudam (ex.: item adicionado). */
  private readonly refresh$ = this.planningService.itemsChanged$.pipe(
    filter(change => change.categoryId === this.categoryId && YearMonthUtils.equals(change.month, this.month)),
    startWith(null)
  );

  protected readonly items = toSignal(
    this.refresh$.pipe(
      switchMap(() => this.planningService.getItemsByCategory(this.month, this.categoryId).pipe(
        catchError(() => {
          this.error.set('Não foi possível carregar os itens desta categoria.');
          return of(null);
        }),
        finalize(() => this.loading.set(false))
      ))
    ),
    { initialValue: null as PlanItemDetail[] | null }
  );

  protected readonly category = toSignal(
    this.refresh$.pipe(
      switchMap(() => this.planningService.getMonthlyPlan(this.month)),
      map(plan => plan.cards.find(card => card.id === this.categoryId) ?? null),
      catchError(() => of(null))
    ),
    { initialValue: null }
  );

  protected readonly plannedTotal = computed(() => (this.items() ?? []).reduce((sum, item) => sum + item.plannedValue, 0));
  protected readonly spentTotal = computed(() => (this.items() ?? []).reduce((sum, item) => sum + item.realValue, 0));

  addNewItem(): void {
    this.dialog.open<AddPlanningItemDialogComponent, void, PlanningItemCreate>(AddPlanningItemDialogComponent, {
      ariaLabel: 'Adicionar item ao planejamento'
    }).closed.pipe(
      filter((payload): payload is PlanningItemCreate => !!payload),
      switchMap(payload => this.planningService.addCategoryItem(this.month, { ...payload, categoryId: this.categoryId })),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      // A lista é atualizada automaticamente via itemsChanged$
      next: item => this.toast.success(`"${item.name}" adicionado ao planejamento.`),
      error: () => this.toast.error('Erro ao adicionar item. Tente novamente.')
    });
  }
}
