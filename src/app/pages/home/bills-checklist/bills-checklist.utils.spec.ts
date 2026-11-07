import { Bill } from './bills-checklist.models';
import { compareBills, getBillStatus } from './bills-checklist.utils';

describe('bills-checklist utils', () => {
  const bill = (overrides: Partial<Bill> = {}): Bill => ({
    id: '1',
    name: 'Luz',
    amount: 100,
    dueDate: '2026-02-10',
    isPaid: false,
    ...overrides
  });

  describe('getBillStatus', () => {
    it('returns paid regardless of the due date', () => {
      expect(getBillStatus(bill({ isPaid: true }), new Date(2026, 5, 1)).type).toBe('paid');
    });

    it('returns dueToday on the due date, at any time of day', () => {
      expect(getBillStatus(bill(), new Date(2026, 1, 10, 0, 1)).type).toBe('dueToday');
      expect(getBillStatus(bill(), new Date(2026, 1, 10, 23, 59)).type).toBe('dueToday');
    });

    it('returns pending before the due date', () => {
      expect(getBillStatus(bill(), new Date(2026, 1, 9, 23, 59)).type).toBe('pending');
    });

    it('returns overdue after the due date', () => {
      expect(getBillStatus(bill(), new Date(2026, 1, 11)).type).toBe('overdue');
    });
  });

  describe('compareBills', () => {
    it('puts unpaid bills first, then sorts by due date', () => {
      const bills = [
        bill({ id: 'paid', isPaid: true, dueDate: '2026-02-01' }),
        bill({ id: 'late', dueDate: '2026-02-20' }),
        bill({ id: 'early', dueDate: '2026-02-05' })
      ];
      expect(bills.sort(compareBills).map(b => b.id)).toEqual(['early', 'late', 'paid']);
    });
  });
});
