import { InventoryItem } from '../models/inventory-item.model';

export const INVENTORY_ITEMS_MOCK: InventoryItem[] = [
  // Livros
  {
    id: 'item_livro_1',
    categoryId: '1',
    title: 'O Senhor dos Anéis: A Sociedade do Anel',
    author: 'J.R.R. Tolkien',
    notes: 'Primeira edição da trilogia',
    createdAt: '2023-01-15T10:30:00.000Z'
  },
  {
    id: 'item_livro_2',
    categoryId: '1',
    title: '1984',
    author: 'George Orwell',
    notes: 'Edição especial com prefácio',
    createdAt: '2023-02-20T14:45:00.000Z'
  },
  {
    id: 'item_livro_3',
    categoryId: '1',
    title: 'Dom Casmurro',
    author: 'Machado de Assis',
    createdAt: '2023-03-10T09:15:00.000Z'
  },
  {
    id: 'item_livro_4',
    categoryId: '1',
    title: 'Cem Anos de Solidão',
    author: 'Gabriel García Márquez',
    notes: 'Versão em português brasileiro',
    createdAt: '2023-04-05T16:20:00.000Z'
  },
  
  // Discos
  {
    id: 'item_disco_1',
    categoryId: '2',
    title: 'Abbey Road',
    author: 'The Beatles',
    notes: 'Vinil original de 1969',
    createdAt: '2023-01-20T11:00:00.000Z'
  },
  {
    id: 'item_disco_2',
    categoryId: '2',
    title: 'Dark Side of the Moon',
    author: 'Pink Floyd',
    notes: 'Edição remasterizada',
    createdAt: '2023-02-15T13:30:00.000Z'
  },
  {
    id: 'item_disco_3',
    categoryId: '2',
    title: 'Kind of Blue',
    author: 'Miles Davis',
    createdAt: '2023-03-01T08:45:00.000Z'
  },
  {
    id: 'item_disco_4',
    categoryId: '2',
    title: 'Thriller',
    author: 'Michael Jackson',
    notes: 'CD original lacrado',
    createdAt: '2023-03-25T19:10:00.000Z'
  }
];