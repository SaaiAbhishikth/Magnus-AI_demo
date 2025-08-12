


import React, { useState } from 'react';
import { type ChatMessage, MessageRole, type User, type ChatFile, type Action, type CompilerInfo } from '../types';
import { AgentIcon, UserIcon, GlobeAltIcon, DocumentIcon, SpeakerIcon, SpeakerWaveIcon, DocumentDuplicateIcon, CheckIcon, DownloadIcon } from './icons/Icons';
import { AgenticWorkflow } from './AgenticWorkflow';
import { StudyGuideDisplay } from './StudyGuideDisplay';
import { CodeBlock } from './CodeBlock';
import { MusicPlayer } from './MusicPlayer';
import { YouTubePreview } from './YouTubePreview';
import { YouTubeSearchResults } from './YouTubeSearchResults';
import { MapDisplay } from './MapDisplay';
import { CompilerDisplay } from './CompilerDisplay';
import { MultiAgentWorkflow } from './MultiAgentWorkflow';
import { ActionExecution } from './ActionExecution';

interface MessageProps {
  message: ChatMessage;
  onReadAloud: (message: ChatMessage) => void;
  speakingMessageId: string | null;
  mapsApiKey: string;
  user: User | null;
  onExecuteAction: (action: Action) => Promise<void>;
}

const Avatar: React.FC<{ role: MessageRole; user: User | null; }> = ({ role, user }) => {
  const iconClasses = 'w-6 h-6 text-white';
  
  switch(role) {
    case MessageRole.USER:
      if (user?.picture) {
        return <img src={user.picture} alt={user.name} className="w-10 h-10 rounded-full shrink-0" />;
      }
      return <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-indigo-500"><UserIcon className={iconClasses} /></div>;
    case MessageRole.MODEL:
    case MessageRole.SYSTEM:
      return <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-gray-600"><AgentIcon className={iconClasses} /></div>;
    default:
      return null;
  }
};

const SourceList: React.FC<{ sources: Array<{ uri: string; title: string }> }> = ({ sources }) => (
    <div className="mt-3 pt-3 border-t border-gray-500/50">
        <h4 className="text-xs font-semibold text-text-secondary mb-2 flex items-center gap-2">
            <GlobeAltIcon className="w-4 h-4" />
            Sources
        </h4>
        <div className="space-y-1.5">
            {sources.map((source, index) => (
                <a
                    key={index}
                    href={source.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-sm text-accent/90 hover:text-accent truncate bg-black/20 hover:bg-black/30 px-2 py-1.5 rounded-md transition-colors"
                >
                    <span className="font-medium">{source.title || new URL(source.uri).hostname}</span>
                    <p className="text-xs text-text-secondary/80 truncate">{source.uri}</p>
                </a>
            ))}
        </div>
    </div>
);

const TextContent: React.FC<{ content: string }> = ({ content }) => {
  if (!content.trim()) return null;

  const lines = content.split('\n');
  const elements: JSX.Element[] = [];
  let currentParagraphLines: string[] = [];
  let currentListItems: JSX.Element[] = [];

  const parseInline = (text: string, keyPrefix: string) => {
      const parts = text.split(/(\*\*.*?\*\*)/g);
      return parts.map((part, index) => {
          if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={`${keyPrefix}-${index}`}>{part.slice(2, -2)}</strong>;
          }
          return part;
      });
  };

  const flushParagraph = () => {
      if (currentParagraphLines.length > 0) {
          const paragraphText = currentParagraphLines.join('\n');
          if (paragraphText.trim()) {
            elements.push(<div key={`p-${elements.length}`} className="my-2">{parseInline(paragraphText, `p-${elements.length}`)}</div>);
          }
          currentParagraphLines = [];
      }
  };

  const flushList = () => {
      if (currentListItems.length > 0) {
          elements.push(
              <ul key={`ul-${elements.length}`} className="list-disc list-outside pl-5 space-y-1 my-2">
                  {currentListItems}
              </ul>
          );
          currentListItems = [];
      }
  };

  lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      const isListItem = trimmedLine.startsWith('* ') || trimmedLine.startsWith('- ');

      if (isListItem) {
          flushParagraph();
          const itemContent = trimmedLine.substring(2);
          currentListItems.push(<li key={`li-${index}`}>{parseInline(itemContent, `li-${index}`)}</li>);
      } else {
          flushList();
          currentParagraphLines.push(line);
      }
  });

  flushParagraph();
  flushList();

  return <>{elements}</>;
};

const FormattedContent: React.FC<{ content: string }> = ({ content }) => {
  const codeBlockRegex = /```([\w-]*)\n([\s\S]*?)\n```/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push(<TextContent key={`text-${lastIndex}`} content={content.substring(lastIndex, match.index)} />);
    }

    const language = match[1] || 'python';
    const code = match[2];
    parts.push(<CodeBlock key={`code-${match.index}`} language={language} code={code} />);
    
    lastIndex = codeBlockRegex.lastIndex;
  }

  if (lastIndex < content.length) {
    parts.push(<TextContent key={`text-${lastIndex}`} content={content.substring(lastIndex)} />);
  }

  return <>{parts}</>;
};

