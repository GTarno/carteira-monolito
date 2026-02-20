import { Component, Input, Output, EventEmitter, OnInit, OnChanges, AfterViewInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { ChartService } from '../../../core/services/chart.service';
import { BaseChartConfig, ChartInteractionEvent, TrendData } from '../../types/chart.types';

@Component({
  selector: 'app-line-chart',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  template: `
    <div class="line-chart-container">
      <h3 *ngIf="title">{{ title }}</h3>
      
      <div *ngIf="showMetrics && trendData" class="metrics-display">
        <div class="metric-item" *ngFor="let dataset of trendData.datasets">
          <span class="metric-color" [style.background-color]="dataset.color"></span>
          <span class="metric-label">{{ dataset.label }}:</span>
          <span class="metric-value">
            R$ {{ getDatasetAverage(dataset.data).toLocaleString('pt-BR') }}
            <small>(média)</small>
          </span>
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
          [disabled]="!trendData || !trendData.datasets || trendData.datasets.length === 0">
          {{ actionLabel }}
        </button>
      </div>
    </div>
  `,
  styleUrls: ['./line-chart.component.scss']
})
export class LineChartComponent implements BaseChartConfig, OnInit, OnChanges, AfterViewInit, OnDestroy {
  @Input() trendData: TrendData | null = null;
  @Input() title?: string;
  @Input() height: string = '400px';
  @Input() showLegend: boolean = true;
  @Input() showMetrics: boolean = true;
  @Input() showActions: boolean = false;
  @Input() actionLabel: string = 'Adicionar Série';

  @Output() chartClick = new EventEmitter<ChartInteractionEvent>();
  @Output() chartHover = new EventEmitter<ChartInteractionEvent>();
  @Output() actionClick = new EventEmitter<void>();

  @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;
  @ViewChild('chartContainer') chartContainer: ElementRef | undefined;

  public chartData: ChartData<'line'> = { labels: [], datasets: [] };
  public chartOptions: ChartOptions<'line'> = {};
  public chartType = 'line' as const;
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
    if (this.trendData && this.trendData.labels && this.trendData.datasets) {
      const config = this.chartService.generateTrendLineChart(
        this.trendData.labels,
        this.trendData.datasets
      );
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

  public getDatasetAverage(data: number[]): number {
    if (!data || data.length === 0) return 0;
    const sum = data.reduce((acc, val) => acc + val, 0);
    return sum / data.length;
  }

  public getTrendDirection(data: number[]): 'up' | 'down' | 'stable' {
    if (!data || data.length < 2) return 'stable';
    const first = data[0];
    const last = data[data.length - 1];
    const threshold = 0.05; // 5% change threshold
    
    const change = (last - first) / first;
    if (change > threshold) return 'up';
    if (change < -threshold) return 'down';
    return 'stable';
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