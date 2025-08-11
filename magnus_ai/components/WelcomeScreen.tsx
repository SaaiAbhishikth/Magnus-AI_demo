
import React from 'react';
import { type User } from '../types';
import { AgentIcon } from './icons/Icons';

interface WelcomeScreenProps {
    user: User;
    onContinue: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ user, onContinue }) => {
    return (
        <div className="fixed inset-0 bg-primary z-50 flex flex-col items-center justify-center p-8 text-center animate-fade-in">
            <style>
                {`
                    @keyframes fade-in {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }
                    .animate-fade-in {
                        animation: fade-in 0.5s ease-out forwards;
                    }
                    @keyframes slide-up-fade-in {
                        from { opacity: 0; transform: translateY(20px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    .animate-slide-up-1 { animation: slide-up-fade-in 0.5s ease-out 0.2s forwards; opacity: 0; }
                    .animate-slide-up-2 { animation: slide-up-fade-in 0.5s ease-out 0.4s forwards; opacity: 0; }
                    .animate-slide-up-3 { animation: slide-up-fade-in 0.5s ease-out 0.6s forwards; opacity: 0; }
                    .animate-slide-up-4 { animation: slide-up-fade-in 0.5s ease-out 0.8s forwards; opacity: 0; }
                `}
            </style>

            <div className="bg-accent p-4 rounded-2xl mb-6 animate-slide-up-1">
                <AgentIcon className="w-12 h-12 text-white" />
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-4 animate-slide-up-2">
                Welcome, {user.name.split(' ')[0]}!
            </h1>
            
            <p className="text-lg text-text-secondary max-w-xl mx-auto mb-8 animate-slide-up-3">
                We're thrilled to have you. Magnus AI is ready to assist with everything from deep research to creative brainstorming.
            </p>

            <button
                onClick={onContinue}
                className="px-8 py-3 rounded-lg text-lg font-semibold text-white bg-accent hover:bg-accent-hover transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-accent/50 animate-slide-up-4"
            >
                Start Chatting
            </button>
        </div>
    );
};
