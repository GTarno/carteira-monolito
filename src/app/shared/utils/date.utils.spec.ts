import { parseIsoDate, startOfDay } from './date.utils';

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
});