const FileAttachment: React.FC<{ file: ChatFile }> = ({ file }) => {
    const isImage = file.type.startsWith('image/');
    const [isCopied, setIsCopied] = useState(false);

    const handleCopyImage = async () => {
        if (!navigator.clipboard?.write) {
            alert('Your browser does not support the Clipboard API for copying images.');
            return;
        }
        try {
            const response = await fetch(file.url);
            const blob = await response.blob();
            // @ts-ignore - ClipboardItem is supported in modern browsers
            const clipboardItem = new ClipboardItem({ [blob.type]: blob });
            // @ts-ignore
            await navigator.clipboard.write([clipboardItem]);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy image to clipboard:', error);
            alert('Could not copy image. You may need to grant clipboard permissions.');
        }
    };
    
    const formatBytes = (bytes: number, decimals = 2) => {
        if (!+bytes) return '0 Bytes'
        const k = 1024
        const dm = decimals < 0 ? 0 : decimals
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
    }

    if (isImage) {
        return (
            <div className="relative group bg-primary/30 rounded-lg overflow-hidden border border-gray-700/50">
                <img 
                    src={file.url}
                    alt={file.name}
                    className="w-full h-auto object-contain"
                />
                <button
                    onClick={handleCopyImage}
                    className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Copy image"
                    title="Copy image"
                >
                    {isCopied ? <CheckIcon className="w-5 h-5 text-green-400" /> : <DocumentDuplicateIcon className="w-5 h-5" />}
                </button>
            </div>
        );
    }

    return (
        <div className="p-3 bg-black/20 rounded-lg flex items-center gap-3 border border-gray-500/30">
            <div className="w-8 h-8 flex items-center justify-center bg-primary rounded-md shrink-0">
                <DocumentIcon className="w-5 h-5 text-text-secondary"/>
            </div>
            <div className="truncate flex-1">
                <p className="text-sm font-medium text-text-primary truncate">{file.name}</p>
                <p className="text-xs text-text-secondary">{formatBytes(file.size)}</p>
            </div>
            <a href={file.url} download={file.name} className="p-2 rounded-full hover:bg-black/20 text-text-secondary hover:text-text-primary transition-colors" aria-label={`Download ${file.name}`}>
                 <DownloadIcon className="w-5 h-5" />
            </a>
        </div>
    );
};


export const Message: React.FC<MessageProps> = ({ message, onReadAloud, speakingMessageId, mapsApiKey, user, onExecuteAction }) => {
    const isUser = message.role === MessageRole.USER;
    const isSpeaking = speakingMessageId === message.id;

    // Special message types that take up the full width
    if (message.multiAgentState) {
        return <MultiAgentWorkflow multiAgentState={message.multiAgentState} />;
    }
    if (message.workflowState) {
        return <AgenticWorkflow workflowState={message.workflowState} />;
    }
    if (message.studyGuide) {
        return <StudyGuideDisplay studyGuide={message.studyGuide} />;
    }
    if (message.music) {
        return <MusicPlayer music={message.music} />;
    }
    if (message.youtubeSearchResults) {
        return <YouTubeSearchResults results={message.youtubeSearchResults} searchQuery={message.youtubeSearchQuery || ''} />;
    }

    return (
        <div className={`flex w-full items-end gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex max-w-3xl items-end gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                <Avatar role={message.role} user={user} />
                <div className={`relative flex flex-col items-start text-sm text-text-primary px-4 py-3 rounded-2xl shadow-md ${
                    isUser ? 'bg-bubble-user rounded-br-none' : 'bg-bubble-model rounded-bl-none'
                }`}>
                    
                    {/* Main content */}
                    {message.content && <FormattedContent content={message.content} />}

                    {/* Compiler / Code runner */}
                    {message.compilerInfo && <CompilerDisplay compilerInfo={message.compilerInfo} />}

                    {/* Attachments */}
                    {message.files && message.files.length > 0 && (
                        <div className={`mt-3 grid gap-2 ${message.files.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                            {message.files.map((file, index) => <FileAttachment key={index} file={file} />)}
                        </div>
                    )}
                    
                    {/* Special Content Displays */}
                    {message.youtubeVideoId && (
                        <YouTubePreview videoId={message.youtubeVideoId} songTitle={message.youtubeSongTitle || ''} artistName={message.youtubeArtistName || ''} />
                    )}

                    {message.locationInfo && (
                        <MapDisplay locationInfo={message.locationInfo} mapsApiKey={mapsApiKey} />
                    )}
                    
                    {/* Sources */}
                    {message.groundingSources && message.groundingSources.length > 0 && (
                        <SourceList sources={message.groundingSources} />
                    )}

                    {/* Proposed Actions */}
                    {message.actions && message.actions.length > 0 && (
                        <ActionExecution actions={message.actions} onExecute={onExecuteAction} />
                    )}
                    
                    {/* Toolbar */}
                    {!isUser && message.content && (
                        <div className="absolute -bottom-2 -left-2 flex items-center gap-1 bg-secondary p-1 rounded-full border border-gray-700/50 shadow-md">
                            <button
                                onClick={() => onReadAloud(message)}
                                className={`p-1.5 rounded-full ${isSpeaking ? 'text-accent' : 'text-text-secondary'} hover:bg-gray-700/50 hover:text-text-primary transition-colors`}
                                aria-label={isSpeaking ? 'Stop reading' : 'Read aloud'}
                            >
                                {isSpeaking ? <SpeakerWaveIcon className="w-4 h-4" /> : <SpeakerIcon className="w-4 h-4" />}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};