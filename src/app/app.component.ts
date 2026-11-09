import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ShellComponent } from './layout/shell/shell.component';
import { ToastOutletComponent } from './shared/ui/toast/toast-outlet.component';

@Component({
  selector: 'app-root',
  imports: [ShellComponent, ToastOutletComponent],
  template: `
    <app-shell />
    <app-toast-outlet />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  title = 'carteira-monolito';
}
