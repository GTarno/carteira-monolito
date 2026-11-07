import { DOCUMENT, Injectable, computed, effect, inject, signal } from '@angular/core';

export type AppTheme = 'forest' | 'emerald';

export const DARK_THEME: AppTheme = 'forest';
export const LIGHT_THEME: AppTheme = 'emerald';
export const DEFAULT_THEME: AppTheme = DARK_THEME;

/** Mesma chave usada pelo script inline do `index.html`, que aplica o tema antes do Angular iniciar. */
export const THEME_STORAGE_KEY = 'carteira-theme';

const THEMES: readonly AppTheme[] = [DARK_THEME, LIGHT_THEME];

function isAppTheme(value: unknown): value is AppTheme {
  return THEMES.includes(value as AppTheme);
}

/**
 * Tema do DaisyUI: forest (escuro, padrão) ou emerald (claro).
 * Aplica `data-theme` no `<html>` e guarda a escolha no localStorage.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);

  private readonly themeSignal = signal<AppTheme>(this.readStoredTheme());

  readonly theme = this.themeSignal.asReadonly();
  readonly isDark = computed(() => this.themeSignal() === DARK_THEME);

  constructor() {
    effect(() => {
      const theme = this.themeSignal();
      this.document.documentElement.setAttribute('data-theme', theme);
      this.storeTheme(theme);
    });
  }

  setTheme(theme: AppTheme): void {
    this.themeSignal.set(theme);
  }

  toggle(): void {
    this.themeSignal.update(current => (current === DARK_THEME ? LIGHT_THEME : DARK_THEME));
  }

  private readStoredTheme(): AppTheme {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      return isAppTheme(stored) ? stored : DEFAULT_THEME;
    } catch {
      return DEFAULT_THEME;
    }
  }

  private storeTheme(theme: AppTheme): void {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // localStorage indisponível (modo privado, bloqueado): o tema vale só para esta sessão
    }
  }
}
