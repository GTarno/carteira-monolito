import { Routes } from '@angular/router';

/**
 * Todas as páginas são carregadas sob demanda: o pacote inicial leva só o layout.
 * O Chart.js é registrado apenas nas rotas que têm gráficos (Início e Planejamento).
 */
export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', loadChildren: () => import('./pages/home/home.routes').then(m => m.HOME_ROUTES) },
  { path: 'planejamentos', loadChildren: () => import('./pages/planning/planning.routes').then(m => m.PLANNING_ROUTES) },
  {
    path: 'adicionar-gastos',
    loadComponent: () => import('./pages/adicionar-gastos/adicionar-gastos.component').then(m => m.AdicionarGastosComponent),
    title: 'Adicionar gastos'
  },
  { path: 'inventario', loadChildren: () => import('./pages/inventory/inventory.routes').then(m => m.INVENTORY_ROUTES) },
  { path: 'sobre', loadComponent: () => import('./pages/about/about').then(m => m.About), title: 'Sobre' },
  {
    path: '**',
    loadComponent: () => import('./pages/not-found/not-found.page').then(m => m.NotFoundPage),
    title: 'Página não encontrada'
  }
];
