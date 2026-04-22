import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { InventoryCategoryCreate } from '../../models/inventory-category.model';

@Component({
  selector: 'app-add-category-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './add-category-dialog.component.html',
  styleUrl: './add-category-dialog.component.scss'
})
export class AddCategoryDialogComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<AddCategoryDialogComponent>);
  private dialogData = inject(MAT_DIALOG_DATA, { optional: true });

  categoryForm: FormGroup;
  previewUrl: string | null = null;
  selectedFile: File | null = null;

  constructor() {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(120)]],
      imageFile: ['', Validators.required]
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      this.selectedFile = null;
      this.previewUrl = null;
      this.categoryForm.patchValue({ imageFile: '' });
      return;
    }

    const file = input.files[0];
    this.selectedFile = file;

    // Gerar preview usando FileReader
    const reader = new FileReader();
    reader.onload = (e) => {
      this.previewUrl = e.target?.result as string;
      this.categoryForm.patchValue({ imageFile: this.previewUrl });
    };
    reader.readAsDataURL(file);
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.categoryForm.valid && this.previewUrl) {
      const formValue = this.categoryForm.value;
      const result: InventoryCategoryCreate = {
        name: formValue.name.trim(),
        description: formValue.description.trim(),
        imageUrl: this.previewUrl
      };
      
      this.dialogRef.close(result);
    } else {
      // Marcar todos os campos como touched para mostrar erros
      this.categoryForm.markAllAsTouched();
    }
  }

  getErrorMessage(fieldName: string): string {
    const field = this.categoryForm.get(fieldName);
    if (!field?.errors || !field.touched) return '';

    if (field.errors['required']) return `${this.getFieldLabel(fieldName)} é obrigatório`;
    if (field.errors['minlength']) return `${this.getFieldLabel(fieldName)} deve ter pelo menos ${field.errors['minlength'].requiredLength} caracteres`;
    if (field.errors['maxlength']) return `${this.getFieldLabel(fieldName)} deve ter no máximo ${field.errors['maxlength'].requiredLength} caracteres`;
    
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      'name': 'Nome',
      'description': 'Descrição',
      'imageFile': 'Imagem'
    };
    return labels[fieldName] || fieldName;
  }
}