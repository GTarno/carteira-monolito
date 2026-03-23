export interface MenuItem {
  icon: string;
  label: string;
  route: string;
  description?: string;
}

export interface QuickAccessItem {
  id: string;
  label: string;
  route: string;
  icon: string;
}

export const MENU_ITEMS: MenuItem[] = [
  {
    icon: 'far fa-building',
    label: 'Início',
    route: '/home',
    description: 'Página inicial do sistema'
  },
  {
    icon: 'far fa-credit-card',
    label: 'Planejamentos',
    route: '/planejamentos',
    description: 'Gerencie seus planejamentos financeiros'
  },
  {
    icon: 'far fa-plus-square',
    label: 'Adicionar gastos',
    route: '/adicionar-gastos',
    description: 'Registre novos gastos'
  },
  {
    icon: 'far fa-folder-open',
    label: 'Inventário',
    route: '/inventario',
    description: 'Gerencie suas categorias de inventário'
  },
  {
    icon: 'far fa-question-circle',
    label: 'Sobre',
    route: '/sobre',
    description: 'Informações sobre o sistema'
  }
];