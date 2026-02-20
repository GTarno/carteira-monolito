# Chart Library Implementation - ng2-charts

This document provides comprehensive guidance on using ng2-charts in your Angular application for creating interactive and beautiful charts.

## 📦 Installation & Setup

### 1. Install ng2-charts
```bash
ng add ng2-charts
```

This command will:
- Install ng2-charts and dependencies
- Automatically configure your `app.config.ts` with required providers

### 2. Global Configuration

The `app.config.ts` file has been automatically updated with:

```typescript
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

export const appConfig: ApplicationConfig = {
  providers: [
    // ... other providers
    provideCharts(withDefaultRegisterables())
  ]
};
```

## 🚀 Usage

### Basic Chart Component

To create a chart in any component:

```typescript
import { Component } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions, ChartType } from 'chart.js';

@Component({
  selector: 'app-my-chart',
  imports: [BaseChartDirective],
  template: `
    <canvas 
      baseChart 
      [data]="chartData" 
      [type]="chartType"
      [options]="chartOptions">
    </canvas>
  `
})
export class MyChartComponent {
  public chartType: ChartType = 'bar';
  
  public chartData: ChartData<'bar'> = {
    labels: ['Jan', 'Feb', 'Mar'],
    datasets: [{
      label: 'Sales',
      data: [100, 200, 150]
    }]
  };
  
  public chartOptions: ChartOptions<'bar'> = {
    responsive: true
  };
}
```

## 📊 Chart Types Available

### 1. Doughnut/Pie Charts
Perfect for showing proportional data like expense categories:
- `type: 'doughnut'` - Hollow center
- `type: 'pie'` - Full circle

### 2. Bar Charts
Ideal for comparing data across categories:
- `type: 'bar'` - Vertical bars
- `type: 'horizontalBar'` - Horizontal bars

### 3. Line Charts
Great for showing trends over time:
- `type: 'line'` - Connected points with lines

### 4. Other Types
- `type: 'radar'` - Multi-dimensional data
- `type: 'scatter'` - X/Y coordinate data
- `type: 'bubble'` - Three-dimensional data
- `type: 'polarArea'` - Circular segments

## 🛠️ Chart Service

We've created a reusable `ChartService` located at `src/app/core/services/chart.service.ts` that provides:

### Key Features:
- **Pre-configured chart types** with optimized settings
- **Brazilian currency formatting** (R$)
- **Responsive design** support
- **Color management** with default palettes
- **Type-safe interfaces** for data structures

### Usage Example:

```typescript
import { ChartService, ExpenseData } from '../core/services/chart.service';

export class MyComponent {
  constructor(private chartService: ChartService) {}
  
  ngOnInit() {
    const expenses: ExpenseData[] = [
      { category: 'Food', amount: 500, color: '#FF6384' },
      { category: 'Transport', amount: 300, color: '#36A2EB' }
    ];
    
    const config = this.chartService.generateExpenseDoughnutChart(expenses);
    this.chartData = config.data;
    this.chartOptions = config.options;
  }
}
```

## 📱 Responsive Design

All charts are configured to be responsive by default:

```typescript
public chartOptions: ChartOptions = {
  responsive: true,
  maintainAspectRatio: false, // Allows custom height control
  // ... other options
};
```

CSS styling controls chart dimensions:
```scss
canvas {
  max-width: 100%;
  height: 400px !important; // Override default height
}
```

## 🎛️ Interactive Features

### Chart Events
Handle user interactions:

```typescript
public chartClicked(event: { event: ChartEvent; active: object[] }): void {
  console.log('Chart clicked:', event);
  if (event.active.length > 0) {
    // Handle click on specific chart element
  }
}

public chartHovered(event: { event: ChartEvent; active: object[] }): void {
  console.log('Chart hovered:', event);
}
```

### Dynamic Data Updates
Update chart data dynamically:

```typescript
public updateData(): void {
  // Modify your data
  this.expenseData[0].amount += 100;
  
  // Regenerate chart configuration
  const config = this.chartService.generateExpenseDoughnutChart(this.expenseData);
  this.chartData = config.data;
}
```

## 🎨 Customization

### Colors
The service provides default color palettes, but you can customize:

```typescript
const expenses: ExpenseData[] = [
  { category: 'Food', amount: 500, color: '#FF6384' },
  { category: 'Transport', amount: 300, color: '#36A2EB' }
];
```

### Chart Options
Customize chart behavior and appearance:

```typescript
public chartOptions: ChartOptions<'doughnut'> = {
  responsive: true,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        font: { size: 14 },
        padding: 20
      }
    },
    tooltip: {
      callbacks: {
        label: (context) => {
          return `${context.label}: R$ ${context.parsed.toLocaleString('pt-BR')}`;
        }
      }
    }
  }
};
```

## 📁 Project Structure

```
src/app/
├── core/
│   └── services/
│       └── chart.service.ts          # Reusable chart service
├── pages/
│   └── home/
│       └── expenses/
│           ├── expenses.component.ts  # Example implementation
│           ├── expenses.component.html
│           └── expenses.component.scss
└── app.config.ts                     # Global chart configuration
```

## 💡 Best Practices

### 1. Use the Chart Service
- Leverage the provided `ChartService` for consistency
- Reuse configurations across components
- Maintain type safety with provided interfaces

### 2. Performance
- Use `OnPush` change detection for better performance
- Avoid recreating chart data objects unnecessarily
- Use `trackBy` functions for dynamic chart lists

### 3. Accessibility
- Provide alternative text descriptions for charts
- Use high-contrast colors for better visibility
- Include legends and tooltips for context

### 4. Responsive Design
- Set `responsive: true` in chart options
- Use CSS to control chart dimensions
- Test on different screen sizes

## 🔧 Troubleshooting

### Common Issues:

1. **Charts not rendering:**
   - Ensure `provideCharts(withDefaultRegisterables())` is in app.config.ts
   - Import `BaseChartDirective` in component
   - Check for console errors

2. **Data not updating:**
   - Update data reference, not just values: `this.chartData = { ...this.chartData }`
   - Use Angular's change detection properly

3. **Responsive issues:**
   - Set `maintainAspectRatio: false`
   - Use CSS to control dimensions
   - Test container sizing

## 📚 Additional Resources

- [Chart.js Documentation](https://www.chartjs.org/docs/latest/)
- [ng2-charts GitHub](https://github.com/valor-software/ng2-charts)
- [Angular Change Detection Guide](https://angular.io/guide/change-detection)

## 🎯 Example Implementations

Check the `expenses.component.ts` for complete examples of:
- Multiple chart types in one component
- Chart switching functionality
- Dynamic data updates
- Brazilian currency formatting
- Professional styling

This implementation provides a solid foundation for adding interactive charts to any Angular application!