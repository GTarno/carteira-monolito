import { Component } from '@angular/core';

@Component({
  selector: 'app-sobre',
  standalone: true,
  template: `
    <div class="page-container">
      <h1>Sobre</h1>
      <p>Sistema de gestão financeira pessoal desenvolvido para ajudar você a controlar suas finanças.</p>
      <div class="info-section">
        <h3>Funcionalidades</h3>
        <ul>
          <li>Planejamento financeiro</li>
          <li>Controle de gastos</li>
          <li>Gastos extraordinários</li>
          <li>Relatórios e gráficos</li>
        </ul>
      </div>
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

    h3 {
      color: #424242;
      margin-top: 24px;
      margin-bottom: 12px;
    }

    p {
      color: #666;
      font-size: 16px;
    }

    .info-section {
      margin-top: 24px;
    }

    ul {
      color: #666;
      padding-left: 20px;
    }

    li {
      margin-bottom: 8px;
    }
  `]
})
export class SobrePage {
}