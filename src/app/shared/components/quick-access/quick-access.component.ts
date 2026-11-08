import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { QuickAccessItem } from '../../../models/menu-item';
import { MenuService } from '../../../core/services/menu.service';
import { IconComponent } from '../../ui/icon/icon.component';

/** Atalhos para as seções do app (por padrão, os itens do menu exceto Início). */
@Component({
  selector: 'app-quick-access',
  imports: [RouterLink, IconComponent],
  templateUrl: './quick-access.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QuickAccessComponent {
  private readonly menuService = inject(MenuService);

  readonly items = input<QuickAccessItem[] | undefined>(undefined);

  protected readonly visibleItems = computed(() => this.items() ?? this.menuService.getQuickAccessItems());
}
