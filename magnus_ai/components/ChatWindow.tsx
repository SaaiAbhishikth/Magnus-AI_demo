


import React, { useEffect, useRef } from 'react';
import { type ChatMessage, type User, Action } from '../types';
import { Message } from './Message';
import { AgentIcon, MagnusIcon } from './icons/Icons';

interface ChatWindowProps {
  chatHistory: ChatMessage[];
  isLoading: boolean;
  onReadAloud: (message: ChatMessage) => void;
  speakingMessageId: string | null;
  mapsApiKey: string;
  user: User | null;
  onExecuteAction: (action: Action) => Promise<void>;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ chatHistory, isLoading, onReadAloud, speakingMessageId, mapsApiKey, user, onExecuteAction }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, isLoading]);

  const welcomeMessageVisible = chatHistory.length === 0 && !isLoading;

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
      {welcomeMessageVisible && (
         <div className="text-center pt-20">
            <div className="inline-block mb-4">
              <MagnusIcon className="w-24 h-24" />
            </div>
            <h1 className="text-4xl font-bold text-text-primary mb-2">Magnus AI</h1>
            <p className="text-lg text-text-secondary">How can I help you today?</p>
        </div>
      )}
      {chatHistory.map((message) => (
        <Message 
            key={message.id} 
            message={message} 
            onReadAloud={onReadAloud}
            speakingMessageId={speakingMessageId}
            mapsApiKey={mapsApiKey}
            user={user}
            onExecuteAction={onExecuteAction}
        />
      ))}
      {isLoading && (
        <div className="flex items-end gap-3 w-full justify-start flex-row">
          <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-gray-600">
              <AgentIcon className="w-6 h-6 text-white" />
          </div>
          <div className="bg-bubble-model text-text-primary px-4 py-3 rounded-2xl rounded-bl-none flex items-center space-x-1.5">
            <span className="typing-dot"></span>
            <span className="typing-dot" style={{animationDelay: '0.2s'}}></span>
            <span className="typing-dot" style={{animationDelay: '0.4s'}}></span>
          </div>
        </div>
      )}
    </div>
  );
};