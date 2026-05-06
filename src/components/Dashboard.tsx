/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Category, Expense } from '../types';
import { formatCurrency } from '../utils/format';
import { startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';
import { Wallet, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';

interface DashboardProps {
  expenses: Expense[];
  categories: Category[];
}

export default function Dashboard({ expenses, categories }: DashboardProps) {
  const currentMonthStart = startOfMonth(new Date());
  const currentMonthEnd = endOfMonth(new Date());

  const currentMonthExpenses = expenses.filter(e =>
    isWithinInterval(parseISO(e.date), { start: currentMonthStart, end: currentMonthEnd })
  );

  const totalSpent = currentMonthExpenses.reduce((acc, e) => acc + e.amount, 0);
  const essentialSpent = currentMonthExpenses.filter(e => e.isEssential).reduce((acc, e) => acc + e.amount, 0);
  const nonEssentialSpent = totalSpent - essentialSpent;

  const totalBudget = categories.reduce((acc, c) => acc + c.budget, 0);
  const budgetProgress = (totalSpent / totalBudget) * 100;

  const categoryData = categories.map(cat => {
    const spent = currentMonthExpenses
      .filter(e => e.categoryId === cat.id)
      .reduce((acc, e) => acc + e.amount, 0);
    return { name: cat.name, value: spent, color: cat.color };
  }).filter(c => c.value > 0);

  const essentialData = [
    { name: 'Essential', value: essentialSpent, color: '#10B981' },
    { name: 'Lifestyle', value: nonEssentialSpent, color: '#F43F5E' },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#111] p-5 rounded-2xl border border-[#222] flex flex-col justify-between h-[120px]">
          <p className="text-[10px] font-black text-[#666] uppercase tracking-[0.2em]">Spending</p>
          <div className="mt-auto">
            <p className="text-2xl font-light tracking-tight">{formatCurrency(totalSpent).split('.')[0]}<span className="text-[#444] text-sm italic">.{formatCurrency(totalSpent).split('.')[1] || '00'}</span></p>
          </div>
        </div>
        <div className="bg-[#111] p-5 rounded-2xl border border-[#222] flex flex-col justify-between h-[120px]">
          <p className="text-[10px] font-black text-[#666] uppercase tracking-[0.2em]">Balance</p>
          <div className="mt-auto">
             <p className="text-2xl font-light tracking-tight">{formatCurrency(Math.max(0, totalBudget - totalSpent)).split('.')[0]}<span className="text-[#444] text-sm">.{formatCurrency(Math.max(0, totalBudget - totalSpent)).split('.')[1] || '00'}</span></p>
          </div>
        </div>
      </div>

      {/* Budget Progress Bar */}
      <div className="bg-[#111] p-6 rounded-2xl border border-[#222]">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-[10px] font-black text-[#666] uppercase tracking-[0.2em]">Budget Velocity</h3>
          <span className="text-[10px] font-mono text-essential">{Math.round(budgetProgress)}%</span>
        </div>
        <div className="h-1 w-full bg-[#1A1A1A] rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, budgetProgress)}%` }}
            className={`h-full transition-all duration-1000 ${budgetProgress > 90 ? 'bg-lifestyle' : 'bg-essential'}`}
          />
        </div>
        <div className="flex justify-between mt-3 text-[9px] text-[#444] font-mono">
          <span>{formatCurrency(totalSpent)}</span>
          <span>{formatCurrency(totalBudget)} LIMIT</span>
        </div>
      </div>

      {/* Charts Section */}
      <div className="space-y-6">
        <div className="bg-[#111] p-6 rounded-2xl border border-[#222]">
          <p className="text-[10px] font-black text-[#666] uppercase tracking-[0.2em] mb-8">Allocation</p>
          <div className="h-56 relative group">
            <ResponsiveContainer width="100%" height="100%" debounce={100} minHeight={0} minWidth={0}>
              <PieChart>
                <Pie
                  data={essentialData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {essentialData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-[#1A1A1A] border border-[#333] px-3 py-2 rounded-lg shadow-2xl">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-[#AAA] mb-1">{payload[0].name}</p>
                          <p className="text-sm font-mono text-white">{formatCurrency(Number(payload[0].value))}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[8px] text-[#666] uppercase tracking-widest font-black">Status</span>
              <span className="text-xs font-mono text-white">{budgetProgress > 100 ? 'OVER' : 'OK'}</span>
            </div>
          </div>
          <div className="flex justify-center gap-8 mt-4">
            {essentialData.map(item => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-[9px] font-black uppercase tracking-widest text-[#666]">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#111] p-6 rounded-2xl border border-[#222]">
          <p className="text-[10px] font-black text-[#666] uppercase tracking-[0.2em] mb-6">Distrubution</p>
          <div className="flex flex-col gap-4">
            {categoryData.slice(0, 5).map(item => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)]" style={{ backgroundColor: item.color }} />
                  <span className="text-xs font-medium text-[#AAA] uppercase tracking-tighter">{item.name}</span>
                </div>
                <span className="text-xs font-mono text-[#666]">{formatCurrency(item.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
