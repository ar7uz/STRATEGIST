import { useState, useMemo } from 'react';
import { Plus, ListTodo, CheckCircle, Calendar, CalendarDays, CalendarRange, AlertTriangle, Clock, TrendingUp, Target } from 'lucide-react';
import { useTasksStore } from './store';
import { useSectorsStore } from '../sectors/store';
import { TaskItem } from './TaskItem';
import { Button } from '../../components/ui/Button';
import { Modal, ModalFooter } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import type { Task, EnergyLevel } from '../../lib/types';
import { Card } from '../../components/ui/Card';
import { format, startOfWeek, eachDayOfInterval, isSameDay, addDays, startOfMonth, endOfMonth, isToday, parseISO } from 'date-fns';

interface TasksViewProps {
    onStartSession: (task: Task) => void;
}

type ViewMode = 'today' | 'week' | 'month' | 'all';

const TIME_PRESETS = [15, 30, 45, 60, 90, 120];
const ENERGY_LEVELS: { value: EnergyLevel; label: string; icon: string }[] = [
    { value: 'high', label: 'High Energy', icon: '⚡' },
    { value: 'medium', label: 'Medium', icon: '🔋' },
    { value: 'low', label: 'Low Energy', icon: '🌙' },
];

export const TasksView: React.FC<TasksViewProps> = ({ onStartSession }) => {
    const { tasks, addTask, updateTask, deleteTask, toggleTaskStatus, getTasksForDate, getTasksForWeek, getOverdueTasks } = useTasksStore();
    const { sectors } = useSectorsStore();

    const [viewMode, setViewMode] = useState<ViewMode>('today');
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        sectorId: '',
        estimatedMinutes: 30,
        strategicWeight: 3,
        dueDate: format(new Date(), 'yyyy-MM-dd'),
        energyRequired: 'medium' as EnergyLevel,
        description: '',
    });

    const getSector = (id: string) => sectors.find(s => s.id === id);

    // Get filtered tasks based on view mode
    const filteredTasks = useMemo(() => {
        const allTasks = tasks.filter(t => !t.isTemplate);

        switch (viewMode) {
            case 'today':
                return getTasksForDate(new Date());
            case 'week':
                return getTasksForWeek(selectedDate);
            case 'month': {
                const start = startOfMonth(selectedDate);
                const end = endOfMonth(selectedDate);
                return allTasks.filter(t => {
                    if (!t.dueDate) return false;
                    const due = parseISO(t.dueDate);
                    return due >= start && due <= end;
                });
            }
            case 'all':
            default:
                return allTasks;
        }
    }, [tasks, viewMode, selectedDate, getTasksForDate, getTasksForWeek]);

    const overdueTasks = getOverdueTasks();
    const activeTasks = filteredTasks.filter(t => t.status !== 'completed').sort((a, b) => b.strategicWeight - a.strategicWeight);
    const completedTasks = filteredTasks.filter(t => t.status === 'completed');

    // Analytics
    const analytics = useMemo(() => {
        const allActive = tasks.filter(t => !t.isTemplate);
        const completed = allActive.filter(t => t.status === 'completed');
        const totalPlanned = activeTasks.reduce((acc, t) => acc + t.estimatedMinutes, 0);
        const totalActual = completed.reduce((acc, t) => acc + (t.actualMinutes || t.estimatedMinutes), 0);

        // Time accuracy
        const tasksWithActual = completed.filter(t => t.actualMinutes && t.estimatedMinutes);
        const avgAccuracy = tasksWithActual.length > 0
            ? tasksWithActual.reduce((acc, t) => acc + (t.estimatedMinutes / (t.actualMinutes || 1)), 0) / tasksWithActual.length
            : 1;

        return {
            total: allActive.length,
            completed: completed.length,
            overdue: overdueTasks.length,
            todayCount: getTasksForDate(new Date()).filter(t => t.status !== 'completed').length,
            completionRate: allActive.length > 0 ? Math.round((completed.length / allActive.length) * 100) : 0,
            totalPlannedMinutes: totalPlanned,
            totalActualMinutes: totalActual,
            timeAccuracy: Math.round(avgAccuracy * 100),
        };
    }, [tasks, activeTasks, overdueTasks, getTasksForDate]);

    const handleOpenCreate = () => {
        setEditingTask(null);
        setFormData({
            title: '',
            sectorId: sectors[0]?.id || '',
            estimatedMinutes: 30,
            strategicWeight: 3,
            dueDate: format(selectedDate, 'yyyy-MM-dd'),
            energyRequired: 'medium',
            description: '',
        });
        setIsModalOpen(true);
    };

    const handleOpenEdit = (task: Task) => {
        setEditingTask(task);
        setFormData({
            title: task.title,
            sectorId: task.sectorId,
            estimatedMinutes: task.estimatedMinutes,
            strategicWeight: task.strategicWeight,
            dueDate: task.dueDate || format(new Date(), 'yyyy-MM-dd'),
            energyRequired: task.energyRequired || 'medium',
            description: task.description || '',
        });
        setIsModalOpen(true);
    };

    const handleSave = () => {
        if (!formData.title.trim() || !formData.sectorId) return;

        const taskData = {
            title: formData.title,
            sectorId: formData.sectorId,
            estimatedMinutes: Number(formData.estimatedMinutes),
            strategicWeight: Number(formData.strategicWeight) as 1 | 2 | 3 | 4 | 5,
            dueDate: formData.dueDate,
            energyRequired: formData.energyRequired,
            description: formData.description,
        };

        if (editingTask) {
            updateTask(editingTask.id, taskData);
        } else {
            addTask(taskData);
        }
        setIsModalOpen(false);
    };

    // Week calendar data
    const weekDays = useMemo(() => {
        const start = startOfWeek(selectedDate, { weekStartsOn: 1 });
        return eachDayOfInterval({ start, end: addDays(start, 6) });
    }, [selectedDate]);

    const getTaskCountForDay = (day: Date) => {
        return tasks.filter(t => t.dueDate && isSameDay(parseISO(t.dueDate), day) && t.status !== 'completed').length;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Tasks</h1>
                    <p className="text-gray-400 mt-1">Plan and execute your objectives</p>
                </div>
                <Button leftIcon={<Plus className="h-4 w-4" />} onClick={handleOpenCreate}>
                    Add Task
                </Button>
            </div>

            {/* View Mode Tabs - Full Width */}
            <div className="flex items-center gap-1 p-1 bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-700/50">
                {[
                    { id: 'today', label: 'Today', icon: Calendar },
                    { id: 'week', label: 'Week', icon: CalendarDays },
                    { id: 'month', label: 'Month', icon: CalendarRange },
                    { id: 'all', label: 'All', icon: ListTodo },
                ].map(({ id, label, icon: Icon }) => (
                    <button
                        key={id}
                        onClick={() => setViewMode(id as ViewMode)}
                        className={`
                            flex-1 flex items-center justify-center gap-1.5 px-2 py-2.5 rounded-lg text-xs font-medium transition-all
                            ${viewMode === id
                                ? 'bg-gray-800 text-white shadow-lg'
                                : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                            }
                        `}
                    >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{label}</span>
                    </button>
                ))}
            </div>

            {/* Week Calendar (shown in week view) */}
            {viewMode === 'week' && (
                <Card className="p-4">
                    <div className="flex items-center justify-between mb-4">
                        <button
                            onClick={() => setSelectedDate(addDays(selectedDate, -7))}
                            className="px-3 py-1 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                        >
                            ← Prev
                        </button>
                        <span className="font-medium text-white">
                            {format(weekDays[0], 'MMM d')} – {format(weekDays[6], 'MMM d, yyyy')}
                        </span>
                        <button
                            onClick={() => setSelectedDate(addDays(selectedDate, 7))}
                            className="px-3 py-1 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                        >
                            Next →
                        </button>
                    </div>
                    <div className="grid grid-cols-7 gap-2">
                        {weekDays.map(day => {
                            const taskCount = getTaskCountForDay(day);
                            const isSelected = isSameDay(day, selectedDate);
                            return (
                                <button
                                    key={day.toISOString()}
                                    onClick={() => setSelectedDate(day)}
                                    className={`
                    flex flex-col items-center p-3 rounded-xl transition-all
                    ${isSelected
                                            ? 'bg-cyan-400/20 border border-cyan-400/50 text-cyan-400'
                                            : isToday(day)
                                                ? 'bg-gray-800 text-white'
                                                : 'hover:bg-gray-800/50 text-gray-400'
                                        }
                  `}
                                >
                                    <span className="text-xs uppercase tracking-wider opacity-60">{format(day, 'EEE')}</span>
                                    <span className="text-lg font-bold mt-1">{format(day, 'd')}</span>
                                    {taskCount > 0 && (
                                        <span className={`text-xs mt-1 ${isSelected ? 'text-cyan-400' : 'text-gray-500'}`}>
                                            {taskCount} task{taskCount !== 1 ? 's' : ''}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </Card>
            )}

            {/* Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                <Card className="flex items-center gap-3 p-4">
                    <div className="w-10 h-10 rounded-xl bg-cyan-400/10 flex items-center justify-center">
                        <ListTodo className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                        <p className="text-xl font-bold text-white">{analytics.todayCount}</p>
                        <p className="text-xs text-gray-500">Today</p>
                    </div>
                </Card>

                <Card className="flex items-center gap-3 p-4">
                    <div className="w-10 h-10 rounded-xl bg-green-400/10 flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                        <p className="text-xl font-bold text-white">{analytics.completionRate}%</p>
                        <p className="text-xs text-gray-500">Done</p>
                    </div>
                </Card>

                {analytics.overdue > 0 && (
                    <Card className="flex items-center gap-3 p-4 border-red-400/30">
                        <div className="w-10 h-10 rounded-xl bg-red-400/10 flex items-center justify-center">
                            <AlertTriangle className="w-5 h-5 text-red-400" />
                        </div>
                        <div>
                            <p className="text-xl font-bold text-red-400">{analytics.overdue}</p>
                            <p className="text-xs text-gray-500">Overdue</p>
                        </div>
                    </Card>
                )}

                <Card className="flex items-center gap-3 p-4">
                    <div className="w-10 h-10 rounded-xl bg-purple-400/10 flex items-center justify-center">
                        <Clock className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                        <p className="text-xl font-bold text-white">
                            {Math.floor(analytics.totalPlannedMinutes / 60)}h
                        </p>
                        <p className="text-xs text-gray-500">Planned</p>
                    </div>
                </Card>

                <Card className="flex items-center gap-3 p-4">
                    <div className="w-10 h-10 rounded-xl bg-orange-400/10 flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-orange-400" />
                    </div>
                    <div>
                        <p className="text-xl font-bold text-white">{analytics.timeAccuracy}%</p>
                        <p className="text-xs text-gray-500">Accuracy</p>
                    </div>
                </Card>
            </div>

            {/* Overdue Warning */}
            {overdueTasks.length > 0 && viewMode !== 'all' && (
                <Card className="border-red-400/30 bg-red-400/5">
                    <div className="flex items-center gap-3 mb-3">
                        <AlertTriangle className="w-5 h-5 text-red-400" />
                        <h3 className="font-semibold text-red-400">Overdue Tasks</h3>
                        <span className="text-xs bg-red-400/20 text-red-400 px-2 py-0.5 rounded-full">
                            {overdueTasks.length}
                        </span>
                    </div>
                    <div className="space-y-2">
                        {overdueTasks.slice(0, 3).map(task => (
                            <TaskItem
                                key={task.id}
                                task={task}
                                sector={getSector(task.sectorId)}
                                onToggle={toggleTaskStatus}
                                onStartSession={onStartSession}
                                onEdit={handleOpenEdit}
                            />
                        ))}
                        {overdueTasks.length > 3 && (
                            <button
                                onClick={() => setViewMode('all')}
                                className="text-sm text-red-400 hover:underline"
                            >
                                View all {overdueTasks.length} overdue tasks →
                            </button>
                        )}
                    </div>
                </Card>
            )}

            {/* Active Tasks */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                        {viewMode === 'today' ? "Today's Queue" : viewMode === 'week' ? 'This Week' : 'Active Tasks'}
                    </h2>
                    <span className="text-sm text-gray-500">{activeTasks.length} tasks</span>
                </div>

                {activeTasks.length === 0 ? (
                    <Card className="py-12 flex flex-col items-center justify-center text-center border-dashed border-gray-700">
                        <div className="w-16 h-16 rounded-2xl bg-gray-800 flex items-center justify-center mb-4">
                            <Target className="w-8 h-8 text-gray-600" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-300">No tasks scheduled</h3>
                        <p className="text-gray-500 mt-1 max-w-xs">
                            {viewMode === 'today'
                                ? "Add tasks for today to get started"
                                : "No tasks found for this period"
                            }
                        </p>
                        <Button className="mt-4" onClick={handleOpenCreate}>
                            <Plus className="h-4 w-4 mr-2" /> Add Task
                        </Button>
                    </Card>
                ) : (
                    <div className="space-y-2">
                        {activeTasks.map(task => (
                            <TaskItem
                                key={task.id}
                                task={task}
                                sector={getSector(task.sectorId)}
                                onToggle={toggleTaskStatus}
                                onStartSession={onStartSession}
                                onEdit={handleOpenEdit}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Completed Tasks */}
            {completedTasks.length > 0 && (
                <div className="space-y-3">
                    <h2 className="text-lg font-semibold text-gray-400 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Completed
                    </h2>
                    <div className="space-y-2 opacity-60">
                        {completedTasks.slice(0, 5).map(task => (
                            <TaskItem
                                key={task.id}
                                task={task}
                                sector={getSector(task.sectorId)}
                                onToggle={toggleTaskStatus}
                                onStartSession={onStartSession}
                                onEdit={handleOpenEdit}
                            />
                        ))}
                        {completedTasks.length > 5 && (
                            <p className="text-sm text-gray-500 text-center py-2">
                                +{completedTasks.length - 5} more completed tasks
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* Create/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingTask ? 'Edit Task' : 'New Task'}
                description="Define your objective"
                size="lg"
            >
                <div className="space-y-5">
                    <Input
                        label="What needs to be done?"
                        placeholder="Enter task description..."
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        autoFocus
                    />

                    {/* Due Date */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Due Date</label>
                        <input
                            type="date"
                            value={formData.dueDate}
                            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                            className="w-full h-11 px-4 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50"
                        />
                    </div>

                    {/* Sector Selection */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Sector</label>
                        <div className="grid grid-cols-2 gap-2">
                            {sectors.map(sector => (
                                <button
                                    key={sector.id}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, sectorId: sector.id })}
                                    className={`
                    flex items-center gap-3 p-3 rounded-xl transition-all text-left
                    ${formData.sectorId === sector.id
                                            ? 'bg-gray-800 border-2'
                                            : 'bg-gray-800/50 border border-gray-700/50 hover:border-gray-600'
                                        }
                  `}
                                    style={formData.sectorId === sector.id ? {
                                        borderColor: sector.color,
                                        boxShadow: `0 0 10px ${sector.color}20`
                                    } : {}}
                                >
                                    <span className="text-xl">{sector.icon}</span>
                                    <span className="font-medium text-white">{sector.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Time & Energy Row */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* Time Estimate */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Time</label>
                            <div className="flex flex-wrap gap-2">
                                {TIME_PRESETS.map(mins => (
                                    <button
                                        key={mins}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, estimatedMinutes: mins })}
                                        className={`
                      px-3 py-2 rounded-lg text-sm font-medium transition-all
                      ${formData.estimatedMinutes === mins
                                                ? 'bg-cyan-400 text-gray-900'
                                                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                            }
                    `}
                                    >
                                        {mins < 60 ? `${mins}m` : `${mins / 60}h`}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Energy Level */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Energy</label>
                            <div className="flex gap-2">
                                {ENERGY_LEVELS.map(({ value, label, icon }) => (
                                    <button
                                        key={value}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, energyRequired: value })}
                                        className={`
                      flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-sm transition-all
                      ${formData.energyRequired === value
                                                ? 'bg-cyan-400 text-gray-900'
                                                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                            }
                    `}
                                        title={label}
                                    >
                                        <span>{icon}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Priority */}
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <label className="text-sm font-medium text-gray-300">Strategic Weight</label>
                            <span className="text-sm text-cyan-400 font-medium">
                                {formData.strategicWeight === 5 ? 'Critical' : formData.strategicWeight >= 4 ? 'High' : formData.strategicWeight >= 3 ? 'Normal' : 'Low'}
                            </span>
                        </div>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map(w => (
                                <button
                                    key={w}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, strategicWeight: w })}
                                    className={`
                    flex-1 h-10 rounded-lg font-bold transition-all
                    ${formData.strategicWeight >= w
                                            ? 'bg-gradient-to-r from-cyan-400 to-cyan-500 text-gray-900'
                                            : 'bg-gray-800 text-gray-500 hover:bg-gray-700'
                                        }
                  `}
                                >
                                    {w}
                                </button>
                            ))}
                        </div>
                    </div>

                    <ModalFooter>
                        {editingTask && (
                            <Button
                                variant="danger"
                                onClick={() => { deleteTask(editingTask.id); setIsModalOpen(false); }}
                                className="mr-auto"
                            >
                                Delete
                            </Button>
                        )}
                        <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave}>
                            {editingTask ? 'Save Changes' : 'Create Task'}
                        </Button>
                    </ModalFooter>
                </div>
            </Modal>
        </div>
    );
};
