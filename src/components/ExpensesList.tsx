/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Expense, Category, RecurringExpense } from '../types';
import { formatCurrency, formatDate } from '../utils/format';
import { Trash2, Filter, AlertCircle, Edit2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ExpenseModal from './ExpenseModal';

interface ExpensesListProps {
  expenses: Expense[];
  categories: Category[];
  deleteExpense: (id: string) => void;
  updateExpense: (expense: Expense) => void;
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  addRecurringExpense: (recurring: Omit<RecurringExpense, 'id'>) => void;
}

export default function ExpensesList({ expenses, categories, deleteExpense, updateExpense, addExpense, addRecurringExpense }: ExpensesListProps) {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const filteredExpenses = expenses.filter(e =>
    filterCategory === 'all' ? true : e.categoryId === filterCategory
  );

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <div className="flex items-center gap-3 overflow-x-auto pb-4 no-scrollbar">
        <button
          onClick={() => setFilterCategory('all')}
          className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
            filterCategory === 'all'
              ? 'bg-[#E5E5E5] text-black'
              : 'bg-[#111] text-[#444] border border-[#222] hover:text-[#888]'
          }`}
        >
          All
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setFilterCategory(cat.id)}
            className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
              filterCategory === cat.id
                ? 'bg-[#E5E5E5] text-black'
                : 'bg-[#111] text-[#444] border border-[#222] hover:text-[#888]'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Expenses List */}
      <div className="space-y-3">
        {filteredExpenses.length === 0 ? (
          <div className="text-center py-16 bg-[#111] rounded-2xl border border-dashed border-[#222]">
            <p className="text-[#444] text-[10px] font-black uppercase tracking-widest">No activity found</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {filteredExpenses.map((expense) => {
              const category = categories.find(c => c.id === expense.categoryId);
              return (
                <motion.div
                  key={expense.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-[#111] p-4 rounded-xl border border-[#1A1A1A] flex items-center gap-4 group hover:border-[#222] transition-colors"
                >
                  <div
                    className="w-8 h-8 rounded bg-[#0D0D0D] border border-[#222] flex items-center justify-center shrink-0"
                  >
                    <span className="text-[10px] font-black" style={{ color: category?.color }}>{category?.name.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-medium text-[#E5E5E5] truncate pr-2 uppercase tracking-tighter">{expense.title}</h4>
                      <p className="text-xs font-mono text-[#E5E5E5] shrink-0">{formatCurrency(expense.amount)}</p>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] text-[#444] font-mono leading-none">
                          {formatDate(expense.date).toUpperCase()}
                        </span>
                        <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${expense.isEssential ? 'text-essential bg-emerald-500/5' : 'text-lifestyle bg-rose-500/5'}`}>
                          {expense.isEssential ? 'Essential' : 'Lifestyle'}
                        </span>
                        {expense.isRecurring && (
                          <span className="text-[8px] text-[#444] font-black uppercase">Auto</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <button
                          onClick={() => setEditingExpense(expense)}
                          className="p-1.5 text-[#444] hover:text-[#E5E5E5] transition-all rounded-lg"
                          title="Edit"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => deleteExpense(expense.id)}
                          className="p-1 text-[#444] hover:text-lifestyle transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      <AnimatePresence>
        {editingExpense && (
          <ExpenseModal
            expense={editingExpense}
            onClose={() => setEditingExpense(null)}
            onAddExpense={addExpense}
            onUpdateExpense={updateExpense}
            onAddRecurring={addRecurringExpense}
            categories={categories}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
