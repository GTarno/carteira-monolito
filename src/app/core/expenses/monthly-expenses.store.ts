import { Injectable, signal } from '@angular/core';
import { MonthlyExpense, isMonthlyExpense } from './monthly-expense.model';
import { readJson, writeJson } from '../../shared/utils/storage.utils';

export const MONTHLY_EXPENSES_STORAGE_KEY = 'carteira.monthly-expenses';

function isExpenseList(value: unknown): value is MonthlyExpense[] {
  return Array.isArray(value) && value.every(isMonthlyExpense);
}

/**
 * Gastos mensais cadastrados pelo usuário, salvos no navegador.
 * É a fonte única que alimenta o checklist de contas (Início) e o Planejamento,
 * até existir a API de contas recorrentes.
 */
@Injectable({ providedIn: 'root' })
export class MonthlyExpensesStore {
  private readonly expensesSignal = signal<MonthlyExpense[]>(readJson(MONTHLY_EXPENSES_STORAGE_KEY, isExpenseList) ?? []);

  readonly expenses = this.expensesSignal.asReadonly();

  /** Adiciona e salva. Retorna `false` se não foi possível salvar no navegador. */
  add(expense: MonthlyExpense): boolean {
    this.expensesSignal.update(list => [...list, expense]);
    return writeJson(MONTHLY_EXPENSES_STORAGE_KEY, this.expensesSignal());
  }
}
