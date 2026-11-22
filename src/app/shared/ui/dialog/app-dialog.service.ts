import { Dialog, DialogConfig, DialogRef } from '@angular/cdk/dialog';
import { Overlay } from '@angular/cdk/overlay';
import { ComponentType } from '@angular/cdk/portal';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ConfirmDialogComponent, ConfirmDialogOptions } from './confirm-dialog.component';

export interface AppDialogOptions<D> {
  data?: D;
  /** Largura máxima do painel (ex.: '40rem'). Padrão: 32rem, ou 92% da tela no celular. */
  maxWidth?: string;
  /** Fecha ao clicar fora e com Esc. Padrão: true. */
  dismissible?: boolean;
  ariaLabel?: string;
  /** `drawer`: painel lateral à direita, com a altura da tela (bom para formulários longos). */
  variant?: 'modal' | 'drawer';
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
  private readonly overlay = inject(Overlay);

  open<C, D = unknown, R = unknown>(component: ComponentType<C>, options: AppDialogOptions<D> = {}): DialogRef<R, C> {
    const drawer = options.variant === 'drawer';
    const config: DialogConfig<D, DialogRef<R, C>> = {
      data: options.data,
      panelClass: drawer ? 'app-drawer-panel' : 'app-dialog-panel',
      backdropClass: 'app-dialog-backdrop',
      maxWidth: drawer ? '100vw' : (options.maxWidth ?? 'min(32rem, 92vw)'),
      ...(drawer && {
        width: options.maxWidth ?? 'min(30rem, 100vw)',
        height: '100%',
        positionStrategy: this.overlay.position().global().right('0').top('0')
      }),
      disableClose: options.dismissible === false,
      ariaLabel: options.ariaLabel,
      autoFocus: 'first-tabbable',
      restoreFocus: true
    };
    return this.dialog.open<R, D, C>(component, config);
  }

  /**
   * Pede confirmação ao usuário. Emite `true` só se ele confirmar
   * (cancelar, Esc ou clicar fora emitem `false`).
   *
   * ```ts
   * this.dialog.confirm({ title: 'Excluir item?', message: '...', confirmLabel: 'Excluir', danger: true })
   *   .pipe(filter(Boolean)).subscribe(() => ...);
   * ```
   */
  confirm(options: ConfirmDialogOptions): Observable<boolean> {
    return this.open<ConfirmDialogComponent, ConfirmDialogOptions, boolean>(ConfirmDialogComponent, {
      data: options,
      maxWidth: 'min(28rem, 92vw)',
      ariaLabel: options.title
    }).closed.pipe(map(result => result === true));
  }

  closeAll(): void {
    this.dialog.closeAll();
  }
}
