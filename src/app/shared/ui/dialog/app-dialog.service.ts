import { Dialog, DialogConfig, DialogRef } from '@angular/cdk/dialog';
import { ComponentType } from '@angular/cdk/portal';
import { Injectable, inject } from '@angular/core';

export interface AppDialogOptions<D> {
  data?: D;
  /** Largura máxima do painel (ex.: '40rem'). Padrão: 32rem, ou 92% da tela no celular. */
  maxWidth?: string;
  /** Fecha ao clicar fora e com Esc. Padrão: true. */
  dismissible?: boolean;
  ariaLabel?: string;
}

/**
 * Abre diálogos com o `Dialog` do Angular CDK e o visual do tema (DaisyUI).
 * Substitui o `MatDialog`; a API é parecida:
 *
 * ```ts
 * this.dialog.open(EditItemDialogComponent, { data: item })
 *   .closed.subscribe(result => { ... });
 * ```
 *
 * No componente do diálogo:
 * ```ts
 * readonly data = inject<Item>(DIALOG_DATA);
 * private readonly ref = inject<DialogRef<Result>>(DialogRef);
 * save() { this.ref.close(result); }
 * ```
 */
@Injectable({ providedIn: 'root' })
export class AppDialog {
  private readonly dialog = inject(Dialog);

  open<C, D = unknown, R = unknown>(component: ComponentType<C>, options: AppDialogOptions<D> = {}): DialogRef<R, C> {
    const config: DialogConfig<D, DialogRef<R, C>> = {
      data: options.data,
      panelClass: 'app-dialog-panel',
      backdropClass: 'app-dialog-backdrop',
      maxWidth: options.maxWidth ?? 'min(32rem, 92vw)',
      disableClose: options.dismissible === false,
      ariaLabel: options.ariaLabel,
      autoFocus: 'first-tabbable',
      restoreFocus: true
    };
    return this.dialog.open<R, D, C>(component, config);
  }

  closeAll(): void {
    this.dialog.closeAll();
  }
}
