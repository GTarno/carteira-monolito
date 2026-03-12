import { Component, Input, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { QuickAccessItem } from '../../../models/menu-item';
import { MenuService } from '../../../core/services/menu.service';

@Component({
  selector: 'app-quick-access',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './quick-access.component.html',
  styleUrl: './quick-access.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QuickAccessComponent {
  private menuService = inject(MenuService);
  private router = inject(Router);

  @Input() items?: QuickAccessItem[];

  /**
   * Retorna os itens de acesso rápido.
   * Se items não foi passado via Input, busca do MenuService.
   */
  getItems(): QuickAccessItem[] {
    return this.items ?? this.menuService.getQuickAccessItems();
  }

  /**
   * Navega para a rota especificada
   */
  onItemClick(item: QuickAccessItem): void {
    this.router.navigate([item.route]);
  }

  /**
   * Obtém a descrição de acessibilidade para o item
   */
  getItemAriaLabel(item: QuickAccessItem): string {
    return `Acessar ${item.label}`;
  }

  /**
   * Gerencia navegação via teclado (Enter e Space)
   */
  onItemKeydown(event: KeyboardEvent, item: QuickAccessItem): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.onItemClick(item);
    }
  }
}