import { provideTestDefaults } from '../../../testing/test-providers';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BillsChecklistComponent } from './bills-checklist.component';
import { BillsChecklistService } from './bills-checklist.service';

describe('BillsChecklistComponent', () => {
  let fixture: ComponentFixture<BillsChecklistComponent>;
  let el: HTMLElement;

  beforeEach(async () => {
    localStorage.removeItem('bills-checklist');
    await TestBed.configureTestingModule({
      imports: [BillsChecklistComponent],
      providers: [provideTestDefaults()]
    }).compileComponents();

    fixture = TestBed.createComponent(BillsChecklistComponent);
    el = fixture.nativeElement;
    fixture.detectChanges();
  });

  afterEach(() => localStorage.removeItem('bills-checklist'));

  it('lists the month bills with a status badge and an icon', () => {
    const rows = el.querySelectorAll('li');
    expect(rows.length).toBe(TestBed.inject(BillsChecklistService).getBills().length);
    rows.forEach(row => {
      expect(row.querySelector('.badge')?.textContent?.trim()).toBeTruthy();
      expect(row.querySelector('.badge app-icon')).toBeTruthy();
    });
  });

  it('marks a bill as paid and updates the paid counter', () => {
    const counter = () => el.querySelector('.grid .text-xl')!.textContent!.trim();
    const before = counter();
    const unpaid = Array.from(el.querySelectorAll<HTMLInputElement>('input[type=checkbox]')).find(box => !box.checked)!;

    unpaid.click();
    fixture.detectChanges();

    const [paid, total] = before.split('/').map(Number);
    expect(counter()).toBe(`${paid + 1}/${total}`);
  });
});
