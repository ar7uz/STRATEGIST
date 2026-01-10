import { useMemo } from 'react';
import { usePomodoroStore } from './store';
import { Card } from '../../components/ui/Card';
import { Clock, Flame, Target, TrendingUp } from 'lucide-react';
import { XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { format, parseISO } from 'date-fns';

export const PomodoroStats = () => {
    const { getTodayStats, getWeekStats, getTotalStats, currentStreak, longestStreak, sessions } = usePomodoroStore();

    const todayStats = getTodayStats();
    const weekStats = getWeekStats();
    const totalStats = getTotalStats();

    const weekChartData = useMemo(() => {
        return weekStats.map(day => ({
            day: format(parseISO(day.date), 'EEE'),
            minutes: day.totalMinutes,
            sessions: day.sessionsCount,
        }));
    }, [weekStats]);

    const formatTime = (minutes: number) => {
        if (minutes < 60) return `${minutes}m`;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-white">Focus Statistics</h2>
                <p className="text-gray-400 mt-1">Track your deep work sessions</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="text-center py-5">
                    <div className="w-11 h-11 mx-auto rounded-xl bg-cyan-400/10 flex items-center justify-center mb-2">
                        <Clock className="w-5 h-5 text-cyan-400" />
                    </div>
                    <p className="text-2xl font-bold text-white">{formatTime(todayStats.totalMinutes)}</p>
                    <p className="text-xs text-gray-500">Today's Focus</p>
                </Card>

                <Card className="text-center py-5">
                    <div className="w-11 h-11 mx-auto rounded-xl bg-purple-400/10 flex items-center justify-center mb-2">
                        <Target className="w-5 h-5 text-purple-400" />
                    </div>
                    <p className="text-2xl font-bold text-white">{todayStats.sessionsCount}</p>
                    <p className="text-xs text-gray-500">Sessions Today</p>
                </Card>

                <Card className="text-center py-5">
                    <div className="w-11 h-11 mx-auto rounded-xl bg-orange-400/10 flex items-center justify-center mb-2">
                        <Flame className="w-5 h-5 text-orange-400" />
                    </div>
                    <p className="text-2xl font-bold text-white">{currentStreak}</p>
                    <p className="text-xs text-gray-500">Day Streak</p>
                </Card>

                <Card className="text-center py-5">
                    <div className="w-11 h-11 mx-auto rounded-xl bg-green-400/10 flex items-center justify-center mb-2">
                        <TrendingUp className="w-5 h-5 text-green-400" />
                    </div>
                    <p className="text-2xl font-bold text-white">{formatTime(totalStats.totalMinutes)}</p>
                    <p className="text-xs text-gray-500">All Time</p>
                </Card>
            </div>

            {/* Weekly Chart */}
            <Card variant="elevated">
                <h3 className="font-semibold text-white mb-4">This Week</h3>
                {sessions.length === 0 ? (
                    <div className="h-48 flex items-center justify-center text-gray-500">
                        <div className="text-center">
                            <Clock className="w-10 h-10 mx-auto mb-2 opacity-50" />
                            <p>No focus sessions yet</p>
                            <p className="text-sm mt-1">Complete a session to see your stats</p>
                        </div>
                    </div>
                ) : (
                    <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={weekChartData}>
                                <XAxis
                                    dataKey="day"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#6B7280', fontSize: 12 }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#6B7280', fontSize: 12 }}
                                    tickFormatter={(value) => `${value}m`}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1F2937',
                                        border: '1px solid #374151',
                                        borderRadius: '8px',
                                    }}
                                    labelStyle={{ color: '#9CA3AF' }}
                                    formatter={(value) => [`${value ?? 0} min`, 'Focus Time']}
                                />
                                <Bar
                                    dataKey="minutes"
                                    fill="#00D4AA"
                                    radius={[4, 4, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </Card>

            {/* Detailed Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                    <h4 className="font-medium text-white mb-3">Lifetime Stats</h4>
                    <div className="space-y-2">
                        <div className="flex justify-between py-2 border-b border-gray-800">
                            <span className="text-gray-400">Total Sessions</span>
                            <span className="font-medium text-white">{totalStats.totalSessions}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-800">
                            <span className="text-gray-400">Total Focus Time</span>
                            <span className="font-medium text-white">{formatTime(totalStats.totalMinutes)}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-800">
                            <span className="text-gray-400">Average Session</span>
                            <span className="font-medium text-white">{formatTime(totalStats.avgDuration)}</span>
                        </div>
                        <div className="flex justify-between py-2">
                            <span className="text-gray-400">Longest Streak</span>
                            <span className="font-medium text-orange-400">{longestStreak} days</span>
                        </div>
                    </div>
                </Card>

                <Card>
                    <h4 className="font-medium text-white mb-3">Recent Sessions</h4>
                    {sessions.length === 0 ? (
                        <p className="text-gray-500 text-sm py-4 text-center">No sessions recorded</p>
                    ) : (
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                            {sessions.slice(-5).reverse().map((session) => (
                                <div key={session.id} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                                    <div>
                                        <p className="text-sm text-white">{session.taskName || 'Focus Session'}</p>
                                        <p className="text-xs text-gray-500">
                                            {format(new Date(session.startTime), 'MMM d, h:mm a')}
                                        </p>
                                    </div>
                                    <span className="text-sm font-medium text-cyan-400">
                                        {formatTime(session.durationMinutes)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};
