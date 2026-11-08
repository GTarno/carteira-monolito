import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { LucideDynamicIcon } from '@lucide/angular';
import { APP_ICONS, AppIconName, FALLBACK_ICON, isAppIconName } from './app-icons';

/**
 * Ícone do app (Lucide). Use nomes de `APP_ICONS`:
 *
 * ```html
 * <app-icon name="wallet" />
 * <app-icon name="delete" [size]="16" label="Excluir" />
 * ```
 *
 * Sem `label`, o ícone é decorativo (oculto para leitores de tela).
 * A cor vem de `currentColor`, então use classes de texto (`text-primary`, `text-error`…).
 */
@Component({
  selector: 'app-icon',
  imports: [LucideDynamicIcon],
  template: `<svg [lucideIcon]="icon()" [size]="size()" [strokeWidth]="strokeWidth()" [title]="label()"></svg>`,
  host: {
    class: 'inline-flex shrink-0 items-center justify-center',
    '[attr.role]': 'label() ? "img" : null',
    '[attr.aria-label]': 'label() ?? null',
    '[attr.aria-hidden]': 'label() ? null : "true"'
  },
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IconComponent {
  /** Nome do ícone em `APP_ICONS`. Nomes desconhecidos mostram o ícone padrão. */
  readonly name = input.required<AppIconName | (string & {})>();
  readonly size = input<number>(20);
  readonly strokeWidth = input<number>(1.75);
  /** Texto para leitores de tela, quando o ícone tem significado próprio. */
  readonly label = input<string | undefined>(undefined);

  protected readonly icon = computed(() => {
    const name = this.name();
    return APP_ICONS[isAppIconName(name) ? name : FALLBACK_ICON];
  });
}
