import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BillsChecklistComponent } from './bills-checklist.component';

describe('BillsChecklistComponent', () => {
  let component: BillsChecklistComponent;
  let fixture: ComponentFixture<BillsChecklistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BillsChecklistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BillsChecklistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
