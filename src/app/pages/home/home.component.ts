import { Component } from '@angular/core';
import { ExpensesComponent } from './expenses/expenses.component';
import { PersonaComponent } from './persona/persona.component';

@Component({
  selector: 'app-home',
  imports: [ExpensesComponent, PersonaComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

}
