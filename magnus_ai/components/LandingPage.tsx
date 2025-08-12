import React, { useState, useRef, useEffect } from 'react';
import { MagnusIcon, ThoughtIcon, GlobeAltIcon, CheckIcon, UsersIcon, BoltIcon, MusicNoteIcon, TerminalIcon, UserIcon, LogoutIcon } from './icons/Icons';
import { type User } from '../types';

interface LandingPageProps {
  onLogin: () => void;
  onContinueAsGuest: () => void;
  user: User | null;
  onGoToChat: () => void;
  onLogout: () => void;
}

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode; }> = ({ icon, title, children }) => (
    <div className="bg-secondary p-6 rounded-xl border border-gray-700/50 transform transition-transform hover:-translate-y-1 h-full">
        <div className="flex items-center justify-center w-12 h-12 bg-accent/20 text-accent rounded-lg mb-4">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-text-primary mb-2">{title}</h3>
        <p className="text-text-secondary leading-relaxed">{children}</p>
    </div>
);


export const LandingPage: React.FC<LandingPageProps> = ({ onLogin, onContinueAsGuest, user, onGoToChat, onLogout }) => {
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const profileMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
                setIsProfileMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="bg-primary text-text-primary min-h-screen">
             <style>{`
                .hero-bg {
                    background-image: radial-gradient(circle at 20% 20%, rgba(54, 98, 227, 0.2), transparent 30%),
                                    radial-gradient(circle at 80% 70%, rgba(54, 98, 227, 0.15), transparent 30%);
                    background-attachment: fixed;
                }
                @keyframes slide-in-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-slide-in-up {
                    animation: slide-in-up 0.6s ease-out forwards;
                }
            `}</style>

            <div className="relative hero-bg">
                {/* Header */}
                <header className="absolute top-0 left-0 right-0 z-10">
                    <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <MagnusIcon className="w-8 h-8" />
                            <h1 className="text-xl font-bold text-text-primary">Magnus AI</h1>
                        </div>
                        {user ? (
                             <div className="relative" ref={profileMenuRef}>
                                <button onClick={() => setIsProfileMenuOpen(prev => !prev)} className="flex items-center gap-3 p-1 rounded-lg hover:bg-secondary/50 transition-colors">
                                    {user.picture && <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full" />}
                                    <span className="text-sm font-semibold hidden sm:block">{user.name}</span>
                                </button>
                                {isProfileMenuOpen && (
                                    <div className="absolute top-full right-0 mt-2 w-48 bg-secondary rounded-lg shadow-lg border border-gray-700/50 p-2 z-20">
                                        <button
                                            onClick={onLogout}
                                            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-md text-left text-sm text-text-primary hover:bg-gray-700/60"
                                        >
                                            <LogoutIcon className="w-5 h-5 text-text-secondary" />
                                            <span>Sign Out</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <button
                                onClick={onLogin}
                                className="px-5 py-2.5 text-sm font-semibold text-text-primary bg-secondary/50 border border-gray-700/50 rounded-lg hover:bg-secondary transition-colors"
                            >
                                Login with Google
                            </button>
                        )}
                    </div>
                </header>

                {/* Hero Section */}
                <main className="container mx-auto px-6 pt-32 pb-20 text-center flex flex-col items-center">
                    <div className="max-w-3xl">
                        <div style={{ animationDelay: '0s' }} className="mb-6 animate-slide-in-up inline-block">
                             <MagnusIcon className="w-20 h-20" />
                        </div>
                        <h2 style={{ animationDelay: '0.1s' }} className="text-4xl md:text-6xl font-extrabold text-text-primary leading-tight mb-4 animate-slide-in-up">
                            Meet Magnus AI
                        </h2>
                        <h3 style={{ animationDelay: '0.2s' }} className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-accent to-blue-400 mb-6 animate-slide-in-up">
                            Your Agentic Partner for Thoughtful Work
                        </h3>
                        <p style={{ animationDelay: '0.3s' }} className="text-lg md:text-xl text-text-secondary mb-10 max-w-2xl mx-auto animate-slide-in-up">
                            Go beyond simple answers. Magnus AI uses advanced reasoning, integrates with your tools, and personalizes your experience.
                        </p>
                        <div style={{ animationDelay: '0.4s' }} className="animate-slide-in-up">
                           {user ? (
                                <button
                                    onClick={onGoToChat}
                                    className="px-8 py-4 text-lg font-bold text-white bg-accent rounded-lg hover:bg-accent-hover transition-transform transform hover:scale-105"
                                >
                                    Go to Chat
                                </button>
                           ) : (
                            <>
                                <button
                                    onClick={onLogin}
                                    className="px-8 py-4 text-lg font-bold text-white bg-accent rounded-lg hover:bg-accent-hover transition-transform transform hover:scale-105"
                                >
                                    Signup with Google
                                </button>
                                <p className="mt-4 text-sm text-text-secondary">
                                    or{' '}
                                    <button onClick={onContinueAsGuest} className="font-bold text-accent-hover hover:underline focus:outline-none">
                                        Continue as a Guest
                                    </button>
                                </p>
                            </>
                           )}
                        </div>
                    </div>
                </main>
            </div>

            {/* Features Section */}
            <section id="features" className="py-20 bg-secondary/30">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-12">
                         <h2 className="text-3xl md:text-4xl font-bold text-text-primary">An Assistant That Does More</h2>
                         <p className="text-lg text-text-secondary mt-2">Magnus AI is packed with features to supercharge your workflow.</p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <FeatureCard icon={<UsersIcon className="w-6 h-6"/>} title="Agentic Intelligence">
                           See how Magnus thinks with a step-by-step workflow, or deploy a team of AI experts to tackle complex problems collaboratively.
                        </FeatureCard>
                        <FeatureCard icon={<BoltIcon className="w-6 h-6"/>} title="Seamless Integration">
                           Continue as a guest or sign in with Google. A Google account is required to sync chats and use integrations like Calendar and Drive.
                        </FeatureCard>
                        <FeatureCard icon={<MusicNoteIcon className="w-6 h-6"/>} title="Creative Suite">
                           Generate music concepts, create comprehensive study guides, or take control of a real-time music stream with the PromptDJ tool.
                        </FeatureCard>
                         <FeatureCard icon={<TerminalIcon className="w-6 h-6"/>} title="Developer's Toolkit">
                           Generate code in any language, get detailed explanations, and see simulated output instantly in the built-in compiler.
                        </FeatureCard>
                        <FeatureCard icon={<UserIcon className="w-6 h-6"/>} title="Personalized Experience">
                           Tailor Magnus's personality, set and track goals, and use voice commands. Sign in to save your personalizations across all your devices.
                        </FeatureCard>
                        <FeatureCard icon={<GlobeAltIcon className="w-6 h-6"/>} title="Information Hub">
                           Get up-to-date answers from the web with citations, find locations on a map, or search and play YouTube videos directly in the chat.
                        </FeatureCard>
                    </div>
                </div>
            </section>
            
            {/* "How it works" section using a visual demo */}
            <section id="demo" className="py-20">
                <div className="container mx-auto px-6 flex flex-col lg:flex-row items-center gap-12">
                    <div className="lg:w-1/2">
                        <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">See the Agent at Work</h2>
                        <p className="text-lg text-text-secondary mb-6">Instead of a black box, you get a window into the AI's mind. Understand the 'why' behind every answer to build trust and learn more effectively.</p>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3"><CheckIcon className="w-5 h-5 text-accent shrink-0 mt-1"/><span>Verify information with a clear reasoning path.</span></li>
                            <li className="flex items-start gap-3"><CheckIcon className="w-5 h-5 text-accent shrink-0 mt-1"/><span>Gain deeper insights from structured, multi-step responses.</span></li>
                            <li className="flex items-start gap-3"><CheckIcon className="w-5 h-5 text-accent shrink-0 mt-1"/><span>Ideal for complex research, debugging, and strategic planning.</span></li>
                        </ul>
                    </div>
                    <div className="lg:w-1/2">
                        <div className="bg-secondary p-4 rounded-xl border border-gray-700/50 shadow-2xl">
                             {/* Mock AgenticWorkflow component */}
                             <div className="flex items-start gap-3 p-3 rounded-lg bg-bubble-model">
                                <div className="pt-0.5 shrink-0">
                                    <MagnusIcon className="w-6 h-6"/>
                                </div>
                                <div className="w-full">
                                    <h4 className="font-bold text-teal-400 mb-4 flex items-center gap-2">
                                        <ThoughtIcon className="w-5 h-5" />
                                        Agent Workflow Summary
                                    </h4>
                                    <div className="space-y-2">
                                        {/* Mock steps */}
                                        <div className="p-3 bg-primary/40 rounded-md text-sm"><strong className="text-teal-400/90">Learn:</strong> Phone B has better low-light photos and a 20% longer battery life.</div>
                                        <div className="p-3 bg-primary/40 rounded-md text-sm"><strong className="text-teal-400/90">Act:</strong> Phone A: 48MP, f/1.8. Phone B: 50MP, f/1.6. Battery: A=10hrs, B=12hrs.</div>
                                        <div className="p-3 bg-primary/40 rounded-md text-sm"><strong className="text-teal-400/90">Reason:</strong> I will compare camera specs and battery tests for both models.</div>
                                        <div className="p-3 bg-primary/40 rounded-md text-sm"><strong className="text-teal-400/90">Perceive:</strong> User wants a comparison of two phones on camera and battery.</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            
            {/* Footer */}
            <footer className="py-8 bg-secondary/30 border-t border-gray-700/50">
                <div className="container mx-auto px-6 text-center text-text-secondary">
                    <p>&copy; {new Date().getFullYear()} Magnus AI. Powered by Google Gemini.</p>
                </div>
            </footer>
        </div>
    );
};