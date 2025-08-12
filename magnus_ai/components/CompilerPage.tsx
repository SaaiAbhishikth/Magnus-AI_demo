
import React, { useState } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { XIcon, TerminalIcon, PlayIcon, LightbulbIcon, TrashIcon, CheckIcon } from './icons/Icons';

// Interface for the structured response from the AI
interface CodeAnalysis {
    hasErrors: boolean;
    correctedCode?: string;
    explanation: string;
    errors: Array<{
        line: number;
        message: string;
        suggestion: string;
    }>;
    output: string;
}

interface CompilerPageProps {
    ai: GoogleGenAI | null;
    onClose: () => void;
}

const LANGUAGES = ['JavaScript', 'Python', 'HTML', 'CSS', 'SQL', 'TypeScript', 'Java', 'C++', 'C', 'Go', 'Ruby', 'PHP'];
const DEFAULT_CODE: { [key: string]: string } = {
    JavaScript: 'console.log("Hello, Magnus AI!");',
    Python: 'print("Hello, Magnus AI!")',
    HTML: '<!DOCTYPE html>\n<html>\n<head>\n  <title>Magnus AI</title>\n  <style>\n    body { font-family: sans-serif; background: #fff; color: #111; text-align: center; padding-top: 50px; }\n    h1 { color: #3662E3; }\n  </style>\n</head>\n<body>\n  <h1>Hello, Magnus AI!</h1>\n  <p>This is a rendered HTML output.</p>\n</body>\n</html>',
    CSS: 'body {\n  background-color: #0D0F12;\n  color: #F0F4F8;\n  font-family: sans-serif;\n}',
    SQL: 'SELECT id, name FROM users WHERE role = \'admin\';',
    TypeScript: 'const message: string = "Hello, Magnus AI!";\nconsole.log(message);',
    Java: 'public class HelloWorld {\n    public static void main(String[] args) {\n        System.out.println("Hello, Magnus AI!");\n    }\n}',
    'C++': '#include <iostream>\n\nint main() {\n    std::cout << "Hello, Magnus AI!";\n    return 0;\n}',
    C: '#include <stdio.h>\n\nint main() {\n    printf("Hello, Magnus AI!");\n    return 0;\n}',
    Go: 'package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, Magnus AI!")\n}',
    Ruby: 'puts "Hello, Magnus AI!"',
    PHP: '<?php\n  echo "Hello, Magnus AI!";\n?>'
};


