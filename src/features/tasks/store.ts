import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Task, TaskId, TaskStatus } from '../../lib/types';
import { generateId } from '../../lib/utils';
import { startOfDay, startOfWeek, startOfMonth, endOfWeek, endOfMonth, isWithinInterval, parseISO, isSameDay } from 'date-fns';

interface TasksState {
    tasks: Task[];

    // CRUD
    addTask: (task: Omit<Task, 'id' | 'status' | 'createdAt'>) => void;
    updateTask: (id: TaskId, updates: Partial<Task>) => void;
    deleteTask: (id: TaskId) => void;

    // Status
    toggleTaskStatus: (id: TaskId) => void;
    setTaskStatus: (id: TaskId, status: TaskStatus) => void;

    // Bulk operations
    completeTasks: (ids: TaskId[]) => void;
    deleteTasks: (ids: TaskId[]) => void;

    // Filtering
    getTasksForDate: (date: Date) => Task[];
    getTasksForWeek: (date: Date) => Task[];
    getTasksForMonth: (date: Date) => Task[];
    getTasksBySector: (sectorId: string) => Task[];
    getTasksByProject: (projectId: string) => Task[];
    getOverdueTasks: () => Task[];
    getUpcomingTasks: (days: number) => Task[];

    // Analytics helpers
    getCompletedTasksInRange: (start: Date, end: Date) => Task[];
    getTaskStats: () => {
        total: number;
        completed: number;
        overdue: number;
        todayCount: number;
        completionRate: number;
    };

    // Templates
    createFromTemplate: (templateId: TaskId, overrides?: Partial<Task>) => void;
    saveAsTemplate: (taskId: TaskId, templateName: string) => void;
    getTemplates: () => Task[];
}

