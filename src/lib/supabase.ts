import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase credentials not configured. Using local storage only.');
}

export const supabase = supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

// Types for database tables
export interface DbUser {
    id: string;
    telegram_id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    photo_url?: string;
    created_at: string;
    updated_at: string;
}

export interface DbTask {
    id: string;
    user_id: string;
    title: string;
    description?: string;
    sector_id: string;
    project_id?: string;
    status: string;
    priority: number;
    energy_required: string;
    strategic_weight: number;
    due_date?: string;
    estimated_minutes: number;
    actual_minutes: number;
    quadrant?: string;
    is_template: boolean;
    created_at: string;
    completed_at?: string;
}

export interface DbHabit {
    id: string;
    user_id: string;
    name: string;
    description?: string;
    frequency: string;
    target_days: number[];
    icon: string;
    color: string;
    sector_id?: string;
    current_streak: number;
    best_streak: number;
    completions: Record<string, boolean>;
    created_at: string;
}

export interface DbGoal {
    id: string;
    user_id: string;
    name: string;
    description?: string;
    target_date?: string;
    sector_id: string;
    color: string;
    icon: string;
    status: string;
    created_at: string;
    completed_at?: string;
}

export interface DbProject {
    id: string;
    user_id: string;
    name: string;
    description?: string;
    goal_id?: string;
    sector_id: string;
    color: string;
    icon: string;
    status: string;
    priority: string;
    due_date?: string;
    created_at: string;
    completed_at?: string;
}

// Sync utilities
export const syncToSupabase = async <T extends { id: string }>(
    table: string,
    data: T[],
    userId: string
): Promise<void> => {
    if (!supabase) return;

    try {
        // Upsert all items
        const itemsWithUserId = data.map(item => ({
            ...item,
            user_id: userId
        }));

        const { error } = await supabase
            .from(table)
            .upsert(itemsWithUserId, { onConflict: 'id' });

        if (error) {
            console.error(`Error syncing ${table}:`, error);
        }
    } catch (err) {
        console.error(`Sync error for ${table}:`, err);
    }
};

export const loadFromSupabase = async <T>(
    table: string,
    userId: string
): Promise<T[] | null> => {
    if (!supabase) return null;

    try {
        const { data, error } = await supabase
            .from(table)
            .select('*')
            .eq('user_id', userId);

        if (error) {
            console.error(`Error loading ${table}:`, error);
            return null;
        }

        return data as T[];
    } catch (err) {
        console.error(`Load error for ${table}:`, err);
        return null;
    }
};

export const deleteFromSupabase = async (
    table: string,
    id: string,
    userId: string
): Promise<void> => {
    if (!supabase) return;

    try {
        const { error } = await supabase
            .from(table)
            .delete()
            .eq('id', id)
            .eq('user_id', userId);

        if (error) {
            console.error(`Error deleting from ${table}:`, error);
        }
    } catch (err) {
        console.error(`Delete error for ${table}:`, err);
    }
};
