import React from 'react';
import { CheckCircle2, Circle, Clock, PlayCircle, ChevronRight } from 'lucide-react';
import type { Task, Sector } from '../../lib/types';
import { cn } from '../../lib/utils';
import { Button } from '../../components/ui/Button';

interface TaskItemProps {
    task: Task;
    sector?: Sector;
    onToggle: (id: string) => void;
    onStartSession: (task: Task) => void;
    onEdit: (task: Task) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task, sector, onToggle, onStartSession, onEdit }) => {
    const isCompleted = task.status === 'completed';

    // Priority indicator
    const priorityColors = {
        1: 'bg-gray-600',
        2: 'bg-gray-500',
        3: 'bg-blue-500',
        4: 'bg-orange-500',
        5: 'bg-red-500',
    };

    return (
        <div
            className={cn(
                `
        group relative
        flex items-center gap-4 p-4
        bg-gray-900/40 backdrop-blur-sm
        border border-gray-800/50 rounded-xl
        hover:bg-gray-800/50 hover:border-gray-700/50
        transition-all duration-200
        cursor-pointer
        `,
                isCompleted && 'opacity-50'
            )}
            onClick={() => onEdit(task)}
        >
            {/* Priority Bar */}
            <div
                className={cn(
                    'absolute left-0 top-0 bottom-0 w-1 rounded-l-xl',
                    priorityColors[task.strategicWeight as keyof typeof priorityColors]
                )}
            />

            {/* Checkbox */}
            <button
                onClick={(e) => { e.stopPropagation(); onToggle(task.id); }}
                className={cn(
                    'flex-shrink-0 transition-all duration-200',
                    isCompleted ? 'text-cyan-400' : 'text-gray-600 hover:text-gray-400'
                )}
            >
                {isCompleted ? (
                    <CheckCircle2 className="h-6 w-6" />
                ) : (
                    <Circle className="h-6 w-6" />
                )}
            </button>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <h4 className={cn(
                    'font-medium text-white truncate',
                    isCompleted && 'line-through text-gray-400'
                )}>
                    {task.title}
                </h4>
                <div className="flex items-center gap-3 mt-1 text-sm">
                    {sector && (
                        <span
                            className="flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium"
                            style={{
                                backgroundColor: `${sector.color}15`,
                                color: sector.color
                            }}
                        >
                            <span>{sector.icon}</span>
                            {sector.name}
                        </span>
                    )}
                    <span className="flex items-center gap-1 text-gray-500">
                        <Clock className="h-3.5 w-3.5" />
                        {task.estimatedMinutes}m
                    </span>
                    {task.strategicWeight >= 4 && (
                        <span className="flex items-center gap-1 text-orange-400 text-xs font-medium">
                            ⚡ High Impact
                        </span>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {!isCompleted && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); onStartSession(task); }}
                        className="gap-1.5"
                    >
                        <PlayCircle className="h-4 w-4" />
                        Focus
                    </Button>
                )}
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
};
