/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Check, Trash2 } from 'lucide-react';
import { Category } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CategoryModalProps {
  category?: Category;
  onClose: () => void;
  onSave: (cat: Omit<Category, 'id'> & { id?: string }) => void;
  onDelete?: (id: string) => void;
}

export default function CategoryModal({ category, onClose, onSave, onDelete }: CategoryModalProps) {
  const [name, setName] = useState(category?.name || '');
  const [budget, setBudget] = useState(category?.budget.toString() || '');
  const [color, setColor] = useState(category?.color || '#3b82f6');

  const colors = [
    '#3b82f6', '#ef4444', '#f59e0b', '#10b981', 
    '#8b5cf6', '#ec4899', '#6b7280', '#06b6d4', 
    '#f43f5e', '#84cc16'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !budget) return;
    onSave({
      id: category?.id,
      name,
      budget: parseFloat(budget),
      color,
      icon: 'Box' // Default icon for now
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4">
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
        className="relative bg-dark-bg w-full max-w-md rounded-3xl border border-[#222] p-8 overflow-hidden shadow-2xl"
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-[10px] font-black text-[#666] uppercase tracking-[0.3em]">
            {category ? 'Configure Scope' : 'Initialize Scope'}
          </h2>
          <button onClick={onClose} className="p-2 text-[#444] hover:text-[#E5E5E5] transition-colors rounded-full bg-[#111] border border-[#222]">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-[8px] font-black text-[#444] uppercase tracking-[0.2em] mb-2 block">Identity</label>
            <input
              type="text"
              placeholder="CATEGORY NAME..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#111] border border-[#222] rounded-xl p-4 focus:border-white/20 outline-none text-xs font-semibold uppercase tracking-tighter text-[#E5E5E5]"
              required
            />
          </div>

          <div>
            <label className="text-[8px] font-black text-[#444] uppercase tracking-[0.2em] mb-2 block">Allocation (USD)</label>
            <input
              type="number"
              placeholder="0.00"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="w-full bg-[#111] border border-[#222] rounded-xl p-4 focus:border-white/20 outline-none text-xs font-mono text-[#E5E5E5]"
              required
            />
          </div>

          <div>
            <label className="text-[8px] font-black text-[#444] uppercase tracking-[0.2em] mb-2 block">Chromatic Index</label>
            <div className="flex flex-wrap gap-2">
              {colors.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${color === c ? 'border-white scale-110 shadow-lg shadow-white/10' : 'border-transparent opacity-50 hover:opacity-100'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            {category && onDelete && category.id !== '7' && (
              <button
                type="button"
                onClick={() => {
                  onDelete(category.id);
                  onClose();
                }}
                className="p-4 rounded-xl border border-lifestyle bg-rose-500/5 text-lifestyle hover:bg-rose-500/10 transition-colors"
                title="Hold to delete"
              >
                <Trash2 size={20} />
              </button>
            )}
            <button
              type="submit"
              className={cn(
                "flex-1 bg-[#E5E5E5] text-black py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl hover:bg-white active:scale-[0.98] transition-all",
                (!category || (category && category.id !== '7')) ? "" : "w-full"
              )}
            >
              Commit Changes
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
