export interface InstallmentPlan {
  id: string;
  title: string;
  /** Valor de cada parcela. */
  amount: number;
  currency: 'BRL';
  /** Parcelas já pagas. */
  paid: number;
  /** Quantidade total de parcelas. */
  total: number;
  /** Imagem ilustrativa (caminho ou data URL); sem imagem, o card mostra um ícone. */
  imageUrl?: string;
}

/** Dados de uma grande compra cadastrada em "Adicionar gastos". */
export interface LargePurchaseInput {
  title: string;
  totalAmount: number;
  installments: number;
  paidInstallments: number;
  imageUrl?: string;
}

/** Valor de cada parcela, arredondado para baixo em centavos (a diferença fica na última). */
export function installmentAmount(totalAmount: number, installments: number): number {
  // Arredonda o total para centavos antes de dividir: 4999.90 * 100 = 499989.99999... em ponto flutuante
  const totalCents = Math.round(totalAmount * 100);
  return Math.floor(totalCents / installments) / 100;
}

export function isInstallmentPlan(value: unknown): value is InstallmentPlan {
  const v = value as InstallmentPlan;
  return !!v && typeof v.id === 'string' && typeof v.title === 'string' && typeof v.amount === 'number'
    && Number.isInteger(v.paid) && Number.isInteger(v.total) && v.total > 0
    && (v.imageUrl === undefined || typeof v.imageUrl === 'string');
}
