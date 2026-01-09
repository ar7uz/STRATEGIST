import { useState, useEffect, useCallback, useRef } from 'react';

interface UseTimerReturn {
    timeLeft: number;
    isActive: boolean;
    progress: number;
    formatTime: (seconds: number) => string;
    start: () => void;
    pause: () => void;
    toggle: () => void;
    reset: () => void;
    addTime: (minutes: number) => void;
}

export const useTimer = (initialMinutes: number, onComplete?: () => void): UseTimerReturn => {
    const [timeLeft, setTimeLeft] = useState(initialMinutes * 60);
    const [isActive, setIsActive] = useState(false);
    const totalTime = initialMinutes * 60;
    const onCompleteRef = useRef(onComplete);

    // Keep callback ref updated
    useEffect(() => {
        onCompleteRef.current = onComplete;
    }, [onComplete]);

    useEffect(() => {
        let interval: ReturnType<typeof setInterval> | undefined;

        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        setIsActive(false);
                        onCompleteRef.current?.();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isActive, timeLeft]);

    const formatTime = useCallback((seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }, []);

    const start = useCallback(() => setIsActive(true), []);
    const pause = useCallback(() => setIsActive(false), []);
    const toggle = useCallback(() => setIsActive(prev => !prev), []);
    const reset = useCallback(() => {
        setIsActive(false);
        setTimeLeft(initialMinutes * 60);
    }, [initialMinutes]);

    const addTime = useCallback((minutes: number) => {
        setTimeLeft(prev => prev + (minutes * 60));
    }, []);

    const progress = totalTime > 0 ? ((totalTime - timeLeft) / totalTime) * 100 : 0;

    return {
        timeLeft,
        isActive,
        progress,
        formatTime,
        start,
        pause,
        toggle,
        reset,
        addTime,
    };
};
