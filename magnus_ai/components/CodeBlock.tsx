
import React, { useState } from 'react';
import { DocumentDuplicateIcon, CheckIcon } from './icons/Icons';

interface CodeBlockProps {
    language: string;
    code: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ language, code }) => {
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = () => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(code).then(() => {
                setIsCopied(true);
                setTimeout(() => setIsCopied(false), 2000);
            }, (err) => {
                console.error('Could not copy text: ', err);
                alert('Failed to copy code.');
            });
        }
    };

    return (
        <div className="bg-primary my-2 rounded-lg border border-gray-700/50 overflow-hidden text-sm">
            <div className="flex justify-between items-center px-4 py-1.5 bg-secondary/50">
                <span className="text-xs font-sans text-text-secondary capitalize">{language}</span>
                <button 
                    onClick={handleCopy} 
                    className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-primary transition-colors disabled:opacity-50"
                    disabled={!navigator.clipboard}
                >
                    {isCopied ? <CheckIcon className="w-4 h-4 text-green-400" /> : <DocumentDuplicateIcon className="w-4 h-4" />}
                    {isCopied ? 'Copied!' : 'Copy code'}
                </button>
            </div>
            <pre className="p-4 overflow-x-auto font-mono text-text-primary">
                <code>
                    {code}
                </code>
            </pre>
        </div>
    );
};