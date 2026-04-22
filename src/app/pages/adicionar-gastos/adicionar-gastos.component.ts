import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';

@Component({
  selector: 'app-adicionar-gastos',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule],
  templateUrl: './adicionar-gastos.component.html',
  styleUrl: './adicionar-gastos.component.scss'
})
export class AdicionarGastosComponent {
  constructor(private router: Router) {}

  onCardClick(type: string): void {
    switch (type) {
      case 'gastos-mensais':
        console.log('gastos-mensais');
        // Future navigation: this.router.navigate(['/gastos-mensais']);
        break;
      case 'grandes-compras':
        console.log('grandes-compras');
        // Future navigation: this.router.navigate(['/grandes-compras']);
        break;
    }
  }
}