import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { InventoryItemCreate } from '../../models/inventory-item.model';

interface DialogData {
  categoryId: string;
  categoryName?: string;
}

@Component({
  selector: 'app-add-item-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './add-item-dialog.component.html',
  styleUrl: './add-item-dialog.component.scss'
})
export class AddItemDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<AddItemDialogComponent>);
  private dialogData = inject<DialogData>(MAT_DIALOG_DATA);

  itemForm!: FormGroup;
  categoryName: string = '';

  ngOnInit(): void {
    this.categoryName = this.dialogData.categoryName || 'Categoria';
    
    this.itemForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(2)]],
      author: ['', [Validators.required, Validators.minLength(2)]],
      notes: ['', [Validators.maxLength(200)]]
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.itemForm.valid) {
      const formValue = this.itemForm.value;
      const result: InventoryItemCreate = {
        categoryId: this.dialogData.categoryId,
        title: formValue.title.trim(),
        author: formValue.author.trim(),
        notes: formValue.notes?.trim() || undefined
      };
      
      this.dialogRef.close(result);
    } else {
      // Marcar todos os campos como touched para mostrar erros
      this.itemForm.markAllAsTouched();
    }
  }

  getErrorMessage(fieldName: string): string {
    const field = this.itemForm.get(fieldName);
    if (!field?.errors || !field.touched) return '';

    if (field.errors['required']) return `${this.getFieldLabel(fieldName)} é obrigatório`;
    if (field.errors['minlength']) return `${this.getFieldLabel(fieldName)} deve ter pelo menos ${field.errors['minlength'].requiredLength} caracteres`;
    if (field.errors['maxlength']) return `${this.getFieldLabel(fieldName)} deve ter no máximo ${field.errors['maxlength'].requiredLength} caracteres`;
    
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      'title': 'Título',
      'author': this.getAuthorLabel(),
      'notes': 'Observações'
    };
    return labels[fieldName] || fieldName;
  }

  getAuthorLabel(): string {
    const categoryName = this.categoryName.toLowerCase();
    switch (categoryName) {
      case 'livros':
        return 'Autor';
      case 'discos':
        return 'Banda/Artista';
      default:
        return 'Autor';
    }
  }

  getTitleLabel(): string {
    const categoryName = this.categoryName.toLowerCase();
    switch (categoryName) {
      case 'livros':
        return 'Título do livro';
      case 'discos':
        return 'Nome do álbum';
      default:
        return 'Título';
    }
  }

  getTitlePlaceholder(): string {
    const categoryName = this.categoryName.toLowerCase();
    switch (categoryName) {
      case 'livros':
        return 'Ex: Dom Casmurro, 1984, O Senhor dos Anéis...';
      case 'discos':
        return 'Ex: Abbey Road, Dark Side of the Moon...';
      default:
        return 'Digite o título...';
    }
  }

  getAuthorPlaceholder(): string {
    const categoryName = this.categoryName.toLowerCase();
    switch (categoryName) {
      case 'livros':
        return 'Ex: Machado de Assis, George Orwell...';
      case 'discos':
        return 'Ex: The Beatles, Pink Floyd...';
      default:
        return 'Digite o autor...';
    }
  }
}