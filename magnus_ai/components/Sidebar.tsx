import React, { useState, useRef, useEffect } from 'react';
import { MagnusIcon, ChatBubbleIcon, PlusIcon, UserIcon, TrashIcon, LogoutIcon, TrophyIcon, StarIcon, FireIcon, TerminalIcon, GuestIcon } from './icons/Icons';
import { type ChatSession, type User, type UserStats } from '../types';
import { UserProfileMenu } from './UserProfileMenu';

interface SidebarProps {
  onNewChat: () => void;
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectChat: (sessionId: string) => void;
  onDeleteChat: (sessionId: string) => void;
  disabled?: boolean;
  user: User | null;
  userStats: UserStats;
  onLogin: () => void;
  onLogout: () => void;
  onGoHome: () => void;
  onOpenCustomizeModal: () => void;
  onOpenSettingsModal: () => void;
  onOpenHelpModal: () => void;
  onOpenChallengeModal: () => void;
  onOpenCompiler: () => void;
}

const ParsedText: React.FC<{ text: string }> = ({ text }) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return (
        <>
            {parts.map((part, index) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={index}>{part.slice(2, -2)}</strong>;
                }
                return part;
            })}
        </>
    );
};


export const Sidebar: React.FC<SidebarProps> = ({ 
  onNewChat, sessions, activeSessionId, onSelectChat, onDeleteChat, 
  disabled = false, user, userStats, onLogin, onLogout, onGoHome, onOpenCustomizeModal,
  onOpenSettingsModal, onOpenHelpModal, onOpenChallengeModal, onOpenCompiler
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleCustomize = () => {
    onOpenCustomizeModal();
    setIsMenuOpen(false);
  }
  
  const handleLogout = () => {
    onLogout();
    setIsMenuOpen(false);
  }

  const handleOpenSettings = () => {
    onOpenSettingsModal();
    setIsMenuOpen(false);
  };
  
  const handleOpenHelp = () => {
    onOpenHelpModal();
    setIsMenuOpen(false);
  };

  return (
    <aside className="w-64 bg-secondary flex flex-col p-4 border-r border-gray-700/50">
      <button onClick={onGoHome} className="flex items-center gap-2 mb-2 text-left w-full hover:opacity-80 transition-opacity focus:outline-none ring-accent/50 focus-visible:ring-2 rounded-md">
        <MagnusIcon className="w-8 h-8" />
        <h1 className="text-xl font-bold text-text-primary">Magnus AI</h1>
      </button>
      
      <div className="flex items-center gap-4 mb-4 pl-1">
          <div className="flex items-center gap-1.5 text-sm text-text-secondary" title={`${userStats.points} Points`}>
            <StarIcon className="w-5 h-5 text-yellow-400" />
            <span className="font-bold text-text-primary">{userStats.points}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-text-secondary" title={`${userStats.streak} Day Streak`}>
            <FireIcon className="w-5 h-5 text-orange-500" />
            <span className="font-bold text-text-primary">{userStats.streak}</span>
          </div>
      </div>

      <div className="space-y-2">
        <button
          onClick={onNewChat}
          disabled={disabled}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-left text-sm font-medium text-text-primary bg-accent hover:bg-accent-hover transition-colors duration-200 disabled:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <PlusIcon className="w-5 h-5" />
          New Chat
        </button>

        <button
            onClick={onOpenChallengeModal}
            disabled={disabled}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-left text-sm font-medium text-text-primary bg-yellow-600/80 hover:bg-yellow-500/80 transition-colors duration-200 disabled:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            <TrophyIcon className="w-5 h-5" />
            Daily Challenge
        </button>

        <button
            onClick={onOpenCompiler}
            disabled={disabled}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-left text-sm font-medium text-text-primary bg-green-700/80 hover:bg-green-600/80 transition-colors duration-200 disabled:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            <TerminalIcon className="w-5 h-5" />
            Code Compiler
        </button>
      </div>


      <div className="flex-1 overflow-y-auto mt-4 space-y-1 pr-1 -mr-2">
        <span className="px-2 text-xs font-semibold text-text-secondary uppercase">Chats</span>
        {sessions.map(session => (
            <div key={session.id} className="relative group">
                <button
                onClick={() => onSelectChat(session.id)}
                className={`flex items-center gap-3 w-full px-2 py-2.5 rounded-lg text-left text-sm font-medium transition-colors duration-200 truncate ${
                    activeSessionId === session.id
                    ? 'bg-gray-700/60 text-text-primary'
                    : 'text-text-secondary hover:bg-gray-700/40'
                }`}
                >
                    <ChatBubbleIcon className="w-4 h-4 shrink-0" />
                    <span className="truncate flex-1">
                        <ParsedText text={session.title} />
                    </span>
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDeleteChat(session.id);
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-text-secondary hover:bg-red-500/20 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label={`Delete chat: ${session.title}`}
                >
                    <TrashIcon className="w-4 h-4" />
                </button>
            </div>
        ))}
      </div>


      <div ref={menuRef} className="mt-auto pt-4 border-t border-gray-700/50 relative">
        {user ? (
          user.id === 'guest' ? (
            <button
              onClick={onLogin}
              className="flex items-center gap-3 w-full px-2 py-1.5 rounded-lg text-left text-sm hover:bg-gray-700/50 transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-gray-600 flex items-center justify-center">
                <GuestIcon className="w-5 h-5 text-white" />
              </div>
              <div className='flex-1 truncate'>
                <span className="font-medium text-text-primary block truncate">Guest</span>
                <span className="text-xs text-text-secondary block truncate">Sign in to save chats</span>
              </div>
            </button>
          ) : (
            <>
              <button 
                onClick={() => setIsMenuOpen(prev => !prev)}
                className="flex items-center gap-3 w-full px-2 py-1.5 rounded-lg text-left text-sm hover:bg-gray-700/50 transition-colors"
              >
                <img src={user.picture} alt={user.name} className="w-7 h-7 rounded-full" />
                <div className='flex-1 truncate'>
                  <span className="font-medium text-text-primary block truncate">{user.name}</span>
                  <span className="text-xs text-text-secondary block truncate">{user.email}</span>
                </div>
              </button>
              {isMenuOpen && (
                <UserProfileMenu 
                  user={user}
                  onLogout={handleLogout}
                  onCustomize={handleCustomize}
                  onOpenSettings={handleOpenSettings}
                  onOpenHelp={handleOpenHelp}
                />
              )}
            </>
          )
        ) : (
          <div className="w-full">
            <button
              onClick={onLogin}
              disabled={disabled}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-left text-sm text-text-secondary hover:bg-gray-700/50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <UserIcon className="w-5 h-5" />
              Login with Google
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};