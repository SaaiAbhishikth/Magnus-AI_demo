
import React from 'react';
import { type AgenticWorkflowState } from '../types';
import { AgentIcon, CheckIcon, ThoughtIcon } from './icons/Icons';

interface WorkflowStepDisplayProps {
    title: string;
    step: { active: boolean; done: boolean; content: string };
    icon: React.ReactNode;
}

const WorkflowStepDisplay: React.FC<WorkflowStepDisplayProps> = ({ title, step, icon }) => {
    const getStatusClasses = () => {
        if (step.active) {
            return 'border-teal-500/80 text-teal-300';
        }
        if (step.done) {
            return 'border-gray-600 text-text-secondary';
        }
        return 'border-gray-700 text-gray-500';
    };

    const iconToShow = step.done ? <CheckIcon className="w-5 h-5 text-teal-400" /> : icon;

    return (
        <div className={`flex items-start gap-3 p-3 rounded-lg border transition-all duration-300 ${getStatusClasses()}`}>
            <div className="pt-0.5 shrink-0">
                {iconToShow}
            </div>
            <div>
                <h4 className={`font-semibold ${step.active ? 'text-teal-300' : step.done ? 'text-text-primary' : 'text-gray-500'}`}>{title}</h4>
                <p className="text-sm whitespace-pre-wrap">{step.content}</p>
            </div>
        </div>
    );
};

interface AgenticWorkflowProps {
    workflowState: AgenticWorkflowState;
}

export const AgenticWorkflow: React.FC<AgenticWorkflowProps> = ({ workflowState }) => {
    const { perceive, reason, act, learn } = workflowState;
    const isSummary = !!(perceive?.done && reason?.done && act?.done && learn?.done);

    const stepsInOrder = [
        { key: 'learn', title: 'Learn', data: learn },
        { key: 'act', title: 'Act', data: act },
        { key: 'reason', title: 'Reason', data: reason },
        { key: 'perceive', title: 'Perceive', data: perceive },
    ];

    return (
        <div className="flex items-end gap-3 w-full justify-start flex-row">
            <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-gray-600">
                <AgentIcon className="w-6 h-6 text-white" />
            </div>
            <div className="bg-bubble-model text-text-primary p-4 rounded-xl max-w-2xl w-full">
                <h3 className="font-bold text-teal-400 mb-4 flex items-center gap-2">
                    <ThoughtIcon className="w-5 h-5" />
                    {isSummary ? 'Agent Workflow Summary' : 'Agent is thinking...'}
                </h3>
                <div className="space-y-2">
                    {stepsInOrder.map(stepInfo => (
                        stepInfo.data && <WorkflowStepDisplay key={stepInfo.key} title={stepInfo.title} step={stepInfo.data} icon={<ThoughtIcon className="w-5 h-5" />} />
                    ))}
                </div>
            </div>
        </div>
    );
};