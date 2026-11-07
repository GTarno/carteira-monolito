import { getBudgetExcess, getBudgetProgress, getBudgetStatus } from './planning.models';

describe('budget rules', () => {
  it('classifies spending relative to the plan', () => {
    expect(getBudgetStatus(100, 90)).toBe('ok');
    expect(getBudgetStatus(100, 90.01)).toBe('limit');
    expect(getBudgetStatus(100, 100)).toBe('limit');
    expect(getBudgetStatus(100, 100.01)).toBe('over');
  });

  it('treats a zero plan as ok with no progress', () => {
    expect(getBudgetStatus(0, 50)).toBe('ok');
    expect(getBudgetProgress(0, 50)).toBe(0);
  });

  it('caps progress at 100% and reports the excess', () => {
    expect(getBudgetProgress(200, 50)).toBe(0.25);
    expect(getBudgetProgress(200, 300)).toBe(1);
    expect(getBudgetExcess(200, 300)).toBe(100);
    expect(getBudgetExcess(200, 150)).toBe(0);
  });
});
