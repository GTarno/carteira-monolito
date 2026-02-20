import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { PlanejamentosPage } from './pages/planejamentos.page';
import { AdicionarGastosPage } from './pages/adicionar-gastos.page';
import { GastosExtraordinariosPage } from './pages/gastos-extraordinarios.page';
import { SobrePage } from './pages/sobre.page';

export const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'planejamentos', component: PlanejamentosPage },
  { path: 'adicionar-gastos', component: AdicionarGastosPage },
  { path: 'gastos-extraordinarios', component: GastosExtraordinariosPage },
  { path: 'sobre', component: SobrePage },
  { path: '', redirectTo: '/home', pathMatch: 'full' }
];
