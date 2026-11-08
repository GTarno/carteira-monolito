import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ThemeService } from '../../core/theme/theme.service';
import { IconComponent } from '../../shared/ui/icon/icon.component';

/** Botão que alterna entre o tema escuro (forest) e o claro (emerald). */
@Component({
  selector: 'app-theme-toggle',
  imports: [IconComponent],
  template: `
    <button
      type="button"
      class="btn btn-ghost btn-circle swap swap-rotate"
      [class.swap-active]="!theme.isDark()"
      [attr.aria-label]="label()"
      [attr.title]="label()"
      (click)="theme.toggle()">
      <app-icon name="sun" class="swap-on" />
      <app-icon name="moon" class="swap-off" />
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ThemeToggleComponent {
  protected readonly theme = inject(ThemeService);
  protected readonly label = computed(() => (this.theme.isDark() ? 'Ativar tema claro' : 'Ativar tema escuro'));
}
