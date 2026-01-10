import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateId } from '../../lib/utils';
import { startOfDay, startOfWeek, startOfMonth, eachDayOfInterval, subDays, format, differenceInDays } from 'date-fns';

export interface PomodoroSession {
    id: string;
    taskId?: string;
    taskName?: string;
    sectorId?: string;
    sectorName?: string;
    startTime: string;
    endTime: string;
    durationMinutes: number;
    wasCompleted: boolean;
}

export interface DailyStats {
    date: string;
    totalMinutes: number;
    sessionsCount: number;
    completedSessions: number;
}

interface PomodoroState {
    sessions: PomodoroSession[];
    currentStreak: number;
    longestStreak: number;

    // Actions
    addSession: (session: Omit<PomodoroSession, 'id'>) => void;

    // Getters
    getTodayStats: () => DailyStats;
    getWeekStats: () => DailyStats[];
    getMonthStats: () => DailyStats[];
    getTotalStats: () => { totalMinutes: number; totalSessions: number; avgDuration: number };
    calculateStreak: () => number;
}

export const usePomodoroStore = create<PomodoroState>()(
    persist(
        (set, get) => ({
            sessions: [],
            currentStreak: 0,
            longestStreak: 0,

            addSession: (sessionData) => {
                const newSession: PomodoroSession = {
                    id: generateId(),
                    ...sessionData,
                };

                set((state) => {
                    const newSessions = [...state.sessions, newSession];

                    // Calculate streak
                    const today = startOfDay(new Date());
                    let streak = 0;
                    let checkDate = today;

                    while (true) {
                        const dayStr = format(checkDate, 'yyyy-MM-dd');
                        const hasSession = newSessions.some(s =>
                            format(new Date(s.startTime), 'yyyy-MM-dd') === dayStr && s.wasCompleted
                        );

                        if (hasSession) {
                            streak++;
                            checkDate = subDays(checkDate, 1);
                        } else if (differenceInDays(today, checkDate) === 0) {
                            // Today might not have sessions yet, check yesterday
                            checkDate = subDays(checkDate, 1);
                        } else {
                            break;
                        }
                    }

                    return {
                        sessions: newSessions,
                        currentStreak: streak,
                        longestStreak: Math.max(state.longestStreak, streak),
                    };
                });
            },

            getTodayStats: () => {
                const sessions = get().sessions;
                const todayStr = format(new Date(), 'yyyy-MM-dd');
                const todaySessions = sessions.filter(s =>
                    format(new Date(s.startTime), 'yyyy-MM-dd') === todayStr
                );

                return {
                    date: todayStr,
                    totalMinutes: todaySessions.reduce((acc, s) => acc + s.durationMinutes, 0),
                    sessionsCount: todaySessions.length,
                    completedSessions: todaySessions.filter(s => s.wasCompleted).length,
                };
            },

            getWeekStats: () => {
                const sessions = get().sessions;
                const today = new Date();
                const weekStart = startOfWeek(today, { weekStartsOn: 1 });
                const days = eachDayOfInterval({ start: weekStart, end: today });

                return days.map(day => {
                    const dayStr = format(day, 'yyyy-MM-dd');
                    const daySessions = sessions.filter(s =>
                        format(new Date(s.startTime), 'yyyy-MM-dd') === dayStr
                    );

                    return {
                        date: dayStr,
                        totalMinutes: daySessions.reduce((acc, s) => acc + s.durationMinutes, 0),
                        sessionsCount: daySessions.length,
                        completedSessions: daySessions.filter(s => s.wasCompleted).length,
                    };
                });
            },

            getMonthStats: () => {
                const sessions = get().sessions;
                const today = new Date();
                const monthStart = startOfMonth(today);
                const days = eachDayOfInterval({ start: monthStart, end: today });

                return days.map(day => {
                    const dayStr = format(day, 'yyyy-MM-dd');
                    const daySessions = sessions.filter(s =>
                        format(new Date(s.startTime), 'yyyy-MM-dd') === dayStr
                    );

                    return {
                        date: dayStr,
                        totalMinutes: daySessions.reduce((acc, s) => acc + s.durationMinutes, 0),
                        sessionsCount: daySessions.length,
                        completedSessions: daySessions.filter(s => s.wasCompleted).length,
                    };
                });
            },

            getTotalStats: () => {
                const sessions = get().sessions;
                const completedSessions = sessions.filter(s => s.wasCompleted);
                const totalMinutes = completedSessions.reduce((acc, s) => acc + s.durationMinutes, 0);

                return {
                    totalMinutes,
                    totalSessions: completedSessions.length,
                    avgDuration: completedSessions.length > 0
                        ? Math.round(totalMinutes / completedSessions.length)
                        : 0,
                };
            },

            calculateStreak: () => {
                return get().currentStreak;
            },
        }),
        {
            name: 'strategist-pomodoro',
        }
    )
);
