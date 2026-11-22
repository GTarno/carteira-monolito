import { installmentAmount } from './installments.models';

describe('installmentAmount', () => {
  it('splits the total in cents, rounding down', () => {
    expect(installmentAmount(1000, 3)).toBe(333.33);
    expect(installmentAmount(3000, 10)).toBe(300);
  });

  it('is not fooled by floating point (4999.90 / 10 = 499.99)', () => {
    expect(installmentAmount(4999.9, 10)).toBe(499.99);
    expect(installmentAmount(0.3, 3)).toBe(0.1);
  });
});
