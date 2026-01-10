import { useState, useRef, useEffect } from 'react';
import { Plus, X, Pin, Trash2, Archive, StickyNote, Search } from 'lucide-react';
import { useNotesStore } from './store';
import type { Note } from './store';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';

const NOTE_COLORS = ['#00D4AA', '#A855F7', '#0088FF', '#22C55E', '#FFB800', '#FF4757'];

interface NotesWidgetProps {
    externalOpen?: boolean;
    onExternalClose?: () => void;
}

export const NotesWidget = ({ externalOpen, onExternalClose }: NotesWidgetProps = {}) => {
    const { addNote, updateNote, deleteNote, togglePin, archiveNote, getActiveNotes } = useNotesStore();
    const [internalOpen, setInternalOpen] = useState(false);
    const [newNote, setNewNote] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editContent, setEditContent] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedColor, setSelectedColor] = useState(NOTE_COLORS[0]);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const widgetRef = useRef<HTMLDivElement>(null);

    // Use external or internal open state
    const isOpen = externalOpen !== undefined ? externalOpen : internalOpen;
    const setIsOpen = (value: boolean) => {
        if (externalOpen !== undefined && onExternalClose && !value) {
            onExternalClose();
        } else {
            setInternalOpen(value);
        }
    };

    const activeNotes = getActiveNotes();
    const filteredNotes = searchQuery
        ? activeNotes.filter(n => n.content.toLowerCase().includes(searchQuery.toLowerCase()))
        : activeNotes;

    // Keyboard shortcut
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
            if (e.key === 'n' || e.key === 'N') {
                e.preventDefault();
                setIsOpen(true);
                setTimeout(() => inputRef.current?.focus(), 100);
            }
            if (e.key === 'Escape' && isOpen) {
                setIsOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen]);

    // Click outside to close
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (widgetRef.current && !widgetRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const handleAddNote = () => {
        if (!newNote.trim()) return;
        addNote(newNote.trim(), selectedColor);
        setNewNote('');
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleAddNote();
        }
    };

    const handleStartEdit = (note: Note) => {
        setEditingId(note.id);
        setEditContent(note.content);
    };

    const handleSaveEdit = () => {
        if (editingId && editContent.trim()) {
            updateNote(editingId, { content: editContent.trim() });
        }
        setEditingId(null);
        setEditContent('');
    };

    return (
        <>
            {/* Floating Button - Hidden on mobile (use menu instead) */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "hidden sm:flex fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg transition-all duration-300",
                    "items-center justify-center",
                    "bg-gradient-to-br from-yellow-400 to-orange-500 hover:scale-110",
                    isOpen && "rotate-45"
                )}
            >
                {isOpen ? <X className="w-6 h-6 text-white" /> : <StickyNote className="w-6 h-6 text-white" />}
            </button>

            {/* Notes Panel - Full screen modal on mobile */}
            <div
                ref={widgetRef}
                className={cn(
                    "fixed z-50 rounded-2xl overflow-hidden transition-all duration-300 transform",
                    "bg-gray-900/98 backdrop-blur-xl border border-gray-700 shadow-2xl",
                    // Desktop: positioned bottom-right
                    "sm:bottom-24 sm:right-6 sm:w-80 md:w-96 sm:max-h-[70vh]",
                    // Mobile: Full screen modal style  
                    "inset-4 sm:inset-auto max-h-[80vh] sm:max-h-[70vh]",
                    isOpen ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-4 pointer-events-none"
                )}
            >
                {/* Header */}
                <div className="p-4 border-b border-gray-800">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <StickyNote className="w-5 h-5 text-yellow-400" />
                            <h3 className="font-semibold text-white">Quick Notes</h3>
                        </div>
                        <span className="text-xs text-gray-500">{activeNotes.length} notes</span>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search notes..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-cyan-400"
                        />
                    </div>
                </div>

                {/* Add Note */}
                <div className="p-4 border-b border-gray-800">
                    <textarea
                        ref={inputRef}
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder="Capture a quick thought... (Enter to save)"
                        rows={2}
                        className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg text-sm text-white placeholder:text-gray-500 resize-none focus:outline-none focus:border-cyan-400"
                    />
                    <div className="flex items-center justify-between mt-2">
                        <div className="flex gap-1.5">
                            {NOTE_COLORS.map((color) => (
                                <button
                                    key={color}
                                    onClick={() => setSelectedColor(color)}
                                    className={cn(
                                        "w-5 h-5 rounded-full transition-transform",
                                        selectedColor === color && "ring-2 ring-white ring-offset-1 ring-offset-gray-900 scale-110"
                                    )}
                                    style={{ backgroundColor: color }}
                                />
                            ))}
                        </div>
                        <button
                            onClick={handleAddNote}
                            disabled={!newNote.trim()}
                            className={cn(
                                "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                                newNote.trim()
                                    ? "bg-cyan-400 text-gray-900 hover:bg-cyan-300"
                                    : "bg-gray-700 text-gray-500 cursor-not-allowed"
                            )}
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Notes List */}
                <div className="max-h-[40vh] overflow-y-auto p-2 space-y-2">
                    {filteredNotes.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <StickyNote className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No notes yet</p>
                            <p className="text-xs mt-1">Press N to quickly capture ideas</p>
                        </div>
                    ) : (
                        filteredNotes.map((note) => (
                            <div
                                key={note.id}
                                className="group p-3 rounded-xl bg-gray-800/50 hover:bg-gray-800 transition-colors relative"
                                style={{ borderLeft: `3px solid ${note.color}` }}
                            >
                                {editingId === note.id ? (
                                    <textarea
                                        value={editContent}
                                        onChange={(e) => setEditContent(e.target.value)}
                                        onBlur={handleSaveEdit}
                                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSaveEdit()}
                                        autoFocus
                                        className="w-full bg-transparent text-sm text-white resize-none focus:outline-none"
                                        rows={3}
                                    />
                                ) : (
                                    <p
                                        onClick={() => handleStartEdit(note)}
                                        className="text-sm text-gray-300 whitespace-pre-wrap cursor-text"
                                    >
                                        {note.content}
                                    </p>
                                )}

                                <div className="flex items-center justify-between mt-2">
                                    <span className="text-xs text-gray-500">
                                        {format(new Date(note.updatedAt), 'MMM d, h:mm a')}
                                    </span>

                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => togglePin(note.id)}
                                            className={cn(
                                                "p-1 rounded hover:bg-gray-700 transition-colors",
                                                note.isPinned ? "text-yellow-400" : "text-gray-500"
                                            )}
                                        >
                                            <Pin className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            onClick={() => archiveNote(note.id)}
                                            className="p-1 rounded text-gray-500 hover:bg-gray-700 hover:text-gray-300 transition-colors"
                                        >
                                            <Archive className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            onClick={() => deleteNote(note.id)}
                                            className="p-1 rounded text-gray-500 hover:bg-red-400/20 hover:text-red-400 transition-colors"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>

                                {note.isPinned && (
                                    <Pin className="absolute top-2 right-2 w-3 h-3 text-yellow-400" />
                                )}
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                <div className="p-2 border-t border-gray-800 bg-gray-900/50">
                    <p className="text-xs text-center text-gray-500">
                        Press <kbd className="px-1.5 py-0.5 bg-gray-800 rounded text-gray-400">N</kbd> anywhere to open
                    </p>
                </div>
            </div>
        </>
    );
};
