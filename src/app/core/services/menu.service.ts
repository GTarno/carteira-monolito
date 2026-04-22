import { Injectable } from '@angular/core';
import { MenuItem, QuickAccessItem, MENU_ITEMS } from '../../models/menu-item';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  
  /**
   * Retorna todos os itens do menu principal
   */
  getMenuItems(): MenuItem[] {
    return MENU_ITEMS;
  }

  /**
   * Retorna os itens para acessos rápidos (exclui Início e usa ícones do Material Design)
   */
  getQuickAccessItems(): QuickAccessItem[] {
    return MENU_ITEMS
      .filter(item => item.route !== '/home') // Exclui o item Início
      .map(item => ({
        id: this.getItemId(item.route),
        label: item.label,
        route: item.route,
        icon: item.icon
      }));
  }

  /**
   * Gera um ID único baseado na rota
   */
  private getItemId(route: string): string {
    return route.replace('/', '').replace('-', '_');
  }
}