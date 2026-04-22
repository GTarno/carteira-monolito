import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarouselModule } from 'primeng/carousel';
import { Observable } from 'rxjs';
import { InstallmentPlan } from './models/installments.models';
import { InstallmentsService } from './data-access/installments.service';

@Component({
  selector: 'app-installments-carousel',
  standalone: true,
  imports: [CommonModule, CarouselModule],
  templateUrl: './installments-carousel.component.html',
  styleUrl: './installments-carousel.component.scss',
})
export class InstallmentsCarouselComponent implements OnInit {
  plans$!: Observable<InstallmentPlan[]>;

  responsiveOptions = [
    {
      breakpoint: '1024px',
      numVisible: 3,
      numScroll: 1
    },
    {
      breakpoint: '768px',
      numVisible: 2,
      numScroll: 1
    },
    {
      breakpoint: '560px',
      numVisible: 1,
      numScroll: 1
    }
  ];

  constructor(private installmentsService: InstallmentsService) {}

  ngOnInit(): void {
    this.plans$ = this.installmentsService.getPlans();
  }

  calculateProgress(paid: number, total: number): number {
    return (paid / total) * 100;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  }
}
