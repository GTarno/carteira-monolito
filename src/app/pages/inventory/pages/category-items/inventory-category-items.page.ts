import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Observable, take, filter } from 'rxjs';
import { InventoryItem } from '../../models/inventory-item.model';
import { InventoryCategory } from '../../models/inventory-category.model';
import { InventoryService } from '../../data-access/inventory.service';
import { AddItemDialogComponent } from '../../ui/add-item-dialog/add-item-dialog.component';

@Component({
  selector: 'app-inventory-category-items',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatDialogModule
  ],
  templateUrl: './inventory-category-items.page.html',
  styleUrl: './inventory-category-items.page.scss'
})
export class InventoryCategoryItemsPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private inventoryService = inject(InventoryService);
  private dialog = inject(MatDialog);

  categoryId!: string;
  category$!: Observable<InventoryCategory | undefined>;
  items$!: Observable<InventoryItem[]>;
  
  displayedColumns: string[] = ['title', 'author', 'notes', 'createdAt', 'actions'];

  ngOnInit(): void {
    this.categoryId = this.route.snapshot.paramMap.get('categoryId') || '';
    
    this.category$ = this.inventoryService.getCategoryById(this.categoryId);
    this.items$ = this.inventoryService.getItemsByCategory(this.categoryId);
  }

  onDeleteItem(itemId: string): void {
    this.inventoryService.deleteItem(itemId);
  }

  openAddItemDialog(): void {
    this.category$.pipe(
      take(1)
    ).subscribe(category => {
      const dialogRef = this.dialog.open(AddItemDialogComponent, {
        width: '500px',
        maxWidth: '90vw',
        data: {
          categoryId: this.categoryId,
          categoryName: category?.name || 'Categoria'
        }
      });

      dialogRef.afterClosed()
        .pipe(
          filter(Boolean),
          take(1)
        )
        .subscribe(result => {
          this.inventoryService.addItem(result);
        });
    });
  }

  onBackToCategories(): void {
    this.router.navigate(['/inventario']);
  }

  getAuthorLabel(category: InventoryCategory | null | undefined): string {
    if (!category) return 'Autor';
    
    switch (category.name.toLowerCase()) {
      case 'livros':
        return 'Autor';
      case 'discos':
        return 'Banda/Artista';
      default:
        return 'Autor';
    }
  }

  formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  }
}