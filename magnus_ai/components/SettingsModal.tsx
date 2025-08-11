
import React, { useState, useEffect } from 'react';
import { type TTSSettings } from '../types';
import { XIcon } from './icons/Icons';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (settings: TTSSettings) => void;
    initialSettings: TTSSettings;
    voices: SpeechSynthesisVoice[];
}

const Label: React.FC<{ htmlFor: string; children: React.ReactNode }> = ({ htmlFor, children }) => (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-text-secondary mb-2">
        {children}
    </label>
);

const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => (
    <select
        {...props}
        className="w-full bg-primary border border-gray-600 rounded-lg px-3 py-2 text-text-primary placeholder:text-gray-500 focus:ring-2 focus:ring-accent focus:border-accent outline-none transition"
    />
);

const RangeInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
    <input
        type="range"
        {...props}
        className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-accent"
    />
);

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSave, initialSettings, voices }) => {
    const [settings, setSettings] = useState<TTSSettings>(initialSettings);

    useEffect(() => {
        if (isOpen) {
            setSettings(initialSettings);
        }
    }, [initialSettings, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: name === 'voiceURI' ? value : parseFloat(value) }));
    };

    const handleSave = () => {
        onSave(settings);
    };

    const handleTestVoice = () => {
        if (!('speechSynthesis' in window)) return;
        window.speechSynthesis.cancel();
        const testUtterance = new SpeechSynthesisUtterance("Hello, this is a test of the selected voice settings.");
        
        if (settings.voiceURI) {
            const selectedVoice = voices.find(v => v.voiceURI === settings.voiceURI);
            if (selectedVoice) {
                testUtterance.voice = selectedVoice;
            }
        }
        testUtterance.rate = settings.rate;
        testUtterance.pitch = settings.pitch;

        window.speechSynthesis.speak(testUtterance);
    };

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/60 z-40 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div 
                className="bg-secondary rounded-xl shadow-2xl w-full max-w-lg border border-gray-700/50 relative"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-4 border-b border-gray-700/50">
                    <h2 className="text-lg font-semibold text-text-primary">Settings</h2>
                    <button onClick={onClose} className="p-1 rounded-full text-text-secondary hover:bg-gray-700">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                    <h3 className="text-md font-semibold text-text-primary border-b border-gray-700 pb-2">Text-to-Speech</h3>
                    <div>
                        <Label htmlFor="voiceURI">Voice</Label>
                        <Select
                            name="voiceURI"
                            id="voiceURI"
                            value={settings.voiceURI || ''}
                            onChange={handleChange}
                            disabled={voices.length === 0}
                        >
                            <option value="">Browser Default</option>
                            {voices.map(voice => (
                                <option key={voice.voiceURI} value={voice.voiceURI}>
                                    {voice.name} ({voice.lang})
                                </option>
                            ))}
                        </Select>
                         {voices.length === 0 && <p className="text-xs text-text-secondary mt-1">Loading voices...</p>}
                    </div>

                    <div>
                        <Label htmlFor="rate">Rate: {settings.rate.toFixed(1)}</Label>
                        <RangeInput
                            type="range"
                            name="rate"
                            id="rate"
                            min="0.5"
                            max="2"
                            step="0.1"
                            value={settings.rate}
                            onChange={handleChange}
                        />
                    </div>
                    
                    <div>
                        <Label htmlFor="pitch">Pitch: {settings.pitch.toFixed(1)}</Label>
                        <RangeInput
                            type="range"
                            name="pitch"
                            id="pitch"
                            min="0"
                            max="2"
                            step="0.1"
                            value={settings.pitch}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <button 
                            onClick={handleTestVoice}
                            className="w-full px-4 py-2 rounded-lg text-sm font-medium text-text-primary bg-gray-600 hover:bg-gray-500 transition-colors"
                        >
                            Test Voice
                        </button>
                    </div>
                </div>

                <div className="flex items-center justify-end p-4 bg-primary/50 border-t border-gray-700/50 rounded-b-xl space-x-3">
                    <button 
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg text-sm font-medium text-text-primary bg-gray-600 hover:bg-gray-500 transition-colors"
                    >
                        Cancel
                    </button>
                     <button 
                        onClick={handleSave}
                        className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-accent hover:bg-accent-hover transition-colors"
                    >
                        Save & Close
                    </button>
                </div>
            </div>
        </div>
    );
};