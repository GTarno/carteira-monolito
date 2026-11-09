import { PlanItemDetail } from '../models/planning.models';
import { YearMonth, YearMonthUtils } from '../models/year-month.models';
import { AppIconName } from '../../../shared/ui/icon/app-icons';

export interface PlanningCategory {
  id: string;
  title: string;
  /** Nome do ícone em APP_ICONS */
  icon: AppIconName;
}

interface ItemSeed {
  id: string;
  name: string;
  icon: AppIconName;
  plannedValue: number;
  /** Gasto típico do item no mês. */
  baseValue: number;
  /** Variação relativa máxima entre meses (0.1 = ±10%). */
  variation: number;
}

interface CategorySeed extends PlanningCategory {
  items: ItemSeed[];
}

/** Quantos meses anteriores ao atual têm dados de exemplo. */
export const PLANNING_HISTORY_MONTHS = 12;
/** Quantos meses futuros têm planejamento (sem gastos). */
export const PLANNING_FUTURE_MONTHS = 1;

const CATEGORY_SEEDS: CategorySeed[] = [
  {
    id: 'contas',
    title: 'Contas',
    icon: 'receipt',
    items: [
      { id: 'luz', name: 'Luz', icon: 'lightbulb', plannedValue: 200, baseValue: 185, variation: 0.15 },
      { id: 'condominio', name: 'Condomínio', icon: 'building', plannedValue: 450, baseValue: 450, variation: 0 },
      { id: 'internet', name: 'Internet', icon: 'wifi', plannedValue: 100, baseValue: 89.9, variation: 0 },
      { id: 'financiamento', name: 'Financiamento', icon: 'home', plannedValue: 1850, baseValue: 1850, variation: 0 }
    ]
  },
  {
    id: 'cartao-credito',
    title: 'Cartão de crédito',
    icon: 'credit-card',
    items: [
      { id: 'fatura', name: 'Fatura', icon: 'credit-card', plannedValue: 800, baseValue: 760, variation: 0.25 }
    ]
  },
  {
    id: 'alimentacao',
    title: 'Alimentação',
    icon: 'food',
    items: [
      { id: 'mercado', name: 'Mercado', icon: 'shopping-cart', plannedValue: 700, baseValue: 660, variation: 0.2 },
      { id: 'acougue', name: 'Açougue', icon: 'food', plannedValue: 200, baseValue: 185, variation: 0.18 },
      { id: 'restaurantes', name: 'Restaurantes', icon: 'restaurant', plannedValue: 300, baseValue: 340, variation: 0.3 }
    ]
  }
];

export const PLANNING_CATEGORIES: PlanningCategory[] = CATEGORY_SEEDS.map(({ id, title, icon }) => ({ id, title, icon }));

/** Ruído determinístico em [-1, 1], para os dados não mudarem a cada recarga. */
function deterministicNoise(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return (x - Math.floor(x)) * 2 - 1;
}

function roundCents(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Gera os itens de planejamento (todas as categorias) por mês, de
 * `PLANNING_HISTORY_MONTHS` meses atrás até `PLANNING_FUTURE_MONTHS` à frente de `current`.
 * Chave do mapa: `YearMonthUtils.toKey(month)`.
 */
export function createPlanningSeed(current: YearMonth): Map<string, PlanItemDetail[]> {
  const itemsByMonth = new Map<string, PlanItemDetail[]>();

  for (let offset = -PLANNING_HISTORY_MONTHS; offset <= PLANNING_FUTURE_MONTHS; offset++) {
    const month = YearMonthUtils.addMonths(current, offset);
    const isFuture = offset > 0;

    const items = CATEGORY_SEEDS.flatMap((category, categoryIndex) =>
      category.items.map((item, itemIndex): PlanItemDetail => {
        const noise = deterministicNoise((offset + 100) * 31 + categoryIndex * 7 + itemIndex);
        return {
          id: item.id,
          categoryId: category.id,
          name: item.name,
          icon: item.icon,
          plannedValue: item.plannedValue,
          realValue: isFuture ? 0 : roundCents(item.baseValue * (1 + noise * item.variation))
        };
      })
    );

    itemsByMonth.set(YearMonthUtils.toKey(month), items);
  }

  return itemsByMonth;
}
