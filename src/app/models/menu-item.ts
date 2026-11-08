import { AppIconName } from '../shared/ui/icon/app-icons';

export interface MenuItem {
  /** Nome do ícone em APP_ICONS */
  icon: AppIconName;
  label: string;
  route: string;
  description?: string;
}

export interface QuickAccessItem {
  id: string;
  label: string;
  route: string;
  icon: AppIconName;
}

export const MENU_ITEMS: MenuItem[] = [
  {
    icon: 'dashboard',
    label: 'Início',
    route: '/home',
    description: 'Página inicial do sistema'
  },
  {
    icon: 'wallet',
    label: 'Planejamentos',
    route: '/planejamentos',
    description: 'Gerencie seus planejamentos financeiros'
  },
  {
    icon: 'add-expense',
    label: 'Adicionar gastos',
    route: '/adicionar-gastos',
    description: 'Registre novos gastos'
  },
  {
    icon: 'inventory',
    label: 'Inventário',
    route: '/inventario',
    description: 'Gerencie suas categorias de inventário'
  },
  {
    icon: 'about',
    label: 'Sobre',
    route: '/sobre',
    description: 'Informações sobre o sistema'
  }
];