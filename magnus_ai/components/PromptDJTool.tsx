

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  GoogleGenAI,
  type LiveMusicServerMessage,
  type LiveMusicSession,
} from '@google/genai';

// --- Type definitions ---
interface Prompt {
  readonly promptId: string;
  readonly color: string;
  text: string;
  weight: number;
}

type PlaybackState = 'stopped' | 'playing' | 'loading' | 'paused' | 'error';

// --- Helper Functions (from former utils.ts) ---
function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const buffer = ctx.createBuffer(
    numChannels,
    data.length / 2 / numChannels,
    sampleRate,
  );

  const dataInt16 = new Int16Array(data.buffer);
  const l = dataInt16.length;
  const dataFloat32 = new Float32Array(l);
  for (let i = 0; i < l; i++) {
    dataFloat32[i] = dataInt16[i] / 32768.0;
  }
  if (numChannels === 1) { 
    buffer.copyToChannel(dataFloat32, 0);
  } else {
    for (let i = 0; i < numChannels; i++) {
      const channel = dataFloat32.filter(
        (_, index) => index % numChannels === i,
      );
      buffer.copyToChannel(channel, i);
    }
  }

  return buffer;
}

const throttle = (func: Function, limit: number) => {
    let inThrottle: boolean;
    return function (this: any, ...args: any[]) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
};


// --- Constants ---
const PROMPT_TEXT_PRESETS = [
  'Bossa Nova', 'Minimal Techno', 'Drum and Bass', 'Post Punk', 'Shoegaze',
  'Funk', 'Chiptune', 'Lush Strings', 'Sparkling Arpeggios',
  'Staccato Rhythms', 'Punchy Kick', 'Dubstep', 'K Pop', 'Neo Soul',
  'Trip Hop', 'Thrash',
];

const COLORS = [
  '#9900ff', '#5200ff', '#ff25f6', '#2af6de', '#ffdd28',
  '#3dffab', '#d8ff3e', '#d9b2ff',
];

const getUnusedRandomColor = (usedColors: string[]): string => {
  const availableColors = COLORS.filter((c) => !usedColors.includes(c));
  if (availableColors.length === 0) {
    return COLORS[Math.floor(Math.random() * COLORS.length)];
  }
  return availableColors[Math.floor(Math.random() * availableColors.length)];
};

// --- Child Components ---

const WeightSlider: React.FC<{ value: number; color: string; onInput: (value: number) => void }> = ({ value, color, onInput }) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const isDraggingRef = useRef(false);

    const updateValueFromPosition = useCallback((clientY: number) => {
        const containerBounds = scrollContainerRef.current?.getBoundingClientRect();
        if (!containerBounds) return;

        const trackHeight = containerBounds.height;
        const relativeY = clientY - containerBounds.top;
        const normalizedValue = 1 - Math.max(0, Math.min(trackHeight, relativeY)) / trackHeight;
        onInput(normalizedValue * 2);
    }, [onInput]);

    const handlePointerMove = useCallback((e: PointerEvent) => {
        if (isDraggingRef.current) {
            updateValueFromPosition(e.clientY);
        }
    }, [updateValueFromPosition]);

    const handlePointerUp = useCallback(() => {
        isDraggingRef.current = false;
        document.body.classList.remove('dragging-promptdj');
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
    }, [handlePointerMove]);

    const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
        e.preventDefault();
        isDraggingRef.current = true;
        document.body.classList.add('dragging-promptdj');
        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerup', handlePointerUp);
        updateValueFromPosition(e.clientY);
    }, [handlePointerMove, handlePointerUp, updateValueFromPosition]);
    
    const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
        e.preventDefault();
        const delta = e.deltaY;
        const newValue = Math.max(0, Math.min(2, value + delta * -0.005));
        onInput(newValue);
    }
    
    const thumbHeightPercent = (value / 2) * 100;
    
    return (
      <div className="h-full flex flex-col justify-center items-center p-[5px]">
          <div
            ref={scrollContainerRef}
            className="w-full flex-grow flex flex-col justify-center items-center cursor-ns-resize"
            onPointerDown={handlePointerDown}
            onWheel={handleWheel}
           >
            <div className="relative w-[10px] h-full bg-black/60 rounded">
              <div
                style={{
                  height: `${thumbHeightPercent}%`,
                  backgroundColor: color,
                  display: value > 0.01 ? 'block' : 'none'
                }}
                className="absolute bottom-0 left-0 w-full rounded shadow-lg"
              />
            </div>
             <div className="text-[1.3vmin] text-gray-400 my-[0.5vmin] select-none text-center">
                {value.toFixed(2)}
            </div>
          </div>
      </div>
    );
};

