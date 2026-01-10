import { useState } from 'react';
import { cn } from '../../lib/utils';
import { Repeat } from 'lucide-react';

export interface RecurrenceConfig {
    type: 'none' | 'daily' | 'weekly' | 'monthly' | 'custom';
    interval: number;
    daysOfWeek?: number[]; // 0 = Sunday, 1 = Monday, etc.
    dayOfMonth?: number;
    endDate?: string;
    endAfterOccurrences?: number;
}

interface RecurrencePickerProps {
    value: RecurrenceConfig;
    onChange: (config: RecurrenceConfig) => void;
    compact?: boolean;
}

const DAYS_OF_WEEK = [
    { id: 0, short: 'S', full: 'Sunday' },
    { id: 1, short: 'M', full: 'Monday' },
    { id: 2, short: 'T', full: 'Tuesday' },
    { id: 3, short: 'W', full: 'Wednesday' },
    { id: 4, short: 'T', full: 'Thursday' },
    { id: 5, short: 'F', full: 'Friday' },
    { id: 6, short: 'S', full: 'Saturday' },
];

export const RecurrencePicker = ({ value, onChange, compact = false }: RecurrencePickerProps) => {
    const [isExpanded, setIsExpanded] = useState(value.type !== 'none');

    const handleTypeChange = (type: RecurrenceConfig['type']) => {
        if (type === 'none') {
            onChange({ type: 'none', interval: 1 });
            setIsExpanded(false);
        } else {
            onChange({
                ...value,
                type,
                interval: value.interval || 1,
                daysOfWeek: type === 'weekly' ? [1] : undefined, // Default to Monday
            });
            setIsExpanded(true);
        }
    };

    const toggleDayOfWeek = (day: number) => {
        const currentDays = value.daysOfWeek || [];
        const newDays = currentDays.includes(day)
            ? currentDays.filter(d => d !== day)
            : [...currentDays, day].sort();

        if (newDays.length === 0) return; // Must have at least one day

        onChange({ ...value, daysOfWeek: newDays });
    };

    const getRecurrenceLabel = () => {
        if (value.type === 'none') return 'Does not repeat';
        if (value.type === 'daily') {
            return value.interval === 1 ? 'Daily' : `Every ${value.interval} days`;
        }
        if (value.type === 'weekly') {
            const days = value.daysOfWeek?.map(d => DAYS_OF_WEEK[d].short).join(', ');
            return value.interval === 1 ? `Weekly on ${days}` : `Every ${value.interval} weeks on ${days}`;
        }
        if (value.type === 'monthly') {
            return value.interval === 1 ? 'Monthly' : `Every ${value.interval} months`;
        }
        return 'Custom';
    };

    if (compact && !isExpanded) {
        return (
            <button
                onClick={() => setIsExpanded(true)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
                <Repeat className="w-4 h-4" />
                <span>{getRecurrenceLabel()}</span>
            </button>
        );
    }

    return (
        <div className="space-y-4">
            {/* Type Selector */}
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Repeat</label>
                <div className="grid grid-cols-5 gap-2">
                    {(['none', 'daily', 'weekly', 'monthly', 'custom'] as const).map(type => (
                        <button
                            key={type}
                            onClick={() => handleTypeChange(type)}
                            className={cn(
                                "py-2 px-3 rounded-lg text-sm font-medium capitalize transition-all",
                                value.type === type
                                    ? "bg-cyan-400 text-gray-900"
                                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                            )}
                        >
                            {type === 'none' ? 'No' : type}
                        </button>
                    ))}
                </div>
            </div>

            {/* Interval */}
            {value.type !== 'none' && (
                <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-400">Every</span>
                    <input
                        type="number"
                        min={1}
                        max={99}
                        value={value.interval}
                        onChange={(e) => onChange({ ...value, interval: Math.max(1, parseInt(e.target.value) || 1) })}
                        className="w-16 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-center focus:outline-none focus:border-cyan-400"
                    />
                    <span className="text-sm text-gray-400">
                        {value.type === 'daily' && 'day(s)'}
                        {value.type === 'weekly' && 'week(s)'}
                        {value.type === 'monthly' && 'month(s)'}
                        {value.type === 'custom' && 'day(s)'}
                    </span>
                </div>
            )}

            {/* Days of Week (for weekly) */}
            {value.type === 'weekly' && (
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">On these days</label>
                    <div className="flex gap-1">
                        {DAYS_OF_WEEK.map(day => (
                            <button
                                key={day.id}
                                onClick={() => toggleDayOfWeek(day.id)}
                                title={day.full}
                                className={cn(
                                    "w-9 h-9 rounded-lg text-sm font-medium transition-all",
                                    value.daysOfWeek?.includes(day.id)
                                        ? "bg-cyan-400 text-gray-900"
                                        : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                                )}
                            >
                                {day.short}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* End Condition */}
            {value.type !== 'none' && (
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Ends</label>
                    <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="endType"
                                checked={!value.endDate && !value.endAfterOccurrences}
                                onChange={() => onChange({ ...value, endDate: undefined, endAfterOccurrences: undefined })}
                                className="accent-cyan-400"
                            />
                            <span className="text-sm text-gray-400">Never</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="endType"
                                checked={!!value.endDate}
                                onChange={() => onChange({ ...value, endDate: '', endAfterOccurrences: undefined })}
                                className="accent-cyan-400"
                            />
                            <span className="text-sm text-gray-400">On date</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="endType"
                                checked={!!value.endAfterOccurrences}
                                onChange={() => onChange({ ...value, endDate: undefined, endAfterOccurrences: 10 })}
                                className="accent-cyan-400"
                            />
                            <span className="text-sm text-gray-400">After</span>
                        </label>
                    </div>

                    {value.endDate !== undefined && (
                        <input
                            type="date"
                            value={value.endDate}
                            onChange={(e) => onChange({ ...value, endDate: e.target.value })}
                            className="mt-2 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                        />
                    )}

                    {value.endAfterOccurrences !== undefined && (
                        <div className="flex items-center gap-2 mt-2">
                            <input
                                type="number"
                                min={1}
                                max={999}
                                value={value.endAfterOccurrences}
                                onChange={(e) => onChange({ ...value, endAfterOccurrences: Math.max(1, parseInt(e.target.value) || 1) })}
                                className="w-20 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-center focus:outline-none focus:border-cyan-400"
                            />
                            <span className="text-sm text-gray-400">occurrences</span>
                        </div>
                    )}
                </div>
            )}

            {/* Preview */}
            {value.type !== 'none' && (
                <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                    <div className="flex items-center gap-2 text-sm">
                        <Repeat className="w-4 h-4 text-cyan-400" />
                        <span className="text-gray-300">{getRecurrenceLabel()}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export const defaultRecurrence: RecurrenceConfig = {
    type: 'none',
    interval: 1,
};
