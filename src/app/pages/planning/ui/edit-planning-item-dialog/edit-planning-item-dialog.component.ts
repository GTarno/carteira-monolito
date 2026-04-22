import { Component, Inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { EditPlanningItemDialogData, PlanningItemUpdate } from '../../models/planning-item-update.model';

@Component({
  selector: 'app-edit-planning-item-dialog',
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
  templateUrl: './edit-planning-item-dialog.component.html',
  styleUrls: ['./edit-planning-item-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditPlanningItemDialogComponent implements OnInit {

  itemForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EditPlanningItemDialogComponent, PlanningItemUpdate>,
    @Inject(MAT_DIALOG_DATA) public data: EditPlanningItemDialogData
  ) {}

  ngOnInit(): void {
    this.createForm();
  }

  private createForm(): void {
    this.itemForm = this.fb.group({
      plannedValue: [
        '', // Valor inicial vazio
        [
          Validators.required,
          Validators.min(0),
          this.decimalValidator
        ]
      ],
      realValue: [
        '', // Valor inicial vazio
        [
          Validators.required,
          Validators.min(0),
          this.decimalValidator
        ]
      ]
    });
  }

  // Validator customizado para números decimais
  private decimalValidator(control: any) {
    const value = control.value;
    if (value === '' || value === null) {
      return null; // Deixa o required validator lidar com valores vazios
    }
    
    const num = parseFloat(value);
    if (isNaN(num)) {
      return { invalidNumber: true };
    }
    
    // Verifica se o número tem mais de 2 casas decimais
    const decimalPart = value.toString().split('.')[1];
    if (decimalPart && decimalPart.length > 2) {
      return { tooManyDecimals: true };
    }
    
    return null;
  }

  // Getters para facilitar acesso aos controles no template
  get plannedValueControl() {
    return this.itemForm.get('plannedValue')!;
  }

  get realValueControl() {
    return this.itemForm.get('realValue')!;
  }

  // Getters para placeholders usando os valores atuais
  get plannedValuePlaceholder(): string {
    return this.data.plannedValue > 0 
      ? `Atual: R$ ${this.data.plannedValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : 'Ex: 1500,00';
  }

  get realValuePlaceholder(): string {
    return this.data.realValue > 0 
      ? `Atual: R$ ${this.data.realValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : 'Ex: 1350,00';
  }

  // Método para obter mensagens de erro
  getErrorMessage(controlName: string): string {
    const control = this.itemForm.get(controlName);
    
    if (control?.hasError('required')) {
      return 'Este campo é obrigatório';
    }
    
    if (control?.hasError('min')) {
      return 'O valor deve ser maior ou igual a zero';
    }
    
    if (control?.hasError('invalidNumber')) {
      return 'Digite um número válido';
    }
    
    if (control?.hasError('tooManyDecimals')) {
      return 'Máximo 2 casas decimais';
    }
    
    return '';
  }

  // Método para verificar se deve mostrar erro
  shouldShowError(controlName: string): boolean {
    const control = this.itemForm.get(controlName);
    return !!(control?.invalid && (control?.dirty || control?.touched));
  }

  // Método para verificar se o formulário é válido
  get isFormValid(): boolean {
    return this.itemForm.valid;
  }

  // Cancela e fecha o dialog
  onCancel(): void {
    this.dialogRef.close();
  }

  // Salva e fecha o dialog
  onSave(): void {
    if (this.itemForm.valid) {
      const formValues = this.itemForm.value;
      
      const result: PlanningItemUpdate = {
        plannedValue: parseFloat(formValues.plannedValue.toString().replace(',', '.')),
        realValue: parseFloat(formValues.realValue.toString().replace(',', '.'))
      };
      
      console.log('Saving planning item update:', {
        itemName: this.data.itemName,
        update: result,
        original: {
          plannedValue: this.data.plannedValue,
          realValue: this.data.realValue
        }
      });
      
      this.dialogRef.close(result);
    }
  }

  // Método helper para formatar valor monetário no input
  onValueInput(event: any, controlName: string): void {
    let value = event.target.value;
    
    // Remove tudo que não é número, vírgula ou ponto
    value = value.replace(/[^\d,\.]/g, '');
    
    // Substitui vírgula por ponto para facilitar cálculos
    value = value.replace(',', '.');
    
    // Se passou da validação, atualiza o controle
    this.itemForm.patchValue({ [controlName]: value });
  }

  // Método para formatar exibição no blur
  onValueBlur(controlName: string): void {
    const control = this.itemForm.get(controlName);
    if (control && control.value !== '') {
      const numericValue = parseFloat(control.value.toString().replace(',', '.'));
      if (!isNaN(numericValue)) {
        // Formatar com 2 casas decimais usando vírgula
        const formattedValue = numericValue.toFixed(2).replace('.', ',');
        control.setValue(formattedValue);
      }
    }
  }
}