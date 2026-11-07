import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';

type ExpenseType = 'gastos-mensais' | 'grandes-compras';

const EXPENSE_TYPE_LABELS: Record<ExpenseType, string> = {
  'gastos-mensais': 'Gastos mensais',
  'grandes-compras': 'Grandes compras'
};

@Component({
  selector: 'app-adicionar-gastos',
  imports: [CommonModule, MatCardModule, MatButtonModule],
  templateUrl: './adicionar-gastos.component.html',
  styleUrl: './adicionar-gastos.component.scss'
})
export class AdicionarGastosComponent {
  private readonly snackBar = inject(MatSnackBar);

  onCardClick(type: ExpenseType, event?: Event): void {
    // Evita rolar a página quando ativado pela barra de espaço
    event?.preventDefault();

    // TODO: navegar para os formulários quando existirem (ver issue de Lançamentos no backend)
    this.snackBar.open(`${EXPENSE_TYPE_LABELS[type]}: em breve!`, 'Fechar', { duration: 3000 });
  }
}
