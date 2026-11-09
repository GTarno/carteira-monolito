import { provideTestDefaults } from '../../../testing/test-providers';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstallmentsCarouselComponent } from './installments-carousel.component';
import { INSTALLMENTS_MOCK } from './data-access/installments.mock';

describe('InstallmentsCarouselComponent', () => {
  let fixture: ComponentFixture<InstallmentsCarouselComponent>;
  let el: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InstallmentsCarouselComponent],
      providers: [provideTestDefaults()]
    }).compileComponents();

    fixture = TestBed.createComponent(InstallmentsCarouselComponent);
    el = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('renders one card per installment plan with its progress', () => {
    const cards = el.querySelectorAll('.carousel-item');
    expect(cards.length).toBe(INSTALLMENTS_MOCK.length);

    const first = INSTALLMENTS_MOCK[0];
    expect(cards[0].textContent).toContain(first.title);
    expect(cards[0].textContent).toContain(`${first.paid} de ${first.total} parcelas pagas`);
  });

  it('scrolls the track with the navigation buttons', () => {
    const track = el.querySelector<HTMLElement>('.carousel')!;
    const spy = spyOn(track, 'scrollBy');

    el.querySelector<HTMLButtonElement>('button[aria-label="Próximo parcelamento"]')!.click();
    expect(spy).toHaveBeenCalledTimes(1);
    expect((spy.calls.mostRecent().args[0] as ScrollToOptions).left).toBeGreaterThan(0);
  });
});
