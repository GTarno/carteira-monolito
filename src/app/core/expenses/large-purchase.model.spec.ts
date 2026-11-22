import {
  LargePurchase,
  installmentAmount,
  installmentAmountAt,
  installmentNumberIn,
  paidInstallmentsAt
} from './large-purchase.model';

describe('large purchase installments', () => {
  it('splits the total in cents, rounding down', () => {
    expect(installmentAmount(1000, 3)).toBe(333.33);
    expect(installmentAmount(3000, 10)).toBe(300);
  });

  it('is not fooled by floating point (4999.90 / 10 = 499.99)', () => {
    expect(installmentAmount(4999.9, 10)).toBe(499.99);
    expect(installmentAmount(0.3, 3)).toBe(0.1);
  });

  it('puts the cents difference in the last installment', () => {
    expect([1, 2, 3].map(n => installmentAmountAt(1000, 3, n))).toEqual([333.33, 333.33, 333.34]);
    const sum = [1, 2, 3].reduce((total, n) => total + installmentAmountAt(1000, 3, n) * 100, 0);
    expect(Math.round(sum)).toBe(100000);
  });

  const purchase: LargePurchase = {
    id: 'p1', title: 'Notebook', totalAmount: 1000, installments: 3, firstMonth: '2026-10', categoryId: 'cartao-credito'
  };

  it('finds which installment falls in a month', () => {
    expect(installmentNumberIn(purchase, { year: 2026, month: 9 })).toBeNull();
    expect(installmentNumberIn(purchase, { year: 2026, month: 10 })).toBe(1);
    expect(installmentNumberIn(purchase, { year: 2026, month: 12 })).toBe(3);
    expect(installmentNumberIn(purchase, { year: 2027, month: 1 })).toBeNull();
  });

  it('counts paid installments as the months before the current one', () => {
    expect(paidInstallmentsAt(purchase, { year: 2026, month: 10 })).toBe(0);
    expect(paidInstallmentsAt(purchase, { year: 2026, month: 11 })).toBe(1);
    expect(paidInstallmentsAt(purchase, { year: 2027, month: 6 })).toBe(3);
  });
});
