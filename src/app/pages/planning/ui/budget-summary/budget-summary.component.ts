import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { CurrencyPipe, PercentPipe } from '@angular/common';
import { getBudgetExcess, getBudgetStatus } from '../../models/planning.models';
import { BUDGET_STATUS_UI } from '../budget-status';
import { IconComponent } from '../../../../shared/ui/icon/icon.component';
import { AppIconName } from '../../../../shared/ui/icon/app-icons';

/**
 * Resumo de orçamento: planejado, gasto, restante e barra de uso com o status.
 * Usado no mês (Planejamento), na categoria e no item.
 */
@Component({
  selector: 'app-budget-summary',
  imports: [CurrencyPipe, PercentPipe, IconComponent],
  templateUrl: './budget-summary.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BudgetSummaryComponent {
  readonly title = input.required<string>();
  readonly subtitle = input<string>();
  readonly icon = input<AppIconName | string>('wallet');
  readonly planned = input.required<number>();
  readonly spent = input.required<number>();
  /** Mostra o botão de editar (emite `edit`). */
  readonly editable = input(false);

  readonly edit = output<void>();

  protected readonly remaining = computed(() => this.planned() - this.spent());
  protected readonly excess = computed(() => getBudgetExcess(this.planned(), this.spent()));
  /** Uso real (pode passar de 100%); a barra é limitada a 100. */
  protected readonly usage = computed(() => (this.planned() > 0 ? this.spent() / this.planned() : 0));
  protected readonly status = computed(() => BUDGET_STATUS_UI[getBudgetStatus(this.planned(), this.spent())]);
}
