import { CHART_SERIES, chartModeAt, seriesColor, withAlpha } from './chart-palette';

describe('chart-palette', () => {
  it('detects the mode from the nearest data-theme', () => {
    const outer = document.createElement('div');
    outer.setAttribute('data-theme', 'forest');
    const inner = document.createElement('div');
    inner.setAttribute('data-theme', 'emerald');
    const darkChild = document.createElement('span');
    const lightChild = document.createElement('span');
    outer.append(darkChild, inner);
    inner.append(lightChild);

    expect(chartModeAt(darkChild)).toBe('dark');
    expect(chartModeAt(lightChild)).toBe('light');
  });

  it('assigns colors in fixed order and never cycles', () => {
    expect(seriesColor('light', 0)).toBe(CHART_SERIES.light[0]);
    expect(seriesColor('dark', 1)).toBe(CHART_SERIES.dark[1]);
    expect(seriesColor('light', 99)).toBe(CHART_SERIES.light[7]);
  });

  it('converts hex colors to rgba', () => {
    expect(withAlpha('#2a78d6', 0.2)).toBe('rgba(42, 120, 214, 0.2)');
  });
});
