import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateId } from '../../lib/utils';

export interface Goal {
    id: string;
    name: string;
    description?: string;
    targetDate?: string;
    sectorId: string;
    color: string;
    icon: string;
    status: 'active' | 'completed' | 'archived';
    createdAt: string;
    completedAt?: string;
}

export interface Project {
    id: string;
    name: string;
    description?: string;
    goalId?: string;
    sectorId: string;
    color: string;
    icon: string;
    status: 'active' | 'completed' | 'on-hold' | 'archived';
    priority: 'low' | 'medium' | 'high';
    dueDate?: string;
    createdAt: string;
    completedAt?: string;
}

interface ProjectsState {
    goals: Goal[];
    projects: Project[];

    // Goals CRUD
    addGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'status'>) => void;
    updateGoal: (id: string, updates: Partial<Goal>) => void;
    deleteGoal: (id: string) => void;
    completeGoal: (id: string) => void;

    // Projects CRUD
    addProject: (project: Omit<Project, 'id' | 'createdAt' | 'status'>) => void;
    updateProject: (id: string, updates: Partial<Project>) => void;
    deleteProject: (id: string) => void;
    completeProject: (id: string) => void;

    // Getters
    getGoalsBySector: (sectorId: string) => Goal[];
    getProjectsByGoal: (goalId: string) => Project[];
    getProjectsBySector: (sectorId: string) => Project[];
    getActiveGoals: () => Goal[];
    getActiveProjects: () => Project[];
    getGoalProgress: (goalId: string) => { completed: number; total: number; percentage: number };
}

const DEFAULT_COLORS = ['#00D4AA', '#A855F7', '#0088FF', '#22C55E', '#FFB800', '#FF4757'];
const DEFAULT_ICONS = ['🎯', '🚀', '💡', '📊', '⭐', '🔥'];

export const useProjectsStore = create<ProjectsState>()(
    persist(
        (set, get) => ({
            goals: [],
            projects: [],

            // ===== Goals CRUD =====
            addGoal: (goalData) => {
                const newGoal: Goal = {
                    id: generateId(),
                    createdAt: new Date().toISOString(),
                    status: 'active',
                    ...goalData,
                    color: goalData.color || DEFAULT_COLORS[Math.floor(Math.random() * DEFAULT_COLORS.length)],
                    icon: goalData.icon || DEFAULT_ICONS[Math.floor(Math.random() * DEFAULT_ICONS.length)],
                };
                set((state) => ({ goals: [...state.goals, newGoal] }));
            },

            updateGoal: (id, updates) => {
                set((state) => ({
                    goals: state.goals.map((g) => (g.id === id ? { ...g, ...updates } : g)),
                }));
            },

            deleteGoal: (id) => {
                set((state) => ({
                    goals: state.goals.filter((g) => g.id !== id),
                    // Also remove associated projects
                    projects: state.projects.filter((p) => p.goalId !== id),
                }));
            },

            completeGoal: (id) => {
                set((state) => ({
                    goals: state.goals.map((g) =>
                        g.id === id
                            ? { ...g, status: 'completed', completedAt: new Date().toISOString() }
                            : g
                    ),
                }));
            },

            // ===== Projects CRUD =====
            addProject: (projectData) => {
                const newProject: Project = {
                    id: generateId(),
                    createdAt: new Date().toISOString(),
                    status: 'active',
                    ...projectData,
                    priority: projectData.priority || 'medium',
                    color: projectData.color || DEFAULT_COLORS[Math.floor(Math.random() * DEFAULT_COLORS.length)],
                    icon: projectData.icon || DEFAULT_ICONS[Math.floor(Math.random() * DEFAULT_ICONS.length)],
                };
                set((state) => ({ projects: [...state.projects, newProject] }));
            },

            updateProject: (id, updates) => {
                set((state) => ({
                    projects: state.projects.map((p) => (p.id === id ? { ...p, ...updates } : p)),
                }));
            },

            deleteProject: (id) => {
                set((state) => ({
                    projects: state.projects.filter((p) => p.id !== id),
                }));
            },

            completeProject: (id) => {
                set((state) => ({
                    projects: state.projects.map((p) =>
                        p.id === id
                            ? { ...p, status: 'completed', completedAt: new Date().toISOString() }
                            : p
                    ),
                }));
            },

            // ===== Getters =====
            getGoalsBySector: (sectorId) => {
                return get().goals.filter((g) => g.sectorId === sectorId && g.status !== 'archived');
            },

            getProjectsByGoal: (goalId) => {
                return get().projects.filter((p) => p.goalId === goalId && p.status !== 'archived');
            },

            getProjectsBySector: (sectorId) => {
                return get().projects.filter((p) => p.sectorId === sectorId && p.status !== 'archived');
            },

            getActiveGoals: () => {
                return get().goals.filter((g) => g.status === 'active');
            },

            getActiveProjects: () => {
                return get().projects.filter((p) => p.status === 'active');
            },

            getGoalProgress: (goalId) => {
                const projects = get().projects.filter((p) => p.goalId === goalId);
                const completed = projects.filter((p) => p.status === 'completed').length;
                const total = projects.length;
                return {
                    completed,
                    total,
                    percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
                };
            },
        }),
        {
            name: 'strategist-projects',
        }
    )
);
