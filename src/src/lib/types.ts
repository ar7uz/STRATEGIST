// ==========================================
// THE STRATEGIST - Core Type Definitions
// ==========================================

// ===== Primitive Types =====
export type SectorId = string;
export type TaskId = string;
export type ProjectId = string;
export type GoalId = string;
export type HabitId = string;

// ===== Enums =====
export type TaskStatus = 'planned' | 'in-progress' | 'completed' | 'cancelled';
export type TaskPriority = 1 | 2 | 3 | 4 | 5;
export type EnergyLevel = 'high' | 'medium' | 'low';
export type Quadrant = 'do' | 'schedule' | 'delegate' | 'eliminate';
export type RecurrenceType = 'daily' | 'weekly' | 'monthly' | 'custom';

// ===== Sector =====
export interface Sector {
    id: SectorId;
    name: string;
    icon: string;
    color: string;
    weight: number; // 0-100
    isActive: boolean;
    sortOrder: number;
}

// ===== Goal =====
export interface Goal {
    id: GoalId;
    title: string;
    description: string;
    deadline?: string; // ISO date
    sectorId: SectorId;
    projectIds: ProjectId[];
    createdAt: string;
    completedAt?: string;
}

// ===== Project =====
export interface Project {
    id: ProjectId;
    goalId?: GoalId;
    sectorId: SectorId;
    name: string;
    description?: string;
    color: string;
    icon: string;
    deadline?: string;
    taskIds: TaskId[];
    status: 'active' | 'completed' | 'archived';
    createdAt: string;
    completedAt?: string;
}

// ===== Task (Enhanced) =====
export interface Task {
    id: TaskId;
    sectorId: SectorId;
    projectId?: ProjectId;
    title: string;
    description?: string;

    // Scheduling
    dueDate?: string; // ISO date (YYYY-MM-DD)
    scheduledTime?: string; // ISO datetime
    estimatedMinutes: number;
    actualMinutes?: number;

    // Priority & Energy
    strategicWeight: TaskPriority;
    energyRequired: EnergyLevel;
    quadrant?: Quadrant;

    // Dependencies
    dependsOn?: TaskId[];
    blockedBy?: TaskId[];

    // Context Tags
    contexts?: string[]; // @home, @office, @phone, etc.
    tags?: string[];

    // Recurrence
    isRecurring?: boolean;
    recurrence?: {
        type: RecurrenceType;
        interval?: number; // e.g., every 2 weeks
        daysOfWeek?: number[]; // 0-6 for weekly
        dayOfMonth?: number; // 1-31 for monthly
    };

    // Status
    status: TaskStatus;
    createdAt: string;
    startedAt?: string;
    completedAt?: string;

    // Template
    isTemplate?: boolean;
    templateName?: string;
}

// ===== Habit =====
export interface Habit {
    id: HabitId;
    name: string;
    icon: string;
    color: string;
    sectorId?: SectorId;

    // Frequency
    frequency: 'daily' | 'weekly' | { times: number; per: 'day' | 'week' };
    targetDays?: number[]; // 0-6 for specific days

    // Tracking
    completions: string[]; // ISO date strings
    currentStreak: number;
    longestStreak: number;

    // Meta
    isActive: boolean;
    createdAt: string;
    notes?: string;
}

// ===== Focus Session =====
export interface FocusSession {
    id: string;
    taskId: TaskId;
    sectorId: SectorId;

    // Timing
    startTime: string;
    endTime?: string;
    plannedDuration: number; // minutes
    actualDuration?: number;

    // Audio
    soundType?: string;

    // Status
    wasCompleted: boolean;
    wasInterrupted: boolean;
    interruptionCount?: number;

    // Notes
    notes?: string;
}

// ===== Journal Entry =====
export interface JournalEntry {
    id: string;
    date: string; // YYYY-MM-DD

    // Morning
    morningEntry?: string;
    intentions?: string[];
    gratitude?: string[];

    // Evening
    eveningEntry?: string;
    wins?: string[];
    improvements?: string[];

    // Mood
    mood?: 1 | 2 | 3 | 4 | 5;
    energy?: 1 | 2 | 3 | 4 | 5;

    // Links
    linkedTaskIds?: TaskId[];
}

// ===== Weekly Review =====
export interface WeeklyReview {
    id: string;
    weekStart: string; // ISO date (Monday)
    weekEnd: string; // ISO date (Sunday)

    // Reflection
    accomplishments: string[];
    challenges: string[];
    lessons: string[];
    nextWeekPriorities: string[];

    // Metrics (auto-calculated)
    tasksCompleted: number;
    focusHours: number;
    sectorsWorkedOn: SectorId[];

    createdAt: string;
}

// ===== Analytics Types =====
export interface DailyStats {
    date: string;
    tasksCompleted: number;
    tasksPlanned: number;
    focusMinutes: number;
    gdpScore: number;
    inflationRate: number;
    sectorBreakdown: Record<SectorId, {
        tasksCompleted: number;
        minutesSpent: number;
    }>;
}

export interface ProductivityPattern {
    bestDayOfWeek: number; // 0-6
    bestHourOfDay: number; // 0-23
    averageTasksPerDay: number;
    averageTimeAccuracy: number; // estimated vs actual ratio
    sectorTrends: Record<SectorId, 'increasing' | 'stable' | 'decreasing'>;
}

// ===== User Settings =====
export interface UserSettings {
    // Appearance
    accentColor: 'cyan' | 'purple' | 'blue' | 'green' | 'orange';
    theme: 'dark' | 'darker' | 'oled';
    fontSize: 'small' | 'medium' | 'large';
    reduceMotion: boolean;

    // Focus
    defaultFocusDuration: number;
    breakReminders: boolean;
    breakInterval: number; // minutes
    preferredSound: string;
    soundVolume: number; // 0-100

    // Productivity
    peakHoursStart: number; // 0-23
    peakHoursEnd: number; // 0-23
    workingDays: number[]; // 0-6
    dailyTaskGoal: number;
    dailyFocusGoal: number; // minutes

    // Notifications
    morningBriefingTime?: string; // HH:MM
    eveningReviewTime?: string;

    // Data
    lastBackup?: string;
}

// ===== Streak Data =====
export interface StreakData {
    currentStreak: number;
    longestStreak: number;
    lastActiveDate: string;
    totalActiveDays: number;
    milestones: number[]; // Days achieved (7, 30, 100, etc.)
}

// ===== Achievement =====
export interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: string;
    unlockedAt?: string;
    progress?: number; // 0-100 for progressive achievements
}
