import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { AddExpensesFacade } from './add-expenses.facade';
import { MONTHLY_EXPENSES_STORAGE_KEY } from '../../../core/expenses/monthly-expenses.store';
import { BillsChecklistService } from '../../home/bills-checklist/bills-checklist.service';
import { InstallmentsService } from '../../home/installments-carousel/data-access/installments.service';
import { LARGE_PURCHASES_STORAGE_KEY, LEGACY_INSTALLMENTS_STORAGE_KEY } from '../../../core/expenses/large-purchases.store';
import { PlanningService } from '../../planning/data-access/planning.service';
import { addMonths, currentYearMonth, yearMonthKey } from '../../../shared/utils/year-month';

const KEYS = [MONTHLY_EXPENSES_STORAGE_KEY, LARGE_PURCHASES_STORAGE_KEY, LEGACY_INSTALLMENTS_STORAGE_KEY, 'bills-checklist'];

describe('AddExpensesFacade', () => {
  beforeEach(() => KEYS.forEach(key => localStorage.removeItem(key)));
  afterAll(() => KEYS.forEach(key => localStorage.removeItem(key)));

  it('adds a monthly expense to the bills checklist and to the planning category', async () => {
    const facade = TestBed.inject(AddExpensesFacade);
    const { value, saved } = facade.addMonthlyExpense({ name: 'Academia', categoryId: 'contas', plannedValue: 99.9, dueDay: 31, paidThisMonth: false });

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

  it('adds the bill as already paid when the user says so, without storing it in the expense', () => {
    const { value } = TestBed.inject(AddExpensesFacade).addMonthlyExpense({
      name: 'Internet fibra', categoryId: 'contas', plannedValue: 120, dueDay: 1, paidThisMonth: true
    });
    const bill = TestBed.inject(BillsChecklistService).getBills().find(b => b.name === 'Internet fibra')!;
    expect(bill.isPaid).toBeTrue();
    expect('paidThisMonth' in value).toBeFalse();
    expect(localStorage.getItem(MONTHLY_EXPENSES_STORAGE_KEY)).not.toContain('paidThisMonth');
  });

  it('restores saved monthly expenses after a reload', async () => {
    TestBed.inject(AddExpensesFacade).addMonthlyExpense({ name: 'Streaming', categoryId: 'alimentacao', plannedValue: 40, dueDay: 5, paidThisMonth: false });
    localStorage.removeItem('bills-checklist'); // força o checklist a ser remontado

    TestBed.resetTestingModule();
    const bills = TestBed.inject(BillsChecklistService).getBills();
    expect(bills.some(b => b.name === 'Streaming' && b.amount === 40)).toBeTrue();

    const items = await firstValueFrom(TestBed.inject(PlanningService).getItemsByCategory(currentYearMonth(), 'alimentacao'));
    expect(items.some(i => i.name === 'Streaming')).toBeTrue();
  });

  it('adds a large purchase first in the installments list and keeps it after a reload', async () => {
    const { value, saved } = TestBed.inject(AddExpensesFacade).addLargePurchase({
      title: 'Notebook', totalAmount: 1000, installments: 3, paidInstallments: 1, categoryId: 'cartao-credito'
    });
    expect(saved).toBeTrue();
    expect(value.firstMonth).toBe(yearMonthKey(addMonths(currentYearMonth(), -1)));

    TestBed.resetTestingModule();
    const plans = await firstValueFrom(TestBed.inject(InstallmentsService).getPlans());
    expect(plans[0]).toEqual(jasmine.objectContaining({ title: 'Notebook', amount: 333.33, paid: 1, total: 3 }));
  });

  it('puts each installment of a large purchase in its month of the planning', async () => {
    const { value } = TestBed.inject(AddExpensesFacade).addLargePurchase({
      title: 'Geladeira', totalAmount: 1000, installments: 3, paidInstallments: 1, categoryId: 'cartao-credito'
    });
    const planning = TestBed.inject(PlanningService);
    const now = currentYearMonth();
    const itemIn = async (offset: number) =>
      (await firstValueFrom(planning.getItemsByCategory(addMonths(now, offset), 'cartao-credito'))).find(i => i.id === value.id);

    expect(await itemIn(-1)).toEqual(jasmine.objectContaining({ name: 'Geladeira (1/3)', plannedValue: 333.33, realValue: 333.33 }));
    expect(await itemIn(0)).toEqual(jasmine.objectContaining({ name: 'Geladeira (2/3)', plannedValue: 333.33, realValue: 0 }));
    expect(await itemIn(1)).toEqual(jasmine.objectContaining({ name: 'Geladeira (3/3)', plannedValue: 333.34, realValue: 0 }));
    expect(await itemIn(-2)).toBeUndefined();

    // Recarregando, o planejamento continua com as parcelas
    TestBed.resetTestingModule();
    const items = await firstValueFrom(TestBed.inject(PlanningService).getItemsByCategory(now, 'cartao-credito'));
    expect(items.some(i => i.name === 'Geladeira (2/3)')).toBeTrue();
  });

  it('converts purchases saved in the previous format', async () => {
    localStorage.setItem(LEGACY_INSTALLMENTS_STORAGE_KEY, JSON.stringify([
      { id: 'old', title: 'TV antiga', amount: 200, currency: 'BRL', paid: 2, total: 5 }
    ]));
    const plans = await firstValueFrom(TestBed.inject(InstallmentsService).getPlans());
    expect(plans[0]).toEqual(jasmine.objectContaining({ id: 'old', title: 'TV antiga', amount: 200, paid: 2, total: 5 }));
    expect(localStorage.getItem(LEGACY_INSTALLMENTS_STORAGE_KEY)).toBeNull();
    expect(localStorage.getItem(LARGE_PURCHASES_STORAGE_KEY)).toContain('cartao-credito');
  });
});
