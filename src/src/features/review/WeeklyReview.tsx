import { useState } from 'react';
import { Modal, ModalFooter } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Textarea } from '../../components/ui/Input';
import { useReviewStore } from './store';
import { useTasksStore } from '../tasks/store';
import { usePomodoroStore } from '../pomodoro/store';
import { useHabitsStore } from '../habits/store';
import { cn } from '../../lib/utils';
import {
    ChevronRight,
    ChevronLeft,
    Check,
    ThumbsUp,
    ThumbsDown,
    Brain,
    Target,
    Star,
    Zap,
    Battery,
    Smile
} from 'lucide-react';
import { format, startOfWeek, endOfWeek, subWeeks } from 'date-fns';

const STEPS = ['Reflect', 'Review', 'Plan', 'Rate'];

interface WeeklyReviewProps {
    isOpen: boolean;
    onClose: () => void;
}

export const WeeklyReview = ({ isOpen, onClose }: WeeklyReviewProps) => {
    const { addReview, getCurrentWeekReview } = useReviewStore();
    const { getCompletedTasksInRange } = useTasksStore();
    const { getWeekStats } = usePomodoroStore();
    const { habits, isCompletedOn } = useHabitsStore();

    const [step, setStep] = useState(0);
    const [formData, setFormData] = useState({
        wentWell: '',
        challenges: '',
        learned: '',
        productivityRating: 0,
        energyRating: 0,
        satisfactionRating: 0,
        topPriorities: ['', '', ''],
        focusAreas: [''],
    });

    const existingReview = getCurrentWeekReview();
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

    // Calculate stats
    const completedTasks = getCompletedTasksInRange(weekStart, weekEnd);
    const weekStats = getWeekStats();
    const focusMinutes = weekStats.reduce((acc, d) => acc + d.totalMinutes, 0);

    // Calculate habits completion rate
    const activeHabits = habits.filter(h => h.isActive);
    let habitCompletions = 0;
    let habitTotal = 0;
    for (let i = 0; i < 7; i++) {
        const day = subWeeks(now, 0);
        day.setDate(weekStart.getDate() + i);
        activeHabits.forEach(habit => {
            habitTotal++;
            if (isCompletedOn(habit.id, day)) habitCompletions++;
        });
    }
    const habitsCompletionRate = habitTotal > 0 ? Math.round((habitCompletions / habitTotal) * 100) : 0;

    const handleNext = () => {
        if (step < STEPS.length - 1) {
            setStep(step + 1);
        }
    };

    const handleBack = () => {
        if (step > 0) {
            setStep(step - 1);
        }
    };

    const handleSave = () => {
        addReview({
            ...formData,
            topPriorities: formData.topPriorities.filter(p => p.trim()),
            focusAreas: formData.focusAreas.filter(f => f.trim()),
            tasksCompleted: completedTasks.length,
            focusMinutes,
            habitsCompletionRate,
        });
        onClose();
        setStep(0);
    };

    const RatingStars = ({ value, onChange, icon: Icon, label }: {
        value: number;
        onChange: (v: number) => void;
        icon: React.ElementType;
        label: string;
    }) => (
        <div className="space-y-2">
            <div className="flex items-center gap-2 text-gray-400">
                <Icon className="w-4 h-4" />
                <span className="text-sm">{label}</span>
            </div>
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        onClick={() => onChange(star)}
                        className={cn(
                            "p-2 rounded-lg transition-all",
                            value >= star
                                ? "bg-yellow-400 text-gray-900"
                                : "bg-gray-800 text-gray-500 hover:bg-gray-700"
                        )}
                    >
                        <Star className="w-5 h-5" fill={value >= star ? "currentColor" : "none"} />
                    </button>
                ))}
            </div>
        </div>
    );

    const renderStep = () => {
        switch (step) {
            case 0: // Reflect
                return (
                    <div className="space-y-6">
                        <div className="text-center mb-4">
                            <ThumbsUp className="w-10 h-10 mx-auto text-green-400 mb-2" />
                            <h3 className="text-lg font-semibold text-white">What went well this week?</h3>
                        </div>
                        <Textarea
                            placeholder="Celebrate your wins, big and small..."
                            value={formData.wentWell}
                            onChange={(e) => setFormData({ ...formData, wentWell: e.target.value })}
                            rows={4}
                        />

                        <div className="text-center mb-4">
                            <ThumbsDown className="w-10 h-10 mx-auto text-red-400 mb-2" />
                            <h3 className="text-lg font-semibold text-white">What challenges did you face?</h3>
                        </div>
                        <Textarea
                            placeholder="What blocked you or didn't go as planned..."
                            value={formData.challenges}
                            onChange={(e) => setFormData({ ...formData, challenges: e.target.value })}
                            rows={4}
                        />

                        <div className="text-center mb-4">
                            <Brain className="w-10 h-10 mx-auto text-purple-400 mb-2" />
                            <h3 className="text-lg font-semibold text-white">What did you learn?</h3>
                        </div>
                        <Textarea
                            placeholder="Key insights, new skills, realizations..."
                            value={formData.learned}
                            onChange={(e) => setFormData({ ...formData, learned: e.target.value })}
                            rows={4}
                        />
                    </div>
                );

            case 1: // Review Stats
                return (
                    <div className="space-y-6">
                        <div className="text-center mb-6">
                            <h3 className="text-lg font-semibold text-white">Your Week at a Glance</h3>
                            <p className="text-gray-400 text-sm">{format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}</p>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="text-center p-4 bg-gray-800/50 rounded-xl">
                                <p className="text-3xl font-bold text-cyan-400">{completedTasks.length}</p>
                                <p className="text-xs text-gray-500">Tasks Done</p>
                            </div>
                            <div className="text-center p-4 bg-gray-800/50 rounded-xl">
                                <p className="text-3xl font-bold text-purple-400">
                                    {Math.floor(focusMinutes / 60)}h {focusMinutes % 60}m
                                </p>
                                <p className="text-xs text-gray-500">Focus Time</p>
                            </div>
                            <div className="text-center p-4 bg-gray-800/50 rounded-xl">
                                <p className="text-3xl font-bold text-green-400">{habitsCompletionRate}%</p>
                                <p className="text-xs text-gray-500">Habits</p>
                            </div>
                        </div>

                        <div className="p-4 bg-gray-800/30 rounded-xl border border-gray-700">
                            <p className="text-sm text-gray-400 text-center">
                                {completedTasks.length > 5
                                    ? "🎉 Great productivity week! Keep the momentum going."
                                    : completedTasks.length > 0
                                        ? "📈 Good progress. Every step counts."
                                        : "🌱 A fresh start awaits. Set your intentions for next week."}
                            </p>
                        </div>
                    </div>
                );

            case 2: // Plan
                return (
                    <div className="space-y-6">
                        <div className="text-center mb-4">
                            <Target className="w-10 h-10 mx-auto text-cyan-400 mb-2" />
                            <h3 className="text-lg font-semibold text-white">Top 3 Priorities for Next Week</h3>
                        </div>

                        {[0, 1, 2].map((idx) => (
                            <div key={idx} className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-cyan-400/20 flex items-center justify-center text-cyan-400 font-bold text-sm">
                                    {idx + 1}
                                </div>
                                <input
                                    type="text"
                                    placeholder={`Priority ${idx + 1}...`}
                                    value={formData.topPriorities[idx]}
                                    onChange={(e) => {
                                        const newPriorities = [...formData.topPriorities];
                                        newPriorities[idx] = e.target.value;
                                        setFormData({ ...formData, topPriorities: newPriorities });
                                    }}
                                    className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-cyan-400"
                                />
                            </div>
                        ))}

                        <div className="text-center mt-8 mb-4">
                            <Zap className="w-8 h-8 mx-auto text-yellow-400 mb-2" />
                            <h3 className="text-lg font-semibold text-white">Focus Areas</h3>
                            <p className="text-sm text-gray-400">What sectors or skills need attention?</p>
                        </div>

                        <Textarea
                            placeholder="e.g., Health & fitness, learning new skills, project deadlines..."
                            value={formData.focusAreas.join('\n')}
                            onChange={(e) => setFormData({ ...formData, focusAreas: e.target.value.split('\n') })}
                            rows={3}
                        />
                    </div>
                );

            case 3: // Rate
                return (
                    <div className="space-y-8">
                        <div className="text-center mb-4">
                            <h3 className="text-lg font-semibold text-white">Rate Your Week</h3>
                            <p className="text-sm text-gray-400">How did you feel overall?</p>
                        </div>

                        <RatingStars
                            value={formData.productivityRating}
                            onChange={(v) => setFormData({ ...formData, productivityRating: v })}
                            icon={Target}
                            label="Productivity"
                        />

                        <RatingStars
                            value={formData.energyRating}
                            onChange={(v) => setFormData({ ...formData, energyRating: v })}
                            icon={Battery}
                            label="Energy Level"
                        />

                        <RatingStars
                            value={formData.satisfactionRating}
                            onChange={(v) => setFormData({ ...formData, satisfactionRating: v })}
                            icon={Smile}
                            label="Satisfaction"
                        />
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Weekly Review"
            description={`Step ${step + 1} of ${STEPS.length}: ${STEPS[step]}`}
            size="lg"
        >
            {existingReview ? (
                <div className="text-center py-8">
                    <Check className="w-16 h-16 mx-auto text-green-400 mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">Review Complete!</h3>
                    <p className="text-gray-400">You've already completed your weekly review.</p>
                    <p className="text-sm text-gray-500 mt-2">
                        Completed on {format(new Date(existingReview.createdAt), 'MMM d, yyyy')}
                    </p>
                </div>
            ) : (
                <>
                    {/* Progress */}
                    <div className="flex gap-2 mb-6">
                        {STEPS.map((s, idx) => (
                            <div
                                key={s}
                                className={cn(
                                    "flex-1 h-1 rounded-full transition-colors",
                                    idx <= step ? "bg-cyan-400" : "bg-gray-700"
                                )}
                            />
                        ))}
                    </div>

                    {renderStep()}

                    <ModalFooter>
                        <div className="flex justify-between w-full">
                            <Button
                                variant="ghost"
                                onClick={handleBack}
                                disabled={step === 0}
                                leftIcon={<ChevronLeft className="w-4 h-4" />}
                            >
                                Back
                            </Button>

                            {step === STEPS.length - 1 ? (
                                <Button onClick={handleSave} rightIcon={<Check className="w-4 h-4" />}>
                                    Save Review
                                </Button>
                            ) : (
                                <Button onClick={handleNext} rightIcon={<ChevronRight className="w-4 h-4" />}>
                                    Next
                                </Button>
                            )}
                        </div>
                    </ModalFooter>
                </>
            )}
        </Modal>
    );
};
