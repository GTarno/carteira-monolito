import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { EditPlanningItemDialogData, PlanningItemUpdate } from '../../models/planning-item-update.model';
import { IconComponent } from '../../../../shared/ui/icon/icon.component';
import { moneyValidator, parseMoney, toMoneyInput } from '../../../../shared/utils/money.utils';

type MoneyField = 'plannedValue' | 'realValue';

/** Diálogo para editar os valores de um item. Abre preenchido; aceita "1.234,56". */
@Component({
  selector: 'app-edit-planning-item-dialog',
  imports: [ReactiveFormsModule, IconComponent],
  templateUrl: './edit-planning-item-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditPlanningItemDialogComponent {
  protected readonly data = inject<EditPlanningItemDialogData>(DIALOG_DATA);
  private readonly dialogRef = inject<DialogRef<PlanningItemUpdate>>(DialogRef);

  protected readonly submitted = signal(false);

  protected readonly form = inject(FormBuilder).nonNullable.group({
    plannedValue: [toMoneyInput(this.data.plannedValue), [Validators.required, moneyValidator(0)]],
    realValue: [toMoneyInput(this.data.realValue), [Validators.required, moneyValidator(0)]]
  });

  showError(field: MoneyField): boolean {
    const control = this.form.controls[field];
    return control.invalid && (control.touched || this.submitted());
  }

  errorMessage(field: MoneyField): string {
    const errors = this.form.controls[field].errors;
    if (errors?.['required']) return 'Este campo é obrigatório.';
    if (errors?.['invalidMoney']) return 'Digite um valor válido, ex.: 150,00.';
    if (errors?.['tooManyDecimals']) return 'Use no máximo 2 casas decimais.';
    if (errors?.['min']) return 'O valor não pode ser negativo.';
    return '';
  }

  cancel(): void {
    this.dialogRef.close();
  }

  save(): void {
    this.submitted.set(true);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { plannedValue, realValue } = this.form.getRawValue();
    this.dialogRef.close({
      plannedValue: parseMoney(plannedValue) ?? 0,
      realValue: parseMoney(realValue) ?? 0
    });
  }
}