const AddButton: React.FC<{ onClick: () => void }> = ({ onClick }) => {
    return (
        <div className="relative flex items-center justify-center w-[12vmin] flex-shrink-0">
            <svg width="140" height="140" viewBox="0 -10 140 150" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="22" y="6" width="96" height="96" rx="48" fill="black" fillOpacity="0.05" />
                <rect x="23.5" y="7.5" width="93" height="93" rx="46.5" stroke="black" strokeOpacity="0.3" strokeWidth="3" />
                <g filter="url(#add-icon-filter)">
                    <rect x="25" y="9" width="90" height="90" rx="45" fill="white" fillOpacity="0.05" shapeRendering="crispEdges" />
                </g>
                <path d="M67 40 H73 V52 H85 V58 H73 V70 H67 V58 H55 V52 H67 Z" fill="#FEFEFE" />
                <defs>
                    <filter id="add-icon-filter" x="0" y="0" width="140" height="140" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                        <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                        <feOffset dy="3" /><feGaussianBlur stdDeviation="1.5" /><feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
                        <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.05 0" /><feBlend mode="normal" in2="shape" result="effect_innerShadow" />
                    </filter>
                </defs>
            </svg>
            <div onClick={onClick} className="absolute w-[65%] aspect-square top-[9%] rounded-full cursor-pointer"/>
        </div>
    );
}

const PlayPauseButton: React.FC<{ onClick: () => void; state: PlaybackState }> = ({ onClick, state }) => {
  const isPlaying = state === 'playing';
  const isLoading = state === 'loading';

  const icon = isLoading ? (
    <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
  ) : isPlaying ? (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"></path></svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10"><path d="M8 5v14l11-7z"></path></svg>
  );

  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className="w-20 h-20 rounded-full bg-accent hover:bg-accent-hover disabled:bg-gray-600 flex items-center justify-center text-white transition-colors shadow-lg"
      aria-label={isPlaying ? "Pause" : "Play"}
    >
      {icon}
    </button>
  );
};

const ResetButton: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  return (
    <button 
      onClick={onClick}
      className="w-16 h-16 rounded-full bg-secondary hover:bg-gray-700/60 flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors shadow-md"
      title="Reset Audio Session"
      aria-label="Reset Audio Session"
    >
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"></path></svg>
    </button>
  );
};

