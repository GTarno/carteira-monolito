import { Injectable, inject } from '@angular/core';
import { MonthlyExpensesStore } from '../../../core/expenses/monthly-expenses.store';
import { MonthlyExpense, NewMonthlyExpense } from '../../../core/expenses/monthly-expense.model';
import { BillsChecklistService } from '../../home/bills-checklist/bills-checklist.service';
import { LargePurchasesStore } from '../../../core/expenses/large-purchases.store';
import { LargePurchase, LargePurchaseInput } from '../../../core/expenses/large-purchase.model';
import { PlanningService } from '../../planning/data-access/planning.service';
import { PlanningCategory } from '../../planning/data-access/planning.mock';
import { createId } from '../../../shared/utils/id.utils';
import { addMonths, currentYearMonth, yearMonthKey } from '../../../shared/utils/year-month';

export interface SaveResult<T> {
  value: T;
  /** `false` quando não foi possível salvar no navegador (vale só até recarregar). */
  saved: boolean;
}

/**
 * Cadastro de gastos da tela "Adicionar gastos":
 * - gasto mensal → Contas do mês (Início) + item na categoria do Planejamento;
 * - grande compra → carrossel de parcelamentos (Início) + parcelas no Planejamento.
 */
@Injectable({ providedIn: 'root' })
export class AddExpensesFacade {
  private readonly expensesStore = inject(MonthlyExpensesStore);
  private readonly bills = inject(BillsChecklistService);
  private readonly planning = inject(PlanningService);
  private readonly purchasesStore = inject(LargePurchasesStore);

  planningCategories(): PlanningCategory[] {
    return this.planning.getCategories();
  }

  addMonthlyExpense({ paidThisMonth, ...input }: NewMonthlyExpense): SaveResult<MonthlyExpense> {
    const expense: MonthlyExpense = { ...input, id: createId(), startMonth: yearMonthKey(currentYearMonth()) };
    const saved = this.expensesStore.add(expense);
    this.bills.addMonthlyExpense(expense, paidThisMonth);
    this.planning.addMonthlyExpense(expense);
    return { value: expense, saved };
  }

  addLargePurchase({ paidInstallments, ...input }: LargePurchaseInput): SaveResult<LargePurchase> {
    const purchase: LargePurchase = {
      ...input,
      id: createId(),
      // As parcelas já pagas ficaram nos meses anteriores: a do mês atual é a seguinte
      firstMonth: yearMonthKey(addMonths(currentYearMonth(), -paidInstallments))
    };
    const saved = this.purchasesStore.add(purchase);
    this.planning.addLargePurchase(purchase);
    return { value: purchase, saved };
  }
}
