

import React, { useState, useEffect } from 'react';
import { type CustomizationSettings, type UserGoal } from '../types';
import { XIcon, PlusIcon, TrashIcon, TargetIcon } from './icons/Icons';

interface CustomizeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (settings: CustomizationSettings) => void;
    initialSettings: CustomizationSettings | null;
}

const Label: React.FC<{ htmlFor?: string; children: React.ReactNode }> = ({ htmlFor, children }) => (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-text-secondary mb-2">
        {children}
    </label>
);

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
    <input
        {...props}
        className="w-full bg-primary border border-gray-600 rounded-lg px-3 py-2 text-text-primary placeholder:text-gray-500 focus:ring-2 focus:ring-accent focus:border-accent outline-none transition"
    />
);

const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => (
     <textarea
        {...props}
        className="w-full bg-primary border border-gray-600 rounded-lg px-3 py-2 text-text-primary placeholder:text-gray-500 focus:ring-2 focus:ring-accent focus:border-accent outline-none transition resize-y min-h-[80px]"
    />
);

const defaultSettings: CustomizationSettings = {
    nickname: '',
    profession: '',
    traits: '',
    interests: '',
    longTermMemory: '',
    goals: [],
};

export const CustomizeModal: React.FC<CustomizeModalProps> = ({ isOpen, onClose, onSave, initialSettings }) => {
    const [settings, setSettings] = useState<CustomizationSettings>(defaultSettings);
    const [newGoal, setNewGoal] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (initialSettings) {
                setSettings({ ...defaultSettings, ...initialSettings });
            } else {
                setSettings(defaultSettings);
            }
        }
    }, [initialSettings, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: value }));
    };

    const handleAddGoal = () => {
        if (newGoal.trim()) {
            const goal: UserGoal = {
                id: `goal-${Date.now()}`,
                description: newGoal.trim(),
                completed: false,
            };
            setSettings(prev => ({ ...prev, goals: [...prev.goals, goal] }));
            setNewGoal('');
        }
    };
    
    const handleGoalKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddGoal();
        }
    }
    
    const toggleGoalCompletion = (goalId: string) => {
        setSettings(prev => ({
            ...prev,
            goals: prev.goals.map(g => g.id === goalId ? { ...g, completed: !g.completed } : g)
        }));
    };

    const handleDeleteGoal = (goalId: string) => {
        setSettings(prev => ({
            ...prev,
            goals: prev.goals.filter(g => g.id !== goalId)
        }));
    };

    const handleSave = () => {
        onSave(settings);
    };

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/60 z-40 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div 
                className="bg-secondary rounded-xl shadow-2xl w-full max-w-lg border border-gray-700/50 relative flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-4 border-b border-gray-700/50">
                    <h2 className="text-lg font-semibold text-text-primary">Customize Magnus AI</h2>
                    <button onClick={onClose} className="p-1 rounded-full text-text-secondary hover:bg-gray-700">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                    {/* Persona Section */}
                    <div className="space-y-4">
                         <div>
                            <Label htmlFor="nickname">What should Magnus AI call you?</Label>
                            <Input 
                                type="text" 
                                name="nickname"
                                id="nickname"
                                placeholder="Nickname"
                                value={settings.nickname}
                                onChange={handleChange}
                            />
                        </div>
                         <div>
                            <Label htmlFor="profession">What do you do?</Label>
                            <Input 
                                type="text" 
                                name="profession"
                                id="profession"
                                placeholder="e.g., Interior designer"
                                value={settings.profession}
                                onChange={handleChange}
                            />
                        </div>
                         <div>
                            <Label htmlFor="traits">What traits should Magnus AI have? (for Default personality)</Label>
                            <Textarea
                                name="traits"
                                id="traits"
                                placeholder="Describe traits, e.g., Chatty, witty, encouraging"
                                value={settings.traits}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <Label htmlFor="interests">Anything else Magnus AI should know about you?</Label>
                            <Textarea
                                name="interests"
                                id="interests"
                                placeholder="Interests, values, or preferences to keep in mind"
                                value={settings.interests}
                                onChange={handleChange}
                            />
                        </div>
                         <div>
                            <Label htmlFor="longTermMemory">Core Memory (for long-term context)</Label>
                            <Textarea
                                name="longTermMemory"
                                id="longTermMemory"
                                placeholder="Add key facts, projects, preferences, and recurring goals Magnus AI should always remember. e.g., 'I'm working on a novel called The Crimson Cipher.' 'My primary programming language is TypeScript.'"
                                value={settings.longTermMemory}
                                onChange={handleChange}
                                rows={5}
                            />
                        </div>
                    </div>

                    {/* Goals Section */}
                    <div className="pt-6 border-t border-gray-700/50">
                        <div className="flex items-center gap-2 mb-2">
                           <TargetIcon className="w-5 h-5 text-text-secondary" />
                           <h3 className="text-md font-semibold text-text-primary">Your Goals</h3>
                        </div>
                        <div className="space-y-3">
                           {/* Add Goal Input */}
                            <div className="flex gap-2">
                                <Input
                                    type="text"
                                    placeholder="Add a new goal (e.g., Learn Python)"
                                    value={newGoal}
                                    onChange={(e) => setNewGoal(e.target.value)}
                                    onKeyDown={handleGoalKeyDown}
                                />
                                <button
                                    onClick={handleAddGoal}
                                    className="p-2 bg-accent text-white rounded-lg hover:bg-accent-hover disabled:bg-gray-600"
                                    disabled={!newGoal.trim()}
                                >
                                    <PlusIcon className="w-5 h-5" />
                                </button>
                            </div>
                            {/* Goals List */}
                            <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                                {settings.goals.length === 0 && <p className="text-sm text-center text-text-secondary py-2">No goals set yet.</p>}
                                {settings.goals.map(goal => (
                                    <div key={goal.id} className="flex items-center gap-3 p-2 bg-primary/70 rounded-md">
                                        <input
                                            type="checkbox"
                                            checked={goal.completed}
                                            onChange={() => toggleGoalCompletion(goal.id)}
                                            className="w-5 h-5 rounded bg-secondary border-gray-500 text-accent focus:ring-accent shrink-0"
                                        />
                                        <p className={`flex-1 text-sm ${goal.completed ? 'line-through text-text-secondary' : 'text-text-primary'}`}>
                                            {goal.description}
                                        </p>
                                        <button onClick={() => handleDeleteGoal(goal.id)} className="p-1 text-text-secondary hover:text-red-500">
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
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
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};