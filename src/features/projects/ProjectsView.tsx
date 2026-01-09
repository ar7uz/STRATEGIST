import { useState, useMemo } from 'react';
import { useProjectsStore } from './store';
import type { Goal, Project } from './store';
import { useTasksStore } from '../tasks/store';
import { useSectorsStore } from '../sectors/store';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal, ModalFooter } from '../../components/ui/Modal';
import { Input, Textarea } from '../../components/ui/Input';
import { cn } from '../../lib/utils';
import { format, differenceInDays, isPast, parseISO } from 'date-fns';
import {
    Plus,
    Target,
    ChevronRight,
    CheckCircle,
    Trash2,
    Edit,
    Calendar,
    Clock,
    TrendingUp,
    ListTodo,
    AlertTriangle,
    Pause,
    Play,
    BarChart3
} from 'lucide-react';

const GOAL_ICONS = ['🎯', '🚀', '💡', '📊', '⭐', '🔥', '💪', '🏆', '🎨', '📚', '💼', '🏠', '❤️', '🧠'];
const PROJECT_ICONS = ['📁', '🗂️', '📋', '🔧', '💻', '🎮', '✈️', '🏠', '💰', '❤️', '📱', '🛒', '📸', '🎬'];

export const ProjectsView = () => {
    const { goals, projects, addGoal, addProject, updateGoal, updateProject, deleteGoal, deleteProject, completeGoal, completeProject, getProjectsByGoal, getGoalProgress } = useProjectsStore();
    const { tasks } = useTasksStore();
    const { sectors } = useSectorsStore();

    const [showGoalModal, setShowGoalModal] = useState(false);
    const [showProjectModal, setShowProjectModal] = useState(false);
    const [showProjectDetails, setShowProjectDetails] = useState<string | null>(null);
    const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [expandedGoals, setExpandedGoals] = useState<Set<string>>(new Set());
    const [viewMode, setViewMode] = useState<'hierarchy' | 'timeline' | 'kanban'>('hierarchy');
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed'>('all');

    const [goalForm, setGoalForm] = useState({
        name: '',
        description: '',
        sectorId: sectors[0]?.id || '',
        targetDate: '',
        icon: '🎯',
        color: '#00D4AA'
    });

    const [projectForm, setProjectForm] = useState<{
        name: string;
        description: string;
        goalId: string;
        sectorId: string;
        dueDate: string;
        priority: 'low' | 'medium' | 'high';
        icon: string;
        color: string;
    }>({
        name: '',
        description: '',
        goalId: '',
        sectorId: sectors[0]?.id || '',
        dueDate: '',
        priority: 'medium',
        icon: '📁',
        color: '#A855F7'
    });

    // Filter goals based on status
    const filteredGoals = useMemo(() => {
        if (filterStatus === 'all') return goals;
        if (filterStatus === 'active') return goals.filter(g => g.status === 'active');
        return goals.filter(g => g.status === 'completed');
    }, [goals, filterStatus]);

    const activeGoals = goals.filter(g => g.status === 'active');
    const activeProjects = projects.filter(p => p.status === 'active');

    // Calculate overall progress
    const overallProgress = useMemo(() => {
        if (activeGoals.length === 0) return 0;
        const totalProgress = activeGoals.reduce((acc, goal) => {
            const progress = getGoalProgress(goal.id);
            return acc + progress.percentage;
        }, 0);
        return Math.round(totalProgress / activeGoals.length);
    }, [activeGoals, getGoalProgress]);

    // Get upcoming deadlines
    const upcomingDeadlines = useMemo(() => {
        const now = new Date();
        return projects
            .filter(p => p.status === 'active' && p.dueDate)
            .map(p => ({
                ...p,
                daysLeft: differenceInDays(parseISO(p.dueDate!), now),
                isOverdue: isPast(parseISO(p.dueDate!))
            }))
            .filter(p => p.daysLeft <= 14 || p.isOverdue)
            .sort((a, b) => a.daysLeft - b.daysLeft)
            .slice(0, 5);
    }, [projects]);

    const toggleGoalExpand = (goalId: string) => {
        setExpandedGoals(prev => {
            const next = new Set(prev);
            if (next.has(goalId)) {
                next.delete(goalId);
            } else {
                next.add(goalId);
            }
            return next;
        });
    };

    const handleSaveGoal = () => {
        if (!goalForm.name.trim()) return;

        if (editingGoal) {
            updateGoal(editingGoal.id, goalForm);
        } else {
            addGoal(goalForm);
        }

        setShowGoalModal(false);
        setEditingGoal(null);
        setGoalForm({ name: '', description: '', sectorId: sectors[0]?.id || '', targetDate: '', icon: '🎯', color: '#00D4AA' });
    };

    const handleSaveProject = () => {
        if (!projectForm.name.trim()) return;

        if (editingProject) {
            updateProject(editingProject.id, projectForm);
        } else {
            addProject(projectForm);
        }

        setShowProjectModal(false);
        setEditingProject(null);
        setProjectForm({ name: '', description: '', goalId: '', sectorId: sectors[0]?.id || '', dueDate: '', priority: 'medium', icon: '📁', color: '#A855F7' });
    };

    const openGoalModal = (goal?: Goal) => {
        if (goal) {
            setEditingGoal(goal);
            setGoalForm({
                name: goal.name,
                description: goal.description || '',
                sectorId: goal.sectorId,
                targetDate: goal.targetDate || '',
                icon: goal.icon,
                color: goal.color
            });
        }
        setShowGoalModal(true);
    };

    const openProjectModal = (goalId?: string, project?: Project) => {
        if (project) {
            setEditingProject(project);
            setProjectForm({
                name: project.name,
                description: project.description || '',
                goalId: project.goalId || '',
                sectorId: project.sectorId,
                dueDate: project.dueDate || '',
                priority: project.priority,
                icon: project.icon,
                color: project.color
            });
        } else if (goalId) {
            setProjectForm(prev => ({ ...prev, goalId }));
        }
        setShowProjectModal(true);
    };

    const getTasksForProject = (projectId: string) => {
        return tasks.filter(t => t.projectId === projectId && !t.isTemplate);
    };

    const toggleProjectStatus = (project: Project) => {
        if (project.status === 'active') {
            updateProject(project.id, { status: 'on-hold' });
        } else if (project.status === 'on-hold') {
            updateProject(project.id, { status: 'active' });
        }
    };

    const selectedProject = showProjectDetails ? projects.find(p => p.id === showProjectDetails) : null;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <Target className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white">Goals & Projects</h1>
                        <p className="text-gray-400 mt-1">Organize your objectives hierarchically</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => openProjectModal()} leftIcon={<Plus className="w-4 h-4" />}>
                        New Project
                    </Button>
                    <Button onClick={() => openGoalModal()} leftIcon={<Plus className="w-4 h-4" />}>
                        New Goal
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="text-center py-5">
                    <p className="text-3xl font-bold text-white">{activeGoals.length}</p>
                    <p className="text-xs text-gray-500 mt-1">Active Goals</p>
                </Card>
                <Card className="text-center py-5">
                    <p className="text-3xl font-bold text-purple-400">{activeProjects.length}</p>
                    <p className="text-xs text-gray-500 mt-1">Active Projects</p>
                </Card>
                <Card className="text-center py-5">
                    <div className="flex items-center justify-center gap-2">
                        <TrendingUp className="w-5 h-5 text-cyan-400" />
                        <p className="text-3xl font-bold text-cyan-400">{overallProgress}%</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Overall Progress</p>
                </Card>
                <Card className="text-center py-5">
                    <p className="text-3xl font-bold text-green-400">{goals.filter(g => g.status === 'completed').length}</p>
                    <p className="text-xs text-gray-500 mt-1">Goals Achieved</p>
                </Card>
            </div>

            {/* Upcoming Deadlines */}
            {upcomingDeadlines.length > 0 && (
                <Card className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-500/20">
                    <div className="flex items-center gap-2 mb-4">
                        <AlertTriangle className="w-5 h-5 text-orange-400" />
                        <h3 className="font-semibold text-white">Upcoming Deadlines</h3>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        {upcomingDeadlines.map(project => (
                            <button
                                key={project.id}
                                onClick={() => setShowProjectDetails(project.id)}
                                className={cn(
                                    "flex items-center gap-2 px-3 py-2 rounded-lg transition-colors",
                                    project.isOverdue ? "bg-red-500/20 text-red-400" : "bg-orange-500/20 text-orange-300"
                                )}
                            >
                                <span>{project.icon}</span>
                                <span className="text-sm font-medium">{project.name}</span>
                                <span className="text-xs px-2 py-0.5 rounded bg-black/20">
                                    {project.isOverdue ? 'Overdue' : `${project.daysLeft}d left`}
                                </span>
                            </button>
                        ))}
                    </div>
                </Card>
            )}

            {/* View Mode & Filters */}
            <div className="flex items-center justify-between">
                <div className="flex gap-2">
                    {(['all', 'active', 'completed'] as const).map(status => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={cn(
                                "px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors",
                                filterStatus === status
                                    ? "bg-cyan-400 text-gray-900"
                                    : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                            )}
                        >
                            {status}
                        </button>
                    ))}
                </div>
                <div className="flex gap-1 bg-gray-800 rounded-lg p-1">
                    {[
                        { id: 'hierarchy', icon: ListTodo },
                        { id: 'timeline', icon: Calendar },
                        { id: 'kanban', icon: BarChart3 }
                    ].map(({ id, icon: Icon }) => (
                        <button
                            key={id}
                            onClick={() => setViewMode(id as any)}
                            className={cn(
                                "p-2 rounded-lg transition-colors",
                                viewMode === id ? "bg-gray-700 text-white" : "text-gray-500 hover:text-white"
                            )}
                        >
                            <Icon className="w-4 h-4" />
                        </button>
                    ))}
                </div>
            </div>

            {/* Goals List */}
            <div className="space-y-4">
                {filteredGoals.length === 0 ? (
                    <Card className="text-center py-12">
                        <Target className="w-12 h-12 mx-auto text-gray-600 mb-4" />
                        <h3 className="text-lg font-semibold text-gray-400">No Goals Yet</h3>
                        <p className="text-gray-500 mt-1 mb-4">Define your big-picture objectives</p>
                        <Button onClick={() => openGoalModal()} leftIcon={<Plus className="w-4 h-4" />}>
                            Create Your First Goal
                        </Button>
                    </Card>
                ) : (
                    filteredGoals.map(goal => {
                        const progress = getGoalProgress(goal.id);
                        const goalProjects = getProjectsByGoal(goal.id);
                        const isExpanded = expandedGoals.has(goal.id);
                        const sector = sectors.find(s => s.id === goal.sectorId);

                        return (
                            <Card key={goal.id} variant="elevated" className="overflow-hidden">
                                {/* Goal Header */}
                                <div className="flex items-center gap-4 p-4">
                                    <button
                                        onClick={() => toggleGoalExpand(goal.id)}
                                        className="flex items-center gap-3 flex-1 text-left"
                                    >
                                        <div
                                            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                                            style={{ backgroundColor: `${goal.color}20` }}
                                        >
                                            {goal.icon}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold text-white truncate">{goal.name}</h3>
                                                {goal.status === 'completed' && (
                                                    <span className="px-2 py-0.5 rounded bg-green-400/20 text-green-400 text-xs">Done</span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                                <span style={{ color: sector?.color }}>{sector?.name}</span>
                                                <span>•</span>
                                                <span>{progress.completed}/{progress.total} projects</span>
                                                {goal.targetDate && (
                                                    <>
                                                        <span>•</span>
                                                        <Calendar className="w-3 h-3" />
                                                        <span>{format(parseISO(goal.targetDate), 'MMM d, yyyy')}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <ChevronRight className={cn(
                                            "w-5 h-5 text-gray-500 transition-transform",
                                            isExpanded && "rotate-90"
                                        )} />
                                    </button>

                                    {/* Progress */}
                                    <div className="w-28">
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="text-gray-500">Progress</span>
                                            <span className="text-cyan-400">{progress.percentage}%</span>
                                        </div>
                                        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all bg-gradient-to-r from-cyan-400 to-green-400"
                                                style={{ width: `${progress.percentage}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => openProjectModal(goal.id)}
                                            className="p-2 rounded-lg text-gray-500 hover:bg-gray-800 hover:text-white"
                                            title="Add Project"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => openGoalModal(goal)}
                                            className="p-2 rounded-lg text-gray-500 hover:bg-gray-800 hover:text-white"
                                            title="Edit Goal"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        {goal.status !== 'completed' && (
                                            <button
                                                onClick={() => completeGoal(goal.id)}
                                                className="p-2 rounded-lg text-gray-500 hover:bg-green-400/20 hover:text-green-400"
                                                title="Complete Goal"
                                            >
                                                <CheckCircle className="w-4 h-4" />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => {
                                                if (confirm('Delete this goal and all its projects?')) {
                                                    deleteGoal(goal.id);
                                                }
                                            }}
                                            className="p-2 rounded-lg text-gray-500 hover:bg-red-400/20 hover:text-red-400"
                                            title="Delete Goal"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Description */}
                                {goal.description && isExpanded && (
                                    <div className="px-4 pb-3 text-sm text-gray-400">
                                        {goal.description}
                                    </div>
                                )}

                                {/* Projects */}
                                {isExpanded && (
                                    <div className="border-t border-gray-800 bg-gray-900/50">
                                        {goalProjects.length === 0 ? (
                                            <div className="p-4 text-center text-gray-500">
                                                <p className="text-sm">No projects yet</p>
                                                <button
                                                    onClick={() => openProjectModal(goal.id)}
                                                    className="text-cyan-400 text-sm mt-1 hover:underline"
                                                >
                                                    + Add first project
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="p-2 space-y-1">
                                                {goalProjects.map(project => {
                                                    const projectTasks = getTasksForProject(project.id);
                                                    const completedTasks = projectTasks.filter(t => t.status === 'completed').length;
                                                    const taskProgress = projectTasks.length > 0
                                                        ? Math.round((completedTasks / projectTasks.length) * 100)
                                                        : 0;
                                                    const daysLeft = project.dueDate
                                                        ? differenceInDays(parseISO(project.dueDate), new Date())
                                                        : null;

                                                    return (
                                                        <div
                                                            key={project.id}
                                                            onClick={() => setShowProjectDetails(project.id)}
                                                            className={cn(
                                                                "flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800/50 group cursor-pointer",
                                                                project.status === 'on-hold' && "opacity-60"
                                                            )}
                                                        >
                                                            <div
                                                                className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                                                                style={{ backgroundColor: `${project.color}20` }}
                                                            >
                                                                {project.icon}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2">
                                                                    <p className="text-sm font-medium text-white truncate">{project.name}</p>
                                                                    {project.status === 'on-hold' && (
                                                                        <span className="px-1.5 py-0.5 rounded bg-yellow-400/20 text-yellow-400 text-[10px]">Paused</span>
                                                                    )}
                                                                    {project.status === 'completed' && (
                                                                        <span className="px-1.5 py-0.5 rounded bg-green-400/20 text-green-400 text-[10px]">Done</span>
                                                                    )}
                                                                </div>
                                                                <div className="flex items-center gap-3 mt-1">
                                                                    <span className="text-xs text-gray-500">{completedTasks}/{projectTasks.length} tasks</span>
                                                                    {daysLeft !== null && (
                                                                        <span className={cn(
                                                                            "text-xs flex items-center gap-1",
                                                                            daysLeft < 0 ? "text-red-400" : daysLeft <= 7 ? "text-orange-400" : "text-gray-500"
                                                                        )}>
                                                                            <Clock className="w-3 h-3" />
                                                                            {daysLeft < 0 ? 'Overdue' : `${daysLeft}d left`}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {/* Task Progress Bar */}
                                                            <div className="w-16">
                                                                <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                                                                    <div
                                                                        className="h-full rounded-full bg-purple-400"
                                                                        style={{ width: `${taskProgress}%` }}
                                                                    />
                                                                </div>
                                                            </div>

                                                            <span className={cn(
                                                                "px-2 py-0.5 rounded text-xs font-medium",
                                                                project.priority === 'high' && "bg-red-400/20 text-red-400",
                                                                project.priority === 'medium' && "bg-yellow-400/20 text-yellow-400",
                                                                project.priority === 'low' && "bg-gray-400/20 text-gray-400"
                                                            )}>
                                                                {project.priority}
                                                            </span>

                                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                                                                <button
                                                                    onClick={() => toggleProjectStatus(project)}
                                                                    className="p-1.5 rounded text-gray-500 hover:text-yellow-400"
                                                                    title={project.status === 'on-hold' ? 'Resume' : 'Pause'}
                                                                >
                                                                    {project.status === 'on-hold' ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                                                                </button>
                                                                <button
                                                                    onClick={() => openProjectModal(goal.id, project)}
                                                                    className="p-1.5 rounded text-gray-500 hover:text-white"
                                                                    title="Edit"
                                                                >
                                                                    <Edit className="w-3.5 h-3.5" />
                                                                </button>
                                                                {project.status !== 'completed' && (
                                                                    <button
                                                                        onClick={() => completeProject(project.id)}
                                                                        className="p-1.5 rounded text-gray-500 hover:text-green-400"
                                                                        title="Complete"
                                                                    >
                                                                        <CheckCircle className="w-3.5 h-3.5" />
                                                                    </button>
                                                                )}
                                                                <button
                                                                    onClick={() => deleteProject(project.id)}
                                                                    className="p-1.5 rounded text-gray-500 hover:text-red-400"
                                                                    title="Delete"
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </Card>
                        );
                    })
                )}
            </div>

            {/* Goal Modal */}
            <Modal
                isOpen={showGoalModal}
                onClose={() => { setShowGoalModal(false); setEditingGoal(null); }}
                title={editingGoal ? 'Edit Goal' : 'New Goal'}
            >
                <div className="space-y-4">
                    <Input
                        label="Goal Name"
                        placeholder="e.g., Launch my startup"
                        value={goalForm.name}
                        onChange={(e) => setGoalForm({ ...goalForm, name: e.target.value })}
                    />
                    <Textarea
                        label="Description"
                        placeholder="What does success look like?"
                        value={goalForm.description}
                        onChange={(e) => setGoalForm({ ...goalForm, description: e.target.value })}
                        rows={3}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Sector</label>
                            <select
                                value={goalForm.sectorId}
                                onChange={(e) => setGoalForm({ ...goalForm, sectorId: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                            >
                                {sectors.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Target Date</label>
                            <input
                                type="date"
                                value={goalForm.targetDate}
                                onChange={(e) => setGoalForm({ ...goalForm, targetDate: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Icon</label>
                        <div className="flex gap-2 flex-wrap">
                            {GOAL_ICONS.map(icon => (
                                <button
                                    key={icon}
                                    onClick={() => setGoalForm({ ...goalForm, icon })}
                                    className={cn(
                                        "w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-all",
                                        goalForm.icon === icon ? "bg-cyan-400/20 ring-2 ring-cyan-400" : "bg-gray-800 hover:bg-gray-700"
                                    )}
                                >
                                    {icon}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                <ModalFooter>
                    <Button variant="ghost" onClick={() => setShowGoalModal(false)}>Cancel</Button>
                    <Button onClick={handleSaveGoal}>{editingGoal ? 'Save' : 'Create Goal'}</Button>
                </ModalFooter>
            </Modal>

            {/* Project Modal */}
            <Modal
                isOpen={showProjectModal}
                onClose={() => { setShowProjectModal(false); setEditingProject(null); }}
                title={editingProject ? 'Edit Project' : 'New Project'}
            >
                <div className="space-y-4">
                    <Input
                        label="Project Name"
                        placeholder="e.g., MVP Development"
                        value={projectForm.name}
                        onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                    />
                    <Textarea
                        label="Description"
                        placeholder="What will this project achieve?"
                        value={projectForm.description}
                        onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                        rows={2}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Parent Goal</label>
                            <select
                                value={projectForm.goalId}
                                onChange={(e) => setProjectForm({ ...projectForm, goalId: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                            >
                                <option value="">No parent goal</option>
                                {activeGoals.map(g => (
                                    <option key={g.id} value={g.id}>{g.icon} {g.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Due Date</label>
                            <input
                                type="date"
                                value={projectForm.dueDate}
                                onChange={(e) => setProjectForm({ ...projectForm, dueDate: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Priority</label>
                        <div className="flex gap-2">
                            {(['low', 'medium', 'high'] as const).map(p => (
                                <button
                                    key={p}
                                    onClick={() => setProjectForm({ ...projectForm, priority: p })}
                                    className={cn(
                                        "flex-1 py-2.5 rounded-lg text-sm font-medium capitalize transition-all",
                                        projectForm.priority === p
                                            ? p === 'high' ? "bg-red-400 text-gray-900" : p === 'medium' ? "bg-yellow-400 text-gray-900" : "bg-gray-400 text-gray-900"
                                            : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                                    )}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Icon</label>
                        <div className="flex gap-2 flex-wrap">
                            {PROJECT_ICONS.map(icon => (
                                <button
                                    key={icon}
                                    onClick={() => setProjectForm({ ...projectForm, icon })}
                                    className={cn(
                                        "w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-all",
                                        projectForm.icon === icon ? "bg-purple-400/20 ring-2 ring-purple-400" : "bg-gray-800 hover:bg-gray-700"
                                    )}
                                >
                                    {icon}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                <ModalFooter>
                    <Button variant="ghost" onClick={() => setShowProjectModal(false)}>Cancel</Button>
                    <Button onClick={handleSaveProject}>{editingProject ? 'Save' : 'Create Project'}</Button>
                </ModalFooter>
            </Modal>

            {/* Project Details Modal */}
            <Modal
                isOpen={!!showProjectDetails}
                onClose={() => setShowProjectDetails(null)}
                title={selectedProject?.name || 'Project Details'}
            >
                {selectedProject && (
                    <div className="space-y-6">
                        {/* Project Info */}
                        <div className="flex items-center gap-4">
                            <div
                                className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl"
                                style={{ backgroundColor: `${selectedProject.color}20` }}
                            >
                                {selectedProject.icon}
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white">{selectedProject.name}</h3>
                                <div className="flex items-center gap-3 mt-1">
                                    <span className={cn(
                                        "px-2 py-0.5 rounded text-xs font-medium",
                                        selectedProject.priority === 'high' && "bg-red-400/20 text-red-400",
                                        selectedProject.priority === 'medium' && "bg-yellow-400/20 text-yellow-400",
                                        selectedProject.priority === 'low' && "bg-gray-400/20 text-gray-400"
                                    )}>
                                        {selectedProject.priority} priority
                                    </span>
                                    <span className={cn(
                                        "px-2 py-0.5 rounded text-xs font-medium",
                                        selectedProject.status === 'active' && "bg-green-400/20 text-green-400",
                                        selectedProject.status === 'on-hold' && "bg-yellow-400/20 text-yellow-400",
                                        selectedProject.status === 'completed' && "bg-blue-400/20 text-blue-400"
                                    )}>
                                        {selectedProject.status}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        {selectedProject.description && (
                            <div className="text-gray-400 text-sm">
                                {selectedProject.description}
                            </div>
                        )}

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-3">
                            <div className="bg-gray-800 rounded-lg p-3 text-center">
                                <ListTodo className="w-5 h-5 mx-auto text-purple-400 mb-1" />
                                <p className="text-2xl font-bold text-white">{getTasksForProject(selectedProject.id).length}</p>
                                <p className="text-xs text-gray-500">Tasks</p>
                            </div>
                            <div className="bg-gray-800 rounded-lg p-3 text-center">
                                <CheckCircle className="w-5 h-5 mx-auto text-green-400 mb-1" />
                                <p className="text-2xl font-bold text-white">
                                    {getTasksForProject(selectedProject.id).filter(t => t.status === 'completed').length}
                                </p>
                                <p className="text-xs text-gray-500">Completed</p>
                            </div>
                            <div className="bg-gray-800 rounded-lg p-3 text-center">
                                <Clock className="w-5 h-5 mx-auto text-cyan-400 mb-1" />
                                <p className="text-2xl font-bold text-white">
                                    {selectedProject.dueDate
                                        ? differenceInDays(parseISO(selectedProject.dueDate), new Date())
                                        : '—'}
                                </p>
                                <p className="text-xs text-gray-500">Days Left</p>
                            </div>
                        </div>

                        {/* Dates */}
                        <div className="flex gap-4 text-sm">
                            <div>
                                <span className="text-gray-500">Created:</span>{' '}
                                <span className="text-white">{format(parseISO(selectedProject.createdAt), 'MMM d, yyyy')}</span>
                            </div>
                            {selectedProject.dueDate && (
                                <div>
                                    <span className="text-gray-500">Due:</span>{' '}
                                    <span className="text-white">{format(parseISO(selectedProject.dueDate), 'MMM d, yyyy')}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
                <ModalFooter>
                    <Button variant="ghost" onClick={() => setShowProjectDetails(null)}>Close</Button>
                    <Button onClick={() => {
                        if (selectedProject) openProjectModal(selectedProject.goalId, selectedProject);
                        setShowProjectDetails(null);
                    }}>Edit Project</Button>
                </ModalFooter>
            </Modal>
        </div>
    );
};
