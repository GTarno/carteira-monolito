import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { filter } from 'rxjs';
import { ToastService } from '../../shared/ui/toast/toast.service';
import { AppDialog } from '../../shared/ui/dialog/app-dialog.service';
import { IconComponent } from '../../shared/ui/icon/icon.component';
import { AppIconName } from '../../shared/ui/icon/app-icons';
import { MonthlyExpenseInput } from '../../core/expenses/monthly-expense.model';
import { LargePurchaseInput } from '../home/installments-carousel/models/installments.models';
import { AddExpensesFacade } from './data-access/add-expenses.facade';
import { MonthlyExpenseFormComponent, MonthlyExpenseFormData } from './ui/monthly-expense-form/monthly-expense-form.component';
import { LargePurchaseFormComponent } from './ui/large-purchase-form/large-purchase-form.component';

type ExpenseType = 'gastos-mensais' | 'grandes-compras';

interface ExpenseOption {
  type: ExpenseType;
  title: string;
  description: string;
  image: string;
  icon: AppIconName;
}

const NOT_SAVED_WARNING = 'Não foi possível salvar no navegador: o gasto vale só até recarregar a página.';

/** Registro de gastos: cada card abre um formulário num drawer lateral. */
@Component({
  selector: 'app-adicionar-gastos',
  imports: [IconComponent],
  templateUrl: './adicionar-gastos.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdicionarGastosComponent {
  private readonly toast = inject(ToastService);
  private readonly dialog = inject(AppDialog);
  private readonly facade = inject(AddExpensesFacade);

  protected readonly options: ExpenseOption[] = [
    {
      type: 'gastos-mensais',
      title: 'Gastos mensais',
      description: 'Uma conta comum, paga todos os meses. Entra nas Contas do mês e no Planejamento.',
      image: 'assets/images/mensais.png',
      icon: 'receipt'
    },
    {
      type: 'grandes-compras',
      title: 'Grandes compras',
      description: 'Uma compra parcelada, para acompanhar as parcelas em Meus parcelamentos.',
      image: 'assets/images/parcelamentos.png',
      icon: 'credit-card'
    }
  ];

  onSelect(option: ExpenseOption): void {
    if (option.type === 'gastos-mensais') {
      this.openMonthlyExpense();
    } else {
      this.openLargePurchase();
    }
  }

  private openMonthlyExpense(): void {
    this.dialog.open<MonthlyExpenseFormComponent, MonthlyExpenseFormData, MonthlyExpenseInput>(MonthlyExpenseFormComponent, {
      variant: 'drawer',
      data: { categories: this.facade.planningCategories() },
      ariaLabel: 'Novo gasto mensal'
    }).closed.pipe(filter((input): input is MonthlyExpenseInput => !!input)).subscribe(input => {
      const { value, saved } = this.facade.addMonthlyExpense(input);
      const category = this.facade.planningCategories().find(c => c.id === value.categoryId)?.title ?? 'Planejamento';
      this.toast.success(`"${value.name}" adicionado às Contas do mês e ao Planejamento › ${category}.`, { duration: 5000 });
      if (!saved) this.toast.warning(NOT_SAVED_WARNING);
    });
  }

  private openLargePurchase(): void {
    this.dialog.open<LargePurchaseFormComponent, void, LargePurchaseInput>(LargePurchaseFormComponent, {
      variant: 'drawer',
      ariaLabel: 'Nova grande compra'
    }).closed.pipe(filter((input): input is LargePurchaseInput => !!input)).subscribe(input => {
      const { value, saved } = this.facade.addLargePurchase(input);
      this.toast.success(`"${value.title}" adicionado a Meus parcelamentos.`, { duration: 5000 });
      if (!saved) this.toast.warning(NOT_SAVED_WARNING);
    });
  }
}
