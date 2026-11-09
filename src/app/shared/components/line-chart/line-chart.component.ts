import { ChangeDetectionStrategy, Component, ElementRef, computed, inject, input } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { ThemeService } from '../../../core/theme/theme.service';
import { CHART_CHROME, cartesianOptions, chartModeAt, seriesColor, withAlpha } from '../../charts/chart-palette';
import { TrendData } from '../../types/chart.types';

interface SeriesMetric {
  label: string;
  color: string;
  average: number;
}

/**
 * Linhas de tendência. Com uma série, preenche a área abaixo da linha; com várias,
 * só linhas (áreas sobrepostas escondem dados).
 */
@Component({
  selector: 'app-line-chart',
  imports: [BaseChartDirective, CurrencyPipe],
  template: `
    <div class="flex h-full flex-col gap-4">
      @if (title()) {
        <h3 class="font-semibold">{{ title() }}</h3>
      }

      @if (showMetrics() && metrics().length) {
        <div class="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          @for (metric of metrics(); track metric.label) {
            <div class="flex items-center gap-2">
              <span class="size-2.5 rounded-full" [style.background-color]="metric.color" aria-hidden="true"></span>
              <span class="text-base-content/80">{{ metric.label }} (média):</span>
              <span class="font-semibold tabular-nums">{{ metric.average | currency }}</span>
            </div>
          }
        </div>
      }

      <div class="relative" [style.height]="height()">
        <canvas baseChart type="line" [data]="chartData()" [options]="chartOptions()" role="img" [attr.aria-label]="title() ?? 'Gráfico de linhas'"></canvas>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LineChartComponent {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly themeService = inject(ThemeService);

  readonly trendData = input<TrendData | null>(null);
  readonly title = input<string>();
  readonly height = input('300px');
  readonly showLegend = input(true);
  readonly showMetrics = input(true);

  private readonly mode = computed(() => {
    this.themeService.theme();
    return chartModeAt(this.host.nativeElement);
  });

  private readonly series = computed(() =>
    (this.trendData()?.datasets ?? []).map((dataset, index) => ({
      ...dataset,
      color: dataset.color ?? seriesColor(this.mode(), index)
    }))
  );

  protected readonly metrics = computed<SeriesMetric[]>(() =>
    this.series().map(series => ({
      label: series.label,
      color: series.color,
      average: series.data.length ? series.data.reduce((sum, value) => sum + value, 0) / series.data.length : 0
    }))
  );

  protected readonly chartData = computed<ChartData<'line'>>(() => {
    const single = this.series().length === 1;
    const surface = CHART_CHROME[this.mode()].surface;
    return {
      labels: this.trendData()?.labels ?? [],
      datasets: this.series().map(series => ({
        label: series.label,
        data: series.data,
        borderColor: series.color,
        backgroundColor: single ? withAlpha(series.color, 0.12) : series.color,
        fill: single,
        tension: 0.35,
        borderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: series.color,
        pointBorderColor: surface,
        pointBorderWidth: 2
      }))
    };
  });

  protected readonly chartOptions = computed(() => {
    // Com as médias visíveis, elas já servem de legenda (cor + nome); evita legenda duplicada
    const showLegend = this.showLegend() && this.series().length > 1 && !this.showMetrics();
    return cartesianOptions(this.mode(), showLegend) as ChartOptions<'line'>;
  });
}
