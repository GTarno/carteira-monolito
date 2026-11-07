import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { IconComponent } from '../icon/icon.component';
import { ToastService, ToastType } from './toast.service';

const ALERT_CLASS: Record<ToastType, string> = {
  success: 'alert-success',
  error: 'alert-error',
  warning: 'alert-warning',
  info: 'alert-info'
};

/** Exibe os toasts do `ToastService`. Deve existir uma única vez, no `AppComponent`. */
@Component({
  selector: 'app-toast-outlet',
  imports: [IconComponent],
  template: `
    <div class="toast toast-end toast-bottom z-[1100]" aria-live="polite" aria-atomic="false">
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          role="status"
          class="alert shadow-lg max-w-sm"
          [class]="alertClass[toast.type]">
          <app-icon [name]="toast.type" />
          <span>{{ toast.message }}</span>
          <button
            type="button"
            class="btn btn-ghost btn-xs btn-circle"
            aria-label="Fechar mensagem"
            (click)="toastService.dismiss(toast.id)">
            <app-icon name="close" [size]="16" />
          </button>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToastOutletComponent {
  protected readonly toastService = inject(ToastService);
  protected readonly alertClass = ALERT_CLASS;
}
