import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ToastService } from '../../shared/ui/toast/toast.service';
import { IconComponent } from '../../shared/ui/icon/icon.component';
import { AppIconName } from '../../shared/ui/icon/app-icons';

type ExpenseType = 'gastos-mensais' | 'grandes-compras';

interface ExpenseOption {
  type: ExpenseType;
  title: string;
  description: string;
  image: string;
  icon: AppIconName;
}

/** Escolha do tipo de gasto a registrar (os formulários chegam com a API de lançamentos). */
@Component({
  selector: 'app-adicionar-gastos',
  imports: [IconComponent],
  templateUrl: './adicionar-gastos.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdicionarGastosComponent {
  private readonly toast = inject(ToastService);

  protected readonly options: ExpenseOption[] = [
    {
      type: 'gastos-mensais',
      title: 'Gastos mensais',
      description: 'Uma conta comum, paga todos os meses.',
      image: 'assets/images/mensais.png',
      icon: 'receipt'
    },
    {
      type: 'grandes-compras',
      title: 'Grandes compras',
      description: 'Uma compra parcelada, para acompanhar as parcelas.',
      image: 'assets/images/parcelamentos.png',
      icon: 'credit-card'
    }
  ];

  onSelect(option: ExpenseOption): void {
    // TODO: abrir os formulários quando existir a API de lançamentos (ver docs/BACKEND_SPRING_BOOT.md)
    this.toast.info(`${option.title}: em breve!`);
  }
}
