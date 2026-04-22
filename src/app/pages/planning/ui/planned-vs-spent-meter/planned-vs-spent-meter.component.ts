import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-planned-vs-spent-meter',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  template: `
    <div class="meter-container">
      <div class="meter-header">
        <h3>Planejado vs Gasto</h3>
        <div class="meter-values">
          <div class="planned-value">
            <span class="label">Planejado:</span>
            <span class="value">{{ plannedTotal | currency:'BRL':'symbol':'1.2-2':'pt' }}</span>
          </div>
          <div class="spent-value">
            <span class="label">Gasto:</span>
            <span class="value">{{ spentTotal | currency:'BRL':'symbol':'1.2-2':'pt' }}</span>
          </div>
          <div class="percentage">
            <span class="label">Progresso:</span>
            <span class="value" [class]="getPercentageClass()">{{ getPercentage() }}%</span>
          </div>
        </div>
      </div>

      <div class="meter-bar-container">
        <div 
          class="meter-bar"
          [attr.aria-label]="getAriaLabel()"
          [attr.aria-valuenow]="getPercentage()"
          [attr.aria-valuemin]="0"
          [attr.aria-valuemax]="getMaxPercentage()"
          role="progressbar"
        >
          <div 
            class="meter-fill"
            [class]="getFillClass()"
            [style.width.%]="getFillWidth()"
          ></div>
        </div>
        
        <div 
          *ngIf="isOverBudget()" 
          class="excess-indicator"
        >
          <span class="excess-text">
            Excedente: {{ getExcess() | currency:'BRL':'symbol':'1.2-2':'pt' }}
          </span>
        </div>
      </div>

      <div class="meter-legend">
        <div class="legend-item safe">
          <span class="legend-color"></span>
          <span class="legend-text">Dentro do planejado (0-60%)</span>
        </div>
        <div class="legend-item warning">
          <span class="legend-color"></span>
          <span class="legend-text">Atenção (60-90%)</span>
        </div>
        <div class="legend-item danger">
          <span class="legend-color"></span>
          <span class="legend-text">Próximo ao limite (90-100%)</span>
        </div>
        <div class="legend-item over">
          <span class="legend-color"></span>
          <span class="legend-text">Excedeu o planejado</span>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./planned-vs-spent-meter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlannedVsSpentMeterComponent {
  @Input() plannedTotal: number = 0;
  @Input() spentTotal: number = 0;

  getPercentage(): number {
    if (this.plannedTotal === 0) return 0;
    return Math.round((this.spentTotal / this.plannedTotal) * 100);
  }

  getMaxPercentage(): number {
    return this.isOverBudget() ? this.getPercentage() : 100;
  }

  getFillWidth(): number {
    if (this.plannedTotal === 0) return 0;
    const percentage = (this.spentTotal / this.plannedTotal) * 100;
    return Math.min(percentage, 100);
  }

  getFillClass(): string {
    if (this.isOverBudget()) return 'over';
    
    const percentage = this.getPercentage();
    if (percentage >= 90) return 'danger';
    if (percentage >= 60) return 'warning';
    return 'safe';
  }

  getPercentageClass(): string {
    const percentage = this.getPercentage();
    if (this.isOverBudget()) return 'over-percentage';
    if (percentage >= 90) return 'danger-percentage';
    if (percentage >= 60) return 'warning-percentage';
    return 'safe-percentage';
  }

  isOverBudget(): boolean {
    return this.spentTotal > this.plannedTotal && this.plannedTotal > 0;
  }

  getExcess(): number {
    return Math.max(this.spentTotal - this.plannedTotal, 0);
  }

  getAriaLabel(): string {
    const percentage = this.getPercentage();
    if (this.isOverBudget()) {
      const excess = this.getExcess();
      return `Orçamento excedido em ${percentage}%. Excesso de ${excess.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`;
    }
    return `${percentage}% do orçamento utilizado`;
  }
}