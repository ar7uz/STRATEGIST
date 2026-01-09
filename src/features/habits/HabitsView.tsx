import { useState } from 'react';
import { Plus, Flame, Check, Trash2, Edit2 } from 'lucide-react';
import { useHabitsStore } from './store';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Modal, ModalFooter } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { cn } from '../../lib/utils';
import { format, subDays, isSameDay } from 'date-fns';
import type { Habit } from '../../lib/types';

const ICONS = ['🧘', '💪', '📚', '💧', '🏃', '😴', '🎯', '✍️', '🎸', '🧠', '💊', '🥗'];
const COLORS = ['#00D4AA', '#A855F7', '#0088FF', '#22C55E', '#FFB800', '#FF4757'];

export const HabitsView = () => {
    const { habits, addHabit, updateHabit, deleteHabit, toggleCompletion, isCompletedOn } = useHabitsStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        icon: '🎯',
        color: '#00D4AA',
        frequency: 'daily' as 'daily' | 'weekly',
    });

    const today = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => subDays(today, 6 - i));

    const handleOpenCreate = () => {
        setEditingHabit(null);
        setFormData({ name: '', icon: '🎯', color: '#00D4AA', frequency: 'daily' });
        setIsModalOpen(true);
    };

    const handleOpenEdit = (habit: Habit) => {
        setEditingHabit(habit);
        setFormData({
            name: habit.name,
            icon: habit.icon,
            color: habit.color,
            frequency: habit.frequency === 'daily' ? 'daily' : 'weekly',
        });
        setIsModalOpen(true);
    };

    const handleSave = () => {
        if (!formData.name.trim()) return;

        if (editingHabit) {
            updateHabit(editingHabit.id, {
                name: formData.name,
                icon: formData.icon,
                color: formData.color,
                frequency: formData.frequency,
            });
        } else {
            addHabit({
                name: formData.name,
                icon: formData.icon,
                color: formData.color,
                frequency: formData.frequency,
                isActive: true,
            });
        }
        setIsModalOpen(false);
    };

    const activeHabits = habits.filter(h => h.isActive);
    const totalStreak = activeHabits.reduce((acc, h) => acc + h.currentStreak, 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Habits</h1>
                    <p className="text-gray-400 mt-1">Build consistency, one day at a time</p>
                </div>
                <Button leftIcon={<Plus className="h-4 w-4" />} onClick={handleOpenCreate}>
                    New Habit
                </Button>
            </div>

            {/* Streak Summary */}
            <Card variant="elevated" className="overflow-hidden">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                            <Flame className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-white">{totalStreak} Day Streak</h3>
                            <p className="text-gray-400">Keep the momentum going!</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-500">Today's Progress</p>
                        <p className="text-xl font-bold text-white">
                            {activeHabits.filter(h => isCompletedOn(h.id, today)).length} / {activeHabits.length}
                        </p>
                    </div>
                </div>
            </Card>

            {/* Habit List with 7-day grid */}
            <div className="space-y-3">
                {/* Header Row */}
                <div className="flex items-center gap-4 px-5">
                    <div className="flex-1">
                        <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Habit</span>
                    </div>
                    <div className="flex gap-1.5">
                        {last7Days.map(day => (
                            <div
                                key={day.toISOString()}
                                className={cn(
                                    "w-9 text-center text-xs font-medium",
                                    isSameDay(day, today) ? "text-cyan-400" : "text-gray-500"
                                )}
                            >
                                {format(day, 'EEE')}
                            </div>
                        ))}
                    </div>
                    <div className="w-20 text-center">
                        <span className="text-sm font-medium text-gray-500">Streak</span>
                    </div>
                </div>

                {/* Habits */}
                {activeHabits.length === 0 ? (
                    <Card className="py-12 flex flex-col items-center justify-center text-center border-dashed">
                        <div className="w-16 h-16 rounded-2xl bg-gray-800 flex items-center justify-center mb-4">
                            <Flame className="w-8 h-8 text-gray-600" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-300">No habits yet</h3>
                        <p className="text-gray-500 mt-1">Create your first habit to start building streaks</p>
                        <Button className="mt-4" onClick={handleOpenCreate}>
                            <Plus className="h-4 w-4 mr-2" /> Add Habit
                        </Button>
                    </Card>
                ) : (
                    activeHabits.map(habit => {
                        return (

                            <Card key={habit.id} className="group hover:bg-gray-800/60 transition-colors">
                                <div className="flex items-center gap-4">
                                    {/* Habit Info */}
                                    <div className="flex-1 flex items-center gap-3 min-w-0">
                                        <div
                                            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                                            style={{ background: `${habit.color}20` }}
                                        >
                                            {habit.icon}
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="font-medium text-white truncate">{habit.name}</h4>
                                            <p className="text-xs text-gray-500">
                                                {habit.frequency === 'daily' ? 'Daily' : `${typeof habit.frequency === 'object' ? habit.frequency.times : 3}x/week`}
                                            </p>
                                        </div>
                                    </div>

                                    {/* 7-day completion grid */}
                                    <div className="flex gap-1.5">
                                        {last7Days.map(day => {
                                            const completed = isCompletedOn(habit.id, day);
                                            const isToday = isSameDay(day, today);

                                            return (
                                                <button
                                                    key={day.toISOString()}
                                                    onClick={() => toggleCompletion(habit.id, day)}
                                                    className={cn(
                                                        "w-9 h-9 rounded-lg flex items-center justify-center transition-all",
                                                        completed
                                                            ? "text-white"
                                                            : isToday
                                                                ? "border-2 border-dashed border-gray-600 hover:border-gray-500"
                                                                : "bg-gray-800/50 hover:bg-gray-700/50"
                                                    )}
                                                    style={completed ? { backgroundColor: habit.color } : {}}
                                                >
                                                    {completed && <Check className="w-4 h-4" />}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* Streak */}
                                    <div className="w-20 flex items-center justify-center gap-1">
                                        {habit.currentStreak > 0 && (
                                            <Flame className="w-4 h-4 text-orange-400" />
                                        )}
                                        <span className={cn(
                                            "font-bold",
                                            habit.currentStreak > 0 ? "text-orange-400" : "text-gray-600"
                                        )}>
                                            {habit.currentStreak}
                                        </span>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleOpenEdit(habit)}
                                            className="h-8 w-8 text-gray-400 hover:text-white"
                                        >
                                            <Edit2 className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => deleteHabit(habit.id)}
                                            className="h-8 w-8 text-gray-400 hover:text-red-400"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        );
                    })
                )}
            </div>

            {/* Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingHabit ? 'Edit Habit' : 'New Habit'}
                description="Build a new daily practice"
            >
                <div className="space-y-5">
                    <Input
                        label="Habit Name"
                        placeholder="e.g., Morning meditation"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        autoFocus
                    />

                    {/* Icon Picker */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Icon</label>
                        <div className="flex flex-wrap gap-2">
                            {ICONS.map(icon => (
                                <button
                                    key={icon}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, icon })}
                                    className={cn(
                                        "w-11 h-11 rounded-xl text-xl flex items-center justify-center transition-all",
                                        formData.icon === icon
                                            ? "bg-cyan-400/20 border-2 border-cyan-400 scale-110"
                                            : "bg-gray-800 border border-gray-700 hover:border-gray-600"
                                    )}
                                >
                                    {icon}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Color Picker */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Color</label>
                        <div className="flex gap-3">
                            {COLORS.map(color => (
                                <button
                                    key={color}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, color })}
                                    className={cn(
                                        "w-10 h-10 rounded-xl transition-all",
                                        formData.color === color ? "ring-2 ring-white ring-offset-2 ring-offset-gray-900 scale-110" : "hover:scale-105"
                                    )}
                                    style={{ backgroundColor: color }}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Frequency */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Frequency</label>
                        <div className="flex gap-3">
                            {['daily', 'weekly'].map(freq => (
                                <button
                                    key={freq}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, frequency: freq as 'daily' | 'weekly' })}
                                    className={cn(
                                        "flex-1 py-3 rounded-xl font-medium transition-all capitalize",
                                        formData.frequency === freq
                                            ? "bg-cyan-400 text-gray-900"
                                            : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                                    )}
                                >
                                    {freq}
                                </button>
                            ))}
                        </div>
                    </div>

                    <ModalFooter>
                        <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave}>{editingHabit ? 'Save' : 'Create Habit'}</Button>
                    </ModalFooter>
                </div>
            </Modal>
        </div>
    );
};
