import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Observable, take } from 'rxjs';
import { InventoryCategory } from './models/inventory-category.model';
import { InventoryService } from './data-access/inventory.service';
import { AddCategoryDialogComponent } from './ui/add-category-dialog/add-category-dialog.component';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule
  ],
  templateUrl: './inventory.page.html',
  styleUrl: './inventory.page.scss'
})
export class InventoryPage implements OnInit {
  private inventoryService = inject(InventoryService);
  private dialog = inject(MatDialog);
  private router = inject(Router);

  categories$!: Observable<InventoryCategory[]>;

  ngOnInit(): void {
    this.categories$ = this.inventoryService.getCategories();
  }

  openCategory(categoryId: string): void {
    this.router.navigate(['/inventario', categoryId]);
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(AddCategoryDialogComponent, {
      width: '500px',
      maxWidth: '90vw',
      disableClose: false,
      autoFocus: true
    });

    dialogRef.afterClosed()
      .pipe(take(1))
      .subscribe(result => {
        if (result) {
          this.inventoryService.addCategory(result);
        }
      });
  }

  onImageError(event: any, category: InventoryCategory): void {
    console.warn(`Failed to load image for ${category.name}:`, category.imageUrl);
    
    // SVG fallback baseado na categoria
    const fallbackImages: { [key: string]: string } = {
      'Livros': 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzQzODNjNCIgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiPjxwYXRoIGQ9Ik0xMiAyQzEzLjEgMiAxNCAyLjkgMTQgNFYyMkMxNCAyMy4xIDEzLjEgMjQgMTIgMjRDMTAuOSAyNCA5IDIzLjEgOSAyMlY0QzkgMi45IDEwLjkgMiAxMiAyWk0xNCA0SDE4VjIwSDE0VjRaTTYgNEgxMFYyMEg2VjRaIi8+PC9zdmc+',
      'Discos': 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzY2M2E4MiIgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiPjxwYXRoIGQ9Ik0xMiAyQzYuNDggMiAyIDYuNDggMiAxMlM2LjQ4IDIyIDEyIDIyIDIyIDE3LjUyIDIyIDEyIDIwLjUyIDIgMTIgMk0xMiA4QzE0LjIxIDggMTYgOS43OSAxNiAxMlMxNC4yMSAxNiAxMiAxNiAxMCAxNC4yMSAxMCAxMiA5LjIxIDggMTIgOE0xMiAxMUMxMS40NSAxMSAxMSAxMS40NSAxMSAxMlMxMS40NSAxMyAxMiAxMyAxMyAxMi41NSAxMyAxMiAxMi41NSAxMSAxMiAxMVoiLz48L3N2Zz4='
    };
    
    const fallbackSrc = fallbackImages[category.name] || fallbackImages['Livros'];
    event.target.src = fallbackSrc;
    event.target.style.display = 'block';
  }
}