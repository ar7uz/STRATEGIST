import React, { useState } from 'react';
import { Play, Pause, Volume2, VolumeX, X, Plus, Minus, ChevronDown } from 'lucide-react';
import { useTimer } from './useTimer';
import { useAudio, SOUND_OPTIONS } from './useAudio';
import type { Task, Sector } from '../../lib/types';
import { Button } from '../../components/ui/Button';
import { cn } from '../../lib/utils';
import { useTasksStore } from '../tasks/store';

interface FocusSessionViewProps {
    task: Task;
    sector: Sector;
    onExit: () => void;
    onComplete: () => void;
}

export const FocusSessionView: React.FC<FocusSessionViewProps> = ({ task, sector, onExit, onComplete }) => {
    const [showSounds, setShowSounds] = useState(false);

    const { toggle, timeLeft, isActive, formatTime, progress, addTime } = useTimer(
        task.estimatedMinutes || 25,
        () => {
            audio.pause();
            alert("🎉 Session Complete! Great work!");
        }
    );

    const audio = useAudio('silence');
    const { updateTask } = useTasksStore();

    const handleStop = () => {
        const elapsedMinutes = Math.ceil(((task.estimatedMinutes * 60) - timeLeft) / 60);
        const currentActual = task.actualMinutes || 0;
        updateTask(task.id, { actualMinutes: currentActual + elapsedMinutes });
        audio.pause();
        onExit();
    };

    const handleFinishTask = () => {
        const elapsedMinutes = Math.ceil(((task.estimatedMinutes * 60) - timeLeft) / 60);
        const currentActual = task.actualMinutes || 0;
        updateTask(task.id, {
            actualMinutes: currentActual + elapsedMinutes,
            status: 'completed',
            completedAt: new Date().toISOString()
        });
        audio.pause();
        onComplete();
    };

    // Calculate ring progress
    const circumference = 2 * Math.PI * 140;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <div className="fixed inset-0 z-50 bg-gray-950 flex flex-col overflow-hidden">
            {/* Ambient Background */}
            <div
                className="absolute inset-0 opacity-20 transition-opacity duration-1000"
                style={{
                    background: `
            radial-gradient(circle at 50% 30%, ${sector.color}60, transparent 50%),
            radial-gradient(circle at 80% 80%, ${sector.color}30, transparent 40%)
          `
                }}
            />

            {/* Animated Particles (subtle) */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {isActive && [...Array(5)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-2 h-2 rounded-full opacity-30 animate-float"
                        style={{
                            backgroundColor: sector.color,
                            left: `${20 + i * 15}%`,
                            top: `${30 + (i % 3) * 20}%`,
                            animationDelay: `${i * 0.5}s`,
                            animationDuration: `${6 + i}s`
                        }}
                    />
                ))}
            </div>

            {/* Top Bar */}
            <div className="relative z-10 flex items-center justify-between p-6">
                <div className="flex items-center gap-4">
                    <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl backdrop-blur-sm"
                        style={{ background: `${sector.color}20`, border: `1px solid ${sector.color}40` }}
                    >
                        {sector.icon}
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 uppercase tracking-[0.2em] font-medium mb-1">Current Objective</p>
                        <h1 className="text-xl font-bold text-white">{task.title}</h1>
                        <div className="flex items-center gap-3 mt-1">
                            <span className="text-sm text-gray-500">{sector.name}</span>
                            {task.projectId && (
                                <span className="text-sm text-gray-600">• Project Task</span>
                            )}
                        </div>
                    </div>
                </div>

                <Button variant="ghost" size="icon" onClick={handleStop} className="text-gray-400 hover:text-white">
                    <X className="h-6 w-6" />
                </Button>
            </div>

            {/* Main Timer */}
            <div className="flex-1 flex flex-col items-center justify-center relative z-10 -mt-8">
                {/* Timer Ring */}
                <div className="relative">
                    {/* Outer Glow */}
                    {isActive && (
                        <div
                            className="absolute inset-0 rounded-full blur-3xl opacity-30 animate-pulse"
                            style={{ background: sector.color }}
                        />
                    )}

                    <svg className="w-80 h-80 md:w-[400px] md:h-[400px] transform -rotate-90">
                        {/* Background Ring */}
                        <circle
                            cx="50%"
                            cy="50%"
                            r="140"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="6"
                            className="text-gray-800/50"
                        />
                        {/* Progress Ring */}
                        <circle
                            cx="50%"
                            cy="50%"
                            r="140"
                            fill="none"
                            stroke={sector.color}
                            strokeWidth="6"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            className="transition-all duration-1000 ease-linear"
                            style={{
                                filter: isActive ? `drop-shadow(0 0 15px ${sector.color})` : 'none'
                            }}
                        />
                    </svg>

                    {/* Time Display */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span
                            className={cn(
                                "text-7xl md:text-8xl font-light tracking-tight tabular-nums transition-colors duration-300",
                                isActive ? "text-white" : "text-gray-400"
                            )}
                            style={{ fontFamily: 'SF Mono, Monaco, monospace' }}
                        >
                            {formatTime(timeLeft)}
                        </span>
                        <div className="flex items-center gap-2 mt-4">
                            <span
                                className={cn(
                                    "w-2 h-2 rounded-full transition-all duration-300",
                                    isActive ? "bg-green-400 animate-pulse" : "bg-gray-600"
                                )}
                            />
                            <span
                                className={cn(
                                    "text-sm font-medium uppercase tracking-widest transition-colors",
                                    isActive ? "text-green-400" : "text-gray-500"
                                )}
                            >
                                {isActive ? 'Focusing' : 'Paused'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Time Adjust Buttons */}
                <div className="flex items-center gap-4 mt-8">
                    <button
                        onClick={() => addTime(-5)}
                        className="p-2 text-gray-500 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                        title="Remove 5 minutes"
                    >
                        <Minus className="w-5 h-5" />
                    </button>
                    <span className="text-sm text-gray-500 w-24 text-center">Adjust time</span>
                    <button
                        onClick={() => addTime(5)}
                        className="p-2 text-gray-500 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                        title="Add 5 minutes"
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Controls */}
            <div className="relative z-10 flex flex-col items-center gap-6 pb-12">
                {/* Main Play/Pause */}
                <button
                    onClick={toggle}
                    className={cn(
                        `
            w-20 h-20 rounded-full 
            flex items-center justify-center
            transition-all duration-300 ease-out
            `,
                        isActive
                            ? 'bg-gray-800/80 text-white hover:bg-gray-700 border border-gray-700'
                            : 'text-gray-900 shadow-lg hover:scale-105'
                    )}
                    style={!isActive ? {
                        background: `linear-gradient(135deg, ${sector.color}, ${sector.color}cc)`,
                        boxShadow: `0 0 40px ${sector.color}40`
                    } : {}}
                >
                    {isActive ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8 ml-1" />}
                </button>

                {/* Complete Task Button */}
                <Button
                    variant="outline"
                    onClick={handleFinishTask}
                    className="px-8"
                >
                    ✓ Complete & Exit
                </Button>

                {/* Sound Controls */}
                <div className="relative">
                    <button
                        onClick={() => setShowSounds(!showSounds)}
                        className={cn(
                            "flex items-center gap-3 px-5 py-3 rounded-full border transition-all duration-200",
                            audio.isPlaying
                                ? "bg-gray-800/80 border-gray-700 text-white"
                                : "bg-gray-900/50 border-gray-800 text-gray-400 hover:border-gray-700"
                        )}
                    >
                        {audio.isPlaying ? (
                            <Volume2 className="w-4 h-4" style={{ color: sector.color }} />
                        ) : (
                            <VolumeX className="w-4 h-4" />
                        )}
                        <span className="text-sm font-medium">
                            {audio.currentSound?.name || 'Silence'}
                        </span>
                        <ChevronDown className={cn("w-4 h-4 transition-transform", showSounds && "rotate-180")} />
                    </button>

                    {/* Sound Picker Dropdown */}
                    {showSounds && (
                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-64 bg-gray-900/95 backdrop-blur-xl border border-gray-800 rounded-xl shadow-elevated overflow-hidden">
                            <div className="p-3 border-b border-gray-800">
                                <label className="text-xs text-gray-400 uppercase tracking-wider">Volume</label>
                                <div className="flex items-center gap-3 mt-2">
                                    <VolumeX className="w-4 h-4 text-gray-500" />
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={audio.volume}
                                        onChange={(e) => audio.setVolume(Number(e.target.value))}
                                        className="flex-1 h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                                    />
                                    <Volume2 className="w-4 h-4 text-gray-500" />
                                </div>
                            </div>
                            <div className="max-h-48 overflow-y-auto scrollbar-hide">
                                {SOUND_OPTIONS.map(sound => (
                                    <button
                                        key={sound.id}
                                        onClick={() => {
                                            audio.selectSound(sound.id);
                                            if (sound.url) audio.play(sound.id);
                                        }}
                                        className={cn(
                                            "w-full flex items-center gap-3 px-4 py-3 text-left transition-colors",
                                            audio.currentSound?.id === sound.id
                                                ? "bg-gray-800 text-white"
                                                : "text-gray-400 hover:bg-gray-800/50 hover:text-white"
                                        )}
                                    >
                                        <span className="text-xl">{sound.icon}</span>
                                        <span className="text-sm font-medium">{sound.name}</span>
                                        {audio.currentSound?.id === sound.id && audio.isPlaying && (
                                            <div className="ml-auto flex gap-0.5">
                                                {[1, 2, 3].map(i => (
                                                    <div
                                                        key={i}
                                                        className="w-0.5 bg-cyan-400 rounded-full animate-pulse"
                                                        style={{
                                                            height: `${8 + i * 4}px`,
                                                            animationDelay: `${i * 0.1}s`
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
