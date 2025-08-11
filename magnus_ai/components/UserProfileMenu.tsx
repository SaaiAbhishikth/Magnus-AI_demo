import React from 'react';
import { type User } from '../types';
import { LogoutIcon, SettingsIcon, HelpIcon, UserIcon } from './icons/Icons';

interface UserProfileMenuProps {
    user: User;
    onLogout: () => void;
    onCustomize: () => void;
    onOpenSettings: () => void;
    onOpenHelp: () => void;
}

const MenuItem: React.FC<{ icon: React.ReactNode; label: string; onClick: () => void; disabled?: boolean }> = ({ icon, label, onClick, disabled }) => (
    <button 
        onClick={onClick}
        disabled={disabled}
        className="flex items-center gap-3 w-full px-3 py-2.5 rounded-md text-left text-sm text-text-primary hover:bg-gray-700/60 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
        {icon}
        <span>{label}</span>
    </button>
);

export const UserProfileMenu: React.FC<UserProfileMenuProps> = ({ user, onLogout, onCustomize, onOpenSettings, onOpenHelp }) => {
    return (
        <div className="absolute bottom-full left-0 right-0 mb-2 w-60 bg-secondary border border-gray-700/50 rounded-lg shadow-lg p-2 z-10">
            <div className="px-3 py-2 border-b border-gray-700/50 mb-2">
                <p className="font-semibold text-text-primary truncate">{user.name}</p>
                <p className="text-sm text-text-secondary truncate">{user.email}</p>
            </div>
            <div className="space-y-1">
                <MenuItem 
                    icon={<UserIcon className="w-5 h-5 text-text-secondary" />} 
                    label="Customize Magnus AI" 
                    onClick={onCustomize} 
                />
                <MenuItem 
                    icon={<SettingsIcon className="w-5 h-5 text-text-secondary" />} 
                    label="Settings" 
                    onClick={onOpenSettings}
                />
                 <MenuItem 
                    icon={<HelpIcon className="w-5 h-5 text-text-secondary" />} 
                    label="Help & FAQ" 
                    onClick={onOpenHelp}
                />
                <MenuItem 
                    icon={<LogoutIcon className="w-5 h-5 text-text-secondary" />} 
                    label="Log out" 
                    onClick={onLogout} 
                />
            </div>
        </div>
    );
};
