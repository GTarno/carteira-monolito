import { ChangeDetectionStrategy, Component, ElementRef, computed, inject, input } from '@angular/core';
import { CurrencyPipe, PercentPipe } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { ThemeService } from '../../../core/theme/theme.service';
import { formatBRL } from '../../../core/i18n/locale';
import { CHART_CHROME, chartModeAt, seriesColor } from '../../charts/chart-palette';
import { ExpenseCategory } from '../../types/chart.types';

interface LegendRow {
  label: string;
  amount: number;
  share: number;
  color: string;
}

/**
 * Gráfico de rosca com legenda em lista (cor, nome, valor e %), que também serve
 * de "tabela" acessível — a identidade nunca depende só da cor.
 */
@Component({
  selector: 'app-doughnut-chart',
  imports: [BaseChartDirective, CurrencyPipe, PercentPipe],
  template: `
    <div class="app-ui flex h-full flex-col gap-4">
      @if (title()) {
        <div>
          <h3 class="font-semibold">{{ title() }}</h3>
          @if (showTotal()) {
            <p class="text-sm text-base-content/70">
              Total: <span class="font-semibold text-base-content">{{ total() | currency }}</span>
            </p>
          }
        </div>
      }

      <div class="relative" [style.height]="height()">
        <canvas baseChart type="doughnut" [data]="chartData()" [options]="chartOptions()" [attr.aria-label]="ariaLabel()" role="img"></canvas>
      </div>

      <ul class="flex flex-col gap-1.5 text-sm">
        @for (row of legend(); track row.label) {
          <li class="flex items-center gap-2">
            <span class="size-2.5 shrink-0 rounded-full" [style.background-color]="row.color" aria-hidden="true"></span>
            <span class="flex-1 truncate">{{ row.label }}</span>
            <span class="tabular-nums text-base-content/70">{{ row.share | percent: '1.0-0' }}</span>
            <span class="w-24 text-right font-medium tabular-nums">{{ row.amount | currency }}</span>
          </li>
        }
      </ul>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DoughnutChartComponent {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly themeService = inject(ThemeService);

  readonly data = input<ExpenseCategory[]>([]);
  readonly title = input<string>();
  readonly height = input('240px');
  readonly showTotal = input(true);

  private readonly mode = computed(() => {
    this.themeService.theme();
    return chartModeAt(this.host.nativeElement);
  });

  protected readonly total = computed(() => this.data().reduce((sum, item) => sum + item.amount, 0));

  protected readonly legend = computed<LegendRow[]>(() => {
    const total = this.total() || 1;
    return this.data().map((item, index) => ({
      label: item.category,
      amount: item.amount,
      share: item.amount / total,
      color: item.color ?? seriesColor(this.mode(), index)
    }));
  });

  protected readonly chartData = computed<ChartData<'doughnut'>>(() => ({
    labels: this.legend().map(row => row.label),
    datasets: [{
      data: this.legend().map(row => row.amount),
      backgroundColor: this.legend().map(row => row.color),
      borderColor: CHART_CHROME[this.mode()].surface,
      borderWidth: 2,
      hoverOffset: 6
    }]
  }));

  protected readonly chartOptions = computed<ChartOptions<'doughnut'>>(() => ({
    responsive: true,
    maintainAspectRatio: false,
    cutout: '64%',
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: context => {
            const share = (Number(context.parsed) / (this.total() || 1)) * 100;
            return `${context.label}: ${formatBRL(Number(context.parsed))} (${share.toFixed(0)}%)`;
          }
        }
      }
    }
  }));

  protected readonly ariaLabel = computed(() =>
    `${this.title() ?? 'Gráfico de rosca'}: ` + this.legend().map(row => `${row.label} ${formatBRL(row.amount)}`).join(', ')
  );
}
