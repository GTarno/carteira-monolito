import { Component } from '@angular/core';
import { ExpensesComponent } from './expenses/expenses.component';
import { PersonaComponent } from './persona/persona.component';
import { BillsChecklistComponent } from './bills-checklist/bills-checklist.component';
import { InstallmentsCarouselComponent } from './installments-carousel/installments-carousel.component';
import { QuickAccessComponent } from '../../shared/components/quick-access/quick-access.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    ExpensesComponent, 
    PersonaComponent, 
    BillsChecklistComponent, 
    InstallmentsCarouselComponent,
    QuickAccessComponent,
    FooterComponent
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {

}
