import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { PlanningPage } from './pages/planning/planning.page';
import { PlanningCategoryItemsPage } from './pages/planning/pages/category-items/planning-category-items.page';
import { PlanningItemDetailPage } from './pages/planning/pages/item-detail/planning-item-detail.page';
import { AdicionarGastosPage } from './pages/adicionar-gastos.page';
import { InventoryPage } from './pages/inventory/inventory.page';
import { InventoryCategoryItemsPage } from './pages/inventory/pages/category-items/inventory-category-items.page';
import { SobrePage } from './pages/sobre.page';

export const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'planejamentos', component: PlanningPage },
  { path: 'planejamentos/:categoryId/:itemId', component: PlanningItemDetailPage },
  { path: 'planejamentos/:categoryId', component: PlanningCategoryItemsPage },
  { path: 'adicionar-gastos', component: AdicionarGastosPage },
  { path: 'inventario', component: InventoryPage },
  { path: 'inventario/:categoryId', component: InventoryCategoryItemsPage },
  { path: 'sobre', component: SobrePage },
  { path: '', redirectTo: '/home', pathMatch: 'full' }
];
