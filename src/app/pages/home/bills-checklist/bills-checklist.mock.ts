import { Bill } from './bills-checklist.models';
import { toIsoDate } from '../../../shared/utils/date.utils';

interface BillTemplate {
  name: string;
  amount: number;
  dueDay: number;
  isPaid: boolean;
}

const BILL_TEMPLATES: BillTemplate[] = [
  { name: 'Conta de Luz', amount: 189.50, dueDay: 10, isPaid: false },
  { name: 'Condomínio', amount: 450.00, dueDay: 15, isPaid: true },
  { name: 'Internet', amount: 89.90, dueDay: 5, isPaid: false },
  { name: 'Financiamento Imóvel', amount: 1250.00, dueDay: 20, isPaid: false },
  { name: 'Cartão de Crédito', amount: 980.75, dueDay: 28, isPaid: false }
];

/**
 * Gera as contas de exemplo com vencimento no mês de `reference` (por padrão, o mês atual),
 * para que o checklist sempre faça sentido independentemente da data em que o app roda.
 */
export function createBillsMock(reference: Date = new Date()): Bill[] {
  const year = reference.getFullYear();
  const month = reference.getMonth();
  const lastDay = new Date(year, month + 1, 0).getDate();

  return BILL_TEMPLATES.map((template, index) => ({
    id: `bill-${index + 1}`,
    name: template.name,
    amount: template.amount,
    dueDate: toIsoDate(new Date(year, month, Math.min(template.dueDay, lastDay))),
    isPaid: template.isPaid
  }));
}
