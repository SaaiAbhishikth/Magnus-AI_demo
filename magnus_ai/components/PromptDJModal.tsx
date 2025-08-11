

import React from 'react';
import { XIcon } from './icons/Icons';
import { PromptDJTool } from './PromptDJTool';

interface PromptDJModalProps {
    isOpen: boolean;
    onClose: () => void;
    apiKey: string;
}

export const PromptDJModal: React.FC<PromptDJModalProps> = ({ isOpen, onClose, apiKey }) => {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div
                className="bg-[#111] rounded-xl shadow-2xl w-full h-full max-w-6xl max-h-[90vh] border border-gray-700/50 relative flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-3 border-b border-gray-700/50 shrink-0 bg-secondary">
                    <h2 className="text-lg font-semibold text-text-primary">PromptDJ</h2>
                    <button onClick={onClose} className="p-1 rounded-full text-text-secondary hover:bg-gray-700">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="flex-grow w-full h-full overflow-hidden">
                    <PromptDJTool apiKey={apiKey} />
                </div>
            </div>
        </div>
    );
};