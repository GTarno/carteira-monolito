import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CurrencyPipe, PercentPipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';

import { Bill, BillStatus, BillStatusType } from './bills-checklist.models';
import { compareBills, getBillStatus } from './bills-checklist.utils';
import { BillsChecklistService } from './bills-checklist.service';
import { parseIsoDate } from '../../../shared/utils/date.utils';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { AppIconName } from '../../../shared/ui/icon/app-icons';

interface BillWithStatus extends Bill {
  status: BillStatus;
}

/** Como cada status aparece: cor do badge + ícone (o status nunca depende só da cor). */
const STATUS_STYLE: Record<BillStatusType, { badge: string; icon: AppIconName }> = {
  paid: { badge: 'badge-success', icon: 'success' },
  pending: { badge: 'badge-ghost', icon: 'pending' },
  dueToday: { badge: 'badge-warning', icon: 'due-today' },
  overdue: { badge: 'badge-error', icon: 'error' }
};

/** Contas do mês: marcar como paga, progresso e total pendente. */
@Component({
  selector: 'app-bills-checklist',
  imports: [CurrencyPipe, PercentPipe, IconComponent],
  templateUrl: './bills-checklist.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BillsChecklistComponent {
  private readonly billsService = inject(BillsChecklistService);

  protected readonly statusStyle = STATUS_STYLE;

  private readonly rawBills = toSignal(this.billsService.bills$, { initialValue: [] as Bill[] });

  protected readonly bills = computed<BillWithStatus[]>(() => {
    const today = new Date();
    return this.rawBills()
      .map(bill => ({ ...bill, status: getBillStatus(bill, today) }))
      .sort(compareBills);
  });

  protected readonly paidCount = computed(() => this.rawBills().filter(bill => bill.isPaid).length);
  protected readonly totalCount = computed(() => this.rawBills().length);
  protected readonly pendingAmount = computed(() =>
    this.rawBills().filter(bill => !bill.isPaid).reduce((sum, bill) => sum + bill.amount, 0)
  );
  protected readonly progress = computed(() => (this.totalCount() ? this.paidCount() / this.totalCount() : 0));

  protected readonly monthLabel = capitalize(
    new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(new Date())
  );

  onTogglePaid(billId: string): void {
    this.billsService.togglePaid(billId);
  }

  onResetMonth(): void {
    this.billsService.resetMonth();
  }

  formatDueDate(dueDate: string): string {
    const date = parseIsoDate(dueDate);
    return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`;
  }
}

/** "novembro de 2026" → "Novembro de 2026" (só a primeira letra). */
function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
