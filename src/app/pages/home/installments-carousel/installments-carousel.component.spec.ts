import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstallmentsCarouselComponent } from './installments-carousel.component';

describe('InstallmentsCarouselComponent', () => {
  let component: InstallmentsCarouselComponent;
  let fixture: ComponentFixture<InstallmentsCarouselComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InstallmentsCarouselComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InstallmentsCarouselComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
