import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, CurrencyPipe, AsyncPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { Observable, EMPTY, combineLatest, of } from 'rxjs';
import { switchMap, map, catchError, shareReplay, startWith, filter, take } from 'rxjs/operators';

import { PlanningService } from '../../data-access/planning.service';
import { PlanItemDetail, PlanCardStatus, PlanningUtils } from '../../models/planning.models';
import { PlanningItemUpdate, EditPlanningItemDialogData } from '../../models/planning-item-update.model';
import { YearMonth, YearMonthUtils } from '../../models/year-month.models';
import { ItemMonthlyTrend } from '../../models/item-monthly-trend.model';
import { SummaryHeaderCardComponent, HeaderStatus } from '../../../../shared/components/summary-header-card/summary-header-card.component';
import { LineChartComponent } from '../../../../shared/components/line-chart/line-chart.component';
import { EditPlanningItemDialogComponent } from '../../ui/edit-planning-item-dialog/edit-planning-item-dialog.component';
import { TrendData } from '../../../../shared/types/chart.types';

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
export class PlanningItemDetailPage implements OnInit, OnDestroy {
  
  categoryId!: string;
  itemId!: string;
  month!: YearMonth;
  
  item$!: Observable<PlanItemDetail | null>;
  categoryInfo$!: Observable<{ title: string; icon: string } | null>;
  trend$!: Observable<ItemMonthlyTrend[]>;
  chartData$!: Observable<TrendData>;
  
  // Observables para o summary header
  totalPlanned$!: Observable<number>;
  totalSpent$!: Observable<number>;
  remaining$!: Observable<number>;
  headerStatus$!: Observable<HeaderStatus>;
  statusConfig$!: Observable<{icon: string; label: string; className: string}>;
  
  isLoading$!: Observable<boolean>;
  error$: Observable<string | null> = EMPTY;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private planningService: PlanningService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    // Extrair parâmetros da rota
    this.categoryId = this.route.snapshot.paramMap.get('categoryId') || '';
    this.itemId = this.route.snapshot.paramMap.get('itemId') || '';
    const monthParam = this.route.snapshot.queryParamMap.get('month');
    
    if (monthParam) {
      this.month = YearMonthUtils.fromKey(monthParam);
    } else {
      this.month = this.planningService.getCurrentMonth();
    }

    console.log('PlanningItemDetailPage init:', {
      categoryId: this.categoryId,
      itemId: this.itemId,
      month: YearMonthUtils.toShortLabel(this.month)
    });

    // Configurar observables
    this.setupObservables();
    
