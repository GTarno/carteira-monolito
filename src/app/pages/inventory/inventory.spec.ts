import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideTestDefaults } from '../../testing/test-providers';
import { inventoryLabelsFor } from './models/inventory-labels';
import { AddCategoryDialogComponent, MAX_IMAGE_BYTES } from './ui/add-category-dialog/add-category-dialog.component';
import { AddItemDialogComponent } from './ui/add-item-dialog/add-item-dialog.component';
import { InventoryPage } from './inventory.page';

function setup<T>(component: Type<T>, data?: unknown) {
  const close = jasmine.createSpy('close');
  TestBed.configureTestingModule({
    providers: [provideTestDefaults(), { provide: DialogRef, useValue: { close } }, { provide: DIALOG_DATA, useValue: data }]
  });
  const fixture = TestBed.createComponent(component);
  fixture.detectChanges();
  const el: HTMLElement = fixture.nativeElement;
  const type = (selector: string, value: string) => {
    const input = el.querySelector<HTMLInputElement | HTMLTextAreaElement>(selector)!;
    input.value = value;
    input.dispatchEvent(new Event('input'));
  };
  const submit = () => {
    el.querySelector<HTMLButtonElement>('button[type=submit]')!.click();
    fixture.detectChanges();
  };
  return { fixture, el, close, type, submit };
}

describe('inventoryLabelsFor', () => {
  it('adapts field labels to the category', () => {
    expect(inventoryLabelsFor('Discos').author).toBe('Banda/Artista');
    expect(inventoryLabelsFor(' livros ').title).toBe('Título do livro');
    expect(inventoryLabelsFor('Jogos').author).toBe('Autor');
    expect(inventoryLabelsFor(undefined).title).toBe('Título');
  });
});

describe('AddCategoryDialogComponent', () => {
  function selectFile(el: HTMLElement, file: File) {
    const input = el.querySelector<HTMLInputElement>('#category-image')!;
    const transfer = new DataTransfer();
    transfer.items.add(file);
    input.files = transfer.files;
    input.dispatchEvent(new Event('change'));
  }

  it('rejects files that are not images or are too large', () => {
    const { el, fixture } = setup(AddCategoryDialogComponent);

    selectFile(el, new File(['x'], 'notas.txt', { type: 'text/plain' }));
    fixture.detectChanges();
    expect(el.textContent).toContain('Escolha um arquivo de imagem');

    selectFile(el, new File([new Uint8Array(MAX_IMAGE_BYTES + 1)], 'foto.png', { type: 'image/png' }));
    fixture.detectChanges();
    expect(el.textContent).toContain('no máximo 2 MB');
  });

  it('requires name, description and image', () => {
    const { el, close, submit } = setup(AddCategoryDialogComponent);
    submit();
    expect(close).not.toHaveBeenCalled();
    expect(el.textContent).toContain('O nome é obrigatório.');
    expect(el.textContent).toContain('Escolha uma imagem para a categoria.');
  });
});

describe('AddItemDialogComponent', () => {
  it('uses category-specific labels and closes with the trimmed item', () => {
    const { el, close, type, submit } = setup(AddItemDialogComponent, { categoryId: '2', categoryName: 'Discos' });
    expect(el.querySelector('label[for=item-author]')!.textContent).toContain('Banda/Artista');

    type('#item-title', ' Abbey Road ');
    type('#item-author', 'The Beatles');
    submit();

    expect(close).toHaveBeenCalledWith({ categoryId: '2', title: 'Abbey Road', author: 'The Beatles', notes: undefined });
  });
});

describe('InventoryPage', () => {
  it('lists categories as links with their item count', () => {
    TestBed.configureTestingModule({ providers: [provideTestDefaults()] });
    const fixture = TestBed.createComponent(InventoryPage);
    fixture.detectChanges();
    const cards = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('a.card'));

    expect(cards.length).toBeGreaterThan(0);
    expect(cards[0].getAttribute('href')).toMatch(/^\/inventario\//);
    expect(cards[0].textContent).toMatch(/\d+ ite(m|ns)/);
  });
});