// --- Main Component: PromptDJTool ---
export const PromptDJTool: React.FC<{ apiKey: string }> = ({ apiKey }) => {
    // Component Styles
    const Styles = () => (
      <style>{`
        .prompt-dj-container {
          height: 100%;
          width: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          box-sizing: border-box;
          padding: 2vmin;
          position: relative;
          font-size: 1.8vmin;
          font-family: 'Roboto', 'Google Sans', sans-serif;
          color: #fff;
          overflow: hidden;
        }
        body.dragging-promptdj {
          cursor: ns-resize;
        }
        body.dragging-promptdj * {
          user-select: none;
        }
        .prompts-area {
          display: flex;
          align-items: flex-end;
          justify-content: center;
          flex: 4;
          width: 100%;
          margin-top: 2vmin;
          gap: 2vmin;
        }
        #prompts-container {
          display: flex;
          flex-direction: row;
          align-items: flex-end;
          flex-shrink: 1;
          height: 100%;
          gap: 2vmin;
          margin-left: 10vmin;
          padding: 1vmin;
          overflow-x: auto;
          scrollbar-width: thin;
          scrollbar-color: #666 #1a1a1a;
        }
        #prompts-container::-webkit-scrollbar { height: 8px; }
        #prompts-container::-webkit-scrollbar-track { background: #111; border-radius: 4px; }
        #prompts-container::-webkit-scrollbar-thumb { background-color: #666; border-radius: 4px; }
        #prompts-container::before, #prompts-container::after { content: ''; flex: 1; min-width: 0.5vmin; }
        .prompt-controller-container {
            height: 100%;
            max-height: 80vmin;
            min-width: 14vmin;
            max-width: 16vmin;
            flex: 1;
        }
      `}</style>
    );
    
    // --- State and Refs ---
    const getStoredPrompts = useCallback((): Map<string, Prompt> => {
        const { localStorage } = window;
        const storedPrompts = localStorage.getItem('prompts');

        if (storedPrompts) {
            try {
                const prompts: Prompt[] = JSON.parse(storedPrompts);
                return new Map(prompts.map((prompt) => [prompt.promptId, prompt]));
            } catch (e) { console.error('Failed to parse stored prompts', e); }
        }

        const numDefaultPrompts = Math.min(4, PROMPT_TEXT_PRESETS.length);
        const shuffledPresetTexts = [...PROMPT_TEXT_PRESETS].sort(() => Math.random() - 0.5);
        const defaultPrompts: Prompt[] = [];
        const usedColors: string[] = [];
        for (let i = 0; i < numDefaultPrompts; i++) {
            const text = shuffledPresetTexts[i];
            const color = getUnusedRandomColor(usedColors);
            usedColors.push(color);
            defaultPrompts.push({ promptId: `prompt-${i}`, text, weight: 0, color });
        }
        const promptsToActivate = [...defaultPrompts].sort(() => Math.random() - 0.5);
        const numToActivate = Math.min(2, defaultPrompts.length);
        for (let i = 0; i < numToActivate; i++) {
            if (promptsToActivate[i]) {
                promptsToActivate[i].weight = 1;
            }
        }
        return new Map(defaultPrompts.map((p) => [p.promptId, p]));
    }, []);

    const [prompts, setPrompts] = useState<Map<string, Prompt>>(getStoredPrompts);
    const [playbackState, setPlaybackState] = useState<PlaybackState>('stopped');
    const [filteredPrompts, setFilteredPrompts] = useState<Set<string>>(new Set());
    const [toast, setToast] = useState<{ show: boolean, message: string }>({ show: false, message: '' });
    
    const sessionRef = useRef<LiveMusicSession | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const outputNodeRef = useRef<GainNode | null>(null);
    const nextStartTimeRef = useRef(0);
    const nextPromptIdRef = useRef(prompts.size);
    const promptsContainerRef = useRef<HTMLDivElement>(null);

    const setSessionPrompts = useCallback(throttle(async () => {
        if (!sessionRef.current) return;
        const promptsToSend = Array.from(prompts.values()).filter(p => !filteredPrompts.has(p.text) && p.weight > 0);
        try {
            await sessionRef.current.setWeightedPrompts({ weightedPrompts: promptsToSend });
        } catch (e: any) {
            setToast({ show: true, message: e.message });
            setPlaybackState('paused');
        }
    }, 200), [prompts, filteredPrompts]);
    
    const background = useMemo(() => {
        const clamp01 = (v: number) => Math.min(Math.max(v, 0), 1);
        const bg: string[] = [];
        [...prompts.values()].forEach((p, i) => {
            const alpha = Math.round(clamp01(p.weight / 0.5) * 0.6 * 255).toString(16).padStart(2, '0');
            const stop = p.weight / 2;
            const x = (i % 4) / 3;
            const y = Math.floor(i / 4) / 3;
            bg.push(`radial-gradient(circle at ${x * 100}% ${y * 100}%, ${p.color}${alpha} 0px, ${p.color}00 ${stop * 100}%)`);
        });
        return bg.join(', ');
    }, [prompts]);

    useEffect(() => {
      localStorage.setItem('prompts', JSON.stringify([...prompts.values()]));
    }, [prompts]);
    
    const handleAddPrompt = useCallback(() => {
        setPrompts(prev => {
            const newPrompts = new Map(prev);
            const newPromptId = `prompt-${nextPromptIdRef.current++}`;
            const usedColors = [...newPrompts.values()].map(p => p.color);
            newPrompts.set(newPromptId, {
                promptId: newPromptId,
                text: 'New Prompt',
                weight: 0,
                color: getUnusedRandomColor(usedColors),
            });
            return newPrompts;
        });
        setTimeout(() => {
            promptsContainerRef.current?.scrollTo({ left: promptsContainerRef.current.scrollWidth, behavior: 'smooth' });
        }, 100);
    }, []);

    const handlePromptChange = useCallback((newPrompt: Prompt) => {
        setPrompts(prev => {
            const newPrompts = new Map(prev);
            newPrompts.set(newPrompt.promptId, newPrompt);
            return newPrompts;
        });
    }, []);

    const handlePromptRemoved = useCallback((promptId: string) => {
        setPrompts(prev => {
            const newPrompts = new Map(prev);
            newPrompts.delete(promptId);
            return newPrompts;
        });
    }, []);

    const connectToSession = useCallback(async () => {
        if (!apiKey || apiKey.includes('PASTE_YOUR')) {
            setToast({ show: true, message: 'API Key is not configured.' });
            setPlaybackState('error');
            return;
        }
        const ai = new GoogleGenAI({ apiKey });
        
        try {
            sessionRef.current = await ai.live.music.connect({
                model: 'lyria-realtime-exp',
                audioConfig: {
                    sampleRate: 48000,
                    numChannels: 2,
                },
                callbacks: {
                    onmessage: async (e: LiveMusicServerMessage) => {
                        console.log('Received message from the server: %s\n', e);
                        if (e.filteredPrompt) {
                            setFilteredPrompts(prev => new Set([...prev, e.filteredPrompt!.text]));
                            setToast({ show: true, message: e.filteredPrompt.filteredReason });
                        }
                        if (e.serverContent?.audioChunks !== undefined) {
                            if (playbackState === 'paused' || playbackState === 'stopped' || !audioContextRef.current) return;
                            
                            const audioBuffer = await decodeAudioData(decode(e.serverContent?.audioChunks[0].data), audioContextRef.current, 48000, 2);
                            const source = audioContextRef.current.createBufferSource();
                            source.buffer = audioBuffer;
                            source.connect(outputNodeRef.current!);
                            
                            if (nextStartTimeRef.current === 0) {
                                nextStartTimeRef.current = audioContextRef.current.currentTime + 2; // buffer time
                                setTimeout(() => setPlaybackState('playing'), 2000);
                            }
                            
                            if (nextStartTimeRef.current < audioContextRef.current.currentTime) {
                                console.log('under run');
                                setPlaybackState('loading');
                                nextStartTimeRef.current = 0;
                                return;
                            }
                            source.start(nextStartTimeRef.current);
                            nextStartTimeRef.current += audioBuffer.duration;
                        }
                    },
                    onerror: (e: ErrorEvent) => {
                        console.error('Connection error occurred:', e);
                        setToast({ show: true, message: 'Connection error, please restart audio.' });
                        setPlaybackState('error');
                    },
                    onclose: (e: CloseEvent) => {
                        console.log('Connection closed.');
                        setToast({ show: true, message: 'Connection closed, please restart audio.' });
                        setPlaybackState('stopped');
                    },
                },
            });
            await setSessionPrompts();
        } catch(e: any) {
            console.error("Failed to connect to session", e);
            setToast({ show: true, message: `Failed to connect: ${e.message}` });
            setPlaybackState('error');
        }

    }, [apiKey, playbackState, setSessionPrompts]);

    useEffect(() => {
        setSessionPrompts();
    }, [prompts, setSessionPrompts]);

    const handlePlayPause = useCallback(async () => {
        if (playbackState === 'playing') {
            audioContextRef.current?.suspend();
            setPlaybackState('paused');
        } else if (playbackState === 'paused') {
            audioContextRef.current?.resume();
            setPlaybackState('playing');
        } else { // 'stopped' or 'error'
            setPlaybackState('loading');
            
            const context = new (window.AudioContext || (window as any).webkitAudioContext)();
            audioContextRef.current = context;
            outputNodeRef.current = context.createGain();
            outputNodeRef.current.connect(context.destination);

            await connectToSession();
        }
    }, [playbackState, connectToSession]);

    const handleReset = useCallback(async () => {
        sessionRef.current?.close();
        sessionRef.current = null;
        audioContextRef.current?.close();
        audioContextRef.current = null;
        setPlaybackState('stopped');
        setFilteredPrompts(new Set());
        nextStartTimeRef.current = 0;
    }, []);

    useEffect(() => {
      // Cleanup on unmount
      return () => {
        sessionRef.current?.close();
        audioContextRef.current?.close();
      }
    }, []);

    return (
        <div className="prompt-dj-container">
            <Styles />
            <div style={{ backgroundImage: background }} className="absolute inset-0 z-[-1]" />
            <div className="prompts-area">
                <div id="prompts-container" ref={promptsContainerRef}>
                    {[...prompts.values()].map(prompt => (
                         <div key={prompt.promptId} className="prompt-controller-container">
                             <PromptController
                                prompt={prompt}
                                onPromptChange={handlePromptChange}
                                onPromptRemoved={handlePromptRemoved}
                                isFiltered={filteredPrompts.has(prompt.text)}
                            />
                         </div>
                    ))}
                </div>
                 <div className="flex items-end h-full flex-shrink-0">
                    <AddButton onClick={handleAddPrompt} />
                </div>
            </div>
             <div className="flex-1 my-2 w-full max-w-4xl">
             </div>
             <div className="flex justify-center items-center flex-shrink-0 gap-8">
                <ResetButton onClick={handleReset} />
                <PlayPauseButton onClick={handlePlayPause} state={playbackState} />
             </div>
             {toast.show && (
                <div className="line-height-6 fixed top-5 left-1/2 -translate-x-1/2 bg-black text-white p-4 rounded-md flex items-center justify-between gap-4 min-w-[200px] max-w-[80vw] z-[11]">
                    <div>{toast.message}</div>
                    <button onClick={() => setToast({show: false, message: ''})} className="rounded-full aspect-square border-none text-black cursor-pointer bg-white w-6 h-6 flex items-center justify-center">✕</button>
                </div>
             )}
        </div>
    );
};

