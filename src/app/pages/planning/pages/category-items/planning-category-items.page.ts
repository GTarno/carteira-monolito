import { Component, ChangeDetectionStrategy, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule, CurrencyPipe, AsyncPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { BehaviorSubject, Observable, combineLatest, of } from 'rxjs';
import { switchMap, map, catchError, shareReplay, filter, startWith, finalize } from 'rxjs/operators';

import { PlanningService } from '../../data-access/planning.service';
import { PlanItemDetail, PlanCardStatus, PlanningUtils, PlanningItemCreate } from '../../models/planning.models';
import { formatBRL } from '../../../../core/i18n/locale';
import { YearMonth, YearMonthUtils } from '../../models/year-month.models';
import { AddPlanningItemDialogComponent } from '../../ui/add-planning-item-dialog/add-planning-item-dialog.component';
import { SummaryHeaderCardComponent } from '../../../../shared/components/summary-header-card/summary-header-card.component';

@Component({
  selector: 'app-planning-category-items',
  standalone: true,
  imports: [
    CommonModule,
    AsyncPipe,
    CurrencyPipe,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatSnackBarModule,
    SummaryHeaderCardComponent
  ],
  templateUrl: './planning-category-items.page.html',
  styleUrls: ['./planning-category-items.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlanningCategoryItemsPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly planningService = inject(PlanningService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly destroyRef = inject(DestroyRef);

  readonly categoryId = this.route.snapshot.paramMap.get('categoryId') ?? '';
  readonly month: YearMonth = YearMonthUtils.parseKey(this.route.snapshot.queryParamMap.get('month'))
    ?? this.planningService.getCurrentMonth();

  private readonly errorSubject = new BehaviorSubject<string | null>(null);
  private readonly loadingSubject = new BehaviorSubject<boolean>(true);
  readonly error$ = this.errorSubject.asObservable();
  readonly isLoading$ = this.loadingSubject.asObservable();

  /** Recarrega quando itens desta categoria/mês mudam (ex.: item adicionado). */
  private readonly refresh$ = this.planningService.itemsChanged$.pipe(
    filter(change => change.categoryId === this.categoryId && YearMonthUtils.equals(change.month, this.month)),
    startWith(null)
  );

  readonly items$: Observable<PlanItemDetail[] | null> = this.refresh$.pipe(
    switchMap(() => this.planningService.getItemsByCategory(this.month, this.categoryId).pipe(
      catchError(() => {
        this.errorSubject.next('Não foi possível carregar os itens desta categoria.');
        return of(null);
      }),
      finalize(() => this.loadingSubject.next(false))
    )),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  readonly categoryInfo$: Observable<{ title: string; icon: string } | null> = this.refresh$.pipe(
    switchMap(() => this.planningService.getMonthlyPlan(this.month)),
    map(plan => {
      const card = plan.cards.find(c => c.id === this.categoryId);
      return card ? { title: card.title, icon: card.icon } : null;
    }),
    catchError(() => of(null)),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  readonly totalPlanned$ = this.items$.pipe(
    map(items => (items ?? []).reduce((sum, item) => sum + item.plannedValue, 0))
  );

  readonly totalSpent$ = this.items$.pipe(
    map(items => (items ?? []).reduce((sum, item) => sum + item.realValue, 0))
  );

  readonly remaining$ = combineLatest([this.totalPlanned$, this.totalSpent$]).pipe(
    map(([planned, spent]) => planned - spent)
  );

  // Navigation Methods
  goBack(): void {
    this.router.navigate(['/planejamentos'], {
      queryParams: { month: YearMonthUtils.toKey(this.month) }
    });
  }

  addNewItem(): void {
    this.dialog.open(AddPlanningItemDialogComponent, {
      width: '600px',
      maxWidth: '90vw',
      autoFocus: true
    }).afterClosed().pipe(
      filter((payload): payload is PlanningItemCreate => !!payload),
      switchMap(payload => this.planningService.addCategoryItem(this.month, {
        ...payload,
        categoryId: this.categoryId
      })),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      // A lista é atualizada automaticamente via itemsChanged$
      next: item => this.snackBar.open(`"${item.name}" adicionado.`, 'Fechar', { duration: 3000 }),
      error: () => this.snackBar.open('Erro ao adicionar item. Tente novamente.', 'Fechar', { duration: 5000 })
    });
  }

  onItemClick(item: PlanItemDetail): void {
    this.router.navigate(['/planejamentos', this.categoryId, item.id], {
      queryParams: { month: YearMonthUtils.toKey(this.month) }
    });
  }

  // Template Helper Methods
  getMonthLabel(): string {
    return YearMonthUtils.toLongLabel(this.month);
  }

  trackByItemId(index: number, item: PlanItemDetail): string {
    return item.id;
  }

  // Item Utility Methods
  getItemStatus(item: PlanItemDetail): PlanCardStatus {
    return PlanningUtils.getItemStatus(item.plannedValue, item.realValue);
  }

  getItemStatusClass(item: PlanItemDetail): string {
    const status = this.getItemStatus(item);
    return `item-${status}`;
  }

  getItemProgress(item: PlanItemDetail): number {
    return PlanningUtils.getItemProgress(item.plannedValue, item.realValue);
  }

  getItemExcess(item: PlanItemDetail): number {
    return PlanningUtils.getItemExcess(item.plannedValue, item.realValue);
  }

  getItemIcon(item: PlanItemDetail): string {
    return item.icon || 'receipt';
  }

  getBadgeText(item: PlanItemDetail): string {
    const status = this.getItemStatus(item);
    switch (status) {
      case 'ok':
        return 'Dentro';
      case 'limit':
        return 'No limite';
      case 'over':
        return 'Excedeu';
      default:
        return 'Dentro';
    }
  }

  shouldShowExcess(item: PlanItemDetail): boolean {
    return this.getItemExcess(item) > 0;
  }

  shouldShowBadge(item: PlanItemDetail): boolean {
    const status = this.getItemStatus(item);
    return status === 'limit' || status === 'over';
  }

  // Accessibility Methods
  getItemAriaLabel(item: PlanItemDetail): string {
    const status = this.getItemStatus(item);
    const progress = Math.round(this.getItemProgress(item) * 100);
    
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

    return `${item.name}, ${progress}% utilizado, valor real ${formatBRL(item.realValue)}, ${statusText}`;
  }

  onItemKeydown(event: KeyboardEvent, item: PlanItemDetail): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.onItemClick(item);
    }
  }
}