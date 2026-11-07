import { Component, inject } from '@angular/core';
import { CommonModule, AsyncPipe, NgFor, NgIf, CurrencyPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { Observable, map } from 'rxjs';

import { Bill, BillStatus } from './bills-checklist.models';
import { compareBills, getBillStatus } from './bills-checklist.utils';
import { parseIsoDate } from '../../../shared/utils/date.utils';
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
    MatProgressBarModule,
    MatButtonModule
  ],
  templateUrl: './bills-checklist.component.html',
  styleUrl: './bills-checklist.component.scss',
})
export class BillsChecklistComponent {
  private billsService = inject(BillsChecklistService);
  
  billsSummary$: Observable<BillsSummary> = this.billsService.bills$.pipe(
    map(bills => this.processBillsData(bills))
  );

  private processBillsData(bills: Bill[]): BillsSummary {
    const today = new Date();
    const sortedBills: BillWithStatus[] = bills
      .map(bill => ({ ...bill, status: getBillStatus(bill, today) }))
      .sort(compareBills);

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
    const date = parseIsoDate(dueDate);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}`;
  }

  getDueDateLabel(dueDate: string): string {
    return `Vence dia ${parseIsoDate(dueDate).getDate()}`;
  }

  trackByBillId(index: number, bill: BillWithStatus): string {
    return bill.id;
  }
}