const PromptController: React.FC<{
    prompt: Prompt;
    isFiltered: boolean;
    onPromptChange: (prompt: Prompt) => void;
    onPromptRemoved: (promptId: string) => void;
}> = ({ prompt, isFiltered, onPromptChange, onPromptRemoved }) => {
    const textInputRef = useRef<HTMLSpanElement>(null);

    const handleTextUpdate = () => {
        const newText = textInputRef.current?.textContent?.trim();
        if (newText) {
            onPromptChange({ ...prompt, text: newText });
        } else {
            if(textInputRef.current) textInputRef.current.textContent = prompt.text;
        }
    };
    
    const handleTextKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleTextUpdate();
            textInputRef.current?.blur();
        }
    };

    const handleWeightChange = (newWeight: number) => {
        onPromptChange({ ...prompt, weight: newWeight });
    };

    return (
        <div className="relative h-full w-full flex flex-col items-center box-border overflow-hidden bg-[#2a2a2a] rounded-md">
            <button
                onClick={() => onPromptRemoved(prompt.promptId)}
                className="absolute top-[1.2vmin] left-[1.2vmin] bg-[#666] text-white border-none rounded-full w-[2.8vmin] h-[2.8vmin] text-[1.8vmin] flex items-center justify-center leading-[2.8vmin] cursor-pointer opacity-50 hover:opacity-100 transition-opacity z-10"
                aria-label={`Remove prompt ${prompt.text}`}
            >
                ×
            </button>
            <div className="max-h-[calc(100%-9vmin)] flex-1 min-h-[10vmin] w-full box-border overflow-hidden my-[2vmin] mb-[1vmin]">
                <WeightSlider
                    value={prompt.weight}
                    color={prompt.color}
                    onInput={handleWeightChange}
                />
            </div>
            <div className="flex flex-col flex-shrink-0 items-center gap-[0.2vmin] w-full h-[8vmin] px-[0.5vmin] box-border mb-[1vmin]">
                <span
                    ref={textInputRef}
                    contentEditable
                    suppressContentEditableWarning
                    onKeyDown={handleTextKeyDown}
                    onBlur={handleTextUpdate}
                    className={`font-google-sans text-[1.8vmin] w-full flex-grow max-h-full p-[0.4vmin] box-border text-center break-words overflow-y-auto border-none outline-none text-white scrollbar-thin scrollbar-thumb-[#666] scrollbar-track-black/60 ${isFiltered ? 'bg-red-700' : ''}`}
                >
                    {prompt.text}
                </span>
            </div>
        </div>
    );
};