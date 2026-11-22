import { YearMonth, monthsBetween, parseYearMonthKey } from '../../shared/utils/year-month';

/** Grande compra parcelada cadastrada pelo usuário (tela "Adicionar gastos"). */
export interface LargePurchase {
  id: string;
  title: string;
  totalAmount: number;
  /** Quantidade de parcelas. */
  installments: number;
  /** Mês da 1ª parcela ("yyyy-mm"); a parcela k cai em firstMonth + (k - 1). */
  firstMonth: string;
  /** Categoria do planejamento onde as parcelas entram (ex.: 'cartao-credito'). */
  categoryId: string;
  /** Imagem ilustrativa (data URL reduzido); sem imagem, o card mostra um ícone. */
  imageUrl?: string;
}

/** O que o formulário devolve. `paidInstallments` define o mês da 1ª parcela a partir do mês atual. */
export interface LargePurchaseInput {
  title: string;
  totalAmount: number;
  installments: number;
  paidInstallments: number;
  categoryId: string;
  imageUrl?: string;
}

/** Valor de cada parcela, arredondado para baixo em centavos (a diferença fica na última). */
export function installmentAmount(totalAmount: number, installments: number): number {
  // Arredonda o total para centavos antes de dividir: 4999.90 * 100 = 499989.99999... em ponto flutuante
  const totalCents = Math.round(totalAmount * 100);
  return Math.floor(totalCents / installments) / 100;
}

/** Valor da parcela `number` (1..installments); a última absorve a diferença de centavos. */
export function installmentAmountAt(totalAmount: number, installments: number, number: number): number {
  const totalCents = Math.round(totalAmount * 100);
  const baseCents = Math.floor(totalCents / installments);
  return (number === installments ? totalCents - baseCents * (installments - 1) : baseCents) / 100;
}

/** Qual parcela cai no mês `month` (1..installments), ou `null` se nenhuma. */
export function installmentNumberIn(purchase: LargePurchase, month: YearMonth): number | null {
  const first = parseYearMonthKey(purchase.firstMonth);
  if (!first) return null;
  const number = monthsBetween(first, month) + 1;
  return number >= 1 && number <= purchase.installments ? number : null;
}

/** Parcelas pagas até `current`: as que caíram em meses anteriores ao atual. */
export function paidInstallmentsAt(purchase: LargePurchase, current: YearMonth): number {
  const first = parseYearMonthKey(purchase.firstMonth);
  if (!first) return 0;
  return Math.min(Math.max(monthsBetween(first, current), 0), purchase.installments);
}

export function isLargePurchase(value: unknown): value is LargePurchase {
  const v = value as LargePurchase;
  return !!v && typeof v.id === 'string' && typeof v.title === 'string' && typeof v.totalAmount === 'number'
    && Number.isInteger(v.installments) && v.installments > 0 && /^\d{4}-\d{2}$/.test(v.firstMonth)
    && typeof v.categoryId === 'string' && (v.imageUrl === undefined || typeof v.imageUrl === 'string');
}
