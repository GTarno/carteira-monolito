import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideTestDefaults } from '../../../testing/test-providers';
import { AddPlanningItemDialogComponent } from './add-planning-item-dialog/add-planning-item-dialog.component';
import { EditPlanningItemDialogComponent } from './edit-planning-item-dialog/edit-planning-item-dialog.component';

function setup<T>(component: Type<T>, data?: unknown) {
  const close = jasmine.createSpy('close');
  TestBed.configureTestingModule({
    providers: [
      provideTestDefaults(),
      { provide: DialogRef, useValue: { close } },
      { provide: DIALOG_DATA, useValue: data }
    ]
  });
  const fixture = TestBed.createComponent(component);
  fixture.detectChanges();
  const el: HTMLElement = fixture.nativeElement;
  const type = (selector: string, value: string) => {
    const input = el.querySelector<HTMLInputElement>(selector)!;
    input.value = value;
    input.dispatchEvent(new Event('input'));
  };
  const submit = () => {
    el.querySelector<HTMLButtonElement>('button[type=submit]')!.click();
    fixture.detectChanges();
  };
  return { el, close, type, submit, fixture };
}

describe('AddPlanningItemDialogComponent', () => {
  it('shows validation errors and does not close when the form is incomplete', () => {
    const { el, close, submit } = setup(AddPlanningItemDialogComponent);
    submit();
    expect(close).not.toHaveBeenCalled();
    expect(el.textContent).toContain('Informe o nome do item.');
    expect(el.textContent).toContain('Escolha um ícone para o item.');
  });

  it('closes with the new item, parsing a Brazilian amount', () => {
    const { el, close, type, submit, fixture } = setup(AddPlanningItemDialogComponent);
    type('#item-name', '  Padaria ');
    type('#item-value', '1.234,50');
    el.querySelector<HTMLButtonElement>('button[role=radio]')!.click();
    fixture.detectChanges();
    submit();

    expect(close).toHaveBeenCalledWith(jasmine.objectContaining({ name: 'Padaria', plannedValue: 1234.5, icon: 'receipt' }));
  });
});

describe('EditPlanningItemDialogComponent', () => {
  const data = { itemName: 'Luz', plannedValue: 200, realValue: 176.76 };

  it('opens with the current values', () => {
    const { el } = setup(EditPlanningItemDialogComponent, data);
    expect(el.querySelector<HTMLInputElement>('#edit-plannedValue')!.value).toBe('200,00');
    expect(el.querySelector<HTMLInputElement>('#edit-realValue')!.value).toBe('176,76');
  });

  it('closes with the parsed values and rejects invalid input', () => {
    const { el, close, type, submit } = setup(EditPlanningItemDialogComponent, data);
    type('#edit-realValue', 'abc');
    submit();
    expect(close).not.toHaveBeenCalled();
    expect(el.textContent).toContain('Digite um valor válido');

    type('#edit-realValue', '210,5');
    submit();
    expect(close).toHaveBeenCalledWith({ plannedValue: 200, realValue: 210.5 });
  });
});
