/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Calendar, DollarSign, Tag, Check, Repeat, Info } from 'lucide-react';
import { Category, RecurringPeriod, Expense, RecurringExpense } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';

interface ExpenseModalProps {
  expense?: Expense;
  onClose: () => void;
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
  onUpdateExpense: (expense: Expense) => void;
  onAddRecurring: (recurring: Omit<RecurringExpense, 'id'>) => void;
  categories: Category[];
}

export default function ExpenseModal({ expense, onClose, onAddExpense, onUpdateExpense, onAddRecurring, categories }: ExpenseModalProps) {
  const [amount, setAmount] = useState(expense?.amount.toString() || '');
  const [title, setTitle] = useState(expense?.title || '');
  const [categoryId, setCategoryId] = useState(expense?.categoryId || categories[0]?.id || '');
  const [isEssential, setIsEssential] = useState(expense?.isEssential ?? true);
  const [isRecurring, setIsRecurring] = useState(expense?.isRecurring ?? false);
  const [period, setPeriod] = useState<RecurringPeriod>('monthly');
  const [date, setDate] = useState(expense?.date || format(new Date(), 'yyyy-MM-dd'));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!numAmount || !title) return;

    if (expense) {
      onUpdateExpense({
        ...expense,
        amount: numAmount,
        title,
        categoryId,
        isEssential,
        date,
      });
    } else if (isRecurring) {
      onAddRecurring({
        amount: numAmount,
        title,
        categoryId,
        isEssential,
        period,
        startDate: date,
      });
    } else {
      onAddExpense({
        amount: numAmount,
        title,
        categoryId,
        isEssential,
        isRecurring: false,
        date,
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
      />
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 400 }}
        className="relative bg-dark-bg w-full max-w-lg rounded-t-[40px] sm:rounded-3xl border-t border-[#222] sm:border border-[#222] p-10 overflow-hidden"
      >
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-[10px] font-black text-[#666] uppercase tracking-[0.3em]">
            {expense ? 'Modify Entry' : 'Entry Terminal'}
          </h2>
          <button onClick={onClose} className="p-2 text-[#444] hover:text-[#E5E5E5] transition-colors rounded-full bg-[#111] border border-[#222]">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Amount Input */}
          <div className="relative group border-b border-white/5 pb-4 focus-within:border-white/20 transition-colors">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 text-[#444] font-mono text-2xl">$</div>
            <input
              type="number"
              step="0.01"
              autoFocus={!expense}
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full text-5xl font-light pl-10 bg-transparent border-none focus:ring-0 placeholder:text-[#222] text-[#E5E5E5] font-sans"
              required
            />
          </div>

          <div className="space-y-6">
            <div>
              <label className="text-[8px] font-black text-[#444] uppercase tracking-[0.2em] mb-2 block">Description</label>
              <input
                type="text"
                placeholder="NARRATIVE..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#111] border border-[#222] rounded-xl p-4 focus:border-white/20 outline-none text-xs font-semibold uppercase tracking-tighter text-[#E5E5E5]"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[8px] font-black text-[#444] uppercase tracking-[0.2em] mb-2 block">Scope</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full bg-[#111] border border-[#222] rounded-xl p-4 focus:border-white/20 outline-none text-[10px] font-bold uppercase tracking-widest text-[#E5E5E5] appearance-none"
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name.toUpperCase()}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[8px] font-black text-[#444] uppercase tracking-[0.2em] mb-2 block">Chronology</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-[#111] border border-[#222] rounded-xl p-4 focus:border-white/20 outline-none text-[10px] font-mono text-[#E5E5E5]"
                />
              </div>
            </div>

            {/* Toggles */}
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setIsEssential(!isEssential)}
                className={`flex flex-col gap-2 p-4 rounded-xl border transition-all ${
                  isEssential ? 'border-essential bg-emerald-500/5' : 'border-[#222] bg-transparent opacity-40'
                }`}
              >
                <div className={`p-1 w-fit rounded ${isEssential ? 'bg-essential text-black' : 'bg-[#222] text-[#444]'}`}>
                  <Check size={12} strokeWidth={4} />
                </div>
                <span className="text-[8px] font-black uppercase tracking-widest leading-none">Essential</span>
              </button>

              {!expense && (
                <button
                  type="button"
                  onClick={() => setIsRecurring(!isRecurring)}
                  className={`flex flex-col gap-2 p-4 rounded-xl border transition-all ${
                    isRecurring ? 'border-white bg-white/5' : 'border-[#222] bg-transparent opacity-40'
                  }`}
                >
                  <div className={`p-1 w-fit rounded ${isRecurring ? 'bg-[#E5E5E5] text-black' : 'bg-[#222] text-[#444]'}`}>
                    <Repeat size={12} strokeWidth={4} />
                  </div>
                  <span className="text-[8px] font-black uppercase tracking-widest leading-none">Recurring</span>
                </button>
              )}
            </div>

            {/* Recurring Options - only show for new expense */}
            <AnimatePresence>
              {isRecurring && !expense && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex items-center gap-2"
                >
                  {(['daily', 'weekly', 'monthly'] as RecurringPeriod[]).map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPeriod(p)}
                      className={`flex-1 py-3 px-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                        period === p ? 'bg-[#444] text-white' : 'text-[#444] hover:text-[#888] bg-[#0D0D0D] border border-[#1A1A1A]'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            type="submit"
            className="w-full bg-[#E5E5E5] text-black py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] shadow-2xl shadow-black hover:bg-white active:scale-[0.98] transition-all mt-4"
          >
            {expense ? 'Apply Changes' : 'Authorize Entry'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
