import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format, subDays, parseISO, differenceInCalendarDays } from 'date-fns';

export interface Habit {
  id: string;
  title: string;
  createdAt: string;
  completedDates: string[];
}

interface HabitState {
  habits: Habit[];
  activeHabitId: string | null;
  reminderTime: { hour: number; minute: number } | null;
  addHabit: (title: string) => void;
  deleteHabit: (id: string) => void;
  setActiveHabit: (id: string) => void;
  markTodayDone: (id: string) => void;
  setReminderTime: (time: { hour: number; minute: number } | null) => void;
}

export const getTodayStr = () => format(new Date(), 'yyyy-MM-dd');

export const calculateCurrentStreak = (completedDates: string[]): number => {
  if (!completedDates.length) return 0;
  const set = new Set(completedDates);
  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');
  const yesterdayStr = format(subDays(today, 1), 'yyyy-MM-dd');
  if (!set.has(todayStr) && !set.has(yesterdayStr)) return 0;
  let streak = 0;
  let checkDate = set.has(todayStr) ? today : subDays(today, 1);
  while (set.has(format(checkDate, 'yyyy-MM-dd'))) {
    streak++;
    checkDate = subDays(checkDate, 1);
  }
  return streak;
};

export const calculateBestStreak = (completedDates: string[]): number => {
  if (!completedDates.length) return 0;
  const sorted = [...new Set(completedDates)].sort();
  let maxStreak = 1;
  let current = 1;
  for (let i = 1; i < sorted.length; i++) {
    const diff = differenceInCalendarDays(parseISO(sorted[i]), parseISO(sorted[i - 1]));
    if (diff === 1) {
      current++;
      maxStreak = Math.max(maxStreak, current);
    } else {
      current = 1;
    }
  }
  return maxStreak;
};

export const useHabitStore = create<HabitState>()(
  persist(
    (set) => ({
      habits: [{ id: 'default-1', title: 'Хардкорный режим', createdAt: getTodayStr(), completedDates: [] }],
      activeHabitId: 'default-1',
      reminderTime: { hour: 20, minute: 0 },
      addHabit: (title) => {
        const newHabit: Habit = { id: Date.now().toString(), title: title.trim(), createdAt: getTodayStr(), completedDates: [] };
        set((s) => ({ habits: [...s.habits, newHabit], activeHabitId: s.activeHabitId ?? newHabit.id }));
      },
      deleteHabit: (id) => {
        set((s) => {
          const filtered = s.habits.filter((h) => h.id !== id);
          return { habits: filtered, activeHabitId: s.activeHabitId === id ? (filtered?.id ?? null) : s.activeHabitId };
        });
      },
      setActiveHabit: (id) => set({ activeHabitId: id }),
      markTodayDone: (id) => {
        const today = getTodayStr();
        set((s) => ({
          habits: s.habits.map((h) => (h.id !== id || h.completedDates.includes(today) ? h : { ...h, completedDates: [...h.completedDates, today] })),
        }));
      },
      setReminderTime: (reminderTime) => set({ reminderTime }),
    }),
    { name: 'hardcore-streak-storage', storage: createJSONStorage(() => AsyncStorage) }
  )
);
