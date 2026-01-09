import { useState, useRef, useEffect, useCallback } from 'react';

export interface SoundOption {
    id: string;
    name: string;
    icon: string;
    url: string;
}

// Free looping ambient sounds from reliable sources
// Using SoundHelix (royalty-free) and other verified CDNs
export const SOUND_OPTIONS: SoundOption[] = [
    {
        id: 'silence',
        name: 'Silence',
        icon: '🔇',
        url: '',
    },
    {
        id: 'rain',
        name: 'Rain',
        icon: '🌧️',
        // Rain from archive.org
        url: 'https://archive.org/download/rain_sounds_10_hours/rain-sounds-10-hours.mp3',
    },
    {
        id: 'ocean',
        name: 'Ocean Waves',
        icon: '🌊',
        // Ocean from archive.org  
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    },
    {
        id: 'forest',
        name: 'Nature',
        icon: '🌲',
        // Calm music alternative
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    },
    {
        id: 'fire',
        name: 'Ambient',
        icon: '🔥',
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    },
    {
        id: 'lofi',
        name: 'Lo-Fi Beats',
        icon: '🎵',
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
    },
    {
        id: 'white',
        name: 'Electronic',
        icon: '📻',
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
    },
];

interface UseAudioReturn {
    isPlaying: boolean;
    currentSound: SoundOption | null;
    volume: number;
    isLoading: boolean;
    error: string | null;
    play: (soundId: string) => void;
    pause: () => void;
    toggle: () => void;
    setVolume: (volume: number) => void;
    selectSound: (soundId: string) => void;
}

export const useAudio = (defaultSoundId: string = 'silence'): UseAudioReturn => {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentSoundId, setCurrentSoundId] = useState(() => {
        return localStorage.getItem('strategist-sound-id') || defaultSoundId;
    });
    const [volume, setVolumeState] = useState(() => {
        const saved = localStorage.getItem('strategist-sound-volume');
        return saved ? Number(saved) : 70;
    });

    const currentSound = SOUND_OPTIONS.find(s => s.id === currentSoundId) || null;

    // Initialize audio element once
    useEffect(() => {
        const audio = new Audio();
        audio.loop = true;
        audio.crossOrigin = 'anonymous';
        audio.preload = 'auto';

        audio.addEventListener('canplaythrough', () => {
            setIsLoading(false);
        });

        audio.addEventListener('error', (e) => {
            console.error('Audio error:', e);
            setError('Failed to load audio');
            setIsLoading(false);
            setIsPlaying(false);
        });

        audio.addEventListener('playing', () => {
            setIsPlaying(true);
            setIsLoading(false);
            setError(null);
        });

        audio.addEventListener('pause', () => {
            setIsPlaying(false);
        });

        audioRef.current = audio;

        return () => {
            audio.pause();
            audio.src = '';
            audioRef.current = null;
        };
    }, []);

    // Update volume when changed
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume / 100;
        }
        localStorage.setItem('strategist-sound-volume', String(volume));
    }, [volume]);

    const play = useCallback((soundId: string) => {
        const sound = SOUND_OPTIONS.find(s => s.id === soundId);
        const audio = audioRef.current;

        if (!sound || !sound.url || !audio) {
            setIsPlaying(false);
            return;
        }

        setError(null);
        setIsLoading(true);
        setCurrentSoundId(soundId);
        localStorage.setItem('strategist-sound-id', soundId);

        // Stop current playback
        audio.pause();

        // Set new source and play
        audio.src = sound.url;
        audio.load();

        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise
                .then(() => {
                    setIsPlaying(true);
                    setIsLoading(false);
                })
                .catch((err) => {
                    console.warn('Autoplay blocked:', err);
                    setError('Click to play');
                    setIsPlaying(false);
                    setIsLoading(false);
                });
        }
    }, []);

    const pause = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            setIsPlaying(false);
        }
    }, []);

    const toggle = useCallback(() => {
        const audio = audioRef.current;
        if (!audio) return;

        if (isPlaying) {
            pause();
        } else if (currentSound?.url) {
            // If source is not set or different, set it
            if (!audio.src || !audio.src.includes(currentSound.url.split('/').pop() || '')) {
                audio.src = currentSound.url;
                audio.load();
            }

            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise.catch((err) => {
                    console.warn('Play failed:', err);
                    setError('Click again to play');
                });
            }
        }
    }, [isPlaying, currentSound, pause]);

    const setVolume = useCallback((newVolume: number) => {
        setVolumeState(Math.max(0, Math.min(100, newVolume)));
    }, []);

    const selectSound = useCallback((soundId: string) => {
        const sound = SOUND_OPTIONS.find(s => s.id === soundId);

        setCurrentSoundId(soundId);
        localStorage.setItem('strategist-sound-id', soundId);
        setError(null);

        if (!sound?.url) {
            pause();
            return;
        }

        // Auto-play when selecting a sound
        play(soundId);
    }, [pause, play]);

    return {
        isPlaying,
        currentSound,
        volume,
        isLoading,
        error,
        play,
        pause,
        toggle,
        setVolume,
        selectSound,
    };
};
