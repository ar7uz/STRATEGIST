import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Sector, SectorId } from '../../lib/types';
import { generateId } from '../../lib/utils';

interface SectorsState {
    sectors: Sector[];
    addSector: (sector: Omit<Sector, 'id' | 'createdAt'>) => void;
    updateSector: (id: SectorId, updates: Partial<Sector>) => void;
    deleteSector: (id: SectorId) => void;
    resetToDefaults: () => void;
}

const DEFAULT_SECTORS: Sector[] = [
    { id: '1', name: 'Business', icon: '💼', color: '#00D4AA', weight: 40, isActive: true, sortOrder: 0 },
    { id: '2', name: 'Learning', icon: '📚', color: '#0088FF', weight: 35, isActive: true, sortOrder: 1 },
    { id: '3', name: 'Health', icon: '💪', color: '#FF4757', weight: 25, isActive: true, sortOrder: 2 },
];

export const useSectorsStore = create<SectorsState>()(
    persist(
        (set) => ({
            sectors: DEFAULT_SECTORS,

            addSector: (sectorData) => set((state) => ({
                sectors: [...state.sectors, { ...sectorData, id: generateId() }]
            })),

            updateSector: (id, updates) => set((state) => ({
                sectors: state.sectors.map((s) => s.id === id ? { ...s, ...updates } : s)
            })),

            deleteSector: (id) => set((state) => ({
                sectors: state.sectors.filter((s) => s.id !== id)
            })),

            resetToDefaults: () => set({ sectors: DEFAULT_SECTORS }),
        }),
        {
            name: 'strategist-sectors',
        }
    )
);
