import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ExpensesComponent } from './expenses/expenses.component';
import { PersonaComponent } from './persona/persona.component';
import { BillsChecklistComponent } from './bills-checklist/bills-checklist.component';
import { InstallmentsCarouselComponent } from './installments-carousel/installments-carousel.component';
import { QuickAccessComponent } from '../../shared/components/quick-access/quick-access.component';

@Component({
  selector: 'app-home',
  imports: [
    ExpensesComponent, 
    PersonaComponent, 
    BillsChecklistComponent, 
    InstallmentsCarouselComponent,
    QuickAccessComponent
  ],
  templateUrl: './home.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent {}
