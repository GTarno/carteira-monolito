export interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: string; // ISO yyyy-mm-dd
  isPaid: boolean;
}

export interface BillStatus {
  type: 'paid' | 'pending' | 'dueToday' | 'overdue';
  label: string;
  color: string;
}