

import React, { useState } from 'react';
import { type Action } from '../types';
import { BoltIcon, CheckIcon } from './icons/Icons';

interface ActionExecutionProps {
    actions: Action[];
    onExecute: (action: Action) => Promise<void>;
}

export const ActionExecution: React.FC<ActionExecutionProps> = ({ actions, onExecute }) => {
    const [executedActions, setExecutedActions] = useState<Set<string>>(new Set());
    const [executingActions, setExecutingActions] = useState<Set<string>>(new Set());

    const handleExecute = async (action: Action) => {
        const actionId = action.description;
        if (executedActions.has(actionId) || executingActions.has(actionId)) return;

        setExecutingActions(prev => new Set(prev).add(actionId));
        try {
            await onExecute(action);
            setExecutedActions(prev => new Set(prev).add(actionId));
        } catch (error) {
            console.error(`Execution failed for action: ${actionId}`, error);
            // The error is alerted to the user in the parent component (App.tsx)
        } finally {
            setExecutingActions(prev => {
                const newSet = new Set(prev);
                newSet.delete(actionId);
                return newSet;
            });
        }
    };

    const hasCalendarAction = actions.some(a => a.type === 'schedule_meeting');
    const hasEmailAction = actions.some(a => a.type === 'send_email');

    return (
        <div className="mt-4 pt-4 border-t border-gray-500/50 w-full">
            <h4 className="text-sm font-semibold text-text-secondary mb-3 flex items-center gap-2">
                <BoltIcon className="w-4 h-4" />
                Proposed Actions
            </h4>
            <div className="space-y-2">
                {actions.map((action, index) => {
                    const actionId = action.description;
                    const isExecuted = executedActions.has(actionId);
                    const isExecuting = executingActions.has(actionId);
                    
                    let buttonText = 'Execute';
                    if (isExecuting) buttonText = 'Executing';
                    if (isExecuted) buttonText = 'Done';

                    return (
                         <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-primary/40 border border-gray-700/50">
                            <div className="flex-1">
                                <p className="font-medium">{action.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                                <p className="text-sm text-text-secondary">{action.description}</p>
                            </div>
                            <button
                                onClick={() => handleExecute(action)}
                                disabled={isExecuted || isExecuting}
                                className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors w-32
                                    ${isExecuted ? 'bg-green-600 cursor-default' : ''}
                                    ${isExecuting ? 'bg-accent/70 animate-pulse cursor-wait' : ''}
                                    ${!isExecuted && !isExecuting ? 'bg-accent hover:bg-accent-hover' : ''}
                                `}
                            >
                                {isExecuted && <CheckIcon className="w-5 h-5" />}
                                {isExecuting && <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>}
                                {!isExecuting && !isExecuted && <BoltIcon className="w-5 h-5" />}
                                <span>{buttonText}</span>
                            </button>
                        </div>
                    );
                })}
                 <p className="text-xs text-text-secondary text-center pt-2">
                    {hasCalendarAction && "Scheduling a meeting requires Google Calendar permission. "}
                    {hasEmailAction && "Sending an email requires Gmail permission."}
                 </p>
            </div>
        </div>
    );
};
