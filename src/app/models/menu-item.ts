export interface MenuItem {
  icon: string;
  label: string;
  route: string;
  description?: string;
}

export const MENU_ITEMS: MenuItem[] = [
  {
    icon: 'home',
    label: 'Início',
    route: '/home',
    description: 'Página inicial do sistema'
  },
  {
    icon: 'account_balance_wallet',
    label: 'Planejamentos',
    route: '/planejamentos',
    description: 'Gerencie seus planejamentos financeiros'
  },
  {
    icon: 'add_circle',
    label: 'Adicionar gastos',
    route: '/adicionar-gastos',
    description: 'Registre novos gastos'
  },
  {
    icon: 'warning',
    label: 'Gastos extraordinários',
    route: '/gastos-extraordinarios',
    description: 'Gastos imprevistos e esporádicos'
  },
  {
    icon: 'info',
    label: 'Sobre',
    route: '/sobre',
    description: 'Informações sobre o sistema'
  }
];