import { Routes } from '@angular/router';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

/** Rota da Home (carregada sob demanda), com o Chart.js registrado só aqui e no Planejamento. */
export const HOME_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./home.component').then(m => m.HomeComponent),
    providers: [provideCharts(withDefaultRegisterables())],
    title: 'Início'
  }
];
