
import React, { useState } from 'react';
import { XIcon } from './icons/Icons';

interface StudyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onGenerate: (topic: string) => void;
}

export const StudyModal: React.FC<StudyModalProps> = ({ isOpen, onClose, onGenerate }) => {
    const [topic, setTopic] = useState('');

    const handleGenerate = () => {
        if (topic.trim()) {
            onGenerate(topic.trim());
            setTopic('');
        }
    };
    
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleGenerate();
        }
    };

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/60 z-40 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div 
                className="bg-secondary rounded-xl shadow-2xl w-full max-w-lg border border-gray-700/50 relative"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-4 border-b border-gray-700/50">
                    <h2 className="text-lg font-semibold text-text-primary">Create a Study Guide</h2>
                    <button onClick={onClose} className="p-1 rounded-full text-text-secondary hover:bg-gray-700">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label htmlFor="topic" className="block text-sm font-medium text-text-secondary mb-2">
                            What topic would you like to learn about?
                        </label>
                        <input
                            id="topic"
                            type="text"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="e.g., The Roman Empire, Quantum Physics"
                            className="w-full bg-primary border border-gray-600 rounded-lg px-3 py-2 text-text-primary placeholder:text-gray-500 focus:ring-2 focus:ring-accent focus:border-accent outline-none transition"
                            autoFocus
                        />
                    </div>
                </div>
                <div className="flex items-center justify-end p-4 bg-primary/50 border-t border-gray-700/50 rounded-b-xl space-x-3">
                    <button 
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg text-sm font-medium text-text-primary bg-gray-600 hover:bg-gray-500 transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleGenerate}
                        disabled={!topic.trim()}
                        className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-accent hover:bg-accent-hover transition-colors disabled:bg-gray-600 disabled:opacity-50"
                    >
                        Generate Study Guide
                    </button>
                </div>
            </div>
        </div>
    );
};