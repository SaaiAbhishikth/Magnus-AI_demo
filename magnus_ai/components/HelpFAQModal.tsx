
import React, { useState } from 'react';
import { XIcon, SendIcon } from './icons/Icons';
import { type User } from '../types';

interface HelpFAQModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSendQuery: (queryData: { name: string; email: string; query: string }) => Promise<void>;
    user: User | null;
}

const FAQItem: React.FC<{ question: string; children: React.ReactNode }> = ({ question, children }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="py-3 border-b border-gray-700/50">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center text-left"
            >
                <span className="font-semibold text-text-primary">{question}</span>
                <svg
                    className={`w-5 h-5 text-text-secondary transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            {isOpen && <div className="mt-2 text-text-secondary pr-4">{children}</div>}
        </div>
    );
};


export const HelpFAQModal: React.FC<HelpFAQModalProps> = ({ isOpen, onClose, onSendQuery, user }) => {
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [query, setQuery] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !email.trim() || !query.trim()) {
            alert('Please fill out all fields.');
            return;
        }
        setIsSubmitting(true);
        setSubmitStatus('idle');
        try {
            await onSendQuery({ name, email, query });
            setSubmitStatus('success');
            setQuery('');
            setTimeout(() => setSubmitStatus('idle'), 4000); // Reset after 4s
        } catch (error) {
            setSubmitStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/60 z-40 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div
                className="bg-secondary rounded-xl shadow-2xl w-full max-w-2xl border border-gray-700/50 relative flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-4 border-b border-gray-700/50">
                    <h2 className="text-lg font-semibold text-text-primary">Help & FAQ</h2>
                    <button onClick={onClose} className="p-1 rounded-full text-text-secondary hover:bg-gray-700">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                    {/* Troubleshooting Section */}
                    <div>
                        <h3 className="text-xl font-bold text-text-primary mb-3">Troubleshooting</h3>
                        <div className="space-y-3 text-text-secondary">
                           <p><strong>Login issues:</strong> If you're unable to log in, please ensure third-party cookies are enabled in your browser settings. Sometimes ad-blockers or privacy extensions can interfere with Google Sign-In.</p>
                           <p><strong>Voice input not working:</strong> Voice-to-text requires a secure (HTTPS) connection and microphone permissions. If it says "unsupported", your browser may not be compatible. If it says "denied", please check your browser's site settings to allow microphone access for this page.</p>
                           <p><strong>App is slow or unresponsive:</strong> Try clearing your browser cache or opening the app in an incognito/private window. If the issue persists, feel free to contact support.</p>
                        </div>
                    </div>
                    
                    {/* FAQ Section */}
                    <div>
                        <h3 className="text-xl font-bold text-text-primary mb-2">Frequently Asked Questions</h3>
                        <FAQItem question="Is my data secure?">
                            <p>Yes. All of your chat history and customization settings are stored locally in your browser's localStorage. If you are logged in, this data is tied to your Google User ID. We do not store your conversations on our servers.</p>
                        </FAQItem>
                        <FAQItem question="How do the Agentic tools work?">
                            <p>Tools like "Deep Research" and "Think Longer" use a special prompt that instructs the AI to follow a structured thinking process: Perceive (understand the query), Reason (plan the response), Act (gather information), and Learn (synthesize the final answer). This provides more transparent and detailed results.</p>
                        </FAQItem>
                        <FAQItem question="How does scheduling a meeting work?">
                            <p>When you ask Magnus to schedule a meeting, it uses the Google Calendar API to create an event directly in the calendar of the logged-in user. The first time you use this feature, you will be asked to grant permission for the app to access your calendar. All event details (like time and attendees) are inferred from your prompt.</p>
                        </FAQItem>
                         <FAQItem question="Can I use Magnus AI for free?">
                            <p>Magnus AI itself is free to use, but it requires a Google Gemini API key. Google provides a generous free tier for the Gemini API, which is sufficient for most personal use cases. You are responsible for any costs incurred on your own API key.</p>
                        </FAQItem>
                    </div>

                    {/* Contact Support Section */}
                    <div>
                         <h3 className="text-xl font-bold text-text-primary mb-3">Contact Support</h3>
                         <p className="text-sm text-text-secondary mb-4">Still have questions? Fill out the form below and we'll get back to you.</p>
                         <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-text-secondary mb-1">Your Name</label>
                                    <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} className="w-full bg-primary border border-gray-600 rounded-lg px-3 py-2 text-text-primary" required />
                                </div>
                                <div>
                                     <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-1">Your Email</label>
                                    <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-primary border border-gray-600 rounded-lg px-3 py-2 text-text-primary" required />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="query" className="block text-sm font-medium text-text-secondary mb-1">Your Question or Issue</label>
                                <textarea id="query" value={query} onChange={e => setQuery(e.target.value)} rows={4} className="w-full bg-primary border border-gray-600 rounded-lg px-3 py-2 text-text-primary resize-y" required />
                            </div>
                             <div>
                                <button type="submit" disabled={isSubmitting} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-accent hover:bg-accent-hover transition-colors disabled:bg-gray-600">
                                    {isSubmitting ? 'Sending...' : 'Submit Query'}
                                    {!isSubmitting && <SendIcon className="w-4 h-4" />}
                                </button>
                                {submitStatus === 'success' && <p className="text-green-400 text-sm mt-2 text-center">Your query has been sent successfully!</p>}
                                {submitStatus === 'error' && <p className="text-red-400 text-sm mt-2 text-center">There was an error sending your query. Please try again.</p>}
                             </div>
                         </form>
                    </div>
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