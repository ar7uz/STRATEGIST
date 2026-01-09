import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateId } from '../../lib/utils';

export interface Note {
    id: string;
    content: string;
    createdAt: string;
    updatedAt: string;
    color: string;
    isPinned: boolean;
    isArchived: boolean;
}

interface NotesState {
    notes: Note[];
    addNote: (content: string, color?: string) => void;
    updateNote: (id: string, updates: Partial<Note>) => void;
    deleteNote: (id: string) => void;
    togglePin: (id: string) => void;
    archiveNote: (id: string) => void;
    getActiveNotes: () => Note[];
    getArchivedNotes: () => Note[];
    searchNotes: (query: string) => Note[];
}

const NOTE_COLORS = ['#00D4AA', '#A855F7', '#0088FF', '#22C55E', '#FFB800', '#FF4757'];

export const useNotesStore = create<NotesState>()(
    persist(
        (set, get) => ({
            notes: [],

            addNote: (content, color) => {
                const now = new Date().toISOString();
                const newNote: Note = {
                    id: generateId(),
                    content,
                    createdAt: now,
                    updatedAt: now,
                    color: color || NOTE_COLORS[Math.floor(Math.random() * NOTE_COLORS.length)],
                    isPinned: false,
                    isArchived: false,
                };
                set((state) => ({ notes: [newNote, ...state.notes] }));
            },

            updateNote: (id, updates) => {
                set((state) => ({
                    notes: state.notes.map((note) =>
                        note.id === id
                            ? { ...note, ...updates, updatedAt: new Date().toISOString() }
                            : note
                    ),
                }));
            },

            deleteNote: (id) => {
                set((state) => ({ notes: state.notes.filter((note) => note.id !== id) }));
            },

            togglePin: (id) => {
                set((state) => ({
                    notes: state.notes.map((note) =>
                        note.id === id ? { ...note, isPinned: !note.isPinned } : note
                    ),
                }));
            },

            archiveNote: (id) => {
                set((state) => ({
                    notes: state.notes.map((note) =>
                        note.id === id ? { ...note, isArchived: true } : note
                    ),
                }));
            },

            getActiveNotes: () => {
                const notes = get().notes.filter((n) => !n.isArchived);
                return [
                    ...notes.filter((n) => n.isPinned),
                    ...notes.filter((n) => !n.isPinned),
                ];
            },

            getArchivedNotes: () => {
                return get().notes.filter((n) => n.isArchived);
            },

            searchNotes: (query) => {
                const lowerQuery = query.toLowerCase();
                return get()
                    .notes.filter((n) => !n.isArchived)
                    .filter((n) => n.content.toLowerCase().includes(lowerQuery));
            },
        }),
        {
            name: 'strategist-notes',
        }
    )
);
