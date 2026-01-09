import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateId } from '../../lib/utils';
import { startOfWeek, endOfWeek, format } from 'date-fns';

export interface WeeklyReviewData {
    id: string;
    weekStart: string;
    weekEnd: string;
    createdAt: string;

    // Reflection
    wentWell: string;
    challenges: string;
    learned: string;

    // Ratings (1-5)
    productivityRating: number;
    energyRating: number;
    satisfactionRating: number;

    // Planning
    topPriorities: string[];
    focusAreas: string[];

    // Stats snapshot
    tasksCompleted: number;
    focusMinutes: number;
    habitsCompletionRate: number;
}

interface ReviewState {
    reviews: WeeklyReviewData[];

    // Actions
    addReview: (review: Omit<WeeklyReviewData, 'id' | 'createdAt' | 'weekStart' | 'weekEnd'>) => void;
    updateReview: (id: string, updates: Partial<WeeklyReviewData>) => void;
    deleteReview: (id: string) => void;

    // Getters
    getCurrentWeekReview: () => WeeklyReviewData | null;
    getReviewByWeek: (weekStart: string) => WeeklyReviewData | null;
    getAllReviews: () => WeeklyReviewData[];
}

export const useReviewStore = create<ReviewState>()(
    persist(
        (set, get) => ({
            reviews: [],

            addReview: (reviewData) => {
                const now = new Date();
                const weekStart = startOfWeek(now, { weekStartsOn: 1 });
                const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

                const newReview: WeeklyReviewData = {
                    id: generateId(),
                    weekStart: format(weekStart, 'yyyy-MM-dd'),
                    weekEnd: format(weekEnd, 'yyyy-MM-dd'),
                    createdAt: new Date().toISOString(),
                    ...reviewData,
                };

                set((state) => ({ reviews: [...state.reviews, newReview] }));
            },

            updateReview: (id, updates) => {
                set((state) => ({
                    reviews: state.reviews.map((r) =>
                        r.id === id ? { ...r, ...updates } : r
                    ),
                }));
            },

            deleteReview: (id) => {
                set((state) => ({ reviews: state.reviews.filter((r) => r.id !== id) }));
            },

            getCurrentWeekReview: () => {
                const now = new Date();
                const weekStart = format(startOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd');
                return get().reviews.find(r => r.weekStart === weekStart) || null;
            },

            getReviewByWeek: (weekStart) => {
                return get().reviews.find(r => r.weekStart === weekStart) || null;
            },

            getAllReviews: () => {
                return get().reviews.sort((a, b) =>
                    new Date(b.weekStart).getTime() - new Date(a.weekStart).getTime()
                );
            },
        }),
        {
            name: 'strategist-reviews',
        }
    )
);
