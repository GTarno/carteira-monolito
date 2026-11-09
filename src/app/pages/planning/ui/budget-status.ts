import { PlanCardStatus } from '../models/planning.models';
import { AppIconName } from '../../../shared/ui/icon/app-icons';

export interface BudgetStatusUi {
  /** Rótulo curto (badge). */
  label: string;
  /** Frase completa (card de status, leitores de tela). */
  description: string;
  badge: string;
  progress: string;
  text: string;
  /** Fundo suave + texto, para o quadrado do ícone. */
  tint: string;
  icon: AppIconName;
}

/**
 * Como cada status do orçamento aparece (regra em `getBudgetStatus`: até 90% dentro,
 * até 100% no limite, acima disso excedeu). Status sempre vem com rótulo e ícone, nunca só cor.
 */
export const BUDGET_STATUS_UI: Record<PlanCardStatus, BudgetStatusUi> = {
  ok: {
    label: 'Dentro',
    description: 'Dentro do orçamento',
    badge: 'badge-success',
    progress: 'progress-success',
    text: 'text-success',
    tint: 'bg-success/15 text-success',
    icon: 'success'
  },
  limit: {
    label: 'No limite',
    description: 'Próximo do limite',
    badge: 'badge-warning',
    progress: 'progress-warning',
    text: 'text-warning',
    tint: 'bg-warning/15 text-warning',
    icon: 'warning'
  },
  over: {
    label: 'Excedeu',
    description: 'Acima do orçamento',
    badge: 'badge-error',
    progress: 'progress-error',
    text: 'text-error',
    tint: 'bg-error/15 text-error',
    icon: 'error'
  }
};
