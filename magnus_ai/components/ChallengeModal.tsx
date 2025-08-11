import React, { useState, useEffect } from 'react';
import { type Challenge, ChallengeStatus } from '../types';
import { XIcon, TrophyIcon, SendIcon, LightbulbIcon } from './icons/Icons';

interface ChallengeModalProps {
    isOpen: boolean;
    onClose: () => void;
    challenge: Challenge | null;
    onSubmit: (submission: string) => void;
    isLoading: boolean;
}

const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => (
     <textarea
        {...props}
        className="w-full bg-primary border border-gray-600 rounded-lg px-3 py-2 text-text-primary placeholder:text-gray-500 focus:ring-2 focus:ring-accent focus:border-accent outline-none transition resize-y min-h-[100px]"
    />
);

export const ChallengeModal: React.FC<ChallengeModalProps> = ({ isOpen, onClose, challenge, onSubmit, isLoading }) => {
    const [submission, setSubmission] = useState('');
    const [showHint, setShowHint] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setSubmission('');
            setShowHint(false);
        }
    }, [isOpen]);

    const handleSubmit = () => {
        if (submission.trim() && !isLoading) {
            onSubmit(submission);
        }
    };

    if (!isOpen) return null;

    const isCompletedOrFailed = challenge?.status === ChallengeStatus.COMPLETED || challenge?.status === ChallengeStatus.FAILED;

    const getStatusChip = () => {
        if (!challenge) return null;
        switch (challenge.status) {
            case ChallengeStatus.COMPLETED:
                return <span className="px-2.5 py-1 text-xs font-medium text-green-300 bg-green-900/50 rounded-full">Completed</span>
            case ChallengeStatus.FAILED:
                return <span className="px-2.5 py-1 text-xs font-medium text-red-300 bg-red-900/50 rounded-full">Try Again Tomorrow</span>
            case ChallengeStatus.ACTIVE:
                 return <span className="px-2.5 py-1 text-xs font-medium text-yellow-300 bg-yellow-900/50 rounded-full">In Progress</span>
        }
    }


    return (
        <div 
            className="fixed inset-0 bg-black/60 z-40 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div 
                className="bg-secondary rounded-xl shadow-2xl w-full max-w-2xl border border-gray-700/50 relative flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-start justify-between p-4 border-b border-gray-700/50">
                    <div className="flex items-center gap-3">
                        <TrophyIcon className="w-8 h-8 text-yellow-400" />
                        <div>
                            <h2 className="text-lg font-semibold text-text-primary">Daily Challenge</h2>
                            <p className="text-sm text-text-secondary">A new challenge appears every day!</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full text-text-secondary hover:bg-gray-700">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    {!challenge || (isLoading && !challenge.description) ? (
                         <div className="flex flex-col items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-accent"></div>
                            <p className="mt-4 text-text-secondary">Generating today's challenge...</p>
                        </div>
                    ) : (
                        <>
                            <div className="flex justify-between items-center">
                                <h3 className="text-xl font-bold text-text-primary">{challenge.title}</h3>
                                {getStatusChip()}
                            </div>
                            <p className="text-text-secondary whitespace-pre-wrap">{challenge.description}</p>
                            
                            {!isCompletedOrFailed && challenge.hint && (
                                <div className="text-center my-2">
                                    <button onClick={() => setShowHint(!showHint)} className="text-sm text-accent hover:underline flex items-center gap-1.5 mx-auto">
                                        <LightbulbIcon className="w-4 h-4"/>
                                        {showHint ? 'Hide Hint' : 'Show Hint'}
                                    </button>
                                    {showHint && (
                                        <div className="mt-2 p-3 bg-primary/70 rounded-md text-text-secondary text-left italic">
                                            <p>{challenge.hint}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="pt-4 mt-2 border-t border-gray-700/50">
                                {isCompletedOrFailed ? (
                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="font-semibold text-text-secondary mb-2">Your Submission</h4>
                                            <div className="p-3 bg-primary/70 rounded-md text-text-primary whitespace-pre-wrap">{challenge.userSubmission}</div>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-text-secondary mb-2">AI Feedback</h4>
                                            <div className={`p-3 rounded-md text-text-primary whitespace-pre-wrap ${challenge.status === ChallengeStatus.COMPLETED ? 'bg-green-900/30 border border-green-500/30' : 'bg-red-900/30 border border-red-500/30'}`}>
                                                {challenge.feedback}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <label htmlFor="submission" className="block text-sm font-medium text-text-secondary">Your Answer</label>
                                        <Textarea
                                            id="submission"
                                            placeholder="Type your answer here..."
                                            value={submission}
                                            onChange={e => setSubmission(e.target.value)}
                                            disabled={isLoading}
                                        />
                                        <button 
                                            onClick={handleSubmit}
                                            disabled={!submission.trim() || isLoading}
                                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-accent hover:bg-accent-hover transition-colors disabled:bg-gray-600 disabled:opacity-50"
                                        >
                                            {isLoading ? (
                                                <>
                                                 <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                                                 <span>Evaluating...</span>
                                                </>
                                            ) : (
                                                 <>
                                                    <SendIcon className="w-5 h-5" />
                                                    <span>Submit Answer</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
                 <div className="p-4 bg-primary/50 border-t border-gray-700/50 rounded-b-xl text-right">
                    <button 
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg text-sm font-medium text-text-primary bg-gray-600 hover:bg-gray-500 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};