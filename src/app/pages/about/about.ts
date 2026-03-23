import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-about',
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class About {
  readonly appName = 'Carteira Monolito';
  readonly version = '1.0.0';
  readonly description = 'Sistema completo de gestão financeira pessoal';
  
  readonly features = [
    {
      icon: 'far fa-chart-bar',
      title: 'Dashboard Interativo',
      description: 'Visualize seus gastos através de gráficos dinâmicos e informativos'
    },
    {
      icon: 'far fa-credit-card',
      title: 'Planejamentos Financeiros',
      description: 'Crie e gerencie seus planejamentos financeiros de forma organizada'
    },
    {
      icon: 'far fa-plus-square',
      title: 'Controle de Gastos',
      description: 'Registre e acompanhe todos os seus gastos de maneira simples'
    },
    {
      icon: 'far fa-folder-open',
      title: 'Inventário Pessoal',
      description: 'Organize e gerencie seus bens e categorias de inventário'
    },
    {
      icon: 'far fa-check-square',
      title: 'Checklist de Contas',
      description: 'Nunca mais esqueça de pagar uma conta com nosso sistema de checklist'
    },
    {
      icon: 'far fa-credit-card',
      title: 'Controle de Parcelamentos',
      description: 'Acompanhe todas as suas compras parceladas em um só lugar'
    }
  ];
  
  readonly techStack = [
    { name: 'Angular', version: '19', description: 'Framework principal' },
    { name: 'Angular Material', description: 'Componentes de UI' },
    { name: 'Chart.js', description: 'Gráficos interativos' },
    { name: 'PrimeNG', description: 'Componentes adicionais' },
    { name: 'TypeScript', description: 'Linguagem de programação' },
    { name: 'SCSS', description: 'Estilização avançada' }
  ];
  
  readonly contact = {
    project: 'TCC - Trabalho de Conclusão de Curso',
    author: 'Sistema de Gestão Financeira',
    year: new Date().getFullYear()
  };
}
