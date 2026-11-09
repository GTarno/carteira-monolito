import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { filter } from 'rxjs';
import { InventoryCategory, InventoryCategoryCreate } from './models/inventory-category.model';
import { InventoryItem } from './models/inventory-item.model';
import { InventoryService } from './data-access/inventory.service';
import { AddCategoryDialogComponent } from './ui/add-category-dialog/add-category-dialog.component';
import { AppDialog } from '../../shared/ui/dialog/app-dialog.service';
import { ToastService } from '../../shared/ui/toast/toast.service';
import { IconComponent } from '../../shared/ui/icon/icon.component';

/** Categorias do inventário pessoal (livros, discos...). */
@Component({
  selector: 'app-inventory',
  imports: [RouterLink, IconComponent],
  templateUrl: './inventory.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InventoryPage {
  private readonly inventoryService = inject(InventoryService);
  private readonly dialog = inject(AppDialog);
  private readonly toast = inject(ToastService);

  protected readonly categories = toSignal(this.inventoryService.categories$, { initialValue: [] as InventoryCategory[] });
  private readonly items = toSignal(this.inventoryService.items$, { initialValue: [] as InventoryItem[] });

  /** Quantidade de itens por categoria. */
  protected readonly itemCount = computed(() => {
    const counts = new Map<string, number>();
    for (const item of this.items()) counts.set(item.categoryId, (counts.get(item.categoryId) ?? 0) + 1);
    return counts;
  });

  /** Categorias cuja imagem não carregou (mostram um ícone no lugar). */
  protected readonly brokenImages = signal(new Set<string>());

  onImageError(categoryId: string): void {
    this.brokenImages.update(ids => new Set(ids).add(categoryId));
  }

  openAddDialog(): void {
    this.dialog.open<AddCategoryDialogComponent, void, InventoryCategoryCreate>(AddCategoryDialogComponent, {
      ariaLabel: 'Adicionar categoria'
    }).closed.pipe(filter((result): result is InventoryCategoryCreate => !!result)).subscribe(result => {
      this.inventoryService.addCategory(result);
      this.toast.success(`Categoria "${result.name}" criada.`);
    });
  }
}
