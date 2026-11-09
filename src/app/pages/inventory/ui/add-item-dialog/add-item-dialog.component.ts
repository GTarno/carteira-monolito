import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { InventoryItemCreate } from '../../models/inventory-item.model';
import { inventoryLabelsFor } from '../../models/inventory-labels';
import { IconComponent } from '../../../../shared/ui/icon/icon.component';

export interface AddItemDialogData {
  categoryId: string;
  categoryName?: string;
}

type Field = 'title' | 'author' | 'notes';

/** Diálogo para adicionar um item a uma categoria do inventário. */
@Component({
  selector: 'app-add-item-dialog',
  imports: [ReactiveFormsModule, IconComponent],
  templateUrl: './add-item-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddItemDialogComponent {
  protected readonly data = inject<AddItemDialogData>(DIALOG_DATA);
  private readonly dialogRef = inject<DialogRef<InventoryItemCreate>>(DialogRef);

  protected readonly categoryName = this.data.categoryName || 'Categoria';
  protected readonly labels = inventoryLabelsFor(this.categoryName);
  protected readonly submitted = signal(false);

  protected readonly form = inject(FormBuilder).nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    author: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(80)]],
    notes: ['', [Validators.maxLength(200)]]
  });

  showError(field: Field): boolean {
    const control = this.form.controls[field];
    return control.invalid && (control.touched || this.submitted());
  }

  errorMessage(field: Field): string {
    const errors = this.form.controls[field].errors;
    if (errors?.['required']) return 'Campo obrigatório.';
    if (errors?.['minlength']) return `Use pelo menos ${errors['minlength'].requiredLength} caracteres.`;
    if (errors?.['maxlength']) return `Use no máximo ${errors['maxlength'].requiredLength} caracteres.`;
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
    const { title, author, notes } = this.form.getRawValue();
    this.dialogRef.close({
      categoryId: this.data.categoryId,
      title: title.trim(),
      author: author.trim(),
      notes: notes.trim() || undefined
    });
  }
}
