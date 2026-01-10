import { useMemo } from 'react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip, AreaChart, Area, XAxis, YAxis } from 'recharts';
import { useTasksStore } from '../tasks/store';
import { useSectorsStore } from '../sectors/store';
import { calculateTaskGDP, calculateDailyInflation } from './calculations';
import { Card } from '../../components/ui/Card';
import { TrendingUp, Clock, AlertTriangle, Activity, Zap, Target } from 'lucide-react';
import { isSameDay, parseISO } from 'date-fns';

export const AnalyticsView = () => {
    const { tasks } = useTasksStore();
    const { sectors } = useSectorsStore();

    const today = new Date();
    const todayTasks = tasks.filter(t => t.completedAt && isSameDay(parseISO(t.completedAt), today));

    const metrics = useMemo(() => {
        let totalGDP = 0;

        todayTasks.forEach(task => {
            const sector = sectors.find(s => s.id === task.sectorId);
            if (sector) {
                totalGDP += calculateTaskGDP(task, sector);
            }
        });

        const inflation = calculateDailyInflation(todayTasks);
        const focusMinutes = todayTasks.reduce((acc, t) => acc + (t.actualMinutes || 0), 0);

        return {
            gdp: totalGDP.toFixed(1),
            inflation: Math.round(inflation),
            tasksCount: todayTasks.length,
            focusMinutes,
            focusHours: (focusMinutes / 60).toFixed(1),
        };
    }, [todayTasks, sectors]);

    // Radar Chart Data
    const radarData = useMemo(() => {
        return sectors.map(sector => {
            const sectorTasks = todayTasks.filter(t => t.sectorId === sector.id);
            const sectorGDP = sectorTasks.reduce((acc, t) => acc + calculateTaskGDP(t, sector), 0);

            return {
                subject: sector.name,
                target: sector.weight,
                actual: Math.min(sectorGDP * 15, 100), // Scale for visibility
                fullMark: 100,
            };
        });
    }, [sectors, todayTasks]);

    // Mock trend data
    const trendData = [
        { day: 'Mon', gdp: 2.4 },
        { day: 'Tue', gdp: 3.1 },
        { day: 'Wed', gdp: 2.8 },
        { day: 'Thu', gdp: 4.2 },
        { day: 'Fri', gdp: 3.6 },
        { day: 'Sat', gdp: 1.2 },
        { day: 'Sun', gdp: Number(metrics.gdp) || 0 },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white">Analytics</h1>
                <p className="text-gray-400 mt-1">Performance metrics and strategic insights</p>
            </div>

            {/* Key Metrics - Compact */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {/* GDP */}
                <Card variant="elevated" className="relative overflow-hidden py-3 px-4">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-cyan-400/20 to-transparent rounded-full blur-xl" />
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-cyan-400/10 flex items-center justify-center">
                            <Activity className="w-4 h-4 text-cyan-400" />
                        </div>
                        <span className="text-xs font-medium text-gray-400 uppercase">Daily GDP</span>
                    </div>
                    <div className="text-2xl font-bold text-cyan-400 font-mono">
                        {metrics.gdp}
                    </div>
                    <div className="text-xs text-green-400 mt-0.5 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" /> +12% vs avg
                    </div>
                </Card>

                {/* Inflation */}
                <Card variant="elevated" className="relative overflow-hidden py-3 px-4">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-orange-400/20 to-transparent rounded-full blur-xl" />
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-orange-400/10 flex items-center justify-center">
                            <AlertTriangle className="w-4 h-4 text-orange-400" />
                        </div>
                        <span className="text-xs font-medium text-gray-400 uppercase">Inflation</span>
                    </div>
                    <div className={`text-2xl font-bold font-mono ${metrics.inflation > 20 ? 'text-orange-400' : 'text-white'}`}>
                        {metrics.inflation}%
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">Time overspend rate</div>
                </Card>

                {/* Focus Time */}
                <Card variant="elevated" className="py-3 px-4">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-purple-400/10 flex items-center justify-center">
                            <Clock className="w-4 h-4 text-purple-400" />
                        </div>
                        <span className="text-xs font-medium text-gray-400 uppercase">Focus</span>
                    </div>
                    <div className="text-2xl font-bold text-white font-mono">
                        {metrics.focusHours}<span className="text-sm text-gray-400">h</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">{metrics.focusMinutes} min today</div>
                </Card>

                {/* Throughput */}
                <Card variant="elevated" className="py-3 px-4">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-green-400/10 flex items-center justify-center">
                            <Target className="w-4 h-4 text-green-400" />
                        </div>
                        <span className="text-xs font-medium text-gray-400 uppercase">Throughput</span>
                    </div>
                    <div className="text-2xl font-bold text-white font-mono">
                        {metrics.tasksCount}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">Tasks completed</div>
                </Card>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Radar Chart */}
                <Card variant="elevated" className="min-h-[350px] flex flex-col">
                    <div className="flex items-center gap-3 mb-4">
                        <Zap className="w-5 h-5 text-cyan-400" />
                        <h3 className="text-lg font-semibold text-white">Sector Balance</h3>
                    </div>
                    <div className="flex-1 w-full min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                                <PolarGrid stroke="#334155" />
                                <PolarAngleAxis
                                    dataKey="subject"
                                    tick={{ fill: '#94A3B8', fontSize: 12 }}
                                />
                                <PolarRadiusAxis
                                    angle={30}
                                    domain={[0, 100]}
                                    tick={false}
                                    axisLine={false}
                                />
                                <Radar
                                    name="Target"
                                    dataKey="target"
                                    stroke="#475569"
                                    fill="#475569"
                                    fillOpacity={0.2}
                                />
                                <Radar
                                    name="Actual"
                                    dataKey="actual"
                                    stroke="#00D4AA"
                                    fill="#00D4AA"
                                    fillOpacity={0.4}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1E293B',
                                        border: '1px solid #334155',
                                        borderRadius: '8px'
                                    }}
                                    itemStyle={{ color: '#F8FAFC' }}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Trend Chart */}
                <Card variant="elevated" className="min-h-[350px] flex flex-col">
                    <div className="flex items-center gap-3 mb-4">
                        <TrendingUp className="w-5 h-5 text-purple-400" />
                        <h3 className="text-lg font-semibold text-white">Weekly Trend</h3>
                    </div>
                    <div className="flex-1 w-full min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trendData}>
                                <defs>
                                    <linearGradient id="colorGdp" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#00D4AA" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#00D4AA" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis
                                    dataKey="day"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748B', fontSize: 12 }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748B', fontSize: 12 }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1E293B',
                                        border: '1px solid #334155',
                                        borderRadius: '8px'
                                    }}
                                    itemStyle={{ color: '#F8FAFC' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="gdp"
                                    stroke="#00D4AA"
                                    strokeWidth={2}
                                    fill="url(#colorGdp)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>
        </div>
    );
};
