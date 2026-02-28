import { Bill } from './bills-checklist.models';

// Utility function to generate UUIDs with fallback
function generateId(): string {
  if (crypto && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export const billsMockData: Bill[] = [
  {
    id: generateId(),
    name: 'Conta de Luz',
    amount: 189.50,
    dueDate: '2026-02-10',
    isPaid: false
  },
  {
    id: generateId(),
    name: 'Condomínio',
    amount: 450.00,
    dueDate: '2026-02-15',
    isPaid: true
  },
  {
    id: generateId(),
    name: 'Internet',
    amount: 89.90,
    dueDate: '2026-02-05',
    isPaid: false
  },
  {
    id: generateId(),
    name: 'Financiamento Imóvel',
    amount: 1250.00,
    dueDate: '2026-02-20',
    isPaid: false
  },
  {
    id: generateId(),
    name: 'Cartão de Crédito',
    amount: 980.75,
    dueDate: '2026-02-28',
    isPaid: false
  }
];