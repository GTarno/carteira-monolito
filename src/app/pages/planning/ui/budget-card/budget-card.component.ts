import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CurrencyPipe, PercentPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { getBudgetExcess, getBudgetProgress, getBudgetStatus } from '../../models/planning.models';
import { BUDGET_STATUS_UI } from '../budget-status';
import { IconComponent } from '../../../../shared/ui/icon/icon.component';
import { AppIconName } from '../../../../shared/ui/icon/app-icons';

/**
 * Card clicável de uma categoria ou item do planejamento: ícone, status,
 * barra de uso e valores. Conteúdo extra (ex.: lista de itens) via `<ng-content>`.
 */
@Component({
  selector: 'app-budget-card',
  imports: [RouterLink, CurrencyPipe, PercentPipe, IconComponent],
  templateUrl: './budget-card.component.html',
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BudgetCardComponent {
  readonly title = input.required<string>();
  readonly icon = input<AppIconName | string>('receipt');
  readonly planned = input.required<number>();
  readonly spent = input.required<number>();
  readonly link = input.required<string | unknown[]>();
  readonly queryParams = input<Record<string, string>>({});

  protected readonly progress = computed(() => getBudgetProgress(this.planned(), this.spent()));
  protected readonly usage = computed(() => (this.planned() > 0 ? this.spent() / this.planned() : 0));
  protected readonly excess = computed(() => getBudgetExcess(this.planned(), this.spent()));
  protected readonly status = computed(() => BUDGET_STATUS_UI[getBudgetStatus(this.planned(), this.spent())]);
}
