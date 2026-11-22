/** Gasto mensal recorrente cadastrado pelo usuário (tela "Adicionar gastos"). */
export interface MonthlyExpense {
  id: string;
  name: string;
  /** Categoria do planejamento onde o gasto se encaixa (ex.: 'contas'). */
  categoryId: string;
  /** Valor planejado por mês, também usado como valor da conta no checklist. */
  plannedValue: number;
  /** Dia do vencimento (1–31; em meses curtos, vence no último dia). */
  dueDay: number;
  /** Primeiro mês em que o gasto vale ("yyyy-mm"). */
  startMonth: string;
}

export type MonthlyExpenseInput = Omit<MonthlyExpense, 'id' | 'startMonth'>;

export function isMonthlyExpense(value: unknown): value is MonthlyExpense {
  const v = value as MonthlyExpense;
  return !!v && typeof v.id === 'string' && typeof v.name === 'string' && typeof v.categoryId === 'string'
    && typeof v.plannedValue === 'number' && Number.isInteger(v.dueDay) && v.dueDay >= 1 && v.dueDay <= 31
    && /^\d{4}-\d{2}$/.test(v.startMonth);
}
