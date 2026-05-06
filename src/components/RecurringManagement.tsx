/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { RecurringExpense, Category } from '../types';
import { formatCurrency } from '../utils/format';
import { Trash2, Calendar, RefreshCcw, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface RecurringManagementProps {
  recurringExpenses: RecurringExpense[];
  categories: Category[];
  deleteRecurringExpense: (id: string) => void;
}

export default function RecurringManagement({ recurringExpenses, categories, deleteRecurringExpense }: RecurringManagementProps) {
  return (
    <div className="space-y-6">
      <div className="bg-[#111] p-6 rounded-2xl border border-[#222] flex items-center gap-4">
        <div className="bg-dark-surface p-3 rounded-xl border border-[#222] text-essential">
          <RefreshCcw size={20} />
        </div>
        <div>
          <h2 className="text-[10px] font-black text-[#E5E5E5] uppercase tracking-widest">Auto-Pilot</h2>
          <p className="text-[10px] text-[#444] font-medium leading-relaxed mt-1">Authorized expenses will populate automatically on schedule.</p>
        </div>
      </div>

      <div className="space-y-3">
        {recurringExpenses.length === 0 ? (
          <div className="text-center py-16 bg-[#111] rounded-2xl border border-dashed border-[#222]">
            <p className="text-[#444] text-[10px] font-black uppercase tracking-widest">No active automation</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {recurringExpenses.map((recurring) => {
              const category = categories.find(c => c.id === recurring.categoryId);
              return (
                <motion.div
                  key={recurring.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-[#111] p-4 rounded-xl border border-[#1A1A1A] flex items-center gap-4 group"
                >
                  <div
                    className="w-8 h-8 rounded bg-[#0D0D0D] border border-[#222] flex items-center justify-center shrink-0"
                  >
                    <span className="text-[10px] font-black" style={{ color: category?.color }}>{category?.name.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-medium text-[#E5E5E5] truncate pr-2 uppercase tracking-tighter">{recurring.title}</h4>
                      <p className="text-xs font-mono text-[#E5E5E5] shrink-0">{formatCurrency(recurring.amount)}</p>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[8px] text-essential bg-emerald-500/5 font-black uppercase tracking-widest px-1.5 py-0.5 rounded">
                          {recurring.period}
                        </span>
                        <span className="text-[8px] text-[#444] font-mono">
                          START: {recurring.startDate.toUpperCase()}
                        </span>
                      </div>
                      <button
                        onClick={() => deleteRecurringExpense(recurring.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-[#444] hover:text-lifestyle transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
