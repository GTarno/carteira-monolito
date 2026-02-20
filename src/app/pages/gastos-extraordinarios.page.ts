import { Component } from '@angular/core';

@Component({
  selector: 'app-gastos-extraordinarios',
  standalone: true,
  template: `
    <div class="page-container">
      <h1>Gastos Extraordinários</h1>
      <p>Gerencie gastos esporádicos e imprevistos que saem do orçamento normal.</p>
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
export class GastosExtraordinariosPage {
}