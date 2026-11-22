import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { CurrencyPipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { LargePurchaseInput, installmentAmount } from '../../../../core/expenses/large-purchase.model';
import { PlanningCategory } from '../../../planning/data-access/planning.mock';
import { CategoryPickerComponent } from '../category-picker/category-picker.component';
import { IconComponent } from '../../../../shared/ui/icon/icon.component';
import { moneyValidator, parseMoney } from '../../../../shared/utils/money.utils';
import { imageErrorMessage, readImageAsDataUrl } from '../../../../shared/utils/image.utils';

type Field = 'title' | 'totalAmount' | 'installments' | 'paidInstallments' | 'categoryId';

export interface LargePurchaseFormData {
  categories: PlanningCategory[];
}

/** Categoria sugerida para compras parceladas. */
const DEFAULT_CATEGORY = 'cartao-credito';

const MAX_INSTALLMENTS = 120;

/** Parcelas já pagas precisam ser menores que o total de parcelas. */
function paidBelowTotal(group: AbstractControl): ValidationErrors | null {
  const total = Number(group.get('installments')?.value);
  const paid = Number(group.get('paidInstallments')?.value);
  return Number.isInteger(total) && Number.isInteger(paid) && paid >= total ? { paidTooHigh: true } : null;
}

/** Formulário (no drawer) de uma grande compra parcelada. Fecha com `LargePurchaseInput`. */
@Component({
  selector: 'app-large-purchase-form',
  imports: [ReactiveFormsModule, IconComponent, CurrencyPipe, CategoryPickerComponent],
  templateUrl: './large-purchase-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LargePurchaseFormComponent {
  protected readonly data = inject<LargePurchaseFormData>(DIALOG_DATA);
  private readonly dialogRef = inject<DialogRef<LargePurchaseInput>>(DialogRef);

  protected readonly submitted = signal(false);
  protected readonly imageUrl = signal<string | null>(null);
  protected readonly imageError = signal<string | null>(null);
  protected readonly imageLoading = signal(false);
  protected readonly maxInstallments = MAX_INSTALLMENTS;

  protected readonly form = inject(FormBuilder).nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(60)]],
    totalAmount: ['', [Validators.required, moneyValidator(0.01)]],
    installments: ['12', [Validators.required, Validators.pattern(/^\d+$/), Validators.min(1), Validators.max(MAX_INSTALLMENTS)]],
    paidInstallments: ['0', [Validators.required, Validators.pattern(/^\d+$/), Validators.min(0)]],
    categoryId: [this.defaultCategory(), Validators.required]
  }, { validators: paidBelowTotal });

  private readonly values = toSignal(this.form.valueChanges, { initialValue: this.form.getRawValue() });

  /** Prévia "12x de R$ 83,33" enquanto o usuário preenche. */
  protected readonly preview = computed(() => {
    const value = this.values();
    const total = parseMoney(value.totalAmount ?? '');
    const count = Number(value.installments);
    const paid = Number(value.paidInstallments) || 0;
    if (!total || total <= 0 || !Number.isInteger(count) || count < 1 || count > MAX_INSTALLMENTS) return null;
    const amount = installmentAmount(total, count);
    const category = this.data.categories.find(c => c.id === value.categoryId)?.title;
    return { count, amount, remaining: Math.max(count - paid, 0), category };
  });

  showError(field: Field): boolean {
    const control = this.form.controls[field];
    const groupError = field === 'paidInstallments' && this.form.hasError('paidTooHigh');
    return (control.invalid || groupError) && (control.touched || this.submitted());
  }

  errorMessage(field: Field): string {
    const errors = this.form.controls[field].errors;
    if (field === 'categoryId' && errors?.['required']) return 'Escolha a categoria do planejamento.';
    if (errors?.['required']) return 'Campo obrigatório.';
    if (errors?.['minlength']) return `Use pelo menos ${errors['minlength'].requiredLength} caracteres.`;
    if (errors?.['maxlength']) return `Use no máximo ${errors['maxlength'].requiredLength} caracteres.`;
    if (errors?.['invalidMoney']) return 'Digite um valor válido, ex.: 2.499,90.';
    if (errors?.['tooManyDecimals']) return 'Use no máximo 2 casas decimais.';
    if (field === 'installments' && errors) return `Informe de 1 a ${MAX_INSTALLMENTS} parcelas.`;
    if (field === 'paidInstallments' && (errors || this.form.hasError('paidTooHigh'))) {
      return 'Precisa ser menor que a quantidade de parcelas.';
    }
    if (errors?.['min']) return 'O valor deve ser maior que zero.';
    return '';
  }

  private defaultCategory(): string {
    return this.data.categories.some(c => c.id === DEFAULT_CATEGORY) ? DEFAULT_CATEGORY : (this.data.categories[0]?.id ?? '');
  }

  async onImageSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    this.imageError.set(null);
    if (!file) return;

    this.imageLoading.set(true);
    try {
      this.imageUrl.set(await readImageAsDataUrl(file));
    } catch (error) {
      this.imageError.set(imageErrorMessage(error));
    } finally {
      this.imageLoading.set(false);
      input.value = '';
    }
  }

  removeImage(): void {
    this.imageUrl.set(null);
    this.imageError.set(null);
  }

  cancel(): void {
    this.dialogRef.close();
  }

  save(): void {
    this.submitted.set(true);
    if (this.form.invalid || this.imageLoading()) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    this.dialogRef.close({
      title: value.title.trim(),
      totalAmount: parseMoney(value.totalAmount) ?? 0,
      installments: Number(value.installments),
      paidInstallments: Number(value.paidInstallments),
      categoryId: value.categoryId,
      imageUrl: this.imageUrl() ?? undefined
    });
  }
}
