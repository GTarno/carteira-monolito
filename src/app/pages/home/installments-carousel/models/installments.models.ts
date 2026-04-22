export interface InstallmentPlan {
  id: string;
  title: string;
  amount: number;
  currency: 'BRL';
  paid: number;
  total: number;
  imageUrl: string;
}