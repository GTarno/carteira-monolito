import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { InstallmentPlan, LargePurchaseInput, installmentAmount, isInstallmentPlan } from '../models/installments.models';
import { INSTALLMENTS_MOCK } from './installments.mock';
import { createId } from '../../../../shared/utils/id.utils';
import { readJson, writeJson } from '../../../../shared/utils/storage.utils';

export const INSTALLMENTS_STORAGE_KEY = 'carteira.installments';

function isPlanList(value: unknown): value is InstallmentPlan[] {
  return Array.isArray(value) && value.every(isInstallmentPlan);
}

/**
 * Compras parceladas: as de exemplo + as cadastradas pelo usuário (salvas no navegador).
 */
@Injectable({
  providedIn: 'root'
})
export class InstallmentsService {
  private readonly customPlans: InstallmentPlan[] = readJson(INSTALLMENTS_STORAGE_KEY, isPlanList) ?? [];
  private readonly plansSubject = new BehaviorSubject<InstallmentPlan[]>([...this.customPlans, ...INSTALLMENTS_MOCK]);

  getPlans(): Observable<InstallmentPlan[]> {
    return this.plansSubject.asObservable();
  }

  /**
   * Cadastra uma grande compra. Ela aparece primeiro no carrossel.
   * Retorna o plano criado e se foi possível salvar no navegador.
   */
  addPurchase(input: LargePurchaseInput): { plan: InstallmentPlan; saved: boolean } {
    const plan: InstallmentPlan = {
      id: createId(),
      title: input.title,
      amount: installmentAmount(input.totalAmount, input.installments),
      currency: 'BRL',
      paid: input.paidInstallments,
      total: input.installments,
      imageUrl: input.imageUrl
    };
    this.customPlans.unshift(plan);
    this.plansSubject.next([...this.customPlans, ...INSTALLMENTS_MOCK]);

    let saved = writeJson(INSTALLMENTS_STORAGE_KEY, this.customPlans);
    if (!saved && plan.imageUrl) {
      // Armazenamento cheio: tenta salvar ao menos os dados, sem a imagem
      this.customPlans[0] = { ...plan, imageUrl: undefined };
      saved = writeJson(INSTALLMENTS_STORAGE_KEY, this.customPlans);
    }
    return { plan, saved };
  }
}
