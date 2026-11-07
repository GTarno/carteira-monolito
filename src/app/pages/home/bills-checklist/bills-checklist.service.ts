import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Bill } from './bills-checklist.models';
import { createBillsMock } from './bills-checklist.mock';
import { toIsoDate } from '../../../shared/utils/date.utils';

@Injectable({
  providedIn: 'root'
})
export class BillsChecklistService {
  private readonly STORAGE_KEY = 'bills-checklist';
  
  private billsSubject = new BehaviorSubject<Bill[]>(this.loadFromStorage());
  public bills$: Observable<Bill[]> = this.billsSubject.asObservable();

  private loadFromStorage(): Bill[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const bills = JSON.parse(stored);
        // Validate data structure
        if (this.isValidBillList(bills) && this.isFromCurrentMonth(bills)) {
          return bills;
        }
      }
    } catch (error) {
      console.warn('Error loading bills from localStorage:', error);
    }
    
    // Sem dados válidos (ou de um mês anterior): começa o checklist do mês atual
    return createBillsMock();
  }

  private isValidBillList(value: unknown): value is Bill[] {
    return Array.isArray(value) && value.every(bill =>
      bill && bill.id && bill.name && typeof bill.amount === 'number' &&
      typeof bill.dueDate === 'string' && typeof bill.isPaid === 'boolean'
    );
  }

  private isFromCurrentMonth(bills: Bill[]): boolean {
    const currentMonthPrefix = toIsoDate(new Date()).slice(0, 7);
    return bills.length > 0 && bills.every(bill => bill.dueDate.startsWith(currentMonthPrefix));
  }

  private saveToStorage(bills: Bill[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(bills));
    } catch (error) {
      console.warn('Error saving bills to localStorage:', error);
    }
  }

  togglePaid(id: string): void {
    const currentBills = this.billsSubject.value;
    const updatedBills = currentBills.map(bill => 
      bill.id === id 
        ? { ...bill, isPaid: !bill.isPaid }
        : bill
    );
    
    this.billsSubject.next(updatedBills);
    this.saveToStorage(updatedBills);
  }

  setPaid(id: string, paid: boolean): void {
    const currentBills = this.billsSubject.value;
    const updatedBills = currentBills.map(bill => 
      bill.id === id 
        ? { ...bill, isPaid: paid }
        : bill
    );
    
    this.billsSubject.next(updatedBills);
    this.saveToStorage(updatedBills);
  }

  resetMonth(): void {
    const freshBills = createBillsMock();
    this.billsSubject.next(freshBills);
    this.saveToStorage(freshBills);
  }

  getBills(): Bill[] {
    return this.billsSubject.value;
  }
}