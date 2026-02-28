import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, AsyncPipe, NgFor, NgIf, CurrencyPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { Observable, map } from 'rxjs';

import { Bill, BillStatus } from './bills-checklist.models';
import { BillsChecklistService } from './bills-checklist.service';

interface BillWithStatus extends Bill {
  status: BillStatus;
}

interface BillsSummary {
  bills: BillWithStatus[];
  paidCount: number;
  totalCount: number;
  pendingTotalAmount: number;
  progressPercent: number;
}

@Component({
  selector: 'app-bills-checklist',
  standalone: true,
  imports: [
    CommonModule,
    AsyncPipe,
    NgFor,
    NgIf,
    CurrencyPipe,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatIconModule,
    MatProgressBarModule,
    MatButtonModule
  ],
  templateUrl: './bills-checklist.component.html',
  styleUrl: './bills-checklist.component.scss',
})
export class BillsChecklistComponent implements OnInit {
  private billsService = inject(BillsChecklistService);
  
  billsSummary$: Observable<BillsSummary> = this.billsService.bills$.pipe(
    map(bills => this.processBillsData(bills))
  );

  constructor() {}

  ngOnInit(): void {}

  private processBillsData(bills: Bill[]): BillsSummary {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const billsWithStatus: BillWithStatus[] = bills.map(bill => {
      const dueDate = new Date(bill.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      
      let status: BillStatus;
      
      if (bill.isPaid) {
        status = { type: 'paid', label: 'Pago', color: 'success' };
      } else if (today > dueDate) {
        status = { type: 'overdue', label: 'Atrasado', color: 'warn' };
      } else if (today.getTime() === dueDate.getTime()) {
        status = { type: 'dueToday', label: 'Vence hoje', color: 'accent' };
      } else {
        status = { type: 'pending', label: 'Pendente', color: 'primary' };
      }
      
      return { ...bill, status };
    });

    // Sort: pending first, then by due date ascending
    const sortedBills = billsWithStatus.sort((a, b) => {
      // If both are paid or both are unpaid
      if (a.isPaid === b.isPaid) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      // Unpaid first
      return a.isPaid ? 1 : -1;
    });

    const paidCount = bills.filter(bill => bill.isPaid).length;
    const totalCount = bills.length;
    const pendingTotalAmount = bills
      .filter(bill => !bill.isPaid)
      .reduce((sum, bill) => sum + bill.amount, 0);
    const progressPercent = totalCount > 0 ? (paidCount / totalCount) * 100 : 0;

    return {
      bills: sortedBills,
      paidCount,
      totalCount,
      pendingTotalAmount,
      progressPercent
    };
  }

  onTogglePaid(billId: string): void {
    this.billsService.togglePaid(billId);
  }

  onResetMonth(): void {
    this.billsService.resetMonth();
  }

  formatDueDate(dueDate: string): string {
    const date = new Date(dueDate);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}`;
  }

  getDueDateLabel(dueDate: string): string {
    const date = new Date(dueDate);
    const day = date.getDate();
    return `Vence dia ${day}`;
  }

  trackByBillId(index: number, bill: BillWithStatus): string {
    return bill.id;
  }
}
