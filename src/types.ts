/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type CategoryId = string;

export interface Category {
  id: CategoryId;
  name: string;
  budget: number;
  color: string;
  icon: string;
}

export type RecurringPeriod = 'daily' | 'weekly' | 'monthly';

export interface Expense {
  id: string;
  amount: number;
  categoryId: CategoryId;
  date: string; // ISO string
  title: string;
  isEssential: boolean;
  isRecurring: boolean;
  recurringId?: string;
}

export interface RecurringExpense {
  id: string;
  amount: number;
  categoryId: CategoryId;
  title: string;
  isEssential: boolean;
  period: RecurringPeriod;
  startDate: string;
  lastProcessed?: string;
}

export interface BudgetData {
  expenses: Expense[];
  categories: Category[];
  recurringExpenses: RecurringExpense[];
  targetBudget: number;
}

export const DEFAULT_CATEGORIES: Category[] = [
  { id: '1', name: 'Housing', budget: 1000, color: '#3b82f6', icon: 'Home' },
  { id: '2', name: 'Food', budget: 400, color: '#ef4444', icon: 'Utensils' },
  { id: '3', name: 'Transport', budget: 200, color: '#f59e0b', icon: 'Bus' },
  { id: '4', name: 'Entertainment', budget: 150, color: '#8b5cf6', icon: 'Film' },
  { id: '5', name: 'Utilities', budget: 200, color: '#10b981', icon: 'Zap' },
  { id: '6', name: 'Health', budget: 100, color: '#ec4899', icon: 'HeartPulse' },
  { id: '7', name: 'Others', budget: 100, color: '#6b7280', icon: 'Box' },
];
