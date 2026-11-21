import { Routes } from '@angular/router';

/** Rotas do Inventário (carregadas sob demanda). */
export const INVENTORY_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./inventory.page').then(m => m.InventoryPage), title: 'Inventário' },
  {
    path: ':categoryId',
    loadComponent: () => import('./pages/category-items/inventory-category-items.page').then(m => m.InventoryCategoryItemsPage),
    title: 'Itens do inventário'
  }
];
