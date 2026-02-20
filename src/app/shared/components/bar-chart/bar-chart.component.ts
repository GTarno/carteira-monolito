import { Component, Input, Output, EventEmitter, OnInit, OnChanges, AfterViewInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { ChartService } from '../../../core/services/chart.service';
import { BaseChartConfig, ChartInteractionEvent, MonthlyBudget } from '../../types/chart.types';

@Component({
  selector: 'app-bar-chart',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  template: `
    <div class="bar-chart-container">
      <h3 *ngIf="title">{{ title }}</h3>
      
      <div *ngIf="showSummary" class="summary-display">
        <div class="summary-item">
          <span class="label">Média Gastos:</span>
          <span class="value">R$ {{ getAverageActual().toLocaleString('pt-BR') }}</span>
        </div>
        <div class="summary-item">
          <span class="label">Orçamento Médio:</span>
          <span class="value">R$ {{ getAverageBudget().toLocaleString('pt-BR') }}</span>
        </div>
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
  styleUrls: ['./bar-chart.component.scss']
})
export class BarChartComponent implements BaseChartConfig, OnInit, OnChanges, AfterViewInit, OnDestroy {
  @Input() data: MonthlyBudget[] = [];
  @Input() title?: string;
  @Input() height: string = '400px';
  @Input() showLegend: boolean = true;
  @Input() showSummary: boolean = true;
  @Input() showActions: boolean = false;
  @Input() actionLabel: string = 'Adicionar Mês';

  @Output() chartClick = new EventEmitter<ChartInteractionEvent>();
  @Output() chartHover = new EventEmitter<ChartInteractionEvent>();
  @Output() actionClick = new EventEmitter<void>();

  @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;
  @ViewChild('chartContainer') chartContainer: ElementRef | undefined;

  public chartData: ChartData<'bar'> = { labels: [], datasets: [] };
  public chartOptions: ChartOptions<'bar'> = {};
  public chartType = 'bar' as const;
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
      const config = this.chartService.generateMonthlyBarChart(this.data);
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

  public getAverageActual(): number {
    if (!this.data || this.data.length === 0) return 0;
    const total = this.data.reduce((sum, item) => sum + item.actual, 0);
    return total / this.data.length;
  }

  public getAverageBudget(): number {
    if (!this.data || this.data.length === 0) return 0;
    const total = this.data.reduce((sum, item) => sum + item.budget, 0);
    return total / this.data.length;
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