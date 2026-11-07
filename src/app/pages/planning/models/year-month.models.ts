export interface YearMonth {
  year: number;
  month: number; // 1-12
}

export class YearMonthUtils {
  static fromDate(date: Date): YearMonth {
    return {
      year: date.getFullYear(),
      month: date.getMonth() + 1
    };
  }

  static getCurrentYearMonth(): YearMonth {
    return YearMonthUtils.fromDate(new Date());
  }

  static toShortLabel(yearMonth: YearMonth): string {
    const months = [
      'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
      'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
    ];
    return `${months[yearMonth.month - 1]}/${yearMonth.year}`;
  }

  static toLongLabel(yearMonth: YearMonth): string {
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return `${months[yearMonth.month - 1]} de ${yearMonth.year}`;
  }

  static addMonths(yearMonth: YearMonth, months: number): YearMonth {
    const date = new Date(yearMonth.year, yearMonth.month - 1, 1);
    date.setMonth(date.getMonth() + months);
    return YearMonthUtils.fromDate(date);
  }

  static compare(a: YearMonth, b: YearMonth): number {
    if (a.year !== b.year) return a.year - b.year;
    return a.month - b.month;
  }

  static equals(a: YearMonth, b: YearMonth): boolean {
    return a.year === b.year && a.month === b.month;
  }

  static toKey(yearMonth: YearMonth): string {
    const monthStr = yearMonth.month.toString().padStart(2, '0');
    return `${yearMonth.year}-${monthStr}`;
  }

  static fromKey(key: string): YearMonth {
    const [year, month] = key.split('-').map(Number);
    return { year, month };
  }

  /** Como `fromKey`, mas devolve `null` para valores ausentes ou inválidos (ex.: query params). */
  static parseKey(key: string | null | undefined): YearMonth | null {
    const match = /^(\d{4})-(\d{2})$/.exec(key ?? '');
    if (!match) return null;
    const month = Number(match[2]);
    return month >= 1 && month <= 12 ? { year: Number(match[1]), month } : null;
  }
}
