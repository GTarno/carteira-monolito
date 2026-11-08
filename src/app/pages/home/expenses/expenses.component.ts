import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DoughnutChartComponent } from '../../../shared/components/doughnut-chart/doughnut-chart.component';
import { BarChartComponent } from '../../../shared/components/bar-chart/bar-chart.component';
import { LineChartComponent } from '../../../shared/components/line-chart/line-chart.component';
import { ExpenseCategory, MonthlyBudget, TrendData } from '../../../shared/types/chart.types';

/** Análise de gastos da Home (dados de exemplo até existir a API de dashboard). */
@Component({
  selector: 'app-expenses',
  imports: [DoughnutChartComponent, BarChartComponent, LineChartComponent],
  templateUrl: './expenses.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExpensesComponent {
  // A ordem das categorias define a cor de cada uma (paleta fixa, sem ciclar)
  readonly expenseCategories: ExpenseCategory[] = [
    { category: 'Moradia', amount: 2500 },
    { category: 'Alimentação', amount: 1250 },
    { category: 'Transporte', amount: 800 },
    { category: 'Saúde', amount: 600 },
    { category: 'Outros', amount: 400 },
    { category: 'Entretenimento', amount: 350 }
  ];

  readonly monthlyBudgets: MonthlyBudget[] = [
    { month: 'Jan', actual: 5900, budget: 6000 },
    { month: 'Fev', actual: 6200, budget: 6000 },
    { month: 'Mar', actual: 5800, budget: 6000 },
    { month: 'Abr', actual: 6400, budget: 6000 },
    { month: 'Mai', actual: 6100, budget: 6000 },
    { month: 'Jun', actual: 5750, budget: 6000 }
  ];

  readonly trendData: TrendData = {
    labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5', 'Sem 6', 'Sem 7', 'Sem 8'],
    datasets: [
      { label: 'Alimentação', data: [280, 320, 290, 360, 315, 340, 275, 395] },
      { label: 'Transporte', data: [180, 200, 220, 200, 210, 190, 235, 185] }
    ]
  };
}