export const CompilerPage: React.FC<CompilerPageProps> = ({ ai, onClose }) => {
    const [language, setLanguage] = useState('JavaScript');
    const [code, setCode] = useState(DEFAULT_CODE['JavaScript'] || '');
    const [isLoading, setIsLoading] = useState(false);
    const [analysis, setAnalysis] = useState<CodeAnalysis | null>(null);
    const [activeTab, setActiveTab] = useState<'output' | 'analysis'>('output');

    const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newLang = e.target.value;
        setLanguage(newLang);
        setCode(DEFAULT_CODE[newLang] || '');
        setAnalysis(null);
    };

    const handleRunCode = async () => {
        if (!ai || !code.trim()) return;

        setIsLoading(true);
        setAnalysis(null);
        setActiveTab('output'); // Default to output tab on new run
        
        const systemInstruction = `You are an expert code analysis and execution engine. Analyze the user's code snippet.
        1. Determine if there are syntax or logical errors.
        2. If errors exist: set hasErrors to true, provide the full corrected code, explain the errors and their fixes, and list each error with its line number, a descriptive message, and a suggested fix.
        3. If no errors exist: set hasErrors to false and provide a brief explanation of what the code does.
        4. CRITICAL: You must always provide a simulated output for the *correct* version of the code. If there were errors, this should be the output *after* your corrections are applied. For HTML, the output should be the full, runnable HTML document content. For CSS, the output should be a confirmation message that the CSS is valid.
        5. Your tone should be that of a helpful, expert coding assistant.`;

        const prompt = `Language: ${language}\n\nCode:\n\`\`\`${language.toLowerCase()}\n${code}\n\`\`\``;

        const responseSchema = {
            type: Type.OBJECT,
            properties: {
                hasErrors: { type: Type.BOOLEAN, description: "True if errors were found in the original code." },
                correctedCode: { type: Type.STRING, description: "The full, corrected code if errors were found. Otherwise, the original code." },
                explanation: { type: Type.STRING, description: "A concise explanation of the code, and if applicable, the errors and how they were fixed." },
                errors: {
                    type: Type.ARRAY,
                    description: "A list of errors found. Should be empty if hasErrors is false.",
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            line: { type: Type.INTEGER, description: "The line number of the error." },
                            message: { type: Type.STRING, description: "A clear, descriptive error message." },
                            suggestion: { type: Type.STRING, description: "A concrete suggestion on how to fix the error." }
                        },
                        required: ["line", "message", "suggestion"]
                    }
                },
                output: { type: Type.STRING, description: "The simulated output of the executed code (the correct version)." }
            },
            required: ["hasErrors", "explanation", "output"]
        };

        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    systemInstruction,
                    responseMimeType: "application/json",
                    responseSchema
                }
            });
            const parsedResponse = JSON.parse(response.text.trim());
            setAnalysis(parsedResponse);
            if (parsedResponse.hasErrors) {
                setActiveTab('analysis');
            }
        } catch (error: any) {
            console.error("Compiler analysis failed:", error);
            setAnalysis({
                hasErrors: true,
                explanation: "An error occurred while communicating with the analysis service. Please check the console for details.",
                errors: [{ line: 0, message: "API Communication Error", suggestion: error.message }],
                output: `Failed to analyze code: ${error.message}`
            });
            setActiveTab('analysis');
        } finally {
            setIsLoading(false);
        }
    };
    
    const applyFixes = () => {
        if (analysis?.correctedCode) {
            setCode(analysis.correctedCode);
            setAnalysis(prev => prev ? {...prev, hasErrors: false, errors: []} : null);
            setActiveTab('output');
        }
    };

    const clearCode = () => {
        setCode('');
        setAnalysis(null);
    }

    return (
        <div className="fixed inset-0 bg-primary z-50 flex flex-col font-sans">
             {isLoading && (
                <div className="absolute inset-0 bg-black/50 z-20 flex flex-col items-center justify-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-accent"></div>
                    <p className="mt-4 text-text-primary">Analyzing & Running Code...</p>
                </div>
            )}
            <header className="flex items-center justify-between p-3 border-b border-gray-700/50 shrink-0">
                <div className="flex items-center gap-3">
                    <TerminalIcon className="w-7 h-7 text-green-400" />
                    <h1 className="text-xl font-bold text-text-primary">Code Compiler</h1>
                </div>
                <button onClick={onClose} className="p-2 rounded-full hover:bg-secondary">
                    <XIcon className="w-6 h-6 text-text-secondary" />
                </button>
            </header>

            <main className="flex-1 flex flex-col lg:flex-row min-h-0">
                {/* Left Pane: Code Editor */}
                <div className="flex flex-col w-full lg:w-1/2 p-4 border-r-0 lg:border-r border-gray-700/50">
                    <div className="flex items-center justify-between mb-3 shrink-0">
                        <select
                            value={language}
                            onChange={handleLanguageChange}
                            className="bg-secondary border border-gray-600 rounded-md px-3 py-1.5 text-text-primary focus:ring-1 focus:ring-accent focus:border-accent outline-none"
                        >
                            {LANGUAGES.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                        </select>
                        <div className="flex items-center gap-2">
                             <button
                                onClick={clearCode}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm text-text-secondary bg-secondary hover:bg-gray-700"
                                title="Clear code"
                            >
                                <TrashIcon className="w-4 h-4" />
                            </button>
                             <button
                                onClick={handleRunCode}
                                disabled={isLoading || !code.trim()}
                                className="flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-semibold text-white bg-green-600 hover:bg-green-500 disabled:bg-gray-600"
                            >
                                <PlayIcon className="w-4 h-4" />
                                Run
                            </button>
                        </div>
                    </div>
                    <textarea
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder={`Write some ${language} code here...`}
                        className="w-full h-full flex-1 bg-secondary rounded-lg p-4 font-mono text-base text-text-primary border border-gray-600 resize-none outline-none focus:border-accent"
                        spellCheck="false"
                    />
                </div>

                {/* Right Pane: Output/Analysis */}
                <div className="flex flex-col w-full lg:w-1/2 p-4">
                     <div className="flex items-center border-b border-gray-700/50 mb-3 shrink-0">
                        <button 
                            onClick={() => setActiveTab('output')}
                            className={`px-4 py-2 text-sm font-medium ${activeTab === 'output' ? 'text-accent border-b-2 border-accent' : 'text-text-secondary'}`}
                        >
                            Output
                        </button>
                        <button 
                            onClick={() => setActiveTab('analysis')}
                            className={`px-4 py-2 text-sm font-medium flex items-center gap-2 ${activeTab === 'analysis' ? 'text-accent border-b-2 border-accent' : 'text-text-secondary'}`}
                        >
                            Analysis
                            {analysis?.hasErrors && (
                                <span className="w-2.5 h-2.5 bg-red-500 rounded-full"></span>
                            )}
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto bg-secondary rounded-lg">
                        {activeTab === 'output' && (
                            <div className="h-full">
                                {analysis && language === 'HTML' ? (
                                     <iframe
                                        srcDoc={analysis.output}
                                        title="HTML Output"
                                        className="w-full h-full border-none bg-white rounded-lg"
                                        sandbox="allow-scripts"
                                    />
                                ) : (
                                    <div className="p-4">
                                        <h3 className="text-lg font-semibold text-text-primary mb-2">Simulated Output</h3>
                                        <pre className="w-full bg-primary rounded p-3 font-mono text-sm text-text-secondary whitespace-pre-wrap">
                                            {analysis ? analysis.output : "Click 'Run' to see the output."}
                                        </pre>
                                    </div>
                                )}
                            </div>
                        )}
                         {activeTab === 'analysis' && (
                            <div className="p-4">
                                <h3 className="text-lg font-semibold text-text-primary mb-2">AI Analysis</h3>
                                {!analysis ? (
                                    <p className="text-text-secondary">Click 'Run' to get an analysis of your code.</p>
                                ) : (
                                    <div className="space-y-4">
                                        <p className="text-text-primary whitespace-pre-wrap">{analysis.explanation}</p>
                                        
                                        {analysis.hasErrors && analysis.errors.length > 0 && (
                                            <div className="space-y-3">
                                                <h4 className="font-semibold text-red-400">Errors Found</h4>
                                                {analysis.errors.map((err, index) => (
                                                    <div key={index} className="p-3 bg-red-900/30 border border-red-500/30 rounded-md">
                                                        <p className="font-semibold text-red-300">Line {err.line}: {err.message}</p>
                                                        <p className="text-sm text-text-secondary mt-1">{err.suggestion}</p>
                                                    </div>
                                                ))}
                                                {analysis.correctedCode && (
                                                    <button 
                                                        onClick={applyFixes}
                                                        className="w-full flex items-center justify-center gap-2 px-4 py-2 mt-3 rounded-md text-sm font-medium text-white bg-accent hover:bg-accent-hover"
                                                    >
                                                        <CheckIcon className="w-5 h-5"/>
                                                        Apply All Fixes
                                                    </button>
                                                )}
                                            </div>
                                        )}

                                        {!analysis.hasErrors && (
                                             <div className="p-3 bg-green-900/30 border border-green-500/30 rounded-md flex items-center gap-3">
                                                <LightbulbIcon className="w-6 h-6 text-green-400 shrink-0"/>
                                                <p className="text-sm text-green-300">No errors found! The code seems correct.</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};
