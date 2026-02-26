import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule, CurrencyPipe, AsyncPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Observable } from 'rxjs';

export interface SummaryData {
  totalPlanned: number;
  totalSpent: number;
  remaining: number;
}

export type HeaderStatus = 'default' | 'ok' | 'limit' | 'over';

@Component({
  selector: 'app-summary-header-card',
  standalone: true,
  imports: [
    CommonModule,
    AsyncPipe,
    CurrencyPipe,
    MatCardModule,
    MatIconModule,
    MatButtonModule
  ],
  template: `
    <div class="summary-container">
      <mat-card 
        class="summary-card"
        [class.header-ok]="status === 'ok'"
        [class.header-limit]="status === 'limit'"
        [class.header-over]="status === 'over'"
      >
        <mat-card-header>
          <mat-icon mat-card-avatar>{{ icon }}</mat-icon>
          <mat-card-title>{{ title }}</mat-card-title>
          <mat-card-subtitle>{{ subtitle }}</mat-card-subtitle>
          
          <!-- Botão de edição (opcional) -->
          <button 
            *ngIf="showEditButton"
            mat-icon-button 
            class="edit-button"
            (click)="onEditClick()"
            [attr.aria-label]="'Editar ' + title"
          >
            <mat-icon>edit</mat-icon>
          </button>
        </mat-card-header>
        
        <mat-card-content>
          <div class="summary-grid">
            <div class="summary-item">
              <mat-icon>trending_up</mat-icon>
              <div class="summary-text">
                <span class="label">Total Planejado</span>
                <span class="value">{{ totalPlanned$ | async | currency:'BRL':'symbol':'1.2-2' }}</span>
              </div>
            </div>

            <div class="summary-item">
              <mat-icon>shopping_cart</mat-icon>
              <div class="summary-text">
                <span class="label">Total Gasto</span>
                <span class="value">{{ totalSpent$ | async | currency:'BRL':'symbol':'1.2-2' }}</span>
              </div>
            </div>

            <div class="summary-item">
              <mat-icon>account_balance_wallet</mat-icon>
              <div class="summary-text">
                <span class="label">Saldo Restante</span>
                <span 
                  class="value"
                  [class.positive]="(remaining$ | async)! >= 0"
                  [class.negative]="(remaining$ | async)! < 0"
                >
                  {{ remaining$ | async | currency:'BRL':'symbol':'1.2-2' }}
                </span>
              </div>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .summary-container {
      margin-bottom: 32px;
    }

    .summary-card {
      background: linear-gradient(135deg, #e3f2fd 0%, #ffffff 100%);
      position: relative;
      
      &.header-ok {
        background: linear-gradient(135deg, #e8f5e8 0%, #ffffff 100%);
      }

      &.header-limit {
        background: linear-gradient(135deg, #fff8e1 0%, #ffffff 100%);
      }

      &.header-over {
        background: linear-gradient(135deg, #fce4ec 0%, #ffffff 100%);
      }
      
      mat-card-header {
        position: relative;
        
        .mat-mdc-card-avatar {
          background: #1976d2;
          color: white;
        }

        .edit-button {
          position: absolute;
          top: 8px;
          right: 8px;
          color: #666;
          
          &:hover {
            background-color: rgba(0, 0, 0, 0.08);
            color: #1976d2;
          }
        }
      }
    }

    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 24px;

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
        gap: 16px;
      }
    }

    .summary-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

      mat-icon {
        color: #1976d2;
        font-size: 32px;
        width: 32px;
        height: 32px;
      }

      .summary-text {
        display: flex;
        flex-direction: column;
        gap: 4px;

        .label {
          font-size: 0.875rem;
          color: #666;
          font-weight: 500;
        }

        .value {
          font-size: 1.25rem;
          font-weight: 600;
          color: #333;

          &.positive {
            color: #4caf50;
          }

          &.negative {
            color: #f44336;
          }
        }
      }
    }
  `]
})
export class SummaryHeaderCardComponent {
  @Input() title!: string;
  @Input() subtitle!: string;
  @Input() icon!: string;
  @Input() status: HeaderStatus = 'default';
  @Input() showEditButton: boolean = false;
  
  @Input() totalPlanned$!: Observable<number>;
  @Input() totalSpent$!: Observable<number>;
  @Input() remaining$!: Observable<number>;

  @Output() editClick = new EventEmitter<void>();

  onEditClick(): void {
    console.log('Edit clicked for:', this.title);
    this.editClick.emit();
  }
}