




import React from 'react';
import { Tool } from '../types';
import { BookOpenIcon, LightbulbIcon, TelescopeIcon, GlobeAltIcon, MusicNoteIcon, MapPinIcon, UsersIcon, BoltIcon } from './icons/Icons';

interface ToolsMenuProps {
    onSelect: (tool: Tool) => void;
}

const toolList = [
    { id: Tool.STUDY, label: "Study and learn", icon: <BookOpenIcon className="w-5 h-5" /> },
    { id: Tool.MUSIC, label: "Create music", icon: <MusicNoteIcon className="w-5 h-5" /> },
    { id: Tool.THINK_LONGER, label: "Think longer", icon: <LightbulbIcon className="w-5 h-5" /> },
    { id: Tool.DEEP_RESEARCH, label: "Deep research", icon: <TelescopeIcon className="w-5 h-5" /> },
    { id: Tool.WEB_SEARCH, label: "Web search", icon: <GlobeAltIcon className="w-5 h-5" /> },
    { id: Tool.MAP, label: "Find on map", icon: <MapPinIcon className="w-5 h-5" /> },
    { id: Tool.TEAM_OF_EXPERTS, label: "Team of Experts", icon: <UsersIcon className="w-5 h-5" /> },
    { id: Tool.AUTOMATED_TASKS, label: "Automated Tasks", icon: <BoltIcon className="w-5 h-5" /> },
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

export const ToolsMenu: React.FC<ToolsMenuProps> = ({ onSelect }) => {
    return (
        <div className="absolute bottom-full left-0 mb-2 w-60 bg-secondary border border-gray-700/50 rounded-lg shadow-lg p-2 z-10">
            <div className="space-y-1">
                {toolList.map(tool => (
                    <MenuItem
                        key={tool.id}
                        label={tool.label}
                        icon={tool.icon}
                        onClick={() => onSelect(tool.id)}
                    />
                ))}
            </div>
        </div>
    );
};