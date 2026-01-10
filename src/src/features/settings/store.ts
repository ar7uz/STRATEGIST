import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserSettings } from '../../lib/types';

interface SettingsState extends UserSettings {
    updateSettings: (updates: Partial<UserSettings>) => void;
    resetSettings: () => void;
    exportData: () => string;
}

const DEFAULT_SETTINGS: UserSettings = {
    // Appearance
    accentColor: 'cyan',
    theme: 'dark',
    fontSize: 'medium',
    reduceMotion: false,

    // Focus
    defaultFocusDuration: 25,
    breakReminders: true,
    breakInterval: 25,
    preferredSound: 'silence',
    soundVolume: 70,

    // Productivity
    peakHoursStart: 9,
    peakHoursEnd: 12,
    workingDays: [1, 2, 3, 4, 5], // Mon-Fri
    dailyTaskGoal: 5,
    dailyFocusGoal: 120, // 2 hours
};

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            ...DEFAULT_SETTINGS,

            updateSettings: (updates) => set((state) => ({ ...state, ...updates })),

            resetSettings: () => set(DEFAULT_SETTINGS),

            exportData: () => {
                // Collect all localStorage data from strategist stores
                const exportObj: Record<string, unknown> = {};

                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key?.startsWith('strategist-')) {
                        const value = localStorage.getItem(key);
                        if (value) {
                            try {
                                exportObj[key] = JSON.parse(value);
                            } catch {
                                exportObj[key] = value;
                            }
                        }
                    }
                }

                return JSON.stringify(exportObj, null, 2);
            },
        }),
        {
            name: 'strategist-settings',
        }
    )
);
