import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { CurrencyPipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NewMonthlyExpense } from '../../../../core/expenses/monthly-expense.model';
import { PlanningCategory } from '../../../planning/data-access/planning.mock';
import { IconComponent } from '../../../../shared/ui/icon/icon.component';
import { CategoryPickerComponent } from '../category-picker/category-picker.component';
import { moneyValidator, parseMoney } from '../../../../shared/utils/money.utils';

export interface MonthlyExpenseFormData {
  categories: PlanningCategory[];
}

type Field = 'name' | 'categoryId' | 'plannedValue' | 'dueDay';

/** Formulário (no drawer) de um gasto mensal recorrente. Fecha com `NewMonthlyExpense`. */
@Component({
  selector: 'app-monthly-expense-form',
  imports: [ReactiveFormsModule, IconComponent, CurrencyPipe, CategoryPickerComponent],
  templateUrl: './monthly-expense-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MonthlyExpenseFormComponent {
  protected readonly data = inject<MonthlyExpenseFormData>(DIALOG_DATA);
  private readonly dialogRef = inject<DialogRef<NewMonthlyExpense>>(DialogRef);

  protected readonly submitted = signal(false);

  protected readonly form = inject(FormBuilder).nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(60)]],
    categoryId: ['', Validators.required],
    plannedValue: ['', [Validators.required, moneyValidator(0.01)]],
    dueDay: ['10', [Validators.required, Validators.pattern(/^\d{1,2}$/), Validators.min(1), Validators.max(31)]],
    paidThisMonth: [false]
  });

  private readonly values = toSignal(this.form.valueChanges, { initialValue: this.form.getRawValue() });

  /**
   * Situação do vencimento deste mês em relação a hoje, para orientar a pergunta "já pagou?".
   * Em meses curtos, o dia 31 vence no último dia do mês.
   */
  protected readonly dueThisMonth = computed<'passed' | 'today' | 'upcoming' | null>(() => {
    const day = Number(this.values().dueDay);
    if (!Number.isInteger(day) || day < 1 || day > 31) return null;
    const today = new Date();
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const due = Math.min(day, lastDay);
    if (due < today.getDate()) return 'passed';
    return due === today.getDate() ? 'today' : 'upcoming';
  });

  /** Resumo de onde o gasto vai aparecer, atualizado enquanto o usuário preenche. */
  protected readonly summary = computed(() => {
    const value = this.values();
    const category = this.data.categories.find(c => c.id === value.categoryId);
    const amount = parseMoney(value.plannedValue ?? '');
    return category && amount ? { category: category.title, amount, dueDay: value.dueDay, paid: !!value.paidThisMonth } : null;
  });

  showError(field: Field): boolean {
    const control = this.form.controls[field];
    return control.invalid && (control.touched || this.submitted());
  }

  errorMessage(field: Field): string {
    const errors = this.form.controls[field].errors;
    if (!errors) return '';
    if (errors['required']) {
      return field === 'categoryId' ? 'Escolha onde esse gasto se encaixa.' : 'Campo obrigatório.';
    }
    if (errors['minlength']) return `Use pelo menos ${errors['minlength'].requiredLength} caracteres.`;
    if (errors['maxlength']) return `Use no máximo ${errors['maxlength'].requiredLength} caracteres.`;
    if (errors['invalidMoney']) return 'Digite um valor válido, ex.: 150,00.';
    if (errors['tooManyDecimals']) return 'Use no máximo 2 casas decimais.';
    if (field === 'dueDay') return 'Informe um dia entre 1 e 31.';
    if (errors['min']) return 'O valor deve ser maior que zero.';
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
    const value = this.form.getRawValue();
    this.dialogRef.close({
      name: value.name.trim(),
      categoryId: value.categoryId,
      plannedValue: parseMoney(value.plannedValue) ?? 0,
      dueDay: Number(value.dueDay),
      paidThisMonth: value.paidThisMonth
    });
  }
}
