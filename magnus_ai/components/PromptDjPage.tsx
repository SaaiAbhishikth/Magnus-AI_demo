
import React, { useEffect } from 'react';
import './promptdj'; // This will execute the code and register the web components
import { XIcon } from './icons/Icons';

declare global {
    namespace JSX {
        interface IntrinsicElements {
            'prompt-dj': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
        }
    }
}

const promptDjStyles = `
/* Note: These styles are injected globally when PromptDJ is active and cleaned up on unmount */
html.promptdj-active, body.promptdj-active {
  height: 100% !important;
  margin: 0 !important;
  padding: 0 !important;
}
body.promptdj-active {
  overflow: hidden !important;
  background-color: #111 !important;
  color: #fff !important;
  font-family: 'Roboto', 'Google Sans', sans-serif !important;
}
body.promptdj-active.dragging {
  cursor: grabbing !important;
}
body.promptdj-active.dragging * {
  user-select: none !important;
  pointer-events: none !important;
}
`;

interface PromptDjPageProps {
    onClose: () => void;
}

export const PromptDjPage: React.FC<PromptDjPageProps> = ({ onClose }) => {
    useEffect(() => {
        // Inject styles
        const styleElement = document.createElement('style');
        styleElement.id = 'promptdj-styles';
        styleElement.innerHTML = promptDjStyles;
        document.head.appendChild(styleElement);

        // Add a class to html and body for specific styling
        document.documentElement.classList.add('promptdj-active');
        document.body.classList.add('promptdj-active');

        return () => {
            // Cleanup: remove styles and body class
            const existingStyleElement = document.getElementById('promptdj-styles');
            if (existingStyleElement) {
                document.head.removeChild(existingStyleElement);
            }
            document.documentElement.classList.remove('promptdj-active');
            document.body.classList.remove('promptdj-active');
            // Ensure any leftover dragging classes are also removed from the body
            document.body.classList.remove('dragging');
        };
    }, []);

    return (
        <div style={{ height: '100vh', width: '100vw', position: 'fixed', top: 0, left: 0, zIndex: 50, backgroundColor: '#111' }}>
            <button
                onClick={onClose}
                className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors"
                aria-label="Close PromptDJ"
            >
                <XIcon className="w-6 h-6" />
            </button>
            <prompt-dj></prompt-dj>
        </div>
    );
};
