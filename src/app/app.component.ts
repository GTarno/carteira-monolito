import { Component } from '@angular/core';
import { HeaderComponent } from './shared/components/header/header.component';
import { RouterModule } from "@angular/router";
import { ToastOutletComponent } from './shared/ui/toast/toast-outlet.component';

@Component({
  selector: 'app-root',
  imports: [HeaderComponent, RouterModule, ToastOutletComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'carteira-monolito';
}
