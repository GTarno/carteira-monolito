import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

export interface ToastOptions {
  /** Tempo na tela em ms. Use 0 para só fechar manualmente. */
  duration?: number;
}

const DEFAULT_DURATION: Record<ToastType, number> = {
  success: 3000,
  info: 4000,
  warning: 5000,
  error: 6000
};

/** Máximo de toasts visíveis ao mesmo tempo; os mais antigos saem primeiro. */
const MAX_TOASTS = 4;

/**
 * Mensagens rápidas de feedback (substitui o MatSnackBar).
 * Os toasts são exibidos pelo `<app-toast-outlet>` no `AppComponent`.
 */
@Injectable({ providedIn: 'root' })
export class ToastService {
  private nextId = 1;
  private readonly timers = new Map<number, ReturnType<typeof setTimeout>>();
  private readonly toastsSignal = signal<Toast[]>([]);

  readonly toasts = this.toastsSignal.asReadonly();

  success(message: string, options?: ToastOptions): number {
    return this.show('success', message, options);
  }

  error(message: string, options?: ToastOptions): number {
    return this.show('error', message, options);
  }

  warning(message: string, options?: ToastOptions): number {
    return this.show('warning', message, options);
  }

  info(message: string, options?: ToastOptions): number {
    return this.show('info', message, options);
  }

  show(type: ToastType, message: string, options: ToastOptions = {}): number {
    const toast: Toast = { id: this.nextId++, type, message };
    const visible = [...this.toastsSignal(), toast];
    visible.slice(0, Math.max(0, visible.length - MAX_TOASTS)).forEach(old => this.clearTimer(old.id));
    this.toastsSignal.set(visible.slice(-MAX_TOASTS));

    const duration = options.duration ?? DEFAULT_DURATION[type];
    if (duration > 0) {
      this.timers.set(toast.id, setTimeout(() => this.dismiss(toast.id), duration));
    }
    return toast.id;
  }

  dismiss(id: number): void {
    this.clearTimer(id);
    this.toastsSignal.update(toasts => toasts.filter(toast => toast.id !== id));
  }

  private clearTimer(id: number): void {
    clearTimeout(this.timers.get(id));
    this.timers.delete(id);
  }
}
