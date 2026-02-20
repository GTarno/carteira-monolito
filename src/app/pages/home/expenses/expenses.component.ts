import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DoughnutChartComponent } from '../../../shared/components/doughnut-chart/doughnut-chart.component';
import { BarChartComponent } from '../../../shared/components/bar-chart/bar-chart.component';
import { LineChartComponent } from '../../../shared/components/line-chart/line-chart.component';
import { ChartService } from '../../../core/services/chart.service';
import { 
  ExpenseCategory, 
  MonthlyBudget, 
  TrendData, 
  ChartInteractionEvent 
} from '../../../shared/types/chart.types';

@Component({
  selector: 'app-expenses',
  imports: [
    CommonModule, 
    DoughnutChartComponent, 
    BarChartComponent, 
    LineChartComponent
  ],
  templateUrl: './expenses.component.html',
  styleUrl: './expenses.component.scss',
})
export class ExpensesComponent implements OnInit {

  // Responsive breakpoint
  public isMobile$: Observable<boolean>;

  // Raw data for charts
  public expenseCategories: ExpenseCategory[] = [
    { category: 'Alimentação', amount: 1250, color: '#FF6384' },
    { category: 'Transporte', amount: 800, color: '#36A2EB' },
    { category: 'Moradia', amount: 2500, color: '#FFCE56' },
    { category: 'Entretenimento', amount: 350, color: '#4BC0C0' },
    { category: 'Saúde', amount: 600, color: '#9966FF' },
    { category: 'Outros', amount: 400, color: '#FF9F40' }
  ];

  public monthlyBudgets: MonthlyBudget[] = [
    { month: 'Janeiro', actual: 5900, budget: 6000 },
    { month: 'Fevereiro', actual: 6200, budget: 6000 },
    { month: 'Março', actual: 5800, budget: 6000 },
    { month: 'Abril', actual: 6400, budget: 6000 },
    { month: 'Maio', actual: 6100, budget: 6000 },
    { month: 'Junho', actual: 5750, budget: 6000 }
  ];

  public trendData: TrendData = {
    labels: ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4', 'Semana 5', 'Semana 6', 'Semana 7', 'Semana 8'],
    datasets: [
      { label: 'Alimentação', data: [280, 320, 290, 360, 315, 340, 275, 395], color: '#FF6384' },
      { label: 'Transporte', data: [180, 200, 220, 200, 210, 190, 235, 185], color: '#36A2EB' }
    ]
  };

  // Current chart view
  public currentChart: 'doughnut' | 'bar' | 'line' = 'doughnut';

  constructor(
    private chartService: ChartService,
    private breakpointObserver: BreakpointObserver
  ) {
    this.isMobile$ = this.breakpointObserver.observe(['(max-width: 959px)'])
      .pipe(map(result => result.matches));
  }

  ngOnInit(): void {
    // Component initialization - chart components handle their own data
  }

  // Switch between chart types
  public switchChart(type: 'doughnut' | 'bar' | 'line'): void {
    this.currentChart = type;
  }

  // Chart event handlers
  public onChartClick(event: ChartInteractionEvent): void {
    console.log('Chart clicked:', event);
    if (event.active && event.active.length > 0) {
      console.log('Clicked on chart element');
    }
  }

  public onChartHover(event: ChartInteractionEvent): void {
    console.log('Chart hovered:', event);
  }

  // Action handlers for each chart type
  public onExpenseAction(): void {
    const randomIndex = Math.floor(Math.random() * this.expenseCategories.length);
    const randomAmount = Math.floor(Math.random() * 200) + 50;
    
    this.expenseCategories[randomIndex].amount += randomAmount;
    
    // Trigger change detection by creating new array reference
    this.expenseCategories = [...this.expenseCategories];
  }

  public onMonthlyAction(): void {
    const newMonth: MonthlyBudget = {
      month: `Mês ${this.monthlyBudgets.length + 1}`,
      actual: Math.floor(Math.random() * 2000) + 4000,
      budget: 6000
    };
    
    this.monthlyBudgets = [...this.monthlyBudgets, newMonth];
  }

  public onTrendAction(): void {
    const newWeekData = this.trendData.datasets.map(dataset => ({
      ...dataset,
      data: [...dataset.data, Math.floor(Math.random() * 200) + 100]
    }));
    
    this.trendData = {
      labels: [...this.trendData.labels, `Semana ${this.trendData.labels.length + 1}`],
      datasets: newWeekData
    };
  }

  // Utility method
  public getTotalExpenses(): number {
    return this.chartService.calculateTotal(this.expenseCategories);
  }
}


