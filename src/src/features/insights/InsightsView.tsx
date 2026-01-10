import { useMemo } from 'react';
import { useTasksStore } from '../tasks/store';
import { usePomodoroStore } from '../pomodoro/store';
import { useHabitsStore } from '../habits/store';
import { Card } from '../../components/ui/Card';
import {
    Brain,
    Clock,
    Calendar,
    Flame,
    Target,
    Zap,
    Sun,
    Moon,
    Lightbulb
} from 'lucide-react';
import { getHours, getDay, subDays, isWithinInterval, parseISO } from 'date-fns';

interface Insight {
    id: string;
    type: 'productivity' | 'timing' | 'habits' | 'suggestion';
    icon: React.ElementType;
    title: string;
    description: string;
    metric?: string;
    color: string;
}

export const InsightsView = () => {
    const { tasks } = useTasksStore();
    const { sessions, getTotalStats } = usePomodoroStore();
    const { habits, getHabitStats } = useHabitsStore();

    const insights = useMemo(() => {
        const result: Insight[] = [];
        const now = new Date();
        const thirtyDaysAgo = subDays(now, 30);

        // Get completed tasks in last 30 days
        const recentCompletedTasks = tasks.filter(t =>
            t.completedAt &&
            isWithinInterval(parseISO(t.completedAt), { start: thirtyDaysAgo, end: now })
        );

        // ===== Peak Hours Analysis =====
        if (recentCompletedTasks.length >= 5) {
            const hourCounts: Record<number, number> = {};
            recentCompletedTasks.forEach(task => {
                if (task.completedAt) {
                    const hour = getHours(parseISO(task.completedAt));
                    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
                }
            });

            const peakHour = Object.entries(hourCounts)
                .sort(([, a], [, b]) => b - a)[0];

            if (peakHour) {
                const hour = parseInt(peakHour[0]);
                const period = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
                const timeStr = hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`;

                result.push({
                    id: 'peak-hours',
                    type: 'timing',
                    icon: hour < 12 ? Sun : Moon,
                    title: `Peak Productivity: ${period}`,
                    description: `You complete most tasks around ${timeStr}. Consider scheduling important work during this time.`,
                    metric: `${peakHour[1]} tasks`,
                    color: '#FFB800'
                });
            }
        }

        // ===== Best Day of Week =====
        if (recentCompletedTasks.length >= 7) {
            const dayCounts: Record<number, number> = {};
            recentCompletedTasks.forEach(task => {
                if (task.completedAt) {
                    const day = getDay(parseISO(task.completedAt));
                    dayCounts[day] = (dayCounts[day] || 0) + 1;
                }
            });

            const bestDay = Object.entries(dayCounts)
                .sort(([, a], [, b]) => b - a)[0];

            if (bestDay) {
                const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                const dayName = dayNames[parseInt(bestDay[0])];
                const dayCount = Number(bestDay[1]);

                result.push({
                    id: 'best-day',
                    type: 'productivity',
                    icon: Calendar,
                    title: `${dayName}s are your power days`,
                    description: `You complete ${Math.round((dayCount / recentCompletedTasks.length) * 100)}% more tasks on ${dayName}s than average.`,
                    metric: `${dayCount} tasks`,
                    color: '#00D4AA'
                });
            }
        }

        // ===== Focus Sessions Analysis =====
        const recentSessions = sessions.filter(s =>
            isWithinInterval(parseISO(s.startTime), { start: thirtyDaysAgo, end: now })
        );

        if (recentSessions.length >= 3) {
            const avgDuration = Math.round(
                recentSessions.reduce((acc, s) => acc + s.durationMinutes, 0) / recentSessions.length
            );

            result.push({
                id: 'focus-duration',
                type: 'productivity',
                icon: Clock,
                title: 'Optimal Focus Duration',
                description: avgDuration > 45
                    ? `Your sessions average ${avgDuration} min. Great deep work capacity!`
                    : `Your sessions average ${avgDuration} min. Try gradually increasing for deeper focus.`,
                metric: `${avgDuration} min avg`,
                color: '#A855F7'
            });
        }

        // ===== Habit Streaks =====
        const activeHabits = habits.filter(h => h.isActive);
        if (activeHabits.length > 0) {
            const totalStreak = activeHabits.reduce((acc, h) => {
                const stats = getHabitStats(h.id);
                return acc + stats.bestStreak;
            }, 0);
            const avgStreak = Math.round(totalStreak / activeHabits.length);

            if (avgStreak > 0) {
                result.push({
                    id: 'habit-streak',
                    type: 'habits',
                    icon: Flame,
                    title: `${avgStreak}-day average streak`,
                    description: avgStreak >= 7
                        ? "Excellent consistency! Your habits are becoming automatic."
                        : "Building momentum. Keep pushing for that 7-day milestone!",
                    metric: `${activeHabits.length} habits`,
                    color: '#FF4757'
                });
            }
        }

        // ===== Task Completion Rate =====
        const activeTasks = tasks.filter(t => !t.isTemplate);
        if (activeTasks.length >= 5) {
            const completed = activeTasks.filter(t => t.status === 'completed').length;
            const rate = Math.round((completed / activeTasks.length) * 100);

            result.push({
                id: 'completion-rate',
                type: 'productivity',
                icon: Target,
                title: `${rate}% Task Completion Rate`,
                description: rate >= 70
                    ? "Outstanding execution! You consistently deliver on your commitments."
                    : rate >= 40
                        ? "Good progress. Consider breaking down large tasks for better completion."
                        : "Focus on fewer, higher-priority tasks to improve your completion rate.",
                metric: `${completed}/${activeTasks.length}`,
                color: rate >= 70 ? '#22C55E' : rate >= 40 ? '#FFB800' : '#FF4757'
            });
        }

        // ===== Suggestions =====
        const { totalMinutes } = getTotalStats();
        const weeklyFocusGoal = 10 * 60; // 10 hours
        const weeklyFocusProgress = (totalMinutes / 7) * 30; // Estimate last 30 days

        if (weeklyFocusProgress < weeklyFocusGoal * 0.7) {
            result.push({
                id: 'focus-suggestion',
                type: 'suggestion',
                icon: Lightbulb,
                title: 'Increase Deep Work Time',
                description: 'Try scheduling 2-3 dedicated focus blocks per day. Even 25-minute Pomodoro sessions add up.',
                color: '#0088FF'
            });
        }

        if (recentCompletedTasks.length > 0) {
            const avgTasksPerDay = recentCompletedTasks.length / 30;
            if (avgTasksPerDay < 2) {
                result.push({
                    id: 'task-suggestion',
                    type: 'suggestion',
                    icon: Zap,
                    title: 'Break Down Big Tasks',
                    description: 'Smaller tasks are easier to complete. Try splitting large tasks into 2-3 actionable steps.',
                    color: '#0088FF'
                });
            }
        }

        // Default insight if no data
        if (result.length === 0) {
            result.push({
                id: 'getting-started',
                type: 'suggestion',
                icon: Brain,
                title: 'Building Your Insights',
                description: 'Complete more tasks and focus sessions to unlock personalized productivity insights.',
                color: '#6B7280'
            });
        }

        return result;
    }, [tasks, sessions, habits, getHabitStats, getTotalStats]);

    const productivityInsights = insights.filter(i => i.type === 'productivity' || i.type === 'timing');
    const habitInsights = insights.filter(i => i.type === 'habits');
    const suggestions = insights.filter(i => i.type === 'suggestion');

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                    <Brain className="w-7 h-7 text-white" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-white">AI Insights</h1>
                    <p className="text-gray-400 mt-1">Personalized productivity patterns</p>
                </div>
            </div>

            {/* Main Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {productivityInsights.map(insight => {
                    const Icon = insight.icon;
                    return (
                        <Card key={insight.id} variant="elevated" className="relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
                                <Icon className="w-full h-full" style={{ color: insight.color }} />
                            </div>
                            <div className="flex items-start gap-4">
                                <div
                                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                                    style={{ backgroundColor: `${insight.color}20` }}
                                >
                                    <Icon className="w-6 h-6" style={{ color: insight.color }} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-semibold text-white">{insight.title}</h3>
                                        {insight.metric && (
                                            <span
                                                className="text-sm font-medium px-2 py-0.5 rounded"
                                                style={{ backgroundColor: `${insight.color}20`, color: insight.color }}
                                            >
                                                {insight.metric}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-400 mt-1">{insight.description}</p>
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>

            {/* Habits Section */}
            {habitInsights.length > 0 && (
                <div>
                    <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Flame className="w-5 h-5 text-orange-400" />
                        Habit Insights
                    </h2>
                    <div className="space-y-3">
                        {habitInsights.map(insight => {
                            const Icon = insight.icon;
                            return (
                                <Card key={insight.id} className="flex items-center gap-4">
                                    <div
                                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                                        style={{ backgroundColor: `${insight.color}20` }}
                                    >
                                        <Icon className="w-5 h-5" style={{ color: insight.color }} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-white">{insight.title}</p>
                                        <p className="text-sm text-gray-400">{insight.description}</p>
                                    </div>
                                    {insight.metric && (
                                        <span className="text-sm text-gray-500">{insight.metric}</span>
                                    )}
                                </Card>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Suggestions */}
            {suggestions.length > 0 && (
                <div>
                    <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-blue-400" />
                        Suggestions
                    </h2>
                    <div className="space-y-3">
                        {suggestions.map(insight => {
                            const Icon = insight.icon;
                            return (
                                <Card key={insight.id} className="flex items-center gap-4 border-l-4" style={{ borderLeftColor: insight.color }}>
                                    <div
                                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                                        style={{ backgroundColor: `${insight.color}20` }}
                                    >
                                        <Icon className="w-5 h-5" style={{ color: insight.color }} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-white">{insight.title}</p>
                                        <p className="text-sm text-gray-400">{insight.description}</p>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};
