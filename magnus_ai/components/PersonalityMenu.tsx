
import React from 'react';
import { Personality } from '../types';
import { AgentIcon, ScaleIcon, HeartIcon, TerminalIcon, TheaterMasksIcon } from './icons/Icons';

interface PersonalityMenuProps {
    onSelect: (personality: Personality) => void;
}

const personalityList = [
    { id: Personality.DEFAULT, label: "Default", icon: <AgentIcon className="w-5 h-5" /> },
    { id: Personality.FORMAL_ADVISOR, label: "Formal Advisor", icon: <ScaleIcon className="w-5 h-5" /> },
    { id: Personality.FRIENDLY_MENTOR, label: "Friendly Mentor", icon: <HeartIcon className="w-5 h-5" /> },
    { id: Personality.CODING_WIZARD, label: "Coding Wizard", icon: <TerminalIcon className="w-5 h-5" /> },
    { id: Personality.COMEDIAN, label: "Comedian", icon: <TheaterMasksIcon className="w-5 h-5" /> },
];

const MenuItem: React.FC<{ icon: React.ReactNode; label: string; onClick: () => void; }> = ({ icon, label, onClick }) => (
    <button
        onClick={onClick}
        className="flex items-center gap-3 w-full px-3 py-2.5 rounded-md text-left text-sm text-text-primary hover:bg-gray-700/60 transition-colors"
    >
        <div className="text-text-secondary">{icon}</div>
        <span>{label}</span>
    </button>
);

export const PersonalityMenu: React.FC<PersonalityMenuProps> = ({ onSelect }) => {
    return (
        <div className="absolute bottom-full left-0 mb-2 w-60 bg-secondary border border-gray-700/50 rounded-lg shadow-lg p-2 z-10">
            <div className="space-y-1">
                {personalityList.map(p => (
                    <MenuItem
                        key={p.id}
                        label={p.label}
                        icon={p.icon}
                        onClick={() => onSelect(p.id)}
                    />
                ))}
            </div>
        </div>
    );
};
