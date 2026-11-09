export interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: string; // ISO yyyy-mm-dd
  isPaid: boolean;
}

export type BillStatusType = 'paid' | 'pending' | 'dueToday' | 'overdue';

export interface BillStatus {
  type: BillStatusType;
  label: string;
}