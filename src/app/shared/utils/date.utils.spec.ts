import { parseIsoDate, startOfDay, toIsoDate } from './date.utils';

describe('date.utils', () => {
  describe('parseIsoDate', () => {
    it('keeps the same calendar day in the local timezone', () => {
      const date = parseIsoDate('2026-02-10');
      expect(date.getFullYear()).toBe(2026);
      expect(date.getMonth()).toBe(1);
      expect(date.getDate()).toBe(10);
      expect(date.getHours()).toBe(0);
    });

    it('ignores a time component if present', () => {
      expect(parseIsoDate('2026-12-31T23:59:59Z').getDate()).toBe(31);
    });
  });

  describe('startOfDay', () => {
    it('zeroes the time without changing the day', () => {
      const result = startOfDay(new Date(2026, 4, 15, 18, 30));
      expect(result).toEqual(new Date(2026, 4, 15));
    });
  });

  describe('toIsoDate', () => {
    it('formats using the local calendar day', () => {
      expect(toIsoDate(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05');
    });

    it('round-trips with parseIsoDate', () => {
      expect(toIsoDate(parseIsoDate('2026-02-28'))).toBe('2026-02-28');
    });
  });
});
