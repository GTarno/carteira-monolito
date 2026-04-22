import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, CurrencyPipe, AsyncPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { Observable, EMPTY, combineLatest } from 'rxjs';
import { switchMap, map, catchError, shareReplay, filter, take, startWith } from 'rxjs/operators';

import { PlanningService } from '../../data-access/planning.service';
import { PlanItemDetail, PlanCardStatus, PlanningUtils, PlanCard, PlanningItemCreate } from '../../models/planning.models';
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
    SummaryHeaderCardComponent
  ],
  templateUrl: './planning-category-items.page.html',
  styleUrls: ['./planning-category-items.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlanningCategoryItemsPage implements OnInit, OnDestroy {
  
  categoryId!: string;
  month!: YearMonth;
  
  items$!: Observable<PlanItemDetail[]>;
  categoryInfo$!: Observable<{ title: string; icon: string } | null>;
  isLoading$!: Observable<boolean>;
  error$: Observable<string | null> = EMPTY;

  // Observables para o summary header
  totalPlanned$!: Observable<number>;
  totalSpent$!: Observable<number>;
  remaining$!: Observable<number>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private planningService: PlanningService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    // Extrair parâmetros da rota
    this.categoryId = this.route.snapshot.paramMap.get('categoryId') || '';
    const monthParam = this.route.snapshot.queryParamMap.get('month');
    
    if (monthParam) {
      this.month = YearMonthUtils.fromKey(monthParam);
    } else {
      this.month = this.planningService.getCurrentMonth();
    }

    console.log('PlanningCategoryItemsPage init:', {
      categoryId: this.categoryId,
      month: YearMonthUtils.toShortLabel(this.month)
    });

    // Configurar observables
    this.setupObservables();
  }

  ngOnDestroy(): void {
    // Cleanup automático pelos observables
  }

  private setupObservables(): void {
    // Carregar itens da categoria com refresh automático quando há mudanças
    this.items$ = combineLatest([
      this.planningService.getItemsByCategory(this.month, this.categoryId),
      this.planningService.itemsChanged$.pipe(
        filter(change => !!change && 
          YearMonthUtils.equals(change.month, this.month) && 
          change.categoryId === this.categoryId
        ),
        startWith(null)
      )
    ]).pipe(
      switchMap(() => this.planningService.getItemsByCategory(this.month, this.categoryId)),
      catchError(error => {
        console.error('Erro ao carregar itens da categoria:', error);
        this.error$ = EMPTY; // Simplified error handling
        return EMPTY;
      }),
      shareReplay(1)
    );

    // Buscar informações da categoria no plano principal
    this.categoryInfo$ = this.planningService.getMonthlyPlan(this.month).pipe(
      map(plan => {
        const categoryCard = plan.cards.find(card => card.id === this.categoryId);
        if (categoryCard) {
          return {
            title: categoryCard.title,
            icon: categoryCard.icon
          };
        }
        return null;
      }),
      catchError(() => {
        console.warn('Não foi possível carregar informações da categoria');
        return EMPTY;
      }),
      shareReplay(1)
    );

    // Loading state
    this.isLoading$ = combineLatest([
      this.items$.pipe(map(() => false)).pipe(catchError(() => EMPTY)),
      this.categoryInfo$.pipe(map(() => false)).pipe(catchError(() => EMPTY))
    ]).pipe(
      map(() => false) // Simplified loading state
    );

    // Observables para cálculos do summary
    this.totalPlanned$ = this.items$.pipe(
      map(items => items.reduce((sum, item) => sum + item.plannedValue, 0)),
      startWith(0)
    );

    this.totalSpent$ = this.items$.pipe(
      map(items => items.reduce((sum, item) => sum + item.realValue, 0)),
      startWith(0)
    );

    this.remaining$ = combineLatest([
      this.totalPlanned$,
      this.totalSpent$
    ]).pipe(
      map(([planned, spent]) => planned - spent)
    );
  }

  // Navigation Methods
  goBack(): void {
    this.router.navigate(['/planejamentos'], {
      queryParams: { month: YearMonthUtils.toKey(this.month) }
    });
  }

  addNewItem(): void {
    const dialogRef = this.dialog.open(AddPlanningItemDialogComponent, {
      width: '600px',
      maxWidth: '90vw',
      disableClose: false,
      autoFocus: true
    });

    dialogRef.afterClosed().pipe(
      filter(Boolean),
      take(1)
    ).subscribe((payload: PlanningItemCreate) => {
      // Preencher categoryId no payload
      const completePayload: PlanningItemCreate = {
        ...payload,
        categoryId: this.categoryId
      };

      // Adicionar item via service
      this.planningService.addCategoryItem(this.month, completePayload).subscribe({
        next: (newItem) => {
          console.log('Item adicionado com sucesso:', newItem);
          // O refresh automático acontece via itemsChanged$ no setupObservables
        },
        error: (error) => {
          console.error('Erro ao adicionar item:', error);
          // TODO: Exibir mensagem de erro para o usuário
        }
      });
    });
  }

  onItemClick(item: PlanItemDetail): void {
    console.log('Item clicked:', {
      itemId: item.id,
      itemName: item.name,
      status: this.getItemStatus(item),
      realValue: item.realValue,
      plannedValue: item.plannedValue
    });
    
    // Navegar para a página de detalhes do item
    this.router.navigate(['/planejamentos', this.categoryId, item.id], {
      queryParams: { 
        month: YearMonthUtils.toKey(this.month)
      }
    });
  }

  // Template Helper Methods
  getMonthLabel(): string {
    return YearMonthUtils.toLongLabel(this.month);
  }

  getCategoryTitle(): string {
    // Método para obter o título da categoria, será usado no template
    return 'Categoria'; // Placeholder, será substituído pelo async pipe
  }

  getRemainingClass(): string {
    // Esta função será chamada pelo template usando async pipe
    // O cálculo real acontece via remaining$ observable
    return ''; // Será determinado no template via [class]
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

    return `${item.name}, ${progress}% utilizado, valor real ${item.realValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}, ${statusText}`;
  }

  onItemKeydown(event: KeyboardEvent, item: PlanItemDetail): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.onItemClick(item);
    }
  }
}