export const useTasksStore = create<TasksState>()(
    persist(
        (set, get) => ({
            tasks: [],

            // ===== CRUD =====
            addTask: (taskData) => set((state) => ({
                tasks: [...state.tasks, {
                    ...taskData,
                    id: generateId(),
                    status: 'planned',
                    createdAt: new Date().toISOString(),
                    energyRequired: taskData.energyRequired || 'medium',
                    strategicWeight: taskData.strategicWeight || 3,
                } as Task]
            })),

            updateTask: (id, updates) => set((state) => ({
                tasks: state.tasks.map(task =>
                    task.id === id ? { ...task, ...updates } : task
                )
            })),

            deleteTask: (id) => set((state) => ({
                tasks: state.tasks.filter(task => task.id !== id)
            })),

            // ===== Status =====
            toggleTaskStatus: (id) => set((state) => ({
                tasks: state.tasks.map(task =>
                    task.id === id
                        ? {
                            ...task,
                            status: task.status === 'completed' ? 'planned' : 'completed',
                            completedAt: task.status !== 'completed' ? new Date().toISOString() : undefined
                        }
                        : task
                )
            })),

            setTaskStatus: (id, status) => set((state) => ({
                tasks: state.tasks.map(task =>
                    task.id === id
                        ? {
                            ...task,
                            status,
                            startedAt: status === 'in-progress' && !task.startedAt ? new Date().toISOString() : task.startedAt,
                            completedAt: status === 'completed' ? new Date().toISOString() : undefined
                        }
                        : task
                )
            })),

            // ===== Bulk Operations =====
            completeTasks: (ids) => set((state) => ({
                tasks: state.tasks.map(task =>
                    ids.includes(task.id)
                        ? { ...task, status: 'completed', completedAt: new Date().toISOString() }
                        : task
                )
            })),

            deleteTasks: (ids) => set((state) => ({
                tasks: state.tasks.filter(task => !ids.includes(task.id))
            })),

            // ===== Filtering =====
            getTasksForDate: (date) => {
                const { tasks } = get();
                return tasks.filter(task => {
                    if (!task.dueDate) return isSameDay(date, new Date()); // Tasks without due date show on today
                    return isSameDay(parseISO(task.dueDate), date);
                }).filter(t => !t.isTemplate);
            },

            getTasksForWeek: (date) => {
                const { tasks } = get();
                const weekStart = startOfWeek(date, { weekStartsOn: 1 });
                const weekEnd = endOfWeek(date, { weekStartsOn: 1 });

                return tasks.filter(task => {
                    if (!task.dueDate) return false;
                    const dueDate = parseISO(task.dueDate);
                    return isWithinInterval(dueDate, { start: weekStart, end: weekEnd });
                }).filter(t => !t.isTemplate);
            },

            getTasksForMonth: (date) => {
                const { tasks } = get();
                const monthStart = startOfMonth(date);
                const monthEnd = endOfMonth(date);

                return tasks.filter(task => {
                    if (!task.dueDate) return false;
                    const dueDate = parseISO(task.dueDate);
                    return isWithinInterval(dueDate, { start: monthStart, end: monthEnd });
                }).filter(t => !t.isTemplate);
            },

            getTasksBySector: (sectorId) => {
                const { tasks } = get();
                return tasks.filter(task => task.sectorId === sectorId && !task.isTemplate);
            },

            getTasksByProject: (projectId) => {
                const { tasks } = get();
                return tasks.filter(task => task.projectId === projectId && !task.isTemplate);
            },

            getOverdueTasks: () => {
                const { tasks } = get();
                const today = startOfDay(new Date());

                return tasks.filter(task => {
                    if (task.status === 'completed' || task.status === 'cancelled') return false;
                    if (!task.dueDate) return false;
                    return parseISO(task.dueDate) < today;
                }).filter(t => !t.isTemplate);
            },

            getUpcomingTasks: (days) => {
                const { tasks } = get();
                const today = startOfDay(new Date());
                const futureDate = new Date(today);
                futureDate.setDate(futureDate.getDate() + days);

                return tasks.filter(task => {
                    if (task.status === 'completed' || task.status === 'cancelled') return false;
                    if (!task.dueDate) return false;
                    const dueDate = parseISO(task.dueDate);
                    return isWithinInterval(dueDate, { start: today, end: futureDate });
                }).filter(t => !t.isTemplate).sort((a, b) =>
                    new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime()
                );
            },

            // ===== Analytics =====
            getCompletedTasksInRange: (start, end) => {
                const { tasks } = get();
                return tasks.filter(task => {
                    if (!task.completedAt) return false;
                    const completed = parseISO(task.completedAt);
                    return isWithinInterval(completed, { start, end });
                });
            },

            getTaskStats: () => {
                const { tasks, getOverdueTasks, getTasksForDate } = get();
                const activeTasks = tasks.filter(t => !t.isTemplate);
                const completed = activeTasks.filter(t => t.status === 'completed').length;
                const overdue = getOverdueTasks().length;
                const todayCount = getTasksForDate(new Date()).length;

                return {
                    total: activeTasks.length,
                    completed,
                    overdue,
                    todayCount,
                    completionRate: activeTasks.length > 0 ? Math.round((completed / activeTasks.length) * 100) : 0
                };
            },

            // ===== Templates =====
            createFromTemplate: (templateId, overrides) => {
                const { tasks, addTask } = get();
                const template = tasks.find(t => t.id === templateId && t.isTemplate);
                if (!template) return;

                const { id, isTemplate, templateName, createdAt, completedAt, status, ...taskData } = template;
                addTask({
                    ...taskData,
                    ...overrides,
                    dueDate: overrides?.dueDate || new Date().toISOString().split('T')[0],
                });
            },

            saveAsTemplate: (taskId, templateName) => set((state) => {
                const task = state.tasks.find(t => t.id === taskId);
                if (!task) return state;

                const template: Task = {
                    ...task,
                    id: generateId(),
                    isTemplate: true,
                    templateName,
                    status: 'planned',
                    completedAt: undefined,
                    dueDate: undefined,
                };

                return { tasks: [...state.tasks, template] };
            }),

            getTemplates: () => {
                const { tasks } = get();
                return tasks.filter(t => t.isTemplate);
            },
        }),
        {
            name: 'strategist-tasks',
        }
    )
);
