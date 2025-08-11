

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  GoogleGenAI,
  type LiveMusicGenerationConfig,
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

// ... Rest of the child components will be defined inside PromptDJTool for simplicity

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
          cursor: grabbing;
        }
        body.dragging-promptdj * {
          user-select: none;
          pointer-events: none;
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
    
    // ... rest of the logic and components ...
    
    // --- Render logic for PromptDJTool ---
    
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
        if (!apiKey) {
            setToast({ show: true, message: 'API Key is not configured.' });
            return;
        }
        const ai = new GoogleGenAI({ apiKey, apiVersion: 'v1alpha' });
        
        try {
            sessionRef.current = await ai.live.music.connect({
                model: 'lyria-realtime-exp',
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
        } catch(e) {
            console.error("Failed to connect to session", e);
            setToast({ show: true, message: 'Failed to connect. Check console for details.' });
            setPlaybackState('error');
        }

    }, [apiKey, playbackState, setSessionPrompts]);

    useEffect(() => {
        setSessionPrompts();
    }, [prompts, setSessionPrompts]);

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
                    <IconButton onClick={handleAddPrompt}>
                        <path d="M67 40 H73 V52 H85 V58 H73 V70 H67 V58 H55 V52 H67 Z" fill="#FEFEFE" />
                    </IconButton>
                </div>
            </div>
             <div className="flex-1 my-2 w-full max-w-4xl">
                 {/* Settings Controller would go here if converted */}
             </div>
             <div className="flex justify-center items-center flex-shrink-0">
                 {/* Play/Pause and Reset buttons would go here */}
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

const IconButton: React.FC<{ children: React.ReactNode, onClick: () => void }> = ({ children, onClick }) => {
    return (
        <div className="relative flex items-center justify-center w-[12vmin] flex-shrink-0">
            <svg width="140" height="140" viewBox="0 -10 140 150" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="22" y="6" width="96" height="96" rx="48" fill="black" fillOpacity="0.05" />
                <rect x="23.5" y="7.5" width="93" height="93" rx="46.5" stroke="black" strokeOpacity="0.3" strokeWidth="3" />
                <g filter="url(#icon-filter)">
                    <rect x="25" y="9" width="90" height="90" rx="45" fill="white" fillOpacity="0.05" shapeRendering="crispEdges" />
                </g>
                {children}
                <defs>
                    <filter id="icon-filter" x="0" y="0" width="140" height="140" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                        <feFlood floodOpacity="0" result="BackgroundImageFix" />
                        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                        <feOffset dy="2" /><feGaussianBlur stdDeviation="4" /><feComposite in2="hardAlpha" operator="out" />
                        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" /><feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow" />
                        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                        <feOffset dy="16" /><feGaussianBlur stdDeviation="12.5" /><feComposite in2="hardAlpha" operator="out" />
                        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" /><feBlend mode="normal" in2="effect1_dropShadow" result="effect2_dropShadow" />
                        <feBlend mode="normal" in="SourceGraphic" in2="effect2_dropShadow" result="shape" />
                        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                        <feOffset dy="3" /><feGaussianBlur stdDeviation="1.5" /><feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
                        <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.05 0" /><feBlend mode="normal" in2="shape" result="effect3_innerShadow" />
                    </filter>
                </defs>
            </svg>
            <div onClick={onClick} className="absolute w-[65%] aspect-square top-[9%] rounded-full cursor-pointer"/>
        </div>
    );
}


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