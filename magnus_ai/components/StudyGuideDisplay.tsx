
import React from 'react';
import { type StudyGuide } from '../types';
import { AgentIcon, BookOpenIcon, LightbulbIcon, PencilIcon } from './icons/Icons';

const Section: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
    <div className="mt-4 pt-4 border-t border-gray-700/50">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-teal-400 mb-3">
            {icon}
            {title}
        </h3>
        <div className="space-y-3 text-text-primary/90">
            {children}
        </div>
    </div>
);


export const StudyGuideDisplay: React.FC<{ studyGuide: StudyGuide }> = ({ studyGuide }) => {
    return (
        <div className="flex items-start gap-3 w-full justify-start flex-row">
             <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-gray-600 self-start mt-1">
                <AgentIcon className="w-6 h-6 text-white" />
            </div>
            <div className="bg-bubble-model text-text-primary p-5 rounded-2xl rounded-bl-none max-w-3xl w-full">
                <div className="pb-3 border-b border-gray-700/50">
                    <p className="text-sm text-text-secondary">Study Guide</p>
                    <h2 className="text-2xl font-bold text-text-primary">{studyGuide.topic}</h2>
                </div>
                
                <div className="mt-4">
                    <p className="text-base leading-relaxed whitespace-pre-wrap">{studyGuide.summary}</p>
                </div>

                {studyGuide.keyConcepts && studyGuide.keyConcepts.length > 0 && (
                     <Section title="Key Concepts" icon={<LightbulbIcon className="w-5 h-5" />}>
                        <ul className="space-y-4">
                            {studyGuide.keyConcepts.map((item, index) => (
                                <li key={index} className="bg-primary/50 p-3 rounded-lg">
                                    <h4 className="font-semibold text-text-primary">{item.concept}</h4>
                                    <p className="text-sm text-text-secondary mt-1 whitespace-pre-wrap">{item.explanation}</p>
                                </li>
                            ))}
                        </ul>
                    </Section>
                )}
                
                {studyGuide.practiceQuestions && studyGuide.practiceQuestions.length > 0 && (
                    <Section title="Practice Questions" icon={<PencilIcon className="w-5 h-5" />}>
                        <ul className="list-disc list-inside space-y-2 pl-2">
                           {studyGuide.practiceQuestions.map((q, index) => <li key={index}>{q}</li>)}
                        </ul>
                    </Section>
                )}

                {studyGuide.furtherReading && studyGuide.furtherReading.length > 0 && (
                     <Section title="Further Reading" icon={<BookOpenIcon className="w-5 h-5" />}>
                        <ul className="list-disc list-inside space-y-2 pl-2">
                            {studyGuide.furtherReading.map((item, index) => <li key={index}>{item}</li>)}
                        </ul>
                    </Section>
                )}
            </div>
        </div>
    );
};