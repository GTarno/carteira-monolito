export interface InventoryItem {
  id: string;
  categoryId: string;
  title: string;
  author: string;
  notes?: string;
  createdAt: string;
}

export interface InventoryItemCreate {
  categoryId: string;
  title: string;
  author: string;
  notes?: string;
}