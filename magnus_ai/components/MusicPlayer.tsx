import React, { useState, useRef, useEffect, useCallback } from 'react';
import { type Music } from '../types';
import { AgentIcon, MusicNoteIcon, PlayIcon, PauseIcon } from './icons/Icons';

const YouTubeIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 28 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M27.427 3.09C27.107 1.87 26.137 0.91 24.907 0.59C22.727 0 14 0 14 0C14 0 5.277 0 3.097 0.59C1.867 0.91 0.897 1.87 0.577 3.09C-0.003 5.28 -0.003 10 -0.003 10C-0.003 10 -0.003 14.72 0.577 16.91C0.897 18.13 1.867 19.09 3.097 19.41C5.277 20 14 20 14 20C14 20 22.727 20 24.907 19.41C26.137 19.09 27.107 18.13 27.427 16.91C28.007 14.72 28.007 10 28.007 10C28.007 10 28.007 5.28 27.427 3.09Z" fill="#FF0000"/>
        <path d="M11.195 14.28V5.71L18.475 10L11.195 14.28Z" fill="white"/>
    </svg>
);


// --- Web Audio API Helpers ---

const noteFrequencies: { [key: string]: number } = {
    'C3': 130.81, 'D3': 146.83, 'E3': 164.81, 'F3': 174.61, 'G3': 196.00, 'A3': 220.00, 'B3': 246.94,
    'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'G4': 392.00, 'A4': 440.00, 'B4': 493.88,
    'C5': 523.25, 'D5': 587.33, 'E5': 659.25,
};

const noteSequences = {
    upbeat: ['C4', 'E4', 'G4', 'C5', 'G4', 'E4'],
    somber: ['A3', 'C4', 'E4', 'A4', 'E4', 'C4'],
    ethereal: ['D4', 'A4', 'D5', 'C5', 'A4', 'D4'],
    driving: ['C3', 'C3', 'G3', 'C3', 'C3', 'C3', 'G3', 'C3'],
    mellow: ['F3', 'A3', 'C4', 'E4', 'C4', 'A3'],
};

export const MusicPlayer: React.FC<{ music: Music }> = ({ music }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const animationFrameIdRef = useRef<number | null>(null);
    const noteTimeoutIdRef = useRef<number | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const stopAudio = useCallback(() => {
        if (noteTimeoutIdRef.current) {
            clearTimeout(noteTimeoutIdRef.current);
            noteTimeoutIdRef.current = null;
        }
        if (animationFrameIdRef.current) {
            cancelAnimationFrame(animationFrameIdRef.current);
            animationFrameIdRef.current = null;
        }
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close().then(() => {
                audioContextRef.current = null;
                analyserRef.current = null;
            });
        }
        setIsPlaying(false);
    }, []);

    useEffect(() => {
        // Cleanup on unmount or if music changes
        return () => stopAudio();
    }, [music, stopAudio]);

    const drawVisualizer = useCallback(() => {
        const canvas = canvasRef.current;
        const analyser = analyserRef.current;
        if (!canvas || !analyser) return;

        const canvasCtx = canvas.getContext('2d');
        if (!canvasCtx) return;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteTimeDomainData(dataArray);

        canvasCtx.fillStyle = 'rgb(44, 47, 55)'; // bg-bubble-model
        canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
        
        canvasCtx.lineWidth = 2;
        canvasCtx.strokeStyle = 'rgb(54, 98, 227)'; // text-accent
        canvasCtx.beginPath();
        
        const sliceWidth = canvas.width * 1.0 / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
            const v = dataArray[i] / 128.0;
            const y = v * canvas.height / 2;

            if (i === 0) {
                canvasCtx.moveTo(x, y);
            } else {
                canvasCtx.lineTo(x, y);
            }
            x += sliceWidth;
        }
        canvasCtx.lineTo(canvas.width, canvas.height / 2);
        canvasCtx.stroke();
        
        animationFrameIdRef.current = requestAnimationFrame(drawVisualizer);
    }, []);

    const playAudio = useCallback(() => {
        const context = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = context;

        const analyser = context.createAnalyser();
        analyser.fftSize = 2048;
        analyserRef.current = analyser;

        const masterGain = context.createGain();
        masterGain.gain.setValueAtTime(0.2, context.currentTime); // Keep volume reasonable
        masterGain.connect(analyser);
        analyser.connect(context.destination);

        const sequence = noteSequences[music.mood] || noteSequences.mellow;
        const noteDurationSeconds = 60 / music.tempo / 2; // Eighth notes
        let noteIndex = 0;

        const scheduleNote = () => {
            const note = sequence[noteIndex % sequence.length];
            const freq = noteFrequencies[note];
            
            if (freq && context.state === 'running') {
                const osc = context.createOscillator();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, context.currentTime);

                const noteGain = context.createGain();
                noteGain.gain.setValueAtTime(1, context.currentTime);
                noteGain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + noteDurationSeconds * 0.9);

                osc.connect(noteGain);
                noteGain.connect(masterGain);
                
                osc.start(context.currentTime);
                osc.stop(context.currentTime + noteDurationSeconds);
            }

            noteIndex++;
            noteTimeoutIdRef.current = window.setTimeout(scheduleNote, noteDurationSeconds * 1000);
        };
        
        scheduleNote();
        drawVisualizer();

    }, [music, drawVisualizer]);
    
    const togglePlay = () => {
        if (isPlaying) {
            stopAudio();
        } else {
            setIsPlaying(true);
            playAudio();
        }
    };

    return (
        <div className="flex items-start gap-3 w-full justify-start flex-row">
            <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-gray-600 self-start mt-1">
                <AgentIcon className="w-6 h-6 text-white" />
            </div>
            <div className="bg-bubble-model text-text-primary p-5 rounded-2xl rounded-bl-none max-w-2xl w-full">
                {/* Header */}
                <div className="flex items-center gap-4 pb-3 border-b border-gray-700/50">
                    <div className="w-16 h-16 bg-accent rounded-lg flex items-center justify-center shrink-0">
                        <MusicNoteIcon className="w-10 h-10 text-white" />
                    </div>
                    <div className="truncate">
                        <p className="text-sm text-accent-hover font-semibold">Magnus AI Generated</p>
                        <h2 className="text-xl font-bold text-text-primary truncate">{music.title}</h2>
                        <p className="text-md text-text-secondary truncate">{music.artist}</p>
                    </div>
                </div>

                {/* Player Controls */}
                <div className="flex items-center gap-4 mt-4 p-3 bg-primary/50 rounded-lg">
                    <button onClick={togglePlay} className="p-3 bg-accent text-white rounded-full hover:bg-accent-hover transition-colors">
                        {isPlaying ? <PauseIcon className="w-6 h-6" /> : <PlayIcon className="w-6 h-6" />}
                    </button>
                    <div className="flex-1">
                        <canvas ref={canvasRef} width="300" height="50" className="w-full h-12 rounded"></canvas>
                    </div>
                </div>

                {/* Description */}
                <div className="mt-4">
                    <h3 className="text-sm font-semibold text-text-secondary mb-1">Concept Description</h3>
                    <p className="text-base leading-relaxed whitespace-pre-wrap">{music.description}</p>
                </div>

                {/* YouTube Links */}
                {music.youtubeLinks && music.youtubeLinks.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-700/50">
                        <h3 className="text-sm font-semibold text-text-secondary mb-3">Similar Songs to Check Out</h3>
                        <div className="space-y-2">
                            {music.youtubeLinks.map((link, index) => (
                                <a
                                    key={index}
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 p-2 rounded-lg bg-primary/50 hover:bg-primary/80 transition-colors"
                                >
                                    <YouTubeIcon className="w-8 h-auto shrink-0" />
                                    <div className="truncate">
                                        <p className="font-medium text-text-primary truncate">{link.title}</p>
                                        <p className="text-xs text-text-secondary truncate">{new URL(link.url).hostname}</p>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
