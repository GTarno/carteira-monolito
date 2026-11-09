import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DialogRef } from '@angular/cdk/dialog';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { InventoryCategoryCreate } from '../../models/inventory-category.model';
import { IconComponent } from '../../../../shared/ui/icon/icon.component';

/** Tamanho máximo da imagem: ela é guardada como data URL na memória (sem backend ainda). */
export const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

type Field = 'name' | 'description';

/** Diálogo para criar uma categoria do inventário, com imagem. */
@Component({
  selector: 'app-add-category-dialog',
  imports: [ReactiveFormsModule, IconComponent],
  templateUrl: './add-category-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddCategoryDialogComponent {
  private readonly dialogRef = inject<DialogRef<InventoryCategoryCreate>>(DialogRef);

  protected readonly submitted = signal(false);
  protected readonly previewUrl = signal<string | null>(null);
  protected readonly imageError = signal<string | null>(null);

  protected readonly form = inject(FormBuilder).nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
    description: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(120)]]
  });

  showError(field: Field): boolean {
    const control = this.form.controls[field];
    return control.invalid && (control.touched || this.submitted());
  }

  errorMessage(field: Field): string {
    const errors = this.form.controls[field].errors;
    const label = field === 'name' ? 'O nome' : 'A descrição';
    if (errors?.['required']) return `${label} é obrigatório${field === 'name' ? '' : 'a'}.`;
    if (errors?.['minlength']) return `Use pelo menos ${errors['minlength'].requiredLength} caracteres.`;
    if (errors?.['maxlength']) return `Use no máximo ${errors['maxlength'].requiredLength} caracteres.`;
    return '';
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    this.imageError.set(null);
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.imageError.set('Escolha um arquivo de imagem (PNG, JPG, WebP...).');
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      this.imageError.set('A imagem deve ter no máximo 2 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => this.previewUrl.set(reader.result as string);
    reader.readAsDataURL(file);
  }

  cancel(): void {
    this.dialogRef.close();
  }

  save(): void {
    this.submitted.set(true);
    const imageUrl = this.previewUrl();
    if (!imageUrl && !this.imageError()) {
      this.imageError.set('Escolha uma imagem para a categoria.');
    }
    if (this.form.invalid || !imageUrl) {
      this.form.markAllAsTouched();
      return;
    }
    const { name, description } = this.form.getRawValue();
    this.dialogRef.close({ name: name.trim(), description: description.trim(), imageUrl });
  }
}