    // Escutar mudanças do service para atualizar os dados
    this.planningService.itemsChanged$.pipe(
      filter(change => 
        !!change && 
        change.categoryId === this.categoryId &&
        YearMonthUtils.toKey(change.month) === YearMonthUtils.toKey(this.month)
      )
    ).subscribe(() => {
      // Reconfigurar observables quando houver mudanças
      this.setupObservables();
    });
  }

  ngOnDestroy(): void {
    // Cleanup automático pelos observables
  }

  private setupObservables(): void {
    // Carregar item específico
    this.item$ = this.planningService.getItemById(this.month, this.categoryId, this.itemId).pipe(
      catchError(error => {
        console.error('Erro ao carregar item:', error);
        this.error$ = of(error.message || 'Erro ao carregar item');
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
        return of(null);
      }),
      shareReplay(1)
    );

    // Carregar tendência do item
    this.trend$ = this.planningService.getItemTrend(this.categoryId, this.itemId).pipe(
      catchError(error => {
        console.error('Erro ao carregar tendência:', error);
        return of([]);
      }),
      shareReplay(1)
    );

    // Observables para cálculos do summary
    this.totalPlanned$ = this.item$.pipe(
      map(item => item?.plannedValue || 0),
      startWith(0)
    );

    this.totalSpent$ = this.item$.pipe(
      map(item => item?.realValue || 0),
      startWith(0)
    );

    this.remaining$ = combineLatest([
      this.totalPlanned$,
      this.totalSpent$
    ]).pipe(
      map(([planned, spent]) => planned - spent)
    );

    // Status para cores do header
    this.headerStatus$ = this.item$.pipe(
      map(item => {
        if (!item) return 'default' as HeaderStatus;
        const status = PlanningUtils.getItemStatus(item.plannedValue, item.realValue);
        return status as HeaderStatus;
      }),
      startWith('default' as HeaderStatus)
    );

    // Dados do gráfico
    this.chartData$ = combineLatest([
      this.trend$,
      this.headerStatus$
    ]).pipe(
      map(([trends, status]) => this.transformToChartData(trends, status))
    );

    // Configuração do status para o badge
    this.statusConfig$ = this.item$.pipe(
      map(item => {
        if (!item) return this.getStatusConfig('default');
        const status = this.getItemStatus(item.plannedValue, item.realValue);
        return this.getStatusConfig(status);
      }),
      startWith(this.getStatusConfig('default'))
    );

    // Loading state
    this.isLoading$ = combineLatest([
      this.item$.pipe(map(() => false)).pipe(catchError(() => of(false))),
      this.trend$.pipe(map(() => false)).pipe(catchError(() => of(false)))
    ]).pipe(
      map(() => false) // Simplified loading state
    );
  }

  private transformToChartData(trends: ItemMonthlyTrend[], status: HeaderStatus): TrendData {
    if (!trends || trends.length === 0) {
      return {
        labels: [],
        datasets: []
      };
    }

    // Converter mês para formato legível
    const labels = trends.map(trend => {
      const [year, month] = trend.month.split('-');
      const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
                         'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      return `${monthNames[parseInt(month) - 1]}/${year}`;
    });

    // Definir cor baseada no status
    let color: string;
    switch (status) {
      case 'ok':
        color = '#4caf50';
        break;
      case 'limit':
        color = '#ff9800';
        break;
      case 'over':
        color = '#f44336';
        break;
      default:
        color = '#1976d2';
    }

    return {
      labels,
      datasets: [
        {
          label: 'Valor Gasto',
          data: trends.map(trend => trend.value),
          color: color
        }
      ]
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

  // Chart event handlers
  onChartClick(event: any): void {
    console.log('Chart clicked:', event);
  }

  onChartHover(event: any): void {
    // Optional: handle chart hover
  }

  // Edit Dialog Methods
  onEditClick(): void {
    // Obter dados atuais do item para o dialog
    this.item$.pipe(
      filter(item => !!item),
      take(1)
    ).subscribe(item => {
      if (item) {
        this.openEditDialog(item);
      }
    });
  }

  private openEditDialog(item: PlanItemDetail): void {
    const dialogData: EditPlanningItemDialogData = {
      itemName: item.name,
      plannedValue: item.plannedValue,
      realValue: item.realValue
    };

    const dialogRef = this.dialog.open(EditPlanningItemDialogComponent, {
      data: dialogData,
      width: '450px',
      maxWidth: '95vw',
      disableClose: false,
      autoFocus: true,
      restoreFocus: true
    });

    // Escutar resultado do dialog
    dialogRef.afterClosed().pipe(
      filter(Boolean), // Só prossegue se houve resultado (não cancelou)
      take(1)
    ).subscribe((update: PlanningItemUpdate) => {
      this.saveItemUpdate(update);
    });
  }

  private saveItemUpdate(update: PlanningItemUpdate): void {
    console.log('Saving item update:', {
      categoryId: this.categoryId,
      itemId: this.itemId,
      month: YearMonthUtils.toShortLabel(this.month),
      update
    });

    this.planningService.updateItemValues(
      this.month,
      this.categoryId,
      this.itemId,
      update
    ).subscribe({
      next: (updatedItem) => {
        console.log('Item updated successfully:', updatedItem);
        
        // Mostrar feedback de sucesso
        this.snackBar.open(
          'Item atualizado com sucesso!',
          'Fechar',
          {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom'
          }
        );

        // Os observables serão atualizados automaticamente
        // devido ao BehaviorSubject no service
      },
      error: (error) => {
        console.error('Erro ao atualizar item:', error);
        
        // Mostrar feedback de erro
        this.snackBar.open(
          'Erro ao atualizar item. Tente novamente.',
          'Fechar',
          {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom'
          }
        );
      }
    });
  }

  // Status Helper Methods
  private getItemStatus(plannedValue: number, realValue: number): 'ok' | 'limit' | 'over' | 'default' {
    if (plannedValue <= 0) return 'default';
    
    const ratio = realValue / plannedValue;
    
    if (ratio <= 0.9) {
      return 'ok'; // <= 90%
    } else if (ratio <= 1.0) {
      return 'limit'; // > 90% e <= 100%
    } else {
      return 'over'; // > 100%
    }
  }

  private getStatusConfig(status: 'ok' | 'limit' | 'over' | 'default'): {icon: string; label: string; className: string} {
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