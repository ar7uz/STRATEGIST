import { useState } from 'react';
import {
    Shield,
    Database,
    Download,
    AlertTriangle,
    CheckCircle,
    Clock,
    Target,
    Flame,
    FileText
} from 'lucide-react';
import { useTasksStore } from '../tasks/store';
import { useSectorsStore } from '../sectors/store';
import { useHabitsStore } from '../habits/store';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';

export const AdminView = () => {
    const tasks = useTasksStore(state => state.tasks);
    const sectors = useSectorsStore(state => state.sectors);
    const habits = useHabitsStore(state => state.habits);
    const deleteTasks = useTasksStore(state => state.deleteTasks);

    const [confirmAction, setConfirmAction] = useState<string | null>(null);
    const [actionResult, setActionResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    // Stats
    const completedTasks = tasks.filter(t => t.status === 'completed' && !t.isTemplate);
    const activeTasks = tasks.filter(t => t.status !== 'completed' && !t.isTemplate);
    const templates = tasks.filter(t => t.isTemplate);
    const totalFocusMinutes = completedTasks.reduce((acc, t) => acc + (t.actualMinutes || t.estimatedMinutes || 0), 0);

    // Storage usage
    const getStorageSize = () => {
        let total = 0;
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key?.startsWith('strategist-')) {
                total += (localStorage.getItem(key) || '').length;
            }
        }
        return (total / 1024).toFixed(2);
    };

    const handleClearCompleted = () => {
        const completedIds = completedTasks.map(t => t.id);
        deleteTasks(completedIds);
        setActionResult({ type: 'success', message: `Cleared ${completedIds.length} completed tasks` });
        setConfirmAction(null);
    };

    const handleClearAllTasks = () => {
        const allIds = tasks.filter(t => !t.isTemplate).map(t => t.id);
        deleteTasks(allIds);
        setActionResult({ type: 'success', message: `Deleted all ${allIds.length} tasks` });
        setConfirmAction(null);
    };

    const handleResetAllData = () => {
        const keys: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key?.startsWith('strategist-')) {
                keys.push(key);
            }
        }
        keys.forEach(key => localStorage.removeItem(key));
        setActionResult({ type: 'success', message: 'All data cleared. Refresh to start fresh.' });
        setConfirmAction(null);
    };

    const exportFullBackup = () => {
        const backup: Record<string, unknown> = {
            exportDate: new Date().toISOString(),
            version: '1.0.0',
            data: {}
        };

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key?.startsWith('strategist-')) {
                const value = localStorage.getItem(key);
                if (value) {
                    try {
                        (backup.data as Record<string, unknown>)[key] = JSON.parse(value);
                    } catch {
                        (backup.data as Record<string, unknown>)[key] = value;
                    }
                }
            }
        }

        const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `strategist-full-backup-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setActionResult({ type: 'success', message: 'Backup downloaded successfully' });
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                    <Shield className="w-7 h-7 text-white" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-white">Admin Panel</h1>
                    <p className="text-gray-400 mt-1">System overview and data management</p>
                </div>
            </div>

            {/* Action Result */}
            {actionResult && (
                <div className={cn(
                    "flex items-center gap-3 p-4 rounded-xl",
                    actionResult.type === 'success' ? "bg-green-400/10 border border-green-400/30" : "bg-red-400/10 border border-red-400/30"
                )}>
                    {actionResult.type === 'success' ? (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : (
                        <AlertTriangle className="w-5 h-5 text-red-400" />
                    )}
                    <span className={actionResult.type === 'success' ? "text-green-400" : "text-red-400"}>
                        {actionResult.message}
                    </span>
                    <button
                        onClick={() => setActionResult(null)}
                        className="ml-auto text-gray-500 hover:text-white"
                    >
                        ×
                    </button>
                </div>
            )}

            {/* Stats Overview - Compact */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Card className="text-center py-4">
                    <div className="w-10 h-10 mx-auto rounded-xl bg-cyan-400/10 flex items-center justify-center mb-2">
                        <Target className="w-5 h-5 text-cyan-400" />
                    </div>
                    <p className="text-2xl font-bold text-white">{tasks.filter(t => !t.isTemplate).length}</p>
                    <p className="text-xs text-gray-500">Total Tasks</p>
                </Card>

                <Card className="text-center py-4">
                    <div className="w-10 h-10 mx-auto rounded-xl bg-green-400/10 flex items-center justify-center mb-2">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                    </div>
                    <p className="text-2xl font-bold text-white">{completedTasks.length}</p>
                    <p className="text-xs text-gray-500">Completed</p>
                </Card>

                <Card className="text-center py-4">
                    <div className="w-10 h-10 mx-auto rounded-xl bg-orange-400/10 flex items-center justify-center mb-2">
                        <Flame className="w-5 h-5 text-orange-400" />
                    </div>
                    <p className="text-2xl font-bold text-white">{habits.length}</p>
                    <p className="text-xs text-gray-500">Habits</p>
                </Card>

                <Card className="text-center py-4">
                    <div className="w-10 h-10 mx-auto rounded-xl bg-purple-400/10 flex items-center justify-center mb-2">
                        <Clock className="w-5 h-5 text-purple-400" />
                    </div>
                    <p className="text-2xl font-bold text-white">{Math.round(totalFocusMinutes / 60)}h</p>
                    <p className="text-xs text-gray-500">Focus Time</p>
                </Card>
            </div>

            {/* Detailed Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Tasks Breakdown */}
                <Card variant="elevated">
                    <div className="flex items-center gap-3 mb-4">
                        <FileText className="w-5 h-5 text-cyan-400" />
                        <h3 className="font-semibold text-white">Tasks Breakdown</h3>
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center py-2 border-b border-gray-800">
                            <span className="text-gray-400">Active Tasks</span>
                            <span className="font-medium text-white">{activeTasks.length}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-800">
                            <span className="text-gray-400">Completed Tasks</span>
                            <span className="font-medium text-green-400">{completedTasks.length}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-800">
                            <span className="text-gray-400">Templates</span>
                            <span className="font-medium text-purple-400">{templates.length}</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                            <span className="text-gray-400">Sectors</span>
                            <span className="font-medium text-white">{sectors.length}</span>
                        </div>
                    </div>
                </Card>

                {/* Storage */}
                <Card variant="elevated">
                    <div className="flex items-center gap-3 mb-4">
                        <Database className="w-5 h-5 text-purple-400" />
                        <h3 className="font-semibold text-white">Storage Usage</h3>
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center py-2 border-b border-gray-800">
                            <span className="text-gray-400">Local Storage Used</span>
                            <span className="font-medium text-white">{getStorageSize()} KB</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-800">
                            <span className="text-gray-400">Data Keys</span>
                            <span className="font-medium text-white">
                                {Array.from({ length: localStorage.length }, (_, i) => localStorage.key(i))
                                    .filter(k => k?.startsWith('strategist-')).length}
                            </span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                            <span className="text-gray-400">Last Backup</span>
                            <span className="font-medium text-gray-500">Never</span>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Danger Zone */}
            <Card variant="elevated" className="border-red-400/20">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-red-400/10 flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5 text-red-400" />
                    </div>
                    <div>
                        <h2 className="font-semibold text-red-400">Danger Zone</h2>
                        <p className="text-sm text-gray-500">Destructive actions - be careful!</p>
                    </div>
                </div>

                <div className="space-y-4">
                    {/* Clear Completed */}
                    <div className="flex items-center justify-between py-3 border-b border-gray-800">
                        <div>
                            <p className="font-medium text-white">Clear Completed Tasks</p>
                            <p className="text-sm text-gray-500">Remove {completedTasks.length} completed tasks from history</p>
                        </div>
                        {confirmAction === 'clearCompleted' ? (
                            <div className="flex gap-2">
                                <Button size="sm" variant="ghost" onClick={() => setConfirmAction(null)}>Cancel</Button>
                                <Button size="sm" variant="danger" onClick={handleClearCompleted}>Confirm</Button>
                            </div>
                        ) : (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setConfirmAction('clearCompleted')}
                                disabled={completedTasks.length === 0}
                            >
                                Clear
                            </Button>
                        )}
                    </div>

                    {/* Clear All Tasks */}
                    <div className="flex items-center justify-between py-3 border-b border-gray-800">
                        <div>
                            <p className="font-medium text-white">Delete All Tasks</p>
                            <p className="text-sm text-gray-500">Remove all tasks (keeps sectors and habits)</p>
                        </div>
                        {confirmAction === 'clearTasks' ? (
                            <div className="flex gap-2">
                                <Button size="sm" variant="ghost" onClick={() => setConfirmAction(null)}>Cancel</Button>
                                <Button size="sm" variant="danger" onClick={handleClearAllTasks}>Confirm</Button>
                            </div>
                        ) : (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setConfirmAction('clearTasks')}
                                disabled={tasks.length === 0}
                            >
                                Delete All
                            </Button>
                        )}
                    </div>

                    {/* Factory Reset */}
                    <div className="flex items-center justify-between py-3">
                        <div>
                            <p className="font-medium text-red-400">Factory Reset</p>
                            <p className="text-sm text-gray-500">Erase ALL data and start fresh</p>
                        </div>
                        {confirmAction === 'reset' ? (
                            <div className="flex gap-2">
                                <Button size="sm" variant="ghost" onClick={() => setConfirmAction(null)}>Cancel</Button>
                                <Button size="sm" variant="danger" onClick={handleResetAllData}>CONFIRM RESET</Button>
                            </div>
                        ) : (
                            <Button
                                variant="danger"
                                size="sm"
                                onClick={() => setConfirmAction('reset')}
                            >
                                Reset All
                            </Button>
                        )}
                    </div>
                </div>
            </Card>

            {/* Backup */}
            <Card variant="elevated">
                <div className="flex items-center gap-3 mb-4">
                    <Download className="w-5 h-5 text-green-400" />
                    <h3 className="font-semibold text-white">Create Full Backup</h3>
                </div>
                <p className="text-gray-400 text-sm mb-4">
                    Download a complete backup of all your data including tasks, sectors, habits, and settings.
                </p>
                <Button onClick={exportFullBackup} leftIcon={<Download className="w-4 h-4" />}>
                    Download Full Backup
                </Button>
            </Card>
        </div>
    );
};
