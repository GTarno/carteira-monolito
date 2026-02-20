import { Component } from '@angular/core';

@Component({
  selector: 'app-adicionar-gastos',
  standalone: true,
  template: `
    <div class="page-container">
      <h1>Adicionar Gastos</h1>
      <p>Registre seus gastos do dia a dia de forma rápida e fácil.</p>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    h1 {
      color: #1976d2;
      margin-bottom: 16px;
    }

    p {
      color: #666;
      font-size: 16px;
    }
  `]
})
export class AdicionarGastosPage {
}