import { InventoryCategory } from '../models/inventory-category.model';

// SVG data URLs como fallback caso as imagens PNG não carreguem
const BOOK_SVG = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzQzODNjNCIgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiPjxwYXRoIGQ9Ik0xMiAyQzEzLjEgMiAxNCAyLjkgMTQgNFYyMkMxNCAyMy4xIDEzLjEgMjQgMTIgMjRDMTAuOSAyNCA5IDIzLjEgOSAyMlY0QzkgMi45IDEwLjkgMiAxMiAyWk0xNCA0SDE4VjIwSDE0VjRaTTYgNEgxMFYyMEg2VjRaIi8+PC9zdmc+';
const DISC_SVG = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzY2M2E4MiIgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiPjxwYXRoIGQ9Ik0xMiAyQzYuNDggMiAyIDYuNDggMiAxMlM2LjQ4IDIyIDEyIDIyIDIyIDE3LjUyIDIyIDEyIDIwLjUyIDIgMTIgMk0xMiA4QzE0LjIxIDggMTYgOS43OSAxNiAxMlMxNC4yMSAxNiAxMiAxNiAxMCAxNC4yMSAxMCAxMiA5LjIxIDggMTIgOE0xMiAxMUMxMS40NSAxMSAxMSAxMS40NSAxMSAxMlMxMS40NSAxMyAxMiAxMyAxMyAxMi41NSAxMyAxMiAxMi41NSAxMSAxMiAxMVoiLz48L3N2Zz4=';

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