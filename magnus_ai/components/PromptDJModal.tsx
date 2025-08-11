
import React, { useState, useEffect } from 'react';
import { XIcon } from './icons/Icons';

interface PromptDJModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const PromptDJModal: React.FC<PromptDJModalProps> = ({ isOpen, onClose }) => {
    const [iframeContent, setIframeContent] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Only fetch the content if the modal is open and we haven't fetched it yet.
        if (isOpen && iframeContent === null) {
            setIsLoading(true);
            setError(null);
            fetch('/promptdj.html')
                .then(response => {
                    if (!response.ok) {
                        // This can happen on Netlify if the file doesn't exist and the request
                        // is redirected to index.html, or if the file is truly missing.
                        throw new Error(`Failed to load PromptDJ content (status: ${response.status}). This may be a deployment configuration issue.`);
                    }
                    return response.text();
                })
                .then(html => {
                    // This is a workaround for single-page applications (SPAs) where requests
                    // for HTML files might be redirected. By fetching the content and using srcDoc,
                    // we ensure the correct HTML is loaded.
                    if (!html.includes('<title>PromptDJ</title>')) {
                        // The fetched content is not the expected HTML file, likely the SPA's index.html
                        throw new Error("Received incorrect content. This suggests a routing issue where '/promptdj.html' is being redirected to the main app.");
                    }
                    // We also inject a <base> tag so that relative asset paths inside promptdj.html
                    // (like its CSS and JS files) resolve correctly from the domain root.
                    const withBase = html.replace('<head>', `<head><base href="${window.location.origin}/">`);
                    setIframeContent(withBase);
                })
                .catch(err => {
                    console.error("Error fetching promptdj.html:", err);
                    setError(err.message);
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
    }, [isOpen, iframeContent]);

    // Reset content when modal is closed, allowing it to be refetched on next open.
    // This is useful if a transient network error occurred.
    useEffect(() => {
        if (!isOpen) {
            setIframeContent(null);
        }
    }, [isOpen]);

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
                    {isLoading ? (
                         <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-accent"></div>
                    ) : error ? (
                        <div className="text-center p-8 text-red-400">
                           <h3 className="text-xl font-bold mb-2">Error Loading Module</h3>
                           <p className="max-w-md">{error}</p>
                        </div>
                    ) : (
                        <iframe 
                            srcDoc={iframeContent || ''}
                            title="PromptDJ"
                            className="w-full h-full border-0"
                            // 'allow-same-origin' is critical for srcDoc content to load its own assets (JS, CSS) from the same domain.
                            sandbox="allow-scripts allow-same-origin"
                        />
                    )}
                </div>
            </div>
        </div>
    );
};
