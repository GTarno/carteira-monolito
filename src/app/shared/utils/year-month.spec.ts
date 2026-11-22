import {
  addMonths,
  compareYearMonths,
  formatYearMonthLong,
  formatYearMonthShort,
  isSameYearMonth,
  parseYearMonthKey,
  yearMonthFromDate,
  yearMonthKey
} from './year-month';

describe('year-month', () => {
  it('formats short and long labels in Portuguese', () => {
    expect(formatYearMonthShort({ year: 2026, month: 11 })).toBe('Nov/2026');
    expect(formatYearMonthShort({ year: 2026, month: 3 })).toBe('Mar/2026');
    expect(formatYearMonthLong({ year: 2026, month: 3 })).toBe('Março de 2026');
    expect(formatYearMonthLong({ year: 2025, month: 12 })).toBe('Dezembro de 2025');
  });

  it('adds and subtracts months across years', () => {
    expect(addMonths({ year: 2026, month: 11 }, 3)).toEqual({ year: 2027, month: 2 });
    expect(addMonths({ year: 2026, month: 1 }, -1)).toEqual({ year: 2025, month: 12 });
    expect(addMonths({ year: 2026, month: 5 }, -12)).toEqual({ year: 2025, month: 5 });
  });

  it('compares and checks equality', () => {
    expect(compareYearMonths({ year: 2025, month: 12 }, { year: 2026, month: 1 })).toBeLessThan(0);
    expect(compareYearMonths({ year: 2026, month: 2 }, { year: 2026, month: 1 })).toBeGreaterThan(0);
    expect(isSameYearMonth({ year: 2026, month: 2 }, { year: 2026, month: 2 })).toBeTrue();
  });

  it('round-trips keys and rejects invalid ones', () => {
    expect(yearMonthKey({ year: 2026, month: 3 })).toBe('2026-03');
    expect(parseYearMonthKey('2026-03')).toEqual({ year: 2026, month: 3 });
    expect(parseYearMonthKey('2026-13')).toBeNull();
    expect(parseYearMonthKey('abc')).toBeNull();
    expect(parseYearMonthKey(null)).toBeNull();
  });

  it('builds from a date in the local calendar', () => {
    expect(yearMonthFromDate(new Date(2026, 0, 31, 23, 59))).toEqual({ year: 2026, month: 1 });
  });
});
