import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { filter } from 'rxjs';
import { InventoryItem, InventoryItemCreate } from '../../models/inventory-item.model';
import { inventoryLabelsFor } from '../../models/inventory-labels';
import { InventoryService } from '../../data-access/inventory.service';
import { AddItemDialogComponent, AddItemDialogData } from '../../ui/add-item-dialog/add-item-dialog.component';
import { AppDialog } from '../../../../shared/ui/dialog/app-dialog.service';
import { ToastService } from '../../../../shared/ui/toast/toast.service';
import { IconComponent } from '../../../../shared/ui/icon/icon.component';

/** Itens de uma categoria do inventário, em tabela. */
@Component({
  selector: 'app-inventory-category-items',
  imports: [RouterLink, DatePipe, IconComponent],
  templateUrl: './inventory-category-items.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InventoryCategoryItemsPage {
  private readonly inventoryService = inject(InventoryService);
  private readonly dialog = inject(AppDialog);
  private readonly toast = inject(ToastService);

  readonly categoryId = inject(ActivatedRoute).snapshot.paramMap.get('categoryId') ?? '';

  protected readonly category = toSignal(this.inventoryService.getCategoryById(this.categoryId));
  protected readonly items = toSignal(this.inventoryService.getItemsByCategory(this.categoryId), {
    initialValue: [] as InventoryItem[]
  });
  protected readonly labels = computed(() => inventoryLabelsFor(this.category()?.name));

  openAddItemDialog(): void {
    const data: AddItemDialogData = { categoryId: this.categoryId, categoryName: this.category()?.name ?? 'Categoria' };
    this.dialog.open<AddItemDialogComponent, AddItemDialogData, InventoryItemCreate>(AddItemDialogComponent, {
      data,
      ariaLabel: `Adicionar item em ${data.categoryName}`
    }).closed.pipe(filter((result): result is InventoryItemCreate => !!result)).subscribe(result => {
      this.inventoryService.addItem(result);
      this.toast.success(`"${result.title}" adicionado.`);
    });
  }

  onDeleteItem(item: InventoryItem): void {
    this.inventoryService.deleteItem(item.id);
    this.toast.info(`"${item.title}" removido.`);
  }
}
