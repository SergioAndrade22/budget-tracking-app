/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Category, Expense } from '../types';
import { formatCurrency } from '../utils/format';
import { startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';
import { Edit2, TrendingDown, Plus, LayoutGrid } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import CategoryModal from './CategoryModal';

interface BudgetOverviewProps {
  expenses: Expense[];
  categories: Category[];
  targetBudget: number;
  updateCategory: (cat: Category) => void;
  addCategory: (cat: Omit<Category, 'id'>) => void;
  deleteCategory: (id: string) => void;
  updateTargetBudget: (amount: number) => void;
}

export default function BudgetOverview({ 
  expenses, 
  categories, 
  targetBudget,
  updateCategory, 
  addCategory, 
  deleteCategory,
  updateTargetBudget
}: BudgetOverviewProps) {
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [tempBudget, setTempBudget] = useState(targetBudget.toString());

  const currentMonthStart = startOfMonth(new Date());
  const currentMonthEnd = endOfMonth(new Date());

  const currentMonthExpenses = expenses.filter(e =>
    isWithinInterval(parseISO(e.date), { start: currentMonthStart, end: currentMonthEnd })
  );

  const handleBudgetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(tempBudget);
    if (!isNaN(amount) && amount >= 0) {
      updateTargetBudget(amount);
      setIsEditingBudget(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#111] p-6 rounded-2xl border border-[#222] flex items-center justify-between group">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-[#666] font-black text-[10px] uppercase tracking-[0.2em]">Target Monthly Spend</h2>
            <button 
              onClick={() => {
                setTempBudget(targetBudget.toString());
                setIsEditingBudget(true);
              }}
              className="opacity-0 group-hover:opacity-100 p-1 text-[#444] hover:text-[#AAA] transition-all"
            >
              <Edit2 size={12} />
            </button>
          </div>
          
          {isEditingBudget ? (
            <form onSubmit={handleBudgetSubmit} className="flex items-center gap-2">
              <input
                type="number"
                autoFocus
                value={tempBudget}
                onChange={(e) => setTempBudget(e.target.value)}
                className="bg-[#0D0D0D] border border-[#333] text-2xl font-light tracking-tight w-32 px-2 py-1 rounded outline-none focus:border-essential"
                onBlur={() => setIsEditingBudget(false)}
              />
              <button type="submit" className="p-2 text-essential">
                <Plus size={20} className="rotate-45" /> 
              </button>
            </form>
          ) : (
            <p className="text-3xl font-light tracking-tight transition-all">{formatCurrency(targetBudget)}</p>
          )}
        </div>
        <div className="w-12 h-12 bg-dark-surface rounded-xl border border-[#222] flex items-center justify-center text-essential">
          <TrendingDown size={24} />
        </div>
      </div>

      <div className="space-y-4">
        {categories.map((category) => {
          const spent = currentMonthExpenses
            .filter(e => e.categoryId === category.id)
            .reduce((acc, e) => acc + e.amount, 0);

          const progress = (spent / category.budget) * 100;
          const isOver = spent > category.budget;

          return (
            <div key={category.id} className="bg-[#111] p-5 rounded-xl border border-[#1A1A1A] group">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded bg-[#0D0D0D] border border-[#222] flex items-center justify-center shrink-0"
                    style={{ color: category.color }}
                  >
                    <span className="text-[10px] font-black">{category.name.charAt(0)}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-bold text-[#E5E5E5] uppercase tracking-tighter">{category.name}</h3>
                      <button 
                        onClick={() => setEditingCategory(category)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-[#444] hover:text-[#E5E5E5] transition-all"
                      >
                        <Edit2 size={10} />
                      </button>
                    </div>
                    <p className="text-[9px] text-[#444] font-mono">GOAL: {formatCurrency(category.budget)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-xs font-mono ${isOver ? 'text-lifestyle' : 'text-[#E5E5E5]'}`}>
                    {formatCurrency(spent)}
                  </p>
                  <p className="text-[9px] text-[#444] font-black uppercase">Spent</p>
                </div>
              </div>

              <div className="h-1 w-full bg-[#0D0D0D] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, progress)}%` }}
                  className={`h-full ${isOver ? 'bg-lifestyle shadow-[0_0_8px_rgba(244,63,94,0.3)]' : 'bg-essential shadow-[0_0_8px_rgba(16,185,129,0.3)]'}`}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>

              {isOver && (
                <p className="mt-2 text-[8px] font-black text-lifestyle uppercase tracking-widest">
                   Surplus: {formatCurrency(spent - category.budget)}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="pt-4 pb-8 flex flex-col gap-4">
        <button
          onClick={() => setIsAdding(true)}
          className="w-full flex items-center justify-center gap-3 bg-[#111] border border-dashed border-[#333] text-[#666] py-4 rounded-xl font-black text-[9px] uppercase tracking-[0.3em] hover:border-[#444] hover:text-[#AAA] transition-all"
        >
          <Plus size={14} />
          New Operational Scope
        </button>

        <p className="text-center text-[8px] text-[#444] font-black uppercase tracking-[0.2em]">
          Budgets update automatically on the 1st
        </p>
      </div>

      <AnimatePresence>
        {(editingCategory || isAdding) && (
          <CategoryModal
            category={editingCategory || undefined}
            onClose={() => {
              setEditingCategory(null);
              setIsAdding(false);
            }}
            onSave={(cat) => {
              if (cat.id) {
                updateCategory(cat as Category);
              } else {
                addCategory(cat as Omit<Category, 'id'>);
              }
            }}
            onDelete={deleteCategory}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
