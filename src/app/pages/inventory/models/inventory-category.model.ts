export interface InventoryCategory {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
}

export interface InventoryCategoryCreate {
  name: string;
  description: string;
  imageUrl: string;
}