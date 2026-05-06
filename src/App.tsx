/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Home, List, PieChart, Settings, Plus, Repeat, LogIn, LogOut, User as UserIcon, Cloud, CloudOff } from 'lucide-react';
import { useStorage } from './hooks/useStorage';
import Dashboard from './components/Dashboard';
import ExpensesList from './components/ExpensesList';
import BudgetOverview from './components/BudgetOverview';
import RecurringManagement from './components/RecurringManagement';
import ExpenseModal from './components/ExpenseModal';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useAuth } from './context/AuthContext';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type View = 'dashboard' | 'expenses' | 'budget' | 'recurring';

 export default function App() {
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const storage = useStorage();
  const { user, login, logout } = useAuth();

  const navItems = [
    { id: 'dashboard', icon: Home, label: 'Home' },
    { id: 'expenses', icon: List, label: 'Log' },
    { id: 'budget', icon: PieChart, label: 'Plan' },
    { id: 'recurring', icon: Repeat, label: 'Auto' },
  ];

  return (
    <div className="min-h-screen bg-dark-bg pb-24 text-[#E5E5E5] font-sans selection:bg-emerald-500/20">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-dark-surface/80 backdrop-blur-md border-b border-dark-border px-8 py-4">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowProfile(!showProfile)}
              className="relative w-8 h-8 rounded-full bg-[#111] border border-[#222] flex items-center justify-center overflow-hidden group hover:border-[#444] transition-all"
            >
              {user?.photoURL ? (
                <img src={user.photoURL} alt="User" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
              ) : (
                <UserIcon size={14} className="text-[#444]" />
              )}
            </button>
            <div className="flex flex-col">
              <h1 className="text-[10px] font-black tracking-[0.2em] uppercase text-[#E5E5E5] leading-none mb-1">
                {activeView === 'dashboard' ? (user?.displayName || 'Veritas') : activeView}
              </h1>
              <div className="flex items-center gap-1">
                {user ? (
                  <span className="text-[7px] text-essential font-black uppercase tracking-widest flex items-center gap-1.5">
                    <Cloud size={8} /> 
                    Synced
                    <div className="w-1.5 h-1.5 bg-essential rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  </span>
                ) : (
                  <span className="text-[7px] text-[#444] font-black uppercase tracking-widest flex items-center gap-1">
                    <CloudOff size={8} /> Local
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="p-2 bg-[#E5E5E5] text-black rounded-lg shadow-xl shadow-black/20 hover:bg-white transition-all active:scale-95"
            aria-label="Add Expense"
          >
            <Plus size={20} />
          </button>
        </div>

        {/* Profile Dropdown */}
        <AnimatePresence>
          {showProfile && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowProfile(false)}
                className="fixed inset-0 z-40"
              />
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="absolute top-16 left-8 z-50 w-48 bg-dark-bg border border-dark-border rounded-xl shadow-2xl p-2"
              >
                {user ? (
                  <div className="space-y-1">
                    <div className="px-3 py-2">
                      <p className="text-[9px] font-black text-[#444] uppercase tracking-widest truncate">{user.displayName || 'Anonymous'}</p>
                      <p className="text-[8px] text-[#666] truncate">{user.email}</p>
                    </div>
                    <div className="h-px bg-dark-border mx-2" />
                    <button
                      onClick={() => {
                        logout();
                        setShowProfile(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 text-lifestyle hover:bg-rose-500/5 rounded-lg transition-colors text-[9px] font-black uppercase tracking-widest"
                    >
                      <LogOut size={14} />
                      Log Out
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      login();
                      setShowProfile(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-[#E5E5E5] hover:bg-white/5 rounded-lg transition-colors text-[9px] font-black uppercase tracking-widest"
                  >
                    <LogIn size={14} />
                    Sign In (Sync)
                  </button>
                )}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main className="max-w-lg mx-auto p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
          >
            {activeView === 'dashboard' && <Dashboard {...storage} />}
            {activeView === 'expenses' && (
              <ExpensesList 
                {...storage} 
                addExpense={storage.addExpense} 
                updateExpense={storage.updateExpense}
                addRecurringExpense={storage.addRecurringExpense}
              />
            )}
            {activeView === 'budget' && <BudgetOverview {...storage} />}
            {activeView === 'recurring' && <RecurringManagement {...storage} />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-dark-surface border-t border-dark-border px-6 py-3 pb-safe">
        <div className="flex items-center justify-around max-w-lg mx-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id as View)}
              className={cn(
                "flex flex-col items-center gap-1.5 p-2 transition-all relative group",
                activeView === item.id ? "text-essential" : "text-[#444] hover:text-[#888]"
              )}
            >
              <item.icon
                size={20}
                strokeWidth={activeView === item.id ? 2.5 : 2}
                className="transition-transform group-active:scale-90"
              />
              <span className="text-[9px] font-black uppercase tracking-widest">{item.label}</span>
              {activeView === item.id && (
                <motion.div
                  layoutId="active-tab"
                  className="absolute -bottom-1 w-8 h-0.5 bg-essential rounded-full"
                />
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* Modals */}
      <AnimatePresence>
        {isAddModalOpen && (
          <ExpenseModal
            onClose={() => setIsAddModalOpen(false)}
            onAddExpense={storage.addExpense}
            onUpdateExpense={storage.updateExpense}
            onAddRecurring={storage.addRecurringExpense}
            categories={storage.categories}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

