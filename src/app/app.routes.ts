import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { PlanningPage } from './pages/planning/planning.page';
import { AdicionarGastosPage } from './pages/adicionar-gastos.page';
import { InventoryPage } from './pages/inventory/inventory.page';
import { InventoryCategoryItemsPage } from './pages/inventory/pages/category-items/inventory-category-items.page';
import { SobrePage } from './pages/sobre.page';

export const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'planejamentos', component: PlanningPage },
  { path: 'adicionar-gastos', component: AdicionarGastosPage },
  { path: 'inventario', component: InventoryPage },
  { path: 'inventario/:categoryId', component: InventoryCategoryItemsPage },
  { path: 'sobre', component: SobrePage },
  { path: '', redirectTo: '/home', pathMatch: 'full' }
];
