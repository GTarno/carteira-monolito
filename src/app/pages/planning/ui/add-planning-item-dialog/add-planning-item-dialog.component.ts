import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PlanningItemCreate } from '../../models/planning.models';

@Component({
  selector: 'app-add-planning-item-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './add-planning-item-dialog.component.html',
  styleUrls: ['./add-planning-item-dialog.component.scss']
})
export class AddPlanningItemDialogComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<AddPlanningItemDialogComponent>);

  form: FormGroup;
  selectedIcon: string | null = null;

  // Ícones disponíveis para seleção
  availableIcons: { name: string; icon: string }[] = [
    { name: 'Pagamentos', icon: 'payments' },
    { name: 'Cartão de Crédito', icon: 'credit_card' },
    { name: 'Recibos', icon: 'receipt_long' },
    { name: 'Banco', icon: 'account_balance' },
    { name: 'Casa', icon: 'home' },
    { name: 'Energia', icon: 'bolt' },
    { name: 'Internet', icon: 'wifi' },
    { name: 'Carro', icon: 'directions_car' },
    { name: 'Mercado', icon: 'local_grocery_store' },
    { name: 'Restaurante', icon: 'restaurant' },
    { name: 'Médico', icon: 'medical_services' },
    { name: 'Educação', icon: 'school' },
    { name: 'Poupança', icon: 'savings' },
    { name: 'Compras', icon: 'shopping_cart' },
    { name: 'Dinheiro', icon: 'attach_money' },
    { name: 'Orçamento', icon: 'request_quote' },
    { name: 'Pagamento', icon: 'paid' },
    { name: 'Carteira', icon: 'account_balance_wallet' }
  ];

  constructor() {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      plannedValue: [null, [Validators.required, Validators.min(0.01)]]
    });
  }

  selectIcon(icon: string): void {
    this.selectedIcon = icon;
  }

  isIconSelected(icon: string): boolean {
    return this.selectedIcon === icon;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (!this.form.valid || !this.selectedIcon) {
      return;
    }

    const formValue = this.form.value;
    const payload: PlanningItemCreate = {
      categoryId: '', // Será preenchido pelo componente que abre o dialog
      name: formValue.name.trim(),
      plannedValue: Number(formValue.plannedValue),
      icon: this.selectedIcon
    };

    this.dialogRef.close(payload);
  }

  isFormValid(): boolean {
    return this.form.valid && this.selectedIcon !== null;
  }

  getNameError(): string {
    const nameControl = this.form.get('name');
    if (nameControl?.hasError('required')) {
      return 'Nome é obrigatório';
    }
    if (nameControl?.hasError('minlength')) {
      return 'Nome deve ter pelo menos 2 caracteres';
    }
    return '';
  }

  getValueError(): string {
    const valueControl = this.form.get('plannedValue');
    if (valueControl?.hasError('required')) {
      return 'Valor planejado é obrigatório';
    }
    if (valueControl?.hasError('min')) {
      return 'Valor deve ser maior que zero';
    }
    return '';
  }
}