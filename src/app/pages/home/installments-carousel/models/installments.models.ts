/** Um parcelamento como o carrossel exibe. */
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
