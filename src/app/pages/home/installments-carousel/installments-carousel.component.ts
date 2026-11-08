import { ChangeDetectionStrategy, Component, ElementRef, computed, inject, viewChild } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { InstallmentPlan } from './models/installments.models';
import { InstallmentsService } from './data-access/installments.service';
import { IconComponent } from '../../../shared/ui/icon/icon.component';

interface InstallmentView extends InstallmentPlan {
  progress: number;
  remaining: number;
}

/** Compras parceladas em andamento, num carrossel com rolagem horizontal (scroll-snap). */
@Component({
  selector: 'app-installments-carousel',
  imports: [CurrencyPipe, IconComponent],
  templateUrl: './installments-carousel.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InstallmentsCarouselComponent {
  private readonly track = viewChild.required<ElementRef<HTMLElement>>('track');

  private readonly plans = toSignal(inject(InstallmentsService).getPlans(), { initialValue: [] as InstallmentPlan[] });

  protected readonly items = computed<InstallmentView[]>(() =>
    this.plans().map(plan => ({
      ...plan,
      progress: plan.total ? plan.paid / plan.total : 0,
      remaining: plan.amount * Math.max(plan.total - plan.paid, 0)
    }))
  );

  protected readonly totalRemaining = computed(() => this.items().reduce((sum, item) => sum + item.remaining, 0));

  /** Rola um card para o lado (direction: -1 anterior, 1 próximo). */
  scroll(direction: -1 | 1): void {
    const track = this.track().nativeElement;
    const card = track.querySelector<HTMLElement>('.carousel-item');
    const step = card ? card.offsetWidth + 16 : track.clientWidth * 0.8;
    track.scrollBy({ left: direction * step, behavior: 'smooth' });
  }
}
