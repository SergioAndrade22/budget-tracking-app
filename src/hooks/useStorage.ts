/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Category, Expense, RecurringExpense, BudgetData, DEFAULT_CATEGORIES } from '../types';
import { parseISO, addDays, addWeeks, addMonths, isBefore, format, startOfToday } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, doc, onSnapshot, setDoc, deleteDoc, writeBatch, query, getDocs } from 'firebase/firestore';

const STORAGE_KEY = 'smartspend_data';

export function useStorage() {
  const { user } = useAuth();
  const [data, setData] = useState<BudgetData>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        expenses: parsed.expenses || [],
        categories: parsed.categories || DEFAULT_CATEGORIES,
        recurringExpenses: parsed.recurringExpenses || [],
      };
    }
    return {
      expenses: [],
      categories: DEFAULT_CATEGORIES,
      recurringExpenses: [],
    };
  });

  const isInitialSync = useRef(true);

  // Firestore Sync
  useEffect(() => {
    if (!user) {
      // If user logs out, fallback to local storage
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setData(JSON.parse(saved));
      return;
    }

    const userId = user.uid;
    const expRef = collection(db, `users/${userId}/expenses`);
    const catRef = collection(db, `users/${userId}/categories`);
    const recRef = collection(db, `users/${userId}/recurringExpenses`);

    let expenses: Expense[] = [];
    let categories: Category[] = [];
    let recurringExpenses: RecurringExpense[] = [];

    const syncState = () => {
      setData({
        expenses: expenses.sort((a, b) => b.date.localeCompare(a.date)),
        categories: categories.length > 0 ? categories : DEFAULT_CATEGORIES,
        recurringExpenses
      });
    };

    const unsubExp = onSnapshot(expRef, (snap) => {
      expenses = snap.docs.map(d => ({ ...d.data(), id: d.id } as Expense));
      syncState();
    }, (err) => handleFirestoreError(err, OperationType.LIST, `users/${userId}/expenses`));

    const unsubCat = onSnapshot(catRef, (snap) => {
      categories = snap.docs.map(d => ({ ...d.data(), id: d.id } as Category));
      syncState();
    }, (err) => handleFirestoreError(err, OperationType.LIST, `users/${userId}/categories`));

    const unsubRec = onSnapshot(recRef, (snap) => {
      recurringExpenses = snap.docs.map(d => ({ ...d.data(), id: d.id } as RecurringExpense));
      syncState();
    }, (err) => handleFirestoreError(err, OperationType.LIST, `users/${userId}/recurringExpenses`));

    // Initial Migration: If Firestore is empty but Local is not, migrate
    if (isInitialSync.current) {
      isInitialSync.current = false;
      const migrate = async () => {
        const catSnap = await getDocs(catRef);
        if (catSnap.empty) {
          const local = localStorage.getItem(STORAGE_KEY);
          if (local) {
            const parsed = JSON.parse(local) as BudgetData;
            const batch = writeBatch(db);
            
            parsed.categories.forEach(c => {
              const { id, ...rest } = c;
              batch.set(doc(catRef, id), rest);
            });
            parsed.expenses.forEach(e => {
              const { id, ...rest } = e;
              batch.set(doc(expRef, id), rest);
            });
            parsed.recurringExpenses.forEach(r => {
              const { id, ...rest } = r;
              batch.set(doc(recRef, id), rest);
            });
            
            await batch.commit();
          }
        }
      };
      migrate();
    }

    return () => {
      unsubExp();
      unsubCat();
      unsubRec();
    };
  }, [user]);

  const addExpense = useCallback(async (expense: Omit<Expense, 'id'>) => {
    const id = crypto.randomUUID();
    const newExpense = { ...expense, id };
    
    if (user) {
      try {
        // Explicitly strip any accidental 'id' field from the body
        const { id: _, ...rest } = newExpense as any;
        await setDoc(doc(db, `users/${user.uid}/expenses/${id}`), rest);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `users/${user.uid}/expenses/${id}`);
      }
    } else {
      setData(prev => {
        const next = { ...prev, expenses: [newExpense, ...prev.expenses] };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    }
  }, [user]);

  const deleteExpense = useCallback(async (id: string) => {
    if (user) {
      try {
        await deleteDoc(doc(db, `users/${user.uid}/expenses/${id}`));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `users/${user.uid}/expenses/${id}`);
      }
    } else {
      setData(prev => {
        const next = { ...prev, expenses: prev.expenses.filter(e => e.id !== id) };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    }
  }, [user]);

  const updateCategory = useCallback(async (category: Category) => {
    if (user) {
      try {
        const { id, ...rest } = category;
        await setDoc(doc(db, `users/${user.uid}/categories/${id}`), rest);
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}/categories/${category.id}`);
      }
    } else {
      setData(prev => {
        const next = {
          ...prev,
          categories: prev.categories.map(c => c.id === category.id ? category : c)
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    }
  }, [user]);

  const addCategory = useCallback(async (category: Omit<Category, 'id'>) => {
    const id = crypto.randomUUID();
    if (user) {
      try {
        const { id: _, ...rest } = category as any;
        await setDoc(doc(db, `users/${user.uid}/categories/${id}`), rest);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `users/${user.uid}/categories/${id}`);
      }
    } else {
      const newCategory = { ...category, id };
      setData(prev => {
        const next = { ...prev, categories: [...prev.categories, newCategory] };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    }
  }, [user]);

  const updateExpense = useCallback(async (expense: Expense) => {
    if (user) {
      try {
        const { id, ...rest } = expense;
        await setDoc(doc(db, `users/${user.uid}/expenses/${id}`), rest);
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}/expenses/${expense.id}`);
      }
    } else {
      setData(prev => {
        const next = {
          ...prev,
          expenses: prev.expenses.map(e => e.id === expense.id ? expense : e)
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    }
  }, [user]);

  const deleteCategory = useCallback(async (id: string) => {
    // Cannot delete the 'Others' category as it is the fallback
    if (id === '7') return;

    if (user) {
      try {
        const batch = writeBatch(db);
        // Find expenses with this category and reassign to 'Others' (id '7')
        const affectedExpenses = data.expenses.filter(e => e.categoryId === id);
        affectedExpenses.forEach(e => {
          batch.update(doc(db, `users/${user.uid}/expenses/${e.id}`), { categoryId: '7' });
        });
        // Delete the category
        batch.delete(doc(db, `users/${user.uid}/categories/${id}`));
        await batch.commit();
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `users/${user.uid}/categories/${id}`);
      }
    } else {
      setData(prev => {
        const next = {
          ...prev,
          expenses: prev.expenses.map(e => e.categoryId === id ? { ...e, categoryId: '7' } : e),
          categories: prev.categories.filter(c => c.id !== id)
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    }
  }, [user, data.expenses]);

  const addRecurringExpense = useCallback(async (recurring: Omit<RecurringExpense, 'id'>) => {
    const id = crypto.randomUUID();
    if (user) {
      try {
        const { id: _, ...rest } = recurring as any;
        await setDoc(doc(db, `users/${user.uid}/recurringExpenses/${id}`), rest);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `users/${user.uid}/recurringExpenses/${id}`);
      }
    } else {
      const newRecurring = { ...recurring, id };
      setData(prev => {
        const next = { ...prev, recurringExpenses: [...prev.recurringExpenses, newRecurring] };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    }
  }, [user]);

  const deleteRecurringExpense = useCallback(async (id: string) => {
    if (user) {
      try {
        await deleteDoc(doc(db, `users/${user.uid}/recurringExpenses/${id}`));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `users/${user.uid}/recurringExpenses/${id}`);
      }
    } else {
      setData(prev => {
        const next = { ...prev, recurringExpenses: prev.recurringExpenses.filter(r => r.id !== id) };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    }
  }, [user]);

  // Process recurring expenses
  useEffect(() => {
    if (data.recurringExpenses.length === 0) return;
    
    const today = startOfToday();
    let updated = false;
    const newExpenses: Expense[] = [];
    const updatedRecurring = data.recurringExpenses.map(item => {
      let nextProcess = item.lastProcessed ? parseISO(item.lastProcessed) : parseISO(item.startDate);
      let tempLastProcessed = item.lastProcessed;

      while (true) {
        let nextDate: Date;
        if (item.period === 'daily') nextDate = addDays(nextProcess, 1);
        else if (item.period === 'weekly') nextDate = addWeeks(nextProcess, 1);
        else nextDate = addMonths(nextProcess, 1);

        if (isBefore(nextDate, today) || format(nextDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')) {
          newExpenses.push({
            id: crypto.randomUUID(),
            amount: item.amount,
            categoryId: item.categoryId,
            date: format(nextDate, 'yyyy-MM-dd'),
            title: item.title,
            isEssential: item.isEssential,
            isRecurring: true,
            recurringId: item.id
          });
          nextProcess = nextDate;
          tempLastProcessed = format(nextDate, 'yyyy-MM-dd');
          updated = true;
        } else {
          break;
        }
      }

      return { ...item, lastProcessed: tempLastProcessed };
    });

    if (updated) {
      const applyUpdates = async () => {
        if (user) {
          const batch = writeBatch(db);
          newExpenses.forEach(e => {
            const { id, ...rest } = e;
            batch.set(doc(db, `users/${user.uid}/expenses/${id}`), rest);
          });
          updatedRecurring.forEach(r => {
            const { id, ...rest } = r;
            batch.set(doc(db, `users/${user.uid}/recurringExpenses/${id}`), rest);
          });
          await batch.commit();
        } else {
          setData(prev => {
            const next = {
              ...prev,
              expenses: [...newExpenses, ...prev.expenses],
              recurringExpenses: updatedRecurring
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
            return next;
          });
        }
      };
      applyUpdates();
    }
  }, [data.recurringExpenses, user]);

  return {
    ...data,
    addExpense,
    updateExpense,
    deleteExpense,
    addCategory,
    deleteCategory,
    updateCategory,
    addRecurringExpense,
    deleteRecurringExpense
  };
}
