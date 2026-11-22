import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { AddExpensesFacade } from './add-expenses.facade';
import { MONTHLY_EXPENSES_STORAGE_KEY } from '../../../core/expenses/monthly-expenses.store';
import { BillsChecklistService } from '../../home/bills-checklist/bills-checklist.service';
import { InstallmentsService, INSTALLMENTS_STORAGE_KEY } from '../../home/installments-carousel/data-access/installments.service';
import { PlanningService } from '../../planning/data-access/planning.service';
import { addMonths, currentYearMonth } from '../../../shared/utils/year-month';

const KEYS = [MONTHLY_EXPENSES_STORAGE_KEY, INSTALLMENTS_STORAGE_KEY, 'bills-checklist'];

describe('AddExpensesFacade', () => {
  beforeEach(() => KEYS.forEach(key => localStorage.removeItem(key)));
  afterAll(() => KEYS.forEach(key => localStorage.removeItem(key)));

  it('adds a monthly expense to the bills checklist and to the planning category', async () => {
    const facade = TestBed.inject(AddExpensesFacade);
    const { value, saved } = facade.addMonthlyExpense({ name: 'Academia', categoryId: 'contas', plannedValue: 99.9, dueDay: 31 });

    expect(saved).toBeTrue();
    const bill = TestBed.inject(BillsChecklistService).getBills().find(b => b.name === 'Academia')!;
    expect(bill.amount).toBe(99.9);
    expect(bill.isPaid).toBeFalse();

    const planning = TestBed.inject(PlanningService);
    const now = currentYearMonth();
    for (const month of [now, addMonths(now, 1)]) {
      const items = await firstValueFrom(planning.getItemsByCategory(month, 'contas'));
      expect(items.find(i => i.id === value.id)).toEqual(jasmine.objectContaining({ name: 'Academia', plannedValue: 99.9, realValue: 0 }));
    }
    // Meses anteriores ao cadastro não mudam
    const before = await firstValueFrom(planning.getItemsByCategory(addMonths(now, -1), 'contas'));
    expect(before.some(i => i.id === value.id)).toBeFalse();
  });

  it('restores saved monthly expenses after a reload', async () => {
    TestBed.inject(AddExpensesFacade).addMonthlyExpense({ name: 'Streaming', categoryId: 'alimentacao', plannedValue: 40, dueDay: 5 });
    localStorage.removeItem('bills-checklist'); // força o checklist a ser remontado

    TestBed.resetTestingModule();
    const bills = TestBed.inject(BillsChecklistService).getBills();
    expect(bills.some(b => b.name === 'Streaming' && b.amount === 40)).toBeTrue();

    const items = await firstValueFrom(TestBed.inject(PlanningService).getItemsByCategory(currentYearMonth(), 'alimentacao'));
    expect(items.some(i => i.name === 'Streaming')).toBeTrue();
  });

  it('adds a large purchase first in the installments list and keeps it after a reload', async () => {
    const { value, saved } = TestBed.inject(AddExpensesFacade).addLargePurchase({
      title: 'Notebook', totalAmount: 1000, installments: 3, paidInstallments: 1
    });
    expect(saved).toBeTrue();
    expect(value.amount).toBe(333.33);
    expect(value.paid).toBe(1);
    expect(value.total).toBe(3);

    TestBed.resetTestingModule();
    const plans = await firstValueFrom(TestBed.inject(InstallmentsService).getPlans());
    expect(plans[0]).toEqual(jasmine.objectContaining({ title: 'Notebook', amount: 333.33 }));
  });
});
