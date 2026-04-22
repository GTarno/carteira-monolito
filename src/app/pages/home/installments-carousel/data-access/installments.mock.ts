import { InstallmentPlan } from '../models/installments.models';

export const INSTALLMENTS_MOCK: InstallmentPlan[] = [
  {
    id: '1',
    title: 'iPhone 15 Pro',
    amount: 899.90,
    currency: 'BRL',
    paid: 12,
    total: 24,
    imageUrl: 'assets/images/phone.png'
  },
  {
    id: '2',
    title: 'Honda Civic 2024',
    amount: 2450.00,
    currency: 'BRL',
    paid: 18,
    total: 60,
    imageUrl: 'assets/images/car.png'
  },
  {
    id: '3',
    title: 'Viagem Europa',
    amount: 650.00,
    currency: 'BRL',
    paid: 3,
    total: 10,
    imageUrl: 'assets/images/travel.png'
  },
  {
    id: '4',
    title: 'MacBook Pro M4',
    amount: 1299.99,
    currency: 'BRL',
    paid: 8,
    total: 12,
    imageUrl: 'assets/images/laptop.png'
  },
  {
    id: '5',
    title: 'Cartão de Crédito',
    amount: 420.50,
    currency: 'BRL',
    paid: 5,
    total: 8,
    imageUrl: 'assets/images/credit.png'
  }
];