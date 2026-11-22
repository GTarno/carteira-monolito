import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Bill } from './bills-checklist.models';
import { createBillsMock } from './bills-checklist.mock';
import { toIsoDate } from '../../../shared/utils/date.utils';
import { readJson, writeJson } from '../../../shared/utils/storage.utils';
import { MonthlyExpensesStore } from '../../../core/expenses/monthly-expenses.store';
import { MonthlyExpense } from '../../../core/expenses/monthly-expense.model';

/** Prefixo do id das contas que vêm de gastos mensais cadastrados. */
const EXPENSE_BILL_PREFIX = 'expense-';

/**
 * Checklist de contas do mês atual (salvo no navegador).
 * O mês é montado com as contas de exemplo + os gastos mensais cadastrados pelo usuário;
 * quando o mês vira, o checklist recomeça com tudo pendente.
 */
@Injectable({
  providedIn: 'root'
})
export class BillsChecklistService {
  private readonly STORAGE_KEY = 'bills-checklist';
  private readonly expensesStore = inject(MonthlyExpensesStore);

  private readonly billsSubject = new BehaviorSubject<Bill[]>(this.loadMonth());
  readonly bills$: Observable<Bill[]> = this.billsSubject.asObservable();

  togglePaid(id: string): void {
    this.update(this.billsSubject.value.map(bill => (bill.id === id ? { ...bill, isPaid: !bill.isPaid } : bill)));
  }

  setPaid(id: string, paid: boolean): void {
    this.update(this.billsSubject.value.map(bill => (bill.id === id ? { ...bill, isPaid: paid } : bill)));
  }

  /** Recomeça o mês: todas as contas (exemplo + cadastradas) voltam a pendente. */
  resetMonth(): void {
    this.update(this.buildMonth());
  }

  /** Inclui no mês atual a conta de um gasto mensal recém-cadastrado. */
  addMonthlyExpense(expense: MonthlyExpense): void {
    const bills = this.billsSubject.value;
    if (bills.some(bill => bill.id === EXPENSE_BILL_PREFIX + expense.id)) return;
    this.update([...bills, this.toBill(expense, new Date())]);
  }

  getBills(): Bill[] {
    return this.billsSubject.value;
  }

  private update(bills: Bill[]): void {
    this.billsSubject.next(bills);
    writeJson(this.STORAGE_KEY, bills);
  }

  private loadMonth(): Bill[] {
    const stored = readJson(this.STORAGE_KEY, (value): value is Bill[] => this.isValidBillList(value));
    if (!stored || !this.isFromCurrentMonth(stored)) {
      return this.buildMonth();
    }
    // Gastos cadastrados em outra aba/sessão que ainda não estão no checklist salvo
    const missing = this.expenseBills(new Date()).filter(bill => !stored.some(saved => saved.id === bill.id));
    return [...stored, ...missing];
  }

  private buildMonth(reference: Date = new Date()): Bill[] {
    return [...createBillsMock(reference), ...this.expenseBills(reference)];
  }

  /** Contas dos gastos mensais que já valem no mês de `reference`. */
  private expenseBills(reference: Date): Bill[] {
    const monthKey = toIsoDate(reference).slice(0, 7);
    return this.expensesStore.expenses()
      .filter(expense => expense.startMonth <= monthKey)
      .map(expense => this.toBill(expense, reference));
  }

  private toBill(expense: MonthlyExpense, reference: Date): Bill {
    const year = reference.getFullYear();
    const month = reference.getMonth();
    const lastDay = new Date(year, month + 1, 0).getDate();
    return {
      id: EXPENSE_BILL_PREFIX + expense.id,
      name: expense.name,
      amount: expense.plannedValue,
      dueDate: toIsoDate(new Date(year, month, Math.min(expense.dueDay, lastDay))),
      isPaid: false
    };
  }

  private isValidBillList(value: unknown): value is Bill[] {
    return Array.isArray(value) && value.every(bill =>
      bill && bill.id && bill.name && typeof bill.amount === 'number' &&
      typeof bill.dueDate === 'string' && typeof bill.isPaid === 'boolean'
    );
  }

  private isFromCurrentMonth(bills: Bill[]): boolean {
    const currentMonthPrefix = toIsoDate(new Date()).slice(0, 7);
    return bills.length > 0 && bills.every(bill => bill.dueDate.startsWith(currentMonthPrefix));
  }
}
