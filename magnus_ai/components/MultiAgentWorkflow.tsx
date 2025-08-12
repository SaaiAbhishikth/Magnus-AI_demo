import React from 'react';
import { type MultiAgentState } from '../types';
import { AgentIcon, CheckIcon, UsersIcon } from './icons/Icons';

const TypingIndicator = () => (
    <div className="flex items-center space-x-1.5 h-5">
        <span className="typing-dot"></span>
        <span className="typing-dot" style={{ animationDelay: '0.2s' }}></span>
        <span className="typing-dot" style={{ animationDelay: '0.4s' }}></span>
    </div>
);

export const MultiAgentWorkflow: React.FC<{ multiAgentState: MultiAgentState }> = ({ multiAgentState }) => {
    const { plan, agentExecutions, finalResponse } = multiAgentState;

    return (
        <div className="flex items-start gap-3 w-full justify-start flex-row">
            <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-gray-600">
                <AgentIcon className="w-6 h-6 text-white" />
            </div>
            <div className="bg-bubble-model text-text-primary p-4 rounded-xl max-w-3xl w-full">
                <h3 className="font-bold text-indigo-400 mb-4 flex items-center gap-2">
                    <UsersIcon className="w-5 h-5" />
                    Team of Experts is on the job...
                </h3>

                {/* Plan */}
                {plan && (
                    <div className="p-3 bg-primary/40 rounded-lg mb-3">
                        <p className="font-semibold text-sm text-indigo-300">Plan</p>
                        <p className="text-sm whitespace-pre-wrap">{plan}</p>
                    </div>
                )}
                
                {/* Agent Executions */}
                <div className="space-y-3">
                    {agentExecutions.map((exec, index) => (
                        <div key={index} className="p-3 bg-primary/70 rounded-lg border border-gray-700/50">
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="font-semibold text-text-primary">{exec.role}</h4>
                                {exec.isComplete ? <CheckIcon className="w-5 h-5 text-green-400" /> : <TypingIndicator />}
                            </div>
                            <p className="text-sm text-text-secondary italic mb-2">Task: {exec.task}</p>
                            {exec.isComplete && <p className="text-sm whitespace-pre-wrap">{exec.output}</p>}
                        </div>
                    ))}
                </div>

                {/* Final Response */}
                {finalResponse && (
                    <div className="mt-4 pt-4 border-t border-indigo-500/30">
                         <h4 className="font-semibold text-indigo-300 mb-2">Final Synthesized Response</h4>
                         <p className="text-base whitespace-pre-wrap">{finalResponse}</p>
                    </div>
                )}
            </div>
        </div>
    );
};