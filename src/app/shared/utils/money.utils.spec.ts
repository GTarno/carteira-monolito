import { FormControl } from '@angular/forms';
import { moneyValidator, parseMoney, toMoneyInput } from './money.utils';

describe('money.utils', () => {
  it('parses Brazilian and plain formats', () => {
    expect(parseMoney('1.234,56')).toBe(1234.56);
    expect(parseMoney('1234,5')).toBe(1234.5);
    expect(parseMoney('1234.56')).toBe(1234.56);
    expect(parseMoney('R$ 89,90')).toBe(89.9);
    expect(parseMoney(42)).toBe(42);
  });

  it('rejects invalid input', () => {
    expect(parseMoney('')).toBeNull();
    expect(parseMoney('abc')).toBeNull();
    expect(parseMoney('12,3,4')).toBeNull();
  });

  it('formats values for editing', () => {
    expect(toMoneyInput(1234.5)).toBe('1234,50');
    expect(toMoneyInput(null)).toBe('');
  });

  it('validates money fields', () => {
    const validator = moneyValidator(0.01);
    expect(validator(new FormControl('10,50'))).toBeNull();
    expect(validator(new FormControl(''))).toBeNull();
    expect(validator(new FormControl('abc'))).toEqual({ invalidMoney: true });
    expect(validator(new FormControl('1,234'))).toEqual({ tooManyDecimals: true });
    expect(validator(new FormControl('0'))).toEqual({ min: { min: 0.01, actual: 0 } });
  });
});
