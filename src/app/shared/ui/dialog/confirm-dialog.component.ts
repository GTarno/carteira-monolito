import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { IconComponent } from '../icon/icon.component';

export interface ConfirmDialogOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Ação destrutiva (ex.: excluir): botão de confirmar em vermelho. */
  danger?: boolean;
}

/** Diálogo de confirmação. Fecha com `true` ao confirmar; qualquer outra saída é cancelamento. */
@Component({
  selector: 'app-confirm-dialog',
  imports: [IconComponent],
  template: `
    <div class="flex flex-col gap-5" role="alertdialog" aria-labelledby="confirm-title" aria-describedby="confirm-message">
      <div class="flex items-start gap-3">
        <span class="rounded-box p-2" [class]="data.danger ? 'bg-error/15 text-error' : 'bg-primary/15 text-primary'">
          <app-icon [name]="data.danger ? 'delete' : 'info'" />
        </span>
        <div class="flex flex-col gap-1">
          <h2 id="confirm-title" class="text-lg font-semibold">{{ data.title }}</h2>
          <p id="confirm-message" class="text-base-content/80">{{ data.message }}</p>
        </div>
      </div>
      <div class="flex justify-end gap-2">
        <button type="button" class="btn btn-ghost" (click)="ref.close(false)">{{ data.cancelLabel ?? 'Cancelar' }}</button>
        <button type="button" class="btn" [class.btn-error]="data.danger" [class.btn-primary]="!data.danger" (click)="ref.close(true)">
          {{ data.confirmLabel ?? 'Confirmar' }}
        </button>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfirmDialogComponent {
  protected readonly data = inject<ConfirmDialogOptions>(DIALOG_DATA);
  protected readonly ref = inject<DialogRef<boolean>>(DialogRef);
}
