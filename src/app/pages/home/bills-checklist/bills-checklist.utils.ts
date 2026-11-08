import { Bill, BillStatus } from './bills-checklist.models';
import { parseIsoDate, startOfDay } from '../../../shared/utils/date.utils';

const STATUS: Record<BillStatus['type'], BillStatus> = {
  paid: { type: 'paid', label: 'Pago' },
  overdue: { type: 'overdue', label: 'Atrasado' },
  dueToday: { type: 'dueToday', label: 'Vence hoje' },
  pending: { type: 'pending', label: 'Pendente' }
};

/** Calcula o status de uma conta comparando o vencimento com `today` no fuso local. */
export function getBillStatus(bill: Bill, today: Date = new Date()): BillStatus {
  if (bill.isPaid) {
    return STATUS.paid;
  }

  const due = parseIsoDate(bill.dueDate).getTime();
  const todayStart = startOfDay(today).getTime();

  if (todayStart > due) return STATUS.overdue;
  if (todayStart === due) return STATUS.dueToday;
  return STATUS.pending;
}

/** Ordena contas não pagas primeiro e, dentro de cada grupo, por vencimento. */
export function compareBills(a: Bill, b: Bill): number {
  if (a.isPaid !== b.isPaid) {
    return a.isPaid ? 1 : -1;
  }
  return a.dueDate.localeCompare(b.dueDate);
}
