import { Routes } from '@angular/router';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

/** Rotas do Planejamento (carregadas sob demanda). O Chart.js só é registrado aqui e na Home. */
export const PLANNING_ROUTES: Routes = [
  {
    path: '',
    providers: [provideCharts(withDefaultRegisterables())],
    children: [
      { path: '', loadComponent: () => import('./planning.page').then(m => m.PlanningPage), title: 'Planejamentos' },
      {
        path: ':categoryId/:itemId',
        loadComponent: () => import('./pages/item-detail/planning-item-detail.page').then(m => m.PlanningItemDetailPage),
        title: 'Detalhe do item'
      },
      {
        path: ':categoryId',
        loadComponent: () => import('./pages/category-items/planning-category-items.page').then(m => m.PlanningCategoryItemsPage),
        title: 'Itens da categoria'
      }
    ]
  }
];
