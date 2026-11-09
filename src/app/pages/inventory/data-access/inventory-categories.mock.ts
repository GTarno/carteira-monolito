import { InventoryCategory } from '../models/inventory-category.model';

export const INVENTORY_CATEGORIES_MOCK: InventoryCategory[] = [
  {
    id: '1',
    name: 'Livros',
    description: 'Sua coleção de livros e literatura',
    imageUrl: 'assets/images/livros.png'
  },
  {
    id: '2',
    name: 'Discos',
    description: 'Coleção de discos e música',
    imageUrl: 'assets/images/discos.png'
  }
];