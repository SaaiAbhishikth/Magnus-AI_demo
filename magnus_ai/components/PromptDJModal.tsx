
import React, { useMemo } from 'react';
import { XIcon } from './icons/Icons';
import { PROMPTDJ_HTML_CONTENT } from './promptdj-html-content';

interface PromptDJModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const PromptDJModal: React.FC<PromptDJModalProps> = ({ isOpen, onClose }) => {
    // We memoize the srcDoc content to avoid re-computing it on every render.
    const iframeSrcDoc = useMemo(() => {
        if (typeof window === 'undefined') return ''; // Avoid server-side rendering issues
        // We inject a <base> tag into the <head> of the iframe's HTML.
        // This is CRITICAL for ensuring that relative paths for assets (like CSS and JS)
        // inside the iframe resolve correctly from the application's root origin.
        return PROMPTDJ_HTML_CONTENT.replace('<head>', `<head><base href="${window.location.origin}/">`);
    }, []);

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
                <div className="flex-grow w-full h-full p-0 m-0 overflow-hidden flex items-center justify-center bg-black">
                    <iframe 
                        srcDoc={iframeSrcDoc}
                        title="PromptDJ"
                        className="w-full h-full border-0"
                        // 'allow-scripts' is required for the JavaScript in the iframe to run.
                        // 'allow-same-origin' is critical for srcDoc content to load its own assets (JS, CSS) from the same domain.
                        sandbox="allow-scripts allow-same-origin"
                    />
                </div>
            </div>
        </div>
    );
};
