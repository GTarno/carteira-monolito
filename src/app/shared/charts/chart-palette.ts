import { ChartOptions } from 'chart.js';
import { DARK_THEME } from '../../core/theme/theme.service';
import { formatBRL } from '../../core/i18n/locale';

export type ChartMode = 'light' | 'dark';

/**
 * Paleta categórica dos gráficos, por modo. As cores dos temas do DaisyUI (forest/emerald)
 * são quase todas verdes e não servem para distinguir séries; esta paleta foi validada
 * para daltonismo (CVD ΔE ≥ 8 entre vizinhas) contra as superfícies dos cards:
 * emerald #ffffff e forest #1b1717.
 *
 * Use as cores NA ORDEM (nunca ciclar): a cor acompanha a categoria, não a posição no ranking.
 * No modo claro, água/amarelo/rosa ficam abaixo de 3:1 no branco: por isso os gráficos
 * sempre mostram legenda com rótulos (e valores, no de rosca).
 */
export const CHART_SERIES: Record<ChartMode, readonly string[]> = {
  light: ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300', '#6250d6', '#e34948'],
  dark: ['#3987e5', '#d95926', '#199e70', '#c98500', '#d55181', '#008300', '#9085e9', '#e66767']
};

/** Cores de "moldura" (texto, grade, eixos) — recessivas, para os dados aparecerem. */
export const CHART_CHROME: Record<ChartMode, { text: string; muted: string; grid: string; axis: string; surface: string }> = {
  light: { text: '#52514e', muted: '#898781', grid: '#e1e0d9', axis: '#c3c2b7', surface: '#ffffff' },
  dark: { text: '#c3c2b7', muted: '#898781', grid: '#2c2c2a', axis: '#383835', surface: '#1b1717' }
};

const DARK_THEMES = new Set<string>([DARK_THEME]);

/**
 * Modo do gráfico conforme o tema efetivo no ponto da página onde ele está
 * (o `data-theme` mais próximo — páginas antigas ficam num painel claro).
 */
export function chartModeAt(element: Element): ChartMode {
  const theme = element.closest('[data-theme]')?.getAttribute('data-theme');
  return theme && DARK_THEMES.has(theme) ? 'dark' : 'light';
}

export function seriesColor(mode: ChartMode, index: number): string {
  const palette = CHART_SERIES[mode];
  return palette[Math.min(index, palette.length - 1)];
}

/** Aplica transparência a uma cor #rrggbb. */
export function withAlpha(hex: string, alpha: number): string {
  const value = Number.parseInt(hex.slice(1, 7), 16);
  return `rgba(${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255}, ${alpha})`;
}

/** Opções comuns de gráficos com eixos (barra e linha): grade recessiva, eixo Y em reais, tooltip por índice. */
export function cartesianOptions(mode: ChartMode, showLegend: boolean): ChartOptions<'bar' | 'line'> {
  const chrome = CHART_CHROME[mode];
  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    scales: {
      x: {
        grid: { display: false },
        border: { color: chrome.axis },
        ticks: { color: chrome.muted }
      },
      y: {
        beginAtZero: true,
        grid: { color: chrome.grid },
        border: { display: false },
        ticks: { color: chrome.muted, callback: value => formatBRL(Number(value)) }
      }
    },
    plugins: {
      legend: {
        display: showLegend,
        position: 'top',
        align: 'start',
        labels: { color: chrome.text, usePointStyle: true, pointStyle: 'circle', boxWidth: 8, boxHeight: 8, padding: 16 }
      },
      tooltip: {
        callbacks: {
          label: context => `${context.dataset.label}: ${formatBRL(Number(context.parsed.y ?? 0))}`
        }
      }
    }
  };
}
