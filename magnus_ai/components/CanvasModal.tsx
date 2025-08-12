
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { XIcon, SendIcon } from './icons/Icons';
import { type ChatFile } from '../types';

// --- Start of useDrawingCanvas Hook Logic ---
const useDrawingCanvas = (canvasRef: React.RefObject<HTMLCanvasElement>, isOpen: boolean) => {
    const contextRef = useRef<CanvasRenderingContext2D | null>(null);
    const [isDrawing, setIsDrawing] = useState(false);

    const initializeCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext('2d');
        if (!context) return;

        const { width, height } = canvas.getBoundingClientRect();
        if (width === 0 || height === 0) return; // Don't initialize if not visible

        const scale = window.devicePixelRatio;
        canvas.width = width * scale;
        canvas.height = height * scale;
        context.scale(scale, scale);

        context.lineCap = 'round';
        context.strokeStyle = 'white';
        context.lineWidth = 4;
        contextRef.current = context;
    }, [canvasRef]);

    useEffect(() => {
        if (isOpen) {
            // Delay initialization to allow modal to render and get correct dimensions
            setTimeout(initializeCanvas, 50);
        }
    }, [isOpen, initializeCanvas]);

    const startDrawing = ({ nativeEvent }: React.MouseEvent<HTMLCanvasElement>) => {
        const { offsetX, offsetY } = nativeEvent;
        contextRef.current?.beginPath();
        contextRef.current?.moveTo(offsetX, offsetY);
        setIsDrawing(true);
    };

    const finishDrawing = () => {
        contextRef.current?.closePath();
        setIsDrawing(false);
    };

    const draw = ({ nativeEvent }: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;
        const { offsetX, offsetY } = nativeEvent;
        contextRef.current?.lineTo(offsetX, offsetY);
        contextRef.current?.stroke();
    };
    
    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const context = contextRef.current;
        if(canvas && context) {
            context.clearRect(0, 0, canvas.width, canvas.height);
        }
    };
    
    const getCanvasAsDataURL = (type = 'image/png', quality = 0.95): string | undefined => {
        const canvas = canvasRef.current;
        if (!canvas || canvas.width === 0 || canvas.height === 0) return undefined;
        // Check if canvas is blank
        const context = canvas.getContext('2d');
        if (!context) return undefined;
        const pixelBuffer = new Uint32Array(context.getImageData(0, 0, canvas.width, canvas.height).data.buffer);
        const isBlank = !pixelBuffer.some(color => color !== 0);
        if (isBlank) return undefined;

        return canvas.toDataURL(type, quality);
    };

    return { startDrawing, finishDrawing, draw, clearCanvas, getCanvasAsDataURL };
};
// --- End of useDrawingCanvas Hook Logic ---


interface CanvasModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSend: (prompt: string, fileData: ChatFile) => void;
}

export const CanvasModal: React.FC<CanvasModalProps> = ({ isOpen, onClose, onSend }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { startDrawing, finishDrawing, draw, clearCanvas, getCanvasAsDataURL } = useDrawingCanvas(canvasRef, isOpen);
    const [prompt, setPrompt] = useState('');
    
    const handleSend = () => {
        const imageDataUrl = getCanvasAsDataURL();
        if (imageDataUrl) {
            const base64Data = imageDataUrl.split(',')[1];
            const sizeInBytes = Math.ceil(base64Data.length * 3 / 4);
            const fileData: ChatFile = {
                name: `drawing-${Date.now()}.png`,
                type: 'image/png',
                size: sizeInBytes,
                url: imageDataUrl,
            };
            onSend(prompt || "What is this a drawing of?", fileData);
            setPrompt('');
            onClose();
        } else {
            alert("Please draw something on the canvas before sending.");
        }
    };
    
    const handleClear = () => {
        clearCanvas();
    }

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/60 z-40 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div 
                className="bg-secondary rounded-xl shadow-2xl w-full max-w-2xl border border-gray-700/50 relative flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-4 border-b border-gray-700/50">
                    <h2 className="text-lg font-semibold text-text-primary">Canvas - Draw Something!</h2>
                    <button onClick={onClose} className="p-1 rounded-full text-text-secondary hover:bg-gray-700">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="p-4 flex-grow">
                    <canvas
                        ref={canvasRef}
                        onMouseDown={startDrawing}
                        onMouseUp={finishDrawing}
                        onMouseMove={draw}
                        onMouseLeave={finishDrawing}
                        className="w-full h-96 bg-primary rounded-lg cursor-crosshair border border-gray-600"
                    />
                </div>
                 <div className="p-4 pt-0">
                    <input
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Add a prompt (e.g., 'What is this?')"
                        className="w-full bg-primary border border-gray-600 rounded-lg px-3 py-2 text-text-primary placeholder:text-gray-500 focus:ring-2 focus:ring-accent focus:border-accent outline-none transition"
                    />
                </div>
                <div className="flex items-center justify-between p-4 bg-primary/50 border-t border-gray-700/50 rounded-b-xl space-x-3">
                    <button 
                        onClick={handleClear}
                        className="px-4 py-2 rounded-lg text-sm font-medium text-text-primary bg-gray-600 hover:bg-gray-500 transition-colors"
                    >
                        Clear
                    </button>
                    <div className="flex items-center space-x-3">
                        <button 
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg text-sm font-medium text-text-primary bg-gray-600 hover:bg-gray-500 transition-colors"
                        >
                            Cancel
                        </button>
                         <button 
                            onClick={handleSend}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-accent hover:bg-accent-hover transition-colors"
                        >
                            <span>Send</span>
                            <SendIcon className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};