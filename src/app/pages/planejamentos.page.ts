import { Component } from '@angular/core';

@Component({
  selector: 'app-planejamentos',
  standalone: true,
  template: `
    <div class="page-container">
      <h1>Planejamentos</h1>
      <p>Aqui você pode gerenciar seus planejamentos financeiros.</p>
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
export class PlanejamentosPage {
}