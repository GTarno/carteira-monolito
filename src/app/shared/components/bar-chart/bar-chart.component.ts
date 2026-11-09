import { ChangeDetectionStrategy, Component, ElementRef, computed, inject, input } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { ThemeService } from '../../../core/theme/theme.service';
import { cartesianOptions, chartModeAt, seriesColor } from '../../charts/chart-palette';
import { MonthlyBudget } from '../../types/chart.types';

/** Barras agrupadas: gasto real vs orçamento por mês (um único eixo, em reais). */
@Component({
  selector: 'app-bar-chart',
  imports: [BaseChartDirective, CurrencyPipe],
  template: `
    <div class="flex h-full flex-col gap-4">
      @if (title()) {
        <h3 class="font-semibold">{{ title() }}</h3>
      }

      @if (showSummary()) {
        <div class="grid grid-cols-2 gap-3 text-sm">
          <div class="rounded-box bg-base-200 px-4 py-3">
            <div class="text-base-content/80">Média de gastos</div>
            <div class="text-lg font-semibold tabular-nums">{{ averageActual() | currency }}</div>
          </div>
          <div class="rounded-box bg-base-200 px-4 py-3">
            <div class="text-base-content/80">Orçamento médio</div>
            <div class="text-lg font-semibold tabular-nums">{{ averageBudget() | currency }}</div>
          </div>
        </div>
      }

      <div class="relative" [style.height]="height()">
        <canvas baseChart type="bar" [data]="chartData()" [options]="chartOptions()" role="img" [attr.aria-label]="title() ?? 'Gráfico de barras'"></canvas>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BarChartComponent {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly themeService = inject(ThemeService);

  readonly data = input<MonthlyBudget[]>([]);
  readonly title = input<string>();
  readonly height = input('300px');
  readonly showLegend = input(true);
  readonly showSummary = input(true);

  private readonly mode = computed(() => {
    this.themeService.theme();
    return chartModeAt(this.host.nativeElement);
  });

  protected readonly averageActual = computed(() => average(this.data().map(item => item.actual)));
  protected readonly averageBudget = computed(() => average(this.data().map(item => item.budget)));

  protected readonly chartData = computed<ChartData<'bar'>>(() => {
    const mode = this.mode();
    const bar = { borderRadius: 4, borderSkipped: 'start' as const, maxBarThickness: 28, categoryPercentage: 0.7, barPercentage: 0.9 };
    return {
      labels: this.data().map(item => item.month),
      datasets: [
        { label: 'Gasto real', data: this.data().map(item => item.actual), backgroundColor: seriesColor(mode, 0), ...bar },
        { label: 'Orçamento', data: this.data().map(item => item.budget), backgroundColor: seriesColor(mode, 1), ...bar }
      ]
    };
  });

  protected readonly chartOptions = computed(() => cartesianOptions(this.mode(), this.showLegend()) as ChartOptions<'bar'>);
}

function average(values: number[]): number {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}
