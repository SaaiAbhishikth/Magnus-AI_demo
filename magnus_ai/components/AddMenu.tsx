
import React from 'react';
import { PaperclipIcon, GoogleDriveIcon } from './icons/Icons';

interface AddMenuProps {
    onAddFile: () => void;
    isGoogleDriveConnected: boolean;
    onConnectGoogleDrive: () => void;
}

const MenuItem: React.FC<{
    icon: React.ReactNode;
    label: string;
    onClick?: () => void;
}> = ({ icon, label, onClick }) => {
    return (
        <button
            onClick={onClick}
            disabled={!onClick}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-md text-left text-sm text-text-primary hover:bg-gray-700/60 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
            <div className="w-5 h-5 flex items-center justify-center text-text-secondary">{icon}</div>
            <div className="flex-1">
                <span className="block">{label}</span>
            </div>
        </button>
    );
};


export const AddMenu: React.FC<AddMenuProps> = ({ onAddFile, isGoogleDriveConnected, onConnectGoogleDrive }) => {
    return (
        <div className="absolute bottom-full left-0 mb-2 w-64 bg-secondary border border-gray-700/50 rounded-lg shadow-lg p-2 z-10">
            <div className="space-y-1">
                <MenuItem
                    icon={<PaperclipIcon className="w-5 h-5" />}
                    label="Add from your computer"
                    onClick={onAddFile}
                />
                <MenuItem
                    icon={<GoogleDriveIcon className="w-5 h-5" />}
                    label={isGoogleDriveConnected ? "Add from Google Drive" : "Connect Google Drive"}
                    onClick={onConnectGoogleDrive}
                />
            </div>
        </div>
    );
};