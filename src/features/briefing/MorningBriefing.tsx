import React from 'react';
import { Sun, CheckSquare, Battery, TrendingUp, Zap } from 'lucide-react';
import { useTasksStore } from '../tasks/store';
import { useSectorsStore } from '../sectors/store';
import { Modal, ModalFooter } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

interface MorningBriefingProps {
    isOpen: boolean;
    onClose: () => void;
}

export const MorningBriefing: React.FC<MorningBriefingProps> = ({ isOpen, onClose }) => {
    const { tasks } = useTasksStore();
    const { sectors } = useSectorsStore();

    const activeTasks = tasks.filter(t => t.status !== 'completed' && t.status !== 'cancelled');
    const totalMinutes = activeTasks.reduce((acc, t) => acc + t.estimatedMinutes, 0);
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;

    // Determine focus sector
    const sectorFocus = React.useMemo(() => {
        const scores: Record<string, number> = {};
        activeTasks.forEach(t => {
            scores[t.sectorId] = (scores[t.sectorId] || 0) + t.strategicWeight;
        });
        if (Object.keys(scores).length === 0) return null;
        const topSectorId = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b, '');
        return sectors.find(s => s.id === topSectorId);
    }, [activeTasks, sectors]);

    const highPriorityTasks = activeTasks.filter(t => t.strategicWeight >= 4);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Daily Briefing"
            description={`${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`}
            size="lg"
        >
            <div className="space-y-6">
                {/* Welcome Card */}
                <Card variant="elevated" className="bg-gradient-to-br from-cyan-400/10 to-purple-400/5 border-cyan-400/20">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-400 to-yellow-500 flex items-center justify-center">
                            <Sun className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">Good Morning, Strategist</h3>
                            <p className="text-gray-400">Here's your mission overview for today</p>
                        </div>
                    </div>
                </Card>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <Card>
                        <div className="flex items-center gap-3 mb-2">
                            <CheckSquare className="w-5 h-5 text-cyan-400" />
                            <span className="text-sm text-gray-400">Tasks Queued</span>
                        </div>
                        <p className="text-3xl font-bold text-white">{activeTasks.length}</p>
                    </Card>

                    <Card>
                        <div className="flex items-center gap-3 mb-2">
                            <Battery className="w-5 h-5 text-green-400" />
                            <span className="text-sm text-gray-400">Time Budget</span>
                        </div>
                        <p className="text-3xl font-bold text-white">{hours}h {mins}m</p>
                    </Card>
                </div>

                {/* Focus Recommendation */}
                {sectorFocus && (
                    <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Recommended Focus</h4>
                        <Card
                            className="border-l-4"
                            style={{ borderLeftColor: sectorFocus.color }}
                        >
                            <div className="flex items-center gap-4">
                                <div
                                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                                    style={{ background: `${sectorFocus.color}20` }}
                                >
                                    {sectorFocus.icon}
                                </div>
                                <div className="flex-1">
                                    <div className="font-semibold text-white">{sectorFocus.name} Sector</div>
                                    <p className="text-sm text-gray-400">Highest strategic volume today</p>
                                </div>
                                <Zap className="w-5 h-5 text-yellow-400" />
                            </div>
                        </Card>
                    </div>
                )}

                {/* High Priority Tasks */}
                {highPriorityTasks.length > 0 && (
                    <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" />
                            Critical Objectives
                        </h4>
                        <div className="space-y-2">
                            {highPriorityTasks.slice(0, 3).map(task => {
                                const sector = sectors.find(s => s.id === task.sectorId);
                                return (
                                    <div
                                        key={task.id}
                                        className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700/50"
                                    >
                                        <span className="text-lg">{sector?.icon}</span>
                                        <span className="flex-1 text-sm text-white truncate">{task.title}</span>
                                        <span className="text-xs text-orange-400 font-medium">⚡ High</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                <ModalFooter>
                    <Button size="lg" onClick={onClose} className="w-full">
                        Begin Mission
                    </Button>
                </ModalFooter>
            </div>
        </Modal>
    );
};
