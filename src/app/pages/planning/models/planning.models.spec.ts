import { MonthlyPlan, getBudgetExcess, getBudgetProgress, getBudgetStatus, getCardSpent, getPlanPlanned, getPlanSpent } from './planning.models';

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

describe('plan totals', () => {
  const plan: MonthlyPlan = {
    month: { year: 2026, month: 11 },
    cards: [
      { id: 'a', title: 'A', icon: 'receipt', plannedValue: 100, items: [{ name: 'x', value: 30 }, { name: 'y', value: 20 }] },
      { id: 'b', title: 'B', icon: 'food', plannedValue: 200, currentValue: 70 }
    ]
  };

  it('sums items when present, otherwise uses currentValue', () => {
    expect(getCardSpent(plan.cards[0])).toBe(50);
    expect(getCardSpent(plan.cards[1])).toBe(70);
  });

  it('totals planned and spent for the month', () => {
    expect(getPlanPlanned(plan)).toBe(300);
    expect(getPlanSpent(plan)).toBe(120);
  });
});
