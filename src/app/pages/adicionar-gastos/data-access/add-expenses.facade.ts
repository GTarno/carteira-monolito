import { Injectable, inject } from '@angular/core';
import { MonthlyExpensesStore } from '../../../core/expenses/monthly-expenses.store';
import { MonthlyExpense, MonthlyExpenseInput } from '../../../core/expenses/monthly-expense.model';
import { BillsChecklistService } from '../../home/bills-checklist/bills-checklist.service';
import { InstallmentsService } from '../../home/installments-carousel/data-access/installments.service';
import { InstallmentPlan, LargePurchaseInput } from '../../home/installments-carousel/models/installments.models';
import { PlanningService } from '../../planning/data-access/planning.service';
import { PlanningCategory } from '../../planning/data-access/planning.mock';
import { createId } from '../../../shared/utils/id.utils';
import { currentYearMonth, yearMonthKey } from '../../../shared/utils/year-month';

export interface SaveResult<T> {
  value: T;
  /** `false` quando não foi possível salvar no navegador (vale só até recarregar). */
  saved: boolean;
}

/**
 * Cadastro de gastos da tela "Adicionar gastos":
 * - gasto mensal → Contas do mês (Início) + item na categoria do Planejamento;
 * - grande compra → carrossel de parcelamentos (Início).
 */
@Injectable({ providedIn: 'root' })
export class AddExpensesFacade {
  private readonly expensesStore = inject(MonthlyExpensesStore);
  private readonly bills = inject(BillsChecklistService);
  private readonly planning = inject(PlanningService);
  private readonly installments = inject(InstallmentsService);

  planningCategories(): PlanningCategory[] {
    return this.planning.getCategories();
  }

  addMonthlyExpense(input: MonthlyExpenseInput): SaveResult<MonthlyExpense> {
    const expense: MonthlyExpense = { ...input, id: createId(), startMonth: yearMonthKey(currentYearMonth()) };
    const saved = this.expensesStore.add(expense);
    this.bills.addMonthlyExpense(expense);
    this.planning.addMonthlyExpense(expense);
    return { value: expense, saved };
  }

  addLargePurchase(input: LargePurchaseInput): SaveResult<InstallmentPlan> {
    const { plan, saved } = this.installments.addPurchase(input);
    return { value: plan, saved };
  }
}
