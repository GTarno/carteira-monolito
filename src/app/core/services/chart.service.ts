import { Injectable } from '@angular/core';
import { ChartData, ChartOptions, ChartType } from 'chart.js';

export interface ExpenseData {
  category: string;
  amount: number;
  color?: string;
}

export interface MonthlyData {
  month: string;
  actual: number;
  budget: number;
}

@Injectable({
  providedIn: 'root'
})
export class ChartService {

  // Default colors for different chart types
  private readonly defaultColors = [
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
    '#9966FF', '#FF9F40', '#FF6B6B', '#4ECDC4'
  ];

  /**
   * Generate doughnut chart configuration for expense categories
   */
  public generateExpenseDoughnutChart(expenses: ExpenseData[]): {
    data: ChartData<'doughnut'>,
    options: ChartOptions<'doughnut'>
  } {
    const data: ChartData<'doughnut'> = {
      labels: expenses.map(expense => expense.category),
      datasets: [{
        data: expenses.map(expense => expense.amount),
        backgroundColor: expenses.map((expense, index) => 
          expense.color || this.defaultColors[index % this.defaultColors.length]
        ),
        hoverBackgroundColor: expenses.map((expense, index) => 
          (expense.color || this.defaultColors[index % this.defaultColors.length]) + 'AA'
        ),
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    };

    const options: ChartOptions<'doughnut'> = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 20,
            font: {
              size: 14
            }
          }
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const label = context.label || '';
              const value = context.parsed;
              const total = context.dataset.data.reduce((a: any, b: any) => a + b, 0);
              const percentage = ((value / total) * 100).toFixed(1);
              return `${label}: R$ ${value.toLocaleString('pt-BR')} (${percentage}%)`;
            }
          }
        }
      }
    };

    return { data, options };
  }

  /**
   * Generate bar chart configuration for monthly data
   */
  public generateMonthlyBarChart(monthlyData: MonthlyData[]): {
    data: ChartData<'bar'>,
    options: ChartOptions<'bar'>
  } {
    const data: ChartData<'bar'> = {
      labels: monthlyData.map(item => item.month),
      datasets: [
        {
          label: 'Gastos Reais',
          data: monthlyData.map(item => item.actual),
          backgroundColor: '#36A2EB',
          borderColor: '#1E88E5',
          borderWidth: 1,
          borderRadius: 4
        },
        {
          label: 'Orçamento Planejado',
          data: monthlyData.map(item => item.budget),
          backgroundColor: '#FF6384',
          borderColor: '#E91E63',
          borderWidth: 1,
          borderRadius: 4
        }
      ]
    };

    const options: ChartOptions<'bar'> = {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: 'index'
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return 'R$ ' + Number(value).toLocaleString('pt-BR');
            }
          },
          grid: {
            color: 'rgba(0,0,0,0.1)'
          }
        },
        x: {
          grid: {
            display: false
          }
        }
      },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            usePointStyle: true,
            padding: 20
          }
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const value = context.parsed.y ?? 0;
              return `${context.dataset.label}: R$ ${value.toLocaleString('pt-BR')}`;
            }
          }
        }
      }
    };

    return { data, options };
  }

  /**
   * Generate line chart configuration for trend analysis
   */
  public generateTrendLineChart(
    labels: string[], 
    datasets: { label: string; data: number[]; color?: string }[]
  ): {
    data: ChartData<'line'>,
    options: ChartOptions<'line'>
  } {
    const data: ChartData<'line'> = {
      labels,
      datasets: datasets.map((dataset, index) => {
        const color = dataset.color || this.defaultColors[index % this.defaultColors.length];
        return {
          label: dataset.label,
          data: dataset.data,
          borderColor: color,
          backgroundColor: this.hexToRgba(color, 0.1),
          fill: true,
          tension: 0.4,
          borderWidth: 3,
          pointBackgroundColor: color,
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 5
        };
      })
    };

    const options: ChartOptions<'line'> = {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: 'index'
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return 'R$ ' + Number(value).toLocaleString('pt-BR');
            }
          },
          grid: {
            color: 'rgba(0,0,0,0.1)'
          }
        },
        x: {
          grid: {
            display: false
          }
        }
      },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            usePointStyle: true,
            padding: 20
          }
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const value = context.parsed.y ?? 0;
              return `${context.dataset.label}: R$ ${value.toLocaleString('pt-BR')}`;
            }
          }
        }
      }
    };

    return { data, options };
  }

  /**
   * Generate pie chart (similar to doughnut but full circle)
   */
  public generatePieChart(expenses: ExpenseData[]): {
    data: ChartData<'pie'>,
    options: ChartOptions<'pie'>
  } {
    const doughnutConfig = this.generateExpenseDoughnutChart(expenses);
    return {
      data: {
        ...doughnutConfig.data
      } as ChartData<'pie'>,
      options: {
        ...doughnutConfig.options
      } as ChartOptions<'pie'>
    };
  }

  /**
   * Utility function to convert hex color to rgba
   */
  private hexToRgba(hex: string, alpha: number): string {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return `rgba(0,0,0,${alpha})`;
    
    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);
    
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  /**
   * Calculate total from expense data
   */
  public calculateTotal(expenses: ExpenseData[]): number {
    return expenses.reduce((total, expense) => total + expense.amount, 0);
  }

  /**
   * Generate random color
   */
  public generateRandomColor(): string {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }
}