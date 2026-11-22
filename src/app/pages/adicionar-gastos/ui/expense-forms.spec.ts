import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideTestDefaults } from '../../../testing/test-providers';
import { MonthlyExpenseFormComponent } from './monthly-expense-form/monthly-expense-form.component';
import { LargePurchaseFormComponent } from './large-purchase-form/large-purchase-form.component';
import { PLANNING_CATEGORIES } from '../../planning/data-access/planning.mock';

function setup<T>(component: Type<T>, data?: unknown) {
  const close = jasmine.createSpy('close');
  TestBed.configureTestingModule({
    providers: [provideTestDefaults(), { provide: DialogRef, useValue: { close } }, { provide: DIALOG_DATA, useValue: data }]
  });
  const fixture = TestBed.createComponent(component);
  fixture.detectChanges();
  const el: HTMLElement = fixture.nativeElement;
  const type = (selector: string, value: string) => {
    const input = el.querySelector<HTMLInputElement>(selector)!;
    input.value = value;
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
  };
  const submit = () => {
    el.querySelector<HTMLButtonElement>('button[type=submit]')!.click();
    fixture.detectChanges();
  };
  const text = () => el.textContent!.replace(/ /g, ' ');
  return { fixture, el, close, type, submit, text };
}

describe('MonthlyExpenseFormComponent', () => {
  it('asks for the planning category and validates the fields', () => {
    const { el, close, submit, text } = setup(MonthlyExpenseFormComponent, { categories: PLANNING_CATEGORIES });
    expect(el.querySelectorAll('input[type=radio]').length).toBe(PLANNING_CATEGORIES.length);
    submit();
    expect(close).not.toHaveBeenCalled();
    expect(text()).toContain('Escolha onde esse gasto se encaixa.');
  });

  it('shows where the expense will appear and closes with the parsed values', () => {
    const { el, close, type, submit, text, fixture } = setup(MonthlyExpenseFormComponent, { categories: PLANNING_CATEGORIES });
    type('#expense-name', ' Academia ');
    el.querySelectorAll<HTMLInputElement>('input[type=radio]')[0].click(); // 'contas' é a primeira categoria
    fixture.detectChanges();
    type('#expense-value', '1.099,90');
    type('#expense-due', '15');

    expect(text()).toContain('R$ 1.099,90 por mês, vencendo todo dia 15');
    expect(text()).toContain('Planejamento › Contas');

    submit();
    expect(close).toHaveBeenCalledWith({ name: 'Academia', categoryId: 'contas', plannedValue: 1099.9, dueDay: 15 });
  });

  it('rejects an invalid due day', () => {
    const { close, type, submit, text } = setup(MonthlyExpenseFormComponent, { categories: PLANNING_CATEGORIES });
    type('#expense-due', '32');
    submit();
    expect(close).not.toHaveBeenCalled();
    expect(text()).toContain('Informe um dia entre 1 e 31.');
  });
});

describe('LargePurchaseFormComponent', () => {
  it('previews the installment value and closes without image when none is chosen', () => {
    const { close, type, submit, text } = setup(LargePurchaseFormComponent);
    type('#purchase-title', 'Geladeira');
    type('#purchase-total', '3.000,00');
    type('#purchase-installments', '10');
    type('#purchase-paid', '2');

    expect(text()).toContain('10x de R$ 300,00');
    expect(text()).toContain('faltam 8 parcelas');

    submit();
    expect(close).toHaveBeenCalledWith({ title: 'Geladeira', totalAmount: 3000, installments: 10, paidInstallments: 2, imageUrl: undefined });
  });

  it('does not accept more paid installments than the total', () => {
    const { close, type, submit, text } = setup(LargePurchaseFormComponent);
    type('#purchase-title', 'Geladeira');
    type('#purchase-total', '3000');
    type('#purchase-installments', '3');
    type('#purchase-paid', '3');
    submit();
    expect(close).not.toHaveBeenCalled();
    expect(text()).toContain('Precisa ser menor que a quantidade de parcelas.');
  });
});
