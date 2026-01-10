import { useState } from 'react';
import {
    Settings,
    Palette,
    Target,
    Download,
    Upload,
    RotateCcw,
    Moon,
    Zap,
    Check
} from 'lucide-react';
import { useSettingsStore } from './store';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { cn } from '../../lib/utils';

const ACCENT_COLORS = [
    { id: 'cyan', color: '#00D4AA', label: 'Cyan' },
    { id: 'purple', color: '#A855F7', label: 'Purple' },
    { id: 'blue', color: '#0088FF', label: 'Blue' },
    { id: 'green', color: '#22C55E', label: 'Green' },
    { id: 'orange', color: '#FFB800', label: 'Orange' },
] as const;

const THEMES = [
    { id: 'dark', label: 'Dark', icon: Moon },
    { id: 'darker', label: 'Darker', icon: Moon },
    { id: 'oled', label: 'OLED Black', icon: Moon },
] as const;

export const SettingsView = () => {
    const settings = useSettingsStore();
    const [showExport, setShowExport] = useState(false);
    const [exportData, setExportData] = useState('');
    const [importStatus, setImportStatus] = useState<string | null>(null);

    const handleExport = () => {
        const data = settings.exportData();
        setExportData(data);
        setShowExport(true);
    };

    const handleDownload = () => {
        const blob = new Blob([exportData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `strategist-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target?.result as string);
                Object.entries(data).forEach(([key, value]) => {
                    localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
                });
                setImportStatus('Data imported successfully! Refresh to apply.');
            } catch (err) {
                setImportStatus('Import failed: Invalid file format');
            }
        };
        reader.readAsText(file);
    };

    const handleReset = () => {
        if (confirm('Are you sure you want to reset all settings to default?')) {
            settings.resetSettings();
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white">Settings</h1>
                <p className="text-gray-400 mt-1">Customize your strategic command center</p>
            </div>

            {/* Appearance */}
            <Card variant="elevated">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-purple-400/10 flex items-center justify-center">
                        <Palette className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                        <h2 className="font-semibold text-white">Appearance</h2>
                        <p className="text-sm text-gray-400">Theme and visual preferences</p>
                    </div>
                </div>

                {/* Accent Color */}
                <div className="space-y-3 mb-6">
                    <label className="text-sm font-medium text-gray-300">Accent Color</label>
                    <div className="flex gap-3">
                        {ACCENT_COLORS.map(({ id, color, label }) => (
                            <button
                                key={id}
                                title={label}
                                onClick={() => settings.updateSettings({ accentColor: id as any })}
                                className={cn(
                                    "w-12 h-12 rounded-xl transition-all relative",
                                    settings.accentColor === id ? "ring-2 ring-white ring-offset-2 ring-offset-gray-900 scale-110" : "hover:scale-105"
                                )}
                                style={{ backgroundColor: color }}
                            >
                                {settings.accentColor === id && (
                                    <Check className="w-5 h-5 text-white absolute inset-0 m-auto" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Theme */}
                <div className="space-y-3 mb-6">
                    <label className="text-sm font-medium text-gray-300">Theme</label>
                    <div className="flex gap-3">
                        {THEMES.map(({ id, label, icon: Icon }) => (
                            <button
                                key={id}
                                onClick={() => settings.updateSettings({ theme: id as any })}
                                className={cn(
                                    "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all",
                                    settings.theme === id
                                        ? "bg-cyan-400 text-gray-900"
                                        : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                                )}
                            >
                                <Icon className="w-4 h-4" />
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Font Size */}
                <div className="space-y-3 mb-6">
                    <label className="text-sm font-medium text-gray-300">Font Size</label>
                    <div className="flex gap-3">
                        {(['small', 'medium', 'large'] as const).map((size) => (
                            <button
                                key={size}
                                onClick={() => settings.updateSettings({ fontSize: size })}
                                className={cn(
                                    "flex-1 py-3 rounded-xl font-medium transition-all capitalize",
                                    settings.fontSize === size
                                        ? "bg-cyan-400 text-gray-900"
                                        : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                                )}
                            >
                                {size}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Reduce Motion */}
                <div className="flex items-center justify-between py-3 border-t border-gray-800">
                    <div>
                        <p className="font-medium text-white">Reduce Motion</p>
                        <p className="text-sm text-gray-500">Disable animations for accessibility</p>
                    </div>
                    <button
                        onClick={() => settings.updateSettings({ reduceMotion: !settings.reduceMotion })}
                        className={cn(
                            "w-12 h-7 rounded-full transition-colors relative",
                            settings.reduceMotion ? "bg-cyan-400" : "bg-gray-700"
                        )}
                    >
                        <div
                            className={cn(
                                "w-5 h-5 rounded-full bg-white absolute top-1 transition-transform",
                                settings.reduceMotion ? "translate-x-6" : "translate-x-1"
                            )}
                        />
                    </button>
                </div>
            </Card>

            {/* Focus Settings */}
            <Card variant="elevated">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-cyan-400/10 flex items-center justify-center">
                        <Target className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                        <h2 className="font-semibold text-white">Focus Session</h2>
                        <p className="text-sm text-gray-400">Timer and concentration settings</p>
                    </div>
                </div>

                {/* Default Duration */}
                <div className="space-y-3 mb-6">
                    <label className="text-sm font-medium text-gray-300">Default Focus Duration</label>
                    <div className="flex gap-2">
                        {[15, 25, 30, 45, 60, 90].map((mins) => (
                            <button
                                key={mins}
                                onClick={() => settings.updateSettings({ defaultFocusDuration: mins })}
                                className={cn(
                                    "flex-1 py-2.5 rounded-lg text-sm font-medium transition-all",
                                    settings.defaultFocusDuration === mins
                                        ? "bg-cyan-400 text-gray-900"
                                        : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                                )}
                            >
                                {mins}m
                            </button>
                        ))}
                    </div>
                </div>

                {/* Sound Volume */}
                <div className="space-y-3 mb-6">
                    <div className="flex justify-between">
                        <label className="text-sm font-medium text-gray-300">Default Volume</label>
                        <span className="text-sm text-cyan-400">{settings.soundVolume}%</span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={settings.soundVolume}
                        onChange={(e) => settings.updateSettings({ soundVolume: Number(e.target.value) })}
                        className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                    />
                </div>

                {/* Break Reminders */}
                <div className="flex items-center justify-between py-3 border-t border-gray-800">
                    <div>
                        <p className="font-medium text-white">Break Reminders</p>
                        <p className="text-sm text-gray-500">Get notified to take breaks</p>
                    </div>
                    <button
                        onClick={() => settings.updateSettings({ breakReminders: !settings.breakReminders })}
                        className={cn(
                            "w-12 h-7 rounded-full transition-colors relative",
                            settings.breakReminders ? "bg-cyan-400" : "bg-gray-700"
                        )}
                    >
                        <div
                            className={cn(
                                "w-5 h-5 rounded-full bg-white absolute top-1 transition-transform",
                                settings.breakReminders ? "translate-x-6" : "translate-x-1"
                            )}
                        />
                    </button>
                </div>
            </Card>

            {/* Productivity Goals */}
            <Card variant="elevated">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-orange-400/10 flex items-center justify-center">
                        <Zap className="w-5 h-5 text-orange-400" />
                    </div>
                    <div>
                        <h2 className="font-semibold text-white">Daily Goals</h2>
                        <p className="text-sm text-gray-400">Set your productivity targets</p>
                    </div>
                </div>

                {/* Daily Task Goal */}
                <div className="space-y-3 mb-6">
                    <div className="flex justify-between">
                        <label className="text-sm font-medium text-gray-300">Daily Task Target</label>
                        <span className="text-sm text-cyan-400">{settings.dailyTaskGoal} tasks</span>
                    </div>
                    <input
                        type="range"
                        min="1"
                        max="20"
                        value={settings.dailyTaskGoal}
                        onChange={(e) => settings.updateSettings({ dailyTaskGoal: Number(e.target.value) })}
                        className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                    />
                </div>

                {/* Daily Focus Goal */}
                <div className="space-y-3">
                    <div className="flex justify-between">
                        <label className="text-sm font-medium text-gray-300">Daily Focus Time Target</label>
                        <span className="text-sm text-cyan-400">{Math.floor(settings.dailyFocusGoal / 60)}h {settings.dailyFocusGoal % 60}m</span>
                    </div>
                    <input
                        type="range"
                        min="30"
                        max="480"
                        step="30"
                        value={settings.dailyFocusGoal}
                        onChange={(e) => settings.updateSettings({ dailyFocusGoal: Number(e.target.value) })}
                        className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                    />
                </div>
            </Card>

            {/* Data Management */}
            <Card variant="elevated">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-green-400/10 flex items-center justify-center">
                        <Download className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                        <h2 className="font-semibold text-white">Data Management</h2>
                        <p className="text-sm text-gray-400">Export, import, or reset your data</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Button
                        variant="outline"
                        onClick={handleExport}
                        leftIcon={<Download className="w-4 h-4" />}
                        className="w-full"
                    >
                        Export Data
                    </Button>

                    <label className="relative flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-gray-700 bg-transparent text-gray-300 hover:bg-gray-800 hover:text-white transition-colors cursor-pointer w-full">
                        <Upload className="w-4 h-4" />
                        Import Data
                        <input
                            type="file"
                            accept=".json"
                            onChange={handleImport}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                    </label>

                    <Button
                        variant="danger"
                        onClick={handleReset}
                        leftIcon={<RotateCcw className="w-4 h-4" />}
                        className="w-full"
                    >
                        Reset All
                    </Button>
                </div>

                {importStatus && (
                    <div className={cn(
                        "mt-4 p-3 rounded-lg text-sm",
                        importStatus.includes('success') ? "bg-green-400/10 text-green-400" : "bg-red-400/10 text-red-400"
                    )}>
                        {importStatus}
                    </div>
                )}

                {showExport && (
                    <div className="mt-4 space-y-3">
                        <textarea
                            value={exportData}
                            readOnly
                            className="w-full h-32 p-3 bg-gray-800 rounded-lg text-xs font-mono text-gray-300 resize-none"
                        />
                        <Button onClick={handleDownload} size="sm">
                            Download JSON
                        </Button>
                    </div>
                )}
            </Card>

            {/* Keyboard Shortcuts Reference */}
            <Card variant="elevated">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gray-400/10 flex items-center justify-center">
                        <Settings className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                        <h2 className="font-semibold text-white">Keyboard Shortcuts</h2>
                        <p className="text-sm text-gray-400">Quick navigation commands</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                        { key: '1', action: 'Dashboard' },
                        { key: '2', action: 'Tasks' },
                        { key: '3', action: 'Habits' },
                        { key: '4', action: 'Analytics' },
                        { key: 'B', action: 'Show Briefing' },
                        { key: 'Esc', action: 'Close Modal' },
                    ].map(({ key, action }) => (
                        <div key={key} className="flex items-center gap-3 p-2 bg-gray-800/50 rounded-lg">
                            <kbd className="px-2.5 py-1.5 bg-gray-700 rounded border border-gray-600 font-mono text-sm text-white min-w-[40px] text-center">
                                {key}
                            </kbd>
                            <span className="text-sm text-gray-400">{action}</span>
                        </div>
                    ))}
                </div>
            </Card>

            {/* App Info */}
            <Card className="text-center py-8">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center mb-4">
                    <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">THE STRATEGIST</h3>
                <p className="text-gray-500 mt-1">Version 1.0.0 • Strategic Command Edition</p>
                <p className="text-sm text-gray-600 mt-4">Built with ❤️ for peak productivity</p>
            </Card>
        </div>
    );
};
