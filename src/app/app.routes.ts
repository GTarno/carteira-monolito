import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { PlanningPage } from './pages/planning/planning.page';
import { PlanningCategoryItemsPage } from './pages/planning/pages/category-items/planning-category-items.page';
import { PlanningItemDetailPage } from './pages/planning/pages/item-detail/planning-item-detail.page';
import { AdicionarGastosComponent } from './pages/adicionar-gastos/adicionar-gastos.component';
import { InventoryPage } from './pages/inventory/inventory.page';
import { InventoryCategoryItemsPage } from './pages/inventory/pages/category-items/inventory-category-items.page';
import { About } from './pages/about/about';

export const routes: Routes = [
  { path: 'home', component: HomeComponent, title: 'Início' },
  { path: 'planejamentos', component: PlanningPage, title: 'Planejamentos' },
  { path: 'planejamentos/:categoryId/:itemId', component: PlanningItemDetailPage, title: 'Detalhe do item' },
  { path: 'planejamentos/:categoryId', component: PlanningCategoryItemsPage, title: 'Itens da categoria' },
  { path: 'adicionar-gastos', component: AdicionarGastosComponent, title: 'Adicionar gastos' },
  { path: 'inventario', component: InventoryPage, title: 'Inventário' },
  { path: 'inventario/:categoryId', component: InventoryCategoryItemsPage, title: 'Itens do inventário' },
  { path: 'sobre', component: About, title: 'Sobre' },
  { path: '', redirectTo: '/home', pathMatch: 'full' }
];
