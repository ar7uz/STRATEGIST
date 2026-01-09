import type { Task, Sector } from '../../lib/types';
import { differenceInCalendarDays, parseISO } from 'date-fns';

export const calculateTaskGDP = (task: Task, sector: Sector): number => {
    if (task.status !== 'completed' || !task.actualMinutes) return 0;

    // Formula: Task_Value * Completion_Rate * Freshness_Index
    // Task_Value = Strategic_Weight * Sector_Weight (%) * Time_Invested (hours)

    const timeInvestedHours = task.actualMinutes / 60;
    const sectorWeightFactor = sector.weight / 100;
    const taskValue = task.strategicWeight * sectorWeightFactor * timeInvestedHours;

    const completionRate = 1.0; // Assuming full completion for now

    // Freshness: 1 / (1 + days_overdue)
    let daysOverdue = 0;
    if (task.dueDate && task.completedAt) {
        const due = parseISO(task.dueDate);
        const completed = parseISO(task.completedAt);
        const diff = differenceInCalendarDays(completed, due);
        daysOverdue = Math.max(0, diff);
    }
    const freshnessIndex = 1 / (1 + daysOverdue);

    return taskValue * completionRate * freshnessIndex;
};

export const calculateDailyInflation = (tasks: Task[]): number => {
    // Inflation = (Actual - Planned) / Planned
    // Weighted by Task Weight? Spec says: Σ(Task_Inflation × Task_Weight) / Σ(Task_Weight)

    let totalInflationWeighted = 0;
    let totalWeight = 0;

    tasks.forEach(task => {
        if (task.status !== 'completed' || !task.actualMinutes) return;

        // Cap minimum planned to avoid division by zero
        const planned = Math.max(1, task.estimatedMinutes);
        const actual = task.actualMinutes;

        const taskInflation = ((actual - planned) / planned) * 100; // Percentage

        totalInflationWeighted += taskInflation * task.strategicWeight;
        totalWeight += task.strategicWeight;
    });

    return totalWeight === 0 ? 0 : totalInflationWeighted / totalWeight;
};
