import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Bill } from './bills-checklist.models';
import { billsMockData } from './bills-checklist.mock';

@Injectable({
  providedIn: 'root'
})
export class BillsChecklistService {
  private readonly STORAGE_KEY = 'bills-checklist';
  
  private billsSubject = new BehaviorSubject<Bill[]>(this.loadFromStorage());
  public bills$: Observable<Bill[]> = this.billsSubject.asObservable();

  constructor() {}

  private loadFromStorage(): Bill[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const bills = JSON.parse(stored);
        // Validate data structure
        if (Array.isArray(bills) && bills.every(bill => 
          bill.id && bill.name && typeof bill.amount === 'number' && 
          bill.dueDate && typeof bill.isPaid === 'boolean'
        )) {
          return bills;
        }
      }
    } catch (error) {
      console.warn('Error loading bills from localStorage:', error);
    }
    
    // Return mock data if no valid storage found
    return [...billsMockData];
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
    const freshBills = [...billsMockData];
    this.billsSubject.next(freshBills);
    this.saveToStorage(freshBills);
  }

  getBills(): Bill[] {
    return this.billsSubject.value;
  }
}