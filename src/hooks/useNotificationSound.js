import { useCallback, useRef, useEffect } from 'react';

// Base64 encoded notification sound (short pleasant chime)
const NOTIFICATION_SOUND_BASE64 = `data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdX2MlY+Lf3V2e4qVmJWKd2VmaHyOmJyXiXJfWVtrhZablYZxXlVYaIGVnpuMfG5fWF96kJublYJxX1RWaYWanJeGcl9WXnaMm5uThXNjVVNlgZWdk4p5bGBcZ32Qm5qShnxwZWFsd4eVlpCDd21nZnB+ipKRi4F4cGhqcn2HjoyGfnZubG1yfYKFgoB7d3Rxc3l/goOAfXp2cnFzdXt+f398eXZzcnN1d3l7e3p4dnRyc3R2d3h5eHd2dHNzdHV2d3d3dnV0c3N0dXZ2dnZ1dHRzdHR1dXV1dXR0c3R0dHV1dXV0dHNzdHR0dXV0dHRzc3N0dHR0dHR0c3NzdHR0dHR0c3NzdHR0dHR0dHNzc3R0dHR0dHNzc3R0dHR0dHNzc3R0dHR0dHNzdHR0dHR0dHNzdHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0`;

// Alternative: Generate a simple beep using Web Audio API
const generateNotificationBeep = (audioContext) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 880; // A5 note
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
};

// Generate a pleasant notification melody
const generateMelody = (audioContext) => {
    const notes = [
        { freq: 523.25, duration: 0.15, delay: 0 },      // C5
        { freq: 659.25, duration: 0.15, delay: 0.15 },   // E5
        { freq: 783.99, duration: 0.2, delay: 0.3 },     // G5
        { freq: 1046.50, duration: 0.3, delay: 0.5 }     // C6
    ];
    
    notes.forEach(note => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = note.freq;
        oscillator.type = 'sine';
        
        const startTime = audioContext.currentTime + note.delay;
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + note.duration);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + note.duration);
    });
};

// Generate urgent alarm sound
const generateAlarmSound = (audioContext) => {
    for (let i = 0; i < 3; i++) {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800 + (i * 100);
        oscillator.type = 'square';
        
        const startTime = audioContext.currentTime + (i * 0.3);
        gainNode.gain.setValueAtTime(0.2, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + 0.2);
    }
};

export const SOUND_TYPES = {
    CHIME: 'chime',
    MELODY: 'melody',
    BEEP: 'beep',
    ALARM: 'alarm'
};

export const useNotificationSound = () => {
    const audioContextRef = useRef(null);
    const audioElementRef = useRef(null);
    
    // Initialize audio context on first user interaction
    const initAudio = useCallback(() => {
        try {
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
                console.log('[PillTrack] AudioContext created');
            }
            if (audioContextRef.current.state === 'suspended') {
                audioContextRef.current.resume();
                console.log('[PillTrack] AudioContext resumed');
            }
            if (!audioElementRef.current) {
                audioElementRef.current = new Audio(NOTIFICATION_SOUND_BASE64);
                audioElementRef.current.volume = 0.5;
            }
            return true;
        } catch (error) {
            console.error('[PillTrack] Failed to initialize audio:', error);
            return false;
        }
    }, []);
    
    const playSound = useCallback((type = SOUND_TYPES.MELODY) => {
        try {
            const initialized = initAudio();
            if (!initialized) {
                console.warn('[PillTrack] Audio not initialized, cannot play sound');
                return;
            }
            
            const ctx = audioContextRef.current;
            if (!ctx) {
                console.warn('[PillTrack] No AudioContext available');
                return;
            }
            
            if (ctx.state === 'suspended') {
                ctx.resume();
            }
            
            console.log('[PillTrack] Playing sound:', type);
            
            switch (type) {
                case SOUND_TYPES.CHIME:
                    if (audioElementRef.current) {
                        audioElementRef.current.currentTime = 0;
                        audioElementRef.current.play().catch(() => {
                            // Fallback to generated beep
                            generateNotificationBeep(ctx);
                        });
                    }
                    break;
                case SOUND_TYPES.MELODY:
                    generateMelody(ctx);
                    break;
                case SOUND_TYPES.BEEP:
                    generateNotificationBeep(ctx);
                    break;
                case SOUND_TYPES.ALARM:
                    generateAlarmSound(ctx);
                    break;
                default:
                    generateMelody(ctx);
            }
        } catch (error) {
            console.error('Failed to play notification sound:', error);
        }
    }, [initAudio]);
    
    const stopSound = useCallback(() => {
        if (audioElementRef.current) {
            audioElementRef.current.pause();
            audioElementRef.current.currentTime = 0;
        }
    }, []);
    
    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
        };
    }, []);
    
    return { playSound, stopSound, initAudio };
};

export default useNotificationSound;
