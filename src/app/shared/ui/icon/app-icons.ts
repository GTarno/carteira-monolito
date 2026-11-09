import { LucideIconData } from '@lucide/angular';
import {
  Banknote,
  Building,
  Calculator,
  Calendar,
  CalendarClock,
  Car,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  CircleDollarSign,
  CircleExclamationPoint,
  CircleQuestionMark,
  CircleUserRound,
  Clock,
  Code,
  CreditCard,
  FolderOpen,
  GraduationCap,
  House,
  Image,
  Info,
  Landmark,
  LayoutDashboard,
  Lightbulb,
  LogOut,
  Menu,
  Moon,
  Package,
  Pencil,
  PiggyBank,
  Plus,
  Receipt,
  RefreshCw,
  Settings,
  ShoppingBag,
  ShoppingCart,
  SquarePlus,
  Stethoscope,
  Sun,
  Trash,
  TrendingUp,
  TriangleExclamationPoint,
  Utensils,
  UtensilsCrossed,
  Wallet,
  Wifi,
  X,
  Zap,
  type IconNode
} from 'lucide';

/** Converte o desenho do pacote `lucide` (só dados) no formato do `@lucide/angular`. */
function icon(name: string, node: IconNode): LucideIconData {
  return { name, node };
}

/**
 * Ícones disponíveis no app, por nome PRÓPRIO do app (não o nome do Lucide).
 *
 * São estes nomes que ficam nos dados (categorias, itens, menu) e que o backend vai
 * salvar. Assim, se o Lucide renomear um ícone, só esta tabela muda.
 * Para adicionar um ícone: escolha em https://lucide.dev/icons, importe o desenho do
 * pacote `lucide` (ex.: `PiggyBank`) e registre-o aqui. Só os ícones registrados entram no bundle.
 *
 * Importamos os desenhos do pacote `lucide` (só dados) em vez dos componentes `Lucide<Nome>`
 * do `@lucide/angular`: cada componente traz uma cópia do template (~3,5 KB por ícone).
 * Todos são renderizados pelo único `LucideDynamicIcon` dentro de `<app-icon>`.
 */
export const APP_ICONS = {
  // Navegação
  dashboard: icon('layout-dashboard', LayoutDashboard),
  wallet: icon('wallet', Wallet),
  'add-expense': icon('square-plus', SquarePlus),
  inventory: icon('folder-open', FolderOpen),
  about: icon('circle-question-mark', CircleQuestionMark),
  menu: icon('menu', Menu),
  back: icon('chevron-left', ChevronLeft),
  forward: icon('chevron-right', ChevronRight),
  user: icon('circle-user-round', CircleUserRound),
  settings: icon('settings', Settings),
  logout: icon('log-out', LogOut),

  // Ações
  add: icon('plus', Plus),
  edit: icon('pencil', Pencil),
  delete: icon('trash', Trash),
  close: icon('x', X),
  calendar: icon('calendar', Calendar),
  image: icon('image', Image),
  package: icon('package', Package),
  code: icon('code', Code),
  check: icon('check', Check),
  trend: icon('trending-up', TrendingUp),
  refresh: icon('refresh-cw', RefreshCw),

  // Tema
  sun: icon('sun', Sun),
  moon: icon('moon', Moon),

  // Feedback
  success: icon('circle-check', CircleCheck),
  error: icon('circle-exclamation-point', CircleExclamationPoint),
  warning: icon('triangle-exclamation-point', TriangleExclamationPoint),
  info: icon('info', Info),
  pending: icon('clock', Clock),
  'due-today': icon('calendar-clock', CalendarClock),

  // Categorias e itens de gasto
  receipt: icon('receipt', Receipt),
  'credit-card': icon('credit-card', CreditCard),
  food: icon('utensils', Utensils),
  restaurant: icon('utensils-crossed', UtensilsCrossed),
  lightbulb: icon('lightbulb', Lightbulb),
  building: icon('building', Building),
  wifi: icon('wifi', Wifi),
  home: icon('house', House),
  'shopping-cart': icon('shopping-cart', ShoppingCart),
  banknote: icon('banknote', Banknote),
  bank: icon('landmark', Landmark),
  energy: icon('zap', Zap),
  car: icon('car', Car),
  health: icon('stethoscope', Stethoscope),
  education: icon('graduation-cap', GraduationCap),
  savings: icon('piggy-bank', PiggyBank),
  money: icon('circle-dollar-sign', CircleDollarSign),
  'shopping-bag': icon('shopping-bag', ShoppingBag),
  calculator: icon('calculator', Calculator),
} as const satisfies Record<string, LucideIconData>;

export type AppIconName = keyof typeof APP_ICONS;

/** Ícone usado quando o nome não existe no mapa (ex.: valor antigo vindo da API). */
export const FALLBACK_ICON: AppIconName = 'info';

export function isAppIconName(name: string | null | undefined): name is AppIconName {
  return !!name && Object.prototype.hasOwnProperty.call(APP_ICONS, name);
}
