import { useState, useMemo } from 'react';
import { useTasksStore } from '../tasks/store';
import { useSectorsStore } from '../sectors/store';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { cn } from '../../lib/utils';
import { parseISO, differenceInDays } from 'date-fns';
import {
    AlertTriangle,
    Clock,
    Target,
    ArrowUpRight,
    ArrowDownRight,
    Circle,
    CheckCircle,
    Calendar,
    Zap,
    Users,
    Trash2,
    GripVertical,
    RefreshCw
} from 'lucide-react';
import type { Task } from '../../lib/types';

type Quadrant = 'do' | 'schedule' | 'delegate' | 'eliminate';

interface QuadrantConfig {
    id: Quadrant;
    name: string;
    description: string;
    action: string;
    color: string;
    bgColor: string;
    icon: React.ElementType;
}

const QUADRANTS: QuadrantConfig[] = [
    {
        id: 'do',
        name: 'Do First',
        description: 'Urgent & Important',
        action: 'Do it now',
        color: '#FF4757',
        bgColor: 'from-red-500/10 to-orange-500/10',
        icon: AlertTriangle
    },
    {
        id: 'schedule',
        name: 'Schedule',
        description: 'Important, Not Urgent',
        action: 'Plan when to do it',
        color: '#00D4AA',
        bgColor: 'from-cyan-500/10 to-green-500/10',
        icon: Clock
    },
    {
        id: 'delegate',
        name: 'Delegate',
        description: 'Urgent, Not Important',
        action: 'Who can do it?',
        color: '#FFB800',
        bgColor: 'from-yellow-500/10 to-amber-500/10',
        icon: Users
    },
    {
        id: 'eliminate',
        name: 'Eliminate',
        description: 'Neither Urgent nor Important',
        action: 'Drop it',
        color: '#6B7280',
        bgColor: 'from-gray-500/10 to-slate-500/10',
        icon: Trash2
    },
];

