import { createId } from '../../../shared/utils/id.utils';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { InventoryCategory, InventoryCategoryCreate } from '../models/inventory-category.model';
import { InventoryItem, InventoryItemCreate } from '../models/inventory-item.model';
import { INVENTORY_CATEGORIES_MOCK } from './inventory-categories.mock';
import { INVENTORY_ITEMS_MOCK } from './inventory-items.mock';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private readonly categoriesSubject = new BehaviorSubject<InventoryCategory[]>(INVENTORY_CATEGORIES_MOCK);
  private readonly itemsSubject = new BehaviorSubject<InventoryItem[]>(INVENTORY_ITEMS_MOCK);
  
  readonly categories$ = this.categoriesSubject.asObservable();
  readonly items$ = this.itemsSubject.asObservable();

  getCategories(): Observable<InventoryCategory[]> {
    return this.categories$;
  }

  getCategoryById(id: string): Observable<InventoryCategory | undefined> {
    return this.categories$.pipe(
      map(categories => categories.find(cat => cat.id === id))
    );
  }

  getItemsByCategory(categoryId: string): Observable<InventoryItem[]> {
    return this.items$.pipe(
      map(items => items.filter(item => item.categoryId === categoryId))
    );
  }

  addCategory(create: InventoryCategoryCreate): void {
    const newCategory: InventoryCategory = {
      ...create,
      id: createId()
    };
    
    const currentCategories = this.categoriesSubject.value;
    this.categoriesSubject.next([...currentCategories, newCategory]);
  }

  addItem(create: InventoryItemCreate): void {
    const newItem: InventoryItem = {
      ...create,
      id: createId(),
      createdAt: new Date().toISOString()
    };
    
    const currentItems = this.itemsSubject.value;
    this.itemsSubject.next([...currentItems, newItem]);
  }

  deleteItem(itemId: string): void {
    const currentItems = this.itemsSubject.value;
    const filteredItems = currentItems.filter(item => item.id !== itemId);
    this.itemsSubject.next(filteredItems);
  }

}