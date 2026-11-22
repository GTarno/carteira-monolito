import { APP_LOCALE } from '../../core/i18n/locale';

/** Um mês do calendário. `month` vai de 1 (janeiro) a 12 (dezembro). */
export interface YearMonth {
  year: number;
  month: number;
}

const SHORT_MONTH = new Intl.DateTimeFormat(APP_LOCALE, { month: 'short' });
const LONG_MONTH = new Intl.DateTimeFormat(APP_LOCALE, { month: 'long' });

function toDate(yearMonth: YearMonth): Date {
  return new Date(yearMonth.year, yearMonth.month - 1, 1);
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function yearMonthFromDate(date: Date): YearMonth {
  return { year: date.getFullYear(), month: date.getMonth() + 1 };
}

export function currentYearMonth(): YearMonth {
  return yearMonthFromDate(new Date());
}

/** "Nov/2026" */
export function formatYearMonthShort(yearMonth: YearMonth): string {
  const month = SHORT_MONTH.format(toDate(yearMonth)).replace('.', '');
  return `${capitalize(month)}/${yearMonth.year}`;
}

/** "Novembro de 2026" */
export function formatYearMonthLong(yearMonth: YearMonth): string {
  return `${capitalize(LONG_MONTH.format(toDate(yearMonth)))} de ${yearMonth.year}`;
}

/** Soma (ou subtrai, se negativo) meses, atravessando anos. */
export function addMonths(yearMonth: YearMonth, months: number): YearMonth {
  const date = toDate(yearMonth);
  date.setMonth(date.getMonth() + months);
  return yearMonthFromDate(date);
}

/** Quantos meses de `from` até `to` (negativo se `to` vem antes). */
export function monthsBetween(from: YearMonth, to: YearMonth): number {
  return (to.year - from.year) * 12 + (to.month - from.month);
}

/** Para ordenar: negativo se `a` vem antes de `b`. */
export function compareYearMonths(a: YearMonth, b: YearMonth): number {
  return a.year !== b.year ? a.year - b.year : a.month - b.month;
}

export function isSameYearMonth(a: YearMonth, b: YearMonth): boolean {
  return a.year === b.year && a.month === b.month;
}

/** Chave "yyyy-mm" (usada em URLs, mapas e na API). */
export function yearMonthKey(yearMonth: YearMonth): string {
  return `${yearMonth.year}-${String(yearMonth.month).padStart(2, '0')}`;
}

/** Lê uma chave "yyyy-mm"; devolve `null` se ausente ou inválida (ex.: query params). */
export function parseYearMonthKey(key: string | null | undefined): YearMonth | null {
  const match = /^(\d{4})-(\d{2})$/.exec(key ?? '');
  if (!match) return null;
  const month = Number(match[2]);
  return month >= 1 && month <= 12 ? { year: Number(match[1]), month } : null;
}