export const EisenhowerView = () => {
    const { tasks, updateTask, toggleTaskStatus } = useTasksStore();
    const { sectors } = useSectorsStore();
    const [draggedTask, setDraggedTask] = useState<Task | null>(null);
    const [hoveredQuadrant, setHoveredQuadrant] = useState<Quadrant | null>(null);
    const [selectedQuadrant, setSelectedQuadrant] = useState<Quadrant | null>(null);
    const [showCompleted, setShowCompleted] = useState(false);

    // Filter tasks
    const activeTasks = useMemo(() => {
        return tasks.filter(t =>
            !t.isTemplate &&
            (showCompleted ? true : t.status !== 'completed' && t.status !== 'cancelled')
        );
    }, [tasks, showCompleted]);

    // Categorize tasks by quadrant
    const getTaskQuadrant = (task: Task): Quadrant => {
        if (task.quadrant) return task.quadrant as Quadrant;

        // Auto-determine based on energyRequired and due date
        const isUrgent = task.dueDate && differenceInDays(parseISO(task.dueDate), new Date()) <= 2;
        const isImportant = task.energyRequired === 'high' || task.strategicWeight >= 4;

        if (isUrgent && isImportant) return 'do';
        if (!isUrgent && isImportant) return 'schedule';
        if (isUrgent && !isImportant) return 'delegate';
        return 'eliminate';
    };

    const getTasksByQuadrant = (quadrant: Quadrant) => {
        return activeTasks.filter(t => getTaskQuadrant(t) === quadrant);
    };

    // Stats
    const quadrantStats = useMemo(() => {
        return QUADRANTS.map(q => ({
            ...q,
            count: getTasksByQuadrant(q.id).length,
            completedCount: getTasksByQuadrant(q.id).filter(t => t.status === 'completed').length
        }));
    }, [activeTasks]);

    const handleDragStart = (e: React.DragEvent, task: Task) => {
        setDraggedTask(task);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent, quadrant: Quadrant) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setHoveredQuadrant(quadrant);
    };

    const handleDragLeave = () => {
        setHoveredQuadrant(null);
    };

    const handleDrop = (e: React.DragEvent, quadrant: Quadrant) => {
        e.preventDefault();
        if (draggedTask) {
            updateTask(draggedTask.id, { quadrant });
        }
        setDraggedTask(null);
        setHoveredQuadrant(null);
    };

    const handleDragEnd = () => {
        setDraggedTask(null);
        setHoveredQuadrant(null);
    };

    const autoAssignQuadrants = () => {
        activeTasks.forEach(task => {
            if (!task.quadrant) {
                const quadrant = getTaskQuadrant(task);
                updateTask(task.id, { quadrant });
            }
        });
    };

    const QuadrantCard = ({ quadrant }: { quadrant: QuadrantConfig }) => {
        const quadrantTasks = getTasksByQuadrant(quadrant.id);
        const Icon = quadrant.icon;
        const isSelected = selectedQuadrant === quadrant.id;

        return (
            <div
                onDragOver={(e) => handleDragOver(e, quadrant.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, quadrant.id)}
                onClick={() => setSelectedQuadrant(isSelected ? null : quadrant.id)}
                className={cn(
                    "flex flex-col rounded-xl border-2 transition-all min-h-[180px] sm:min-h-[220px] cursor-pointer",
                    `bg-gradient-to-br ${quadrant.bgColor}`,
                    hoveredQuadrant === quadrant.id
                        ? "border-cyan-400 scale-[1.02] shadow-lg"
                        : isSelected
                            ? "border-white/30"
                            : "border-gray-800 hover:border-gray-700"
                )}
            >
                {/* Header - Compact */}
                <div className="p-3 border-b border-gray-800/50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center"
                                style={{ backgroundColor: `${quadrant.color}20` }}
                            >
                                <Icon className="w-4 h-4" style={{ color: quadrant.color }} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-white text-sm">{quadrant.name}</h3>
                                <p className="text-[10px] text-gray-500">{quadrant.description}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span
                                className="px-2 py-0.5 rounded-full text-xs font-bold"
                                style={{ backgroundColor: `${quadrant.color}20`, color: quadrant.color }}
                            >
                                {quadrantTasks.length}
                            </span>
                        </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-400 flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        {quadrant.action}
                    </div>
                </div>

                {/* Tasks */}
                <div className="flex-1 p-3 space-y-2 overflow-y-auto max-h-[300px] scrollbar-hide">
                    {quadrantTasks.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full py-8 text-gray-500">
                            <Icon className="w-8 h-8 mb-2 opacity-30" />
                            <p className="text-sm">No tasks</p>
                            <p className="text-xs mt-1 text-gray-600">Drag tasks here</p>
                        </div>
                    ) : (
                        quadrantTasks.map(task => {
                            const sector = sectors.find(s => s.id === task.sectorId);
                            const daysUntilDue = task.dueDate
                                ? differenceInDays(parseISO(task.dueDate), new Date())
                                : null;

                            return (
                                <div
                                    key={task.id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, task)}
                                    onDragEnd={handleDragEnd}
                                    className={cn(
                                        "group p-3 rounded-xl bg-gray-800/50 hover:bg-gray-800 cursor-grab active:cursor-grabbing",
                                        "border border-transparent hover:border-gray-700 transition-all",
                                        draggedTask?.id === task.id && "opacity-50 scale-95",
                                        task.status === 'completed' && "opacity-50"
                                    )}
                                >
                                    <div className="flex items-start gap-3">
                                        <GripVertical className="w-4 h-4 text-gray-600 opacity-0 group-hover:opacity-100 mt-0.5 flex-shrink-0" />
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleTaskStatus(task.id);
                                            }}
                                            className={cn(
                                                "mt-0.5 flex-shrink-0 transition-colors",
                                                task.status === 'completed' ? "text-green-400" : "text-gray-500 hover:text-green-400"
                                            )}
                                        >
                                            {task.status === 'completed'
                                                ? <CheckCircle className="w-4 h-4" />
                                                : <Circle className="w-4 h-4" />
                                            }
                                        </button>
                                        <div className="flex-1 min-w-0">
                                            <p className={cn(
                                                "text-sm text-white truncate",
                                                task.status === 'completed' && "line-through text-gray-500"
                                            )}>
                                                {task.title}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                {sector && (
                                                    <span
                                                        className="text-[10px] px-1.5 py-0.5 rounded"
                                                        style={{ backgroundColor: `${sector.color}20`, color: sector.color }}
                                                    >
                                                        {sector.name}
                                                    </span>
                                                )}
                                                {daysUntilDue !== null && (
                                                    <span className={cn(
                                                        "text-[10px] flex items-center gap-0.5",
                                                        daysUntilDue < 0 ? "text-red-400" : daysUntilDue <= 2 ? "text-orange-400" : "text-gray-500"
                                                    )}>
                                                        <Calendar className="w-3 h-3" />
                                                        {daysUntilDue < 0 ? 'Overdue' : daysUntilDue === 0 ? 'Today' : `${daysUntilDue}d`}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        {task.energyRequired === 'high' && (
                                            <ArrowUpRight className="w-4 h-4 text-red-400 flex-shrink-0" />
                                        )}
                                        {task.energyRequired === 'low' && (
                                            <ArrowDownRight className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-4">
            {/* Header - Mobile Optimized */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-red-500 to-yellow-500 flex items-center justify-center flex-shrink-0">
                        <Target className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-white">Eisenhower Matrix</h1>
                        <p className="text-gray-400 text-xs sm:text-sm">Prioritize by urgency and importance</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => setShowCompleted(!showCompleted)}
                        size="sm"
                        className="text-xs"
                    >
                        {showCompleted ? 'Hide' : 'Show'} Completed
                    </Button>
                    <Button
                        variant="outline"
                        onClick={autoAssignQuadrants}
                        leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                        size="sm"
                        className="text-xs"
                    >
                        Auto-Assign
                    </Button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {quadrantStats.map(stat => {
                    const Icon = stat.icon;
                    return (
                        <Card
                            key={stat.id}
                            className={cn(
                                "flex items-center gap-3 cursor-pointer transition-all",
                                selectedQuadrant === stat.id && "ring-2 ring-white/30"
                            )}
                            onClick={() => setSelectedQuadrant(selectedQuadrant === stat.id ? null : stat.id)}
                        >
                            <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                                style={{ backgroundColor: `${stat.color}20` }}
                            >
                                <Icon className="w-5 h-5" style={{ color: stat.color }} />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{stat.count}</p>
                                <p className="text-xs text-gray-500">{stat.name}</p>
                            </div>
                        </Card>
                    );
                })}
            </div>

            {/* Matrix Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {QUADRANTS.map(quadrant => (
                    <QuadrantCard key={quadrant.id} quadrant={quadrant} />
                ))}
            </div>

            {/* Legend & Tips */}
            <Card className="p-4">
                <h4 className="font-medium text-white mb-4 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    Quick Guide
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    {QUADRANTS.map(q => {
                        const Icon = q.icon;
                        return (
                            <div key={q.id} className="flex items-start gap-2">
                                <Icon className="w-4 h-4 mt-0.5" style={{ color: q.color }} />
                                <div>
                                    <p className="font-medium text-white">{q.name}</p>
                                    <p className="text-gray-500 text-xs">{q.action}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div className="mt-4 p-3 bg-gray-800/50 rounded-lg">
                    <p className="text-xs text-gray-400">
                        💡 <strong className="text-gray-300">Pro tip:</strong> Focus 80% of your time on Q2 (Schedule) tasks.
                        They build long-term value and prevent Q1 crises.
                    </p>
                </div>
            </Card>
        </div>
    );
};
