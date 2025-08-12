import React, { useState } from 'react';
import { type CompilerInfo } from '../types';
import { CodeBlock } from './CodeBlock';
import { PlayIcon, TerminalIcon } from './icons/Icons';

interface CompilerDisplayProps {
    compilerInfo: CompilerInfo;
}

export const CompilerDisplay: React.FC<CompilerDisplayProps> = ({ compilerInfo }) => {
    const [isOutputVisible, setIsOutputVisible] = useState(false);

    const handleRunCode = () => {
        setIsOutputVisible(true);
    };

    return (
        <div className="mt-4 w-full text-left">
            {/* Render the explanation first */}
            <div className="text-sm mb-3 text-text-primary/90 whitespace-pre-wrap">
                <p>{compilerInfo.explanation}</p>
            </div>

            {/* Render the code block */}
            <CodeBlock language={compilerInfo.language} code={compilerInfo.code} />

            {/* "Run" button and Output section */}
            <div className="mt-3">
                {!isOutputVisible ? (
                    <button
                        onClick={handleRunCode}
                        className="flex items-center gap-2 w-full justify-center px-4 py-2 rounded-lg text-sm font-medium text-white bg-green-600 hover:bg-green-500 transition-colors"
                    >
                        <PlayIcon className="w-4 h-4" />
                        Run
                    </button>
                ) : (
                    <div className="bg-primary mt-2 rounded-lg border border-gray-700/50 overflow-hidden text-sm">
                        <div className="flex justify-between items-center px-4 py-1.5 bg-secondary/50">
                            <span className="text-xs font-sans text-text-secondary flex items-center gap-1.5">
                                <TerminalIcon className="w-4 h-4" />
                                Output
                            </span>
                        </div>
                        <pre className="p-4 overflow-x-auto font-mono text-text-secondary text-xs leading-relaxed">
                            <code>
                                {compilerInfo.simulatedOutput}
                            </code>
                        </pre>
                    </div>
                )}
            </div>
        </div>
    );
};