import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DialogRef } from '@angular/cdk/dialog';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PlanningItemCreate } from '../../models/planning.models';
import { IconComponent } from '../../../../shared/ui/icon/icon.component';
import { AppIconName } from '../../../../shared/ui/icon/app-icons';
import { moneyValidator, parseMoney } from '../../../../shared/utils/money.utils';

interface IconOption {
  name: string;
  icon: AppIconName;
}

/** Ícones que o usuário pode escolher para um item do planejamento. */
export const PLANNING_ITEM_ICONS: IconOption[] = [
  { name: 'Contas', icon: 'receipt' },
  { name: 'Luz', icon: 'lightbulb' },
  { name: 'Energia', icon: 'energy' },
  { name: 'Internet', icon: 'wifi' },
  { name: 'Casa', icon: 'home' },
  { name: 'Condomínio', icon: 'building' },
  { name: 'Cartão', icon: 'credit-card' },
  { name: 'Banco', icon: 'bank' },
  { name: 'Dinheiro', icon: 'banknote' },
  { name: 'Poupança', icon: 'savings' },
  { name: 'Mercado', icon: 'shopping-cart' },
  { name: 'Compras', icon: 'shopping-bag' },
  { name: 'Alimentação', icon: 'food' },
  { name: 'Restaurante', icon: 'restaurant' },
  { name: 'Carro', icon: 'car' },
  { name: 'Saúde', icon: 'health' },
  { name: 'Educação', icon: 'education' },
  { name: 'Orçamento', icon: 'calculator' }
];

/** Diálogo para adicionar um item a uma categoria. Fecha com `PlanningItemCreate` (sem categoryId). */
@Component({
  selector: 'app-add-planning-item-dialog',
  imports: [ReactiveFormsModule, IconComponent],
  templateUrl: './add-planning-item-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddPlanningItemDialogComponent {
  private readonly dialogRef = inject<DialogRef<PlanningItemCreate>>(DialogRef);

  protected readonly icons = PLANNING_ITEM_ICONS;
  protected readonly selectedIcon = signal<AppIconName | null>(null);
  protected readonly submitted = signal(false);

  protected readonly form = inject(FormBuilder).nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
    plannedValue: ['', [Validators.required, moneyValidator(0.01)]]
  });

  showError(control: 'name' | 'plannedValue'): boolean {
    const field = this.form.controls[control];
    return field.invalid && (field.touched || this.submitted());
  }

  nameError(): string {
    const errors = this.form.controls.name.errors;
    if (errors?.['required']) return 'Informe o nome do item.';
    if (errors?.['minlength']) return 'Use pelo menos 2 caracteres.';
    return '';
  }

  valueError(): string {
    const errors = this.form.controls.plannedValue.errors;
    if (errors?.['required']) return 'Informe o valor planejado.';
    if (errors?.['invalidMoney']) return 'Digite um valor válido, ex.: 150,00.';
    if (errors?.['tooManyDecimals']) return 'Use no máximo 2 casas decimais.';
    if (errors?.['min']) return 'O valor deve ser maior que zero.';
    return '';
  }

  cancel(): void {
    this.dialogRef.close();
  }

  save(): void {
    this.submitted.set(true);
    const icon = this.selectedIcon();
    if (this.form.invalid || !icon) {
      this.form.markAllAsTouched();
      return;
    }

    const { name, plannedValue } = this.form.getRawValue();
    this.dialogRef.close({
      categoryId: '', // preenchido por quem abre o diálogo
      name: name.trim(),
      plannedValue: parseMoney(plannedValue) ?? 0,
      icon
    });
  }
}
