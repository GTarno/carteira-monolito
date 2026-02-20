import { Component, Input, Output, EventEmitter, OnInit, OnChanges, AfterViewInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { ChartService } from '../../../core/services/chart.service';
import { BaseChartConfig, ChartInteractionEvent, ExpenseCategory } from '../../types/chart.types';

@Component({
  selector: 'app-doughnut-chart',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  template: `
    <div class="doughnut-chart-container">
      <h3 *ngIf="title">{{ title }}</h3>
      
      <div *ngIf="showTotal" class="total-display">
        Total: R$ {{ getTotal().toLocaleString('pt-BR') }}
      </div>
      
      <div class="chart-wrapper" [style.height]="height" #chartContainer>
        <canvas 
          baseChart 
          [data]="chartData" 
          [type]="chartType"
          [options]="chartOptions"
          (chartClick)="onChartClick($event)"
          (chartHover)="onChartHover($event)">
        </canvas>
      </div>
      
      <div *ngIf="showActions" class="chart-actions">
        <button 
          (click)="onActionClick()" 
          class="action-btn"
          [disabled]="!data || data.length === 0">
          {{ actionLabel }}
        </button>
      </div>
    </div>
  `,
  styleUrls: ['./doughnut-chart.component.scss']
})
export class DoughnutChartComponent implements BaseChartConfig, OnInit, OnChanges, AfterViewInit, OnDestroy {
  @Input() data: ExpenseCategory[] = [];
  @Input() title?: string;
  @Input() height: string = '400px';
  @Input() showLegend: boolean = true;
  @Input() showTotal: boolean = true;
  @Input() showActions: boolean = false;
  @Input() actionLabel: string = 'Adicionar Item';

  @Output() chartClick = new EventEmitter<ChartInteractionEvent>();
  @Output() chartHover = new EventEmitter<ChartInteractionEvent>();
  @Output() actionClick = new EventEmitter<void>();

  @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;
  @ViewChild('chartContainer') chartContainer: ElementRef | undefined;

  public chartData: ChartData<'doughnut'> = { labels: [], datasets: [] };
  public chartOptions: ChartOptions<'doughnut'> = {};
  public chartType = 'doughnut' as const;
  private resizeObserver?: ResizeObserver;
  private resizeTimeout?: any;

  constructor(private chartService: ChartService) {}

  ngOnInit(): void {
    this.updateChart();
  }

  ngOnChanges(): void {
    this.updateChart();
  }

  ngAfterViewInit(): void {
    this.setupResizeObserver();
    // Força redimensionamento inicial após um pequeno delay
    setTimeout(() => this.resizeChart(), 100);
  }

  ngOnDestroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }
  }

  private setupResizeObserver(): void {
    if (this.chartContainer && 'ResizeObserver' in window) {
      this.resizeObserver = new ResizeObserver((entries) => {
        if (this.resizeTimeout) {
          clearTimeout(this.resizeTimeout);
        }
        this.resizeTimeout = setTimeout(() => {
          this.resizeChart();
        }, 150);
      });
      this.resizeObserver.observe(this.chartContainer.nativeElement);
    }
  }

  private resizeChart(): void {
    if (this.chart && this.chart.chart) {
      this.chart.chart.resize();
    }
  }

  private updateChart(): void {
    if (this.data && this.data.length > 0) {
      const config = this.chartService.generateExpenseDoughnutChart(this.data);
      this.chartData = config.data;
      this.chartOptions = {
        ...config.options,
        responsive: true,
        maintainAspectRatio: false,
        aspectRatio: 0, // Remove qualquer ratio fixo
        plugins: {
          ...config.options.plugins,
          legend: {
            ...config.options.plugins?.legend,
            display: this.showLegend
          }
        }
      };
      // Força redimensionamento após atualizar opções
      setTimeout(() => this.resizeChart(), 50);
    }
  }

  public getTotal(): number {
    return this.chartService.calculateTotal(this.data);
  }

  public onChartClick(event: ChartInteractionEvent): void {
    this.chartClick.emit(event);
  }

  public onChartHover(event: ChartInteractionEvent): void {
    this.chartHover.emit(event);
  }

  public onActionClick(): void {
    this.actionClick.emit();
  }
}