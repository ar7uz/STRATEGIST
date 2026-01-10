import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Habit, HabitId } from '../../lib/types';
import { generateId } from '../../lib/utils';
import { parseISO, differenceInDays, format } from 'date-fns';

interface HabitsState {
    habits: Habit[];

    // CRUD
    addHabit: (habit: Omit<Habit, 'id' | 'completions' | 'currentStreak' | 'longestStreak' | 'createdAt'>) => void;
    updateHabit: (id: HabitId, updates: Partial<Habit>) => void;
    deleteHabit: (id: HabitId) => void;

    // Completions
    toggleCompletion: (id: HabitId, date?: Date) => void;
    isCompletedOn: (id: HabitId, date: Date) => boolean;

    // Streak calculations
    calculateStreak: (habit: Habit) => number;
    getTodayProgress: () => { completed: number; total: number };
    getHabitStats: (id: HabitId) => {
        completionRate: number;
        totalCompletions: number;
        bestStreak: number;
    };
}

export const useHabitsStore = create<HabitsState>()(
    persist(
        (set, get) => ({
            habits: [
                // Default habits for demo
                {
                    id: 'habit-1',
                    name: 'Morning Meditation',
                    icon: '🧘',
                    color: '#A855F7',
                    frequency: 'daily',
                    completions: [],
                    currentStreak: 0,
                    longestStreak: 0,
                    isActive: true,
                    createdAt: new Date().toISOString(),
                },
                {
                    id: 'habit-2',
                    name: 'Exercise',
                    icon: '💪',
                    color: '#22C55E',
                    frequency: { times: 3, per: 'week' },
                    completions: [],
                    currentStreak: 0,
                    longestStreak: 0,
                    isActive: true,
                    createdAt: new Date().toISOString(),
                },
                {
                    id: 'habit-3',
                    name: 'Read 30 mins',
                    icon: '📚',
                    color: '#0088FF',
                    frequency: 'daily',
                    completions: [],
                    currentStreak: 0,
                    longestStreak: 0,
                    isActive: true,
                    createdAt: new Date().toISOString(),
                },
            ],

            addHabit: (habitData) => set((state) => ({
                habits: [...state.habits, {
                    ...habitData,
                    id: generateId(),
                    completions: [],
                    currentStreak: 0,
                    longestStreak: 0,
                    createdAt: new Date().toISOString(),
                }]
            })),

            updateHabit: (id, updates) => set((state) => ({
                habits: state.habits.map(h => h.id === id ? { ...h, ...updates } : h)
            })),

            deleteHabit: (id) => set((state) => ({
                habits: state.habits.filter(h => h.id !== id)
            })),

            toggleCompletion: (id, date = new Date()) => set((state) => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                const targetDate = new Date(date);
                targetDate.setHours(0, 0, 0, 0);

                // Only allow completion for today - prevent cheating on past days
                if (targetDate.getTime() !== today.getTime()) {
                    return state; // Do nothing for past/future days
                }

                const dateStr = format(date, 'yyyy-MM-dd');

                return {
                    habits: state.habits.map(habit => {
                        if (habit.id !== id) return habit;

                        const isCompleted = habit.completions.includes(dateStr);
                        let newCompletions: string[];

                        if (isCompleted) {
                            newCompletions = habit.completions.filter(d => d !== dateStr);
                        } else {
                            newCompletions = [...habit.completions, dateStr].sort();
                        }

                        // Recalculate streak
                        const newStreak = get().calculateStreak({ ...habit, completions: newCompletions });

                        return {
                            ...habit,
                            completions: newCompletions,
                            currentStreak: newStreak,
                            longestStreak: Math.max(habit.longestStreak, newStreak),
                        };
                    })
                };
            }),

            isCompletedOn: (id, date) => {
                const { habits } = get();
                const habit = habits.find(h => h.id === id);
                if (!habit) return false;
                const dateStr = format(date, 'yyyy-MM-dd');
                return habit.completions.includes(dateStr);
            },

            calculateStreak: (habit) => {
                if (habit.completions.length === 0) return 0;

                const sortedDates = [...habit.completions]
                    .map(d => parseISO(d))
                    .sort((a, b) => b.getTime() - a.getTime()); // Sort descending (newest first)

                const today = new Date();
                today.setHours(0, 0, 0, 0);

                // Check if user completed today or yesterday
                const mostRecent = new Date(sortedDates[0]);
                mostRecent.setHours(0, 0, 0, 0);

                const daysSinceLast = differenceInDays(today, mostRecent);

                // If last completion was more than 1 day ago, streak is broken
                if (daysSinceLast > 1) return 0;

                // Count consecutive days going backwards
                let streak = 0;
                let expectedDate = daysSinceLast === 0 ? today : new Date(today.getTime() - 24 * 60 * 60 * 1000);

                for (const completion of sortedDates) {
                    const completionDate = new Date(completion);
                    completionDate.setHours(0, 0, 0, 0);

                    const diff = differenceInDays(expectedDate, completionDate);

                    if (diff === 0) {
                        // This is the expected day
                        streak++;
                        // Move expected date to previous day
                        expectedDate = new Date(expectedDate.getTime() - 24 * 60 * 60 * 1000);
                    } else if (diff < 0) {
                        // Completion is in the future relative to expected - skip
                        continue;
                    } else {
                        // Gap found - streak broken
                        break;
                    }
                }

                return streak;
            },

            getTodayProgress: () => {
                const { habits, isCompletedOn } = get();
                const today = new Date();
                const activeHabits = habits.filter(h => h.isActive && h.frequency === 'daily');
                const completed = activeHabits.filter(h => isCompletedOn(h.id, today)).length;

                return { completed, total: activeHabits.length };
            },

            getHabitStats: (id) => {
                const { habits } = get();
                const habit = habits.find(h => h.id === id);

                if (!habit) return { completionRate: 0, totalCompletions: 0, bestStreak: 0 };

                const daysSinceCreation = Math.max(1, differenceInDays(new Date(), parseISO(habit.createdAt)));
                const expectedCompletions = habit.frequency === 'daily'
                    ? daysSinceCreation
                    : typeof habit.frequency === 'object'
                        ? Math.floor(daysSinceCreation / 7) * habit.frequency.times
                        : daysSinceCreation;

                return {
                    completionRate: Math.round((habit.completions.length / Math.max(1, expectedCompletions)) * 100),
                    totalCompletions: habit.completions.length,
                    bestStreak: habit.longestStreak,
                };
            },
        }),
        {
            name: 'strategist-habits',
        }
    )
);
