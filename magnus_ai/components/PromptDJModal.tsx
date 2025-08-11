
import React from 'react';
import { XIcon } from './icons/Icons';

interface PromptDJModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const PromptDJModal: React.FC<PromptDJModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-primary/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
            aria-modal="true"
            role="dialog"
        >
            <div 
                className="bg-secondary rounded-xl shadow-2xl w-full h-full max-w-7xl max-h-[90vh] border border-gray-700/50 relative flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-4 border-b border-gray-700/50 shrink-0">
                    <h2 className="text-lg font-semibold text-text-primary">PromptDJ</h2>
                    <button onClick={onClose} className="p-1 rounded-full text-text-secondary hover:bg-gray-700">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="flex-grow w-full h-full p-0 m-0 overflow-hidden">
                    <iframe 
                        src="/promptdj.html"
                        title="PromptDJ"
                        className="w-full h-full border-0"
                    />
                </div>
            </div>
        </div>
    );
};
