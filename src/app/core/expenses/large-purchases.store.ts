import { Injectable, signal } from '@angular/core';
import { LargePurchase, isLargePurchase } from './large-purchase.model';
import { readJson, writeJson } from '../../shared/utils/storage.utils';
import { addMonths, currentYearMonth, yearMonthKey } from '../../shared/utils/year-month';

export const LARGE_PURCHASES_STORAGE_KEY = 'carteira.large-purchases';
/** Formato anterior (só para o carrossel), convertido na primeira leitura. */
export const LEGACY_INSTALLMENTS_STORAGE_KEY = 'carteira.installments';
const DEFAULT_CATEGORY = 'cartao-credito';

interface LegacyInstallmentPlan {
  id: string;
  title: string;
  amount: number;
  paid: number;
  total: number;
  imageUrl?: string;
}

function isPurchaseList(value: unknown): value is LargePurchase[] {
  return Array.isArray(value) && value.every(isLargePurchase);
}

function isLegacyList(value: unknown): value is LegacyInstallmentPlan[] {
  return Array.isArray(value) && value.every(v =>
    v && typeof v.id === 'string' && typeof v.title === 'string' && typeof v.amount === 'number'
    && Number.isInteger(v.paid) && Number.isInteger(v.total) && v.total > 0);
}

/**
 * Grandes compras cadastradas pelo usuário, salvas no navegador.
 * Fonte única para o carrossel de parcelamentos (Início) e para o Planejamento.
 */
@Injectable({ providedIn: 'root' })
export class LargePurchasesStore {
  private readonly purchasesSignal = signal<LargePurchase[]>(this.load());

  readonly purchases = this.purchasesSignal.asReadonly();

  /**
   * Adiciona e salva. Se o navegador estiver sem espaço, tenta salvar sem a imagem.
   * Retorna `false` se nem assim foi possível salvar.
   */
  add(purchase: LargePurchase): boolean {
    this.purchasesSignal.update(list => [purchase, ...list]);
    if (writeJson(LARGE_PURCHASES_STORAGE_KEY, this.purchasesSignal())) return true;
    if (!purchase.imageUrl) return false;

    this.purchasesSignal.update(list => list.map(p => (p.id === purchase.id ? { ...p, imageUrl: undefined } : p)));
    return writeJson(LARGE_PURCHASES_STORAGE_KEY, this.purchasesSignal());
  }

  private load(): LargePurchase[] {
    const stored = readJson(LARGE_PURCHASES_STORAGE_KEY, isPurchaseList);
    if (stored) return stored;

    // Compras salvas na versão anterior (carteira.installments): converte uma vez
    const legacy = readJson(LEGACY_INSTALLMENTS_STORAGE_KEY, isLegacyList);
    if (!legacy?.length) return [];
    const current = currentYearMonth();
    const migrated: LargePurchase[] = legacy.map(plan => ({
      id: plan.id,
      title: plan.title,
      totalAmount: Math.round(plan.amount * plan.total * 100) / 100,
      installments: plan.total,
      firstMonth: yearMonthKey(addMonths(current, -plan.paid)),
      categoryId: DEFAULT_CATEGORY,
      imageUrl: plan.imageUrl
    }));
    if (writeJson(LARGE_PURCHASES_STORAGE_KEY, migrated)) {
      try {
        localStorage.removeItem(LEGACY_INSTALLMENTS_STORAGE_KEY);
      } catch {
        // sem acesso ao localStorage: a conversão vale só nesta sessão
      }
    }
    return migrated;
  }
}
