import { ChartEvent } from 'chart.js';

// Base interface for all chart components
export interface BaseChartConfig {
  title?: string;
  height?: string;
  showLegend?: boolean;
}

// Chart event interface
export interface ChartInteractionEvent {
  event?: ChartEvent;
  active?: object[];
}

// Expense data interface
export interface ExpenseCategory {
  category: string;
  amount: number;
  color?: string;
}

// Monthly data interface
export interface MonthlyBudget {
  month: string;
  actual: number;
  budget: number;
}

// Trend data interface
export interface TrendDataset {
  label: string;
  data: number[];
  color?: string;
}

export interface TrendData {
  labels: string[];
  datasets: TrendDataset[];
}