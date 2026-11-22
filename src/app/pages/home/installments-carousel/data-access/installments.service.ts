import { Injectable, computed, inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';
import { InstallmentPlan } from '../models/installments.models';
import { INSTALLMENTS_MOCK } from './installments.mock';
import { LargePurchasesStore } from '../../../../core/expenses/large-purchases.store';
import { LargePurchase, installmentAmount, paidInstallmentsAt } from '../../../../core/expenses/large-purchase.model';
import { currentYearMonth } from '../../../../shared/utils/year-month';

/**
 * Parcelamentos do carrossel: as compras cadastradas pelo usuário (mais recentes primeiro)
 * seguidas das de exemplo. As parcelas pagas são calculadas pelo mês atual.
 */
@Injectable({
  providedIn: 'root'
})
export class InstallmentsService {
  private readonly store = inject(LargePurchasesStore);

  private readonly plans = computed<InstallmentPlan[]>(() => {
    const current = currentYearMonth();
    return [...this.store.purchases().map(purchase => this.toPlan(purchase, current)), ...INSTALLMENTS_MOCK];
  });

  private readonly plans$ = toObservable(this.plans);

  getPlans(): Observable<InstallmentPlan[]> {
    return this.plans$;
  }

  private toPlan(purchase: LargePurchase, current: ReturnType<typeof currentYearMonth>): InstallmentPlan {
    return {
      id: purchase.id,
      title: purchase.title,
      amount: installmentAmount(purchase.totalAmount, purchase.installments),
      currency: 'BRL',
      paid: paidInstallmentsAt(purchase, current),
      total: purchase.installments,
      imageUrl: purchase.imageUrl
    };
  }
}
