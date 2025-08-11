
import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SendIcon, PlusIcon, ToolsIcon, XIcon, MicrophoneIcon, DocumentIcon, TrashIcon, PromptDJIcon, TheaterMasksIcon } from './icons/Icons';
import { Tool, type ChatFile, type User, Personality } from '../types';
import { ToolsMenu } from './ToolsMenu';
import { AddMenu } from './AddMenu';
import { PersonalityMenu } from './PersonalityMenu';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  disabled?: boolean;
  activeTool: Tool | null;
  onSelectTool: (tool: Tool | null) => void;
  user: User | null;
  activePersonality: Personality | null;
  onSelectPersonality: (personality: Personality) => void;
  stagedFiles: ChatFile[];
  setStagedFiles: React.Dispatch<React.SetStateAction<ChatFile[]>>;
  googleAccessToken: string | null;
  onConnectDrive: () => void;
}

const StagedFilePreview: React.FC<{ file: ChatFile, onRemove: () => void }> = ({ file, onRemove }) => {
    const isImage = file.type.startsWith('image/');
    return (
        <div className="relative group aspect-square bg-primary rounded-md overflow-hidden border border-gray-700/50">
            {isImage ? (
                <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
            ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-1 text-center">
                    <DocumentIcon className="w-6 h-6 text-text-secondary" />
                    <p className="text-xs text-text-secondary truncate mt-1 px-1">{file.name}</p>
                </div>
            )}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <button 
                    onClick={onRemove} 
                    className="p-1.5 bg-red-600/80 text-white rounded-full hover:bg-red-500"
                    aria-label={`Remove ${file.name}`}
                    title={`Remove ${file.name}`}
                >
                    <TrashIcon className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

// Helper function to process files from file inputs or clipboard
const processFiles = (files: FileList | File[]): Promise<ChatFile[]> => {
    const filePromises = Array.from(files).map(file => {
        return new Promise<ChatFile>((resolve, reject) => {
            if (!file) {
                return reject(new Error("Invalid file object provided."));
            }
            const reader = new FileReader();
            reader.onload = (e) => {
                const dataUrl = e.target?.result as string;
                if (dataUrl) {
                    resolve({
                        name: file.name || `pasted-image-${Date.now()}.png`,
                        type: file.type || 'image/png',
                        size: file.size,
                        url: dataUrl
                    });
                } else {
                    reject(new Error(`Failed to read file: ${file.name}`));
                }
            };
            reader.onerror = (err) => reject(err);
            reader.readAsDataURL(file);
        });
    });
    return Promise.all(filePromises);
};


export const ChatInput: React.FC<ChatInputProps> = ({ 
  onSendMessage, 
  isLoading, 
  disabled = false, 
  activeTool, 
  onSelectTool,
  user,
  activePersonality,
  onSelectPersonality,
  stagedFiles,
  setStagedFiles,
  googleAccessToken,
  onConnectDrive,
}) => {
  const [input, setInput] = useState('');
  const [isToolsMenuOpen, setIsToolsMenuOpen] = useState(false);
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [isPersonalityMenuOpen, setIsPersonalityMenuOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [micSupportStatus, setMicSupportStatus] = useState<'supported' | 'unsupported' | 'denied' | 'checking'>('checking');
  
  const toolsMenuRef = useRef<HTMLDivElement>(null);
  const addMenuRef = useRef<HTMLDivElement>(null);
  const personalityMenuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any | null>(null);
  const finalTranscriptRef = useRef('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (toolsMenuRef.current && !toolsMenuRef.current.contains(target)) {
        setIsToolsMenuOpen(false);
      }
      if (addMenuRef.current && !addMenuRef.current.contains(target)) {
        setIsAddMenuOpen(false);
      }
      if (personalityMenuRef.current && !personalityMenuRef.current.contains(target)) {
        setIsPersonalityMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  useEffect(() => {
    // @ts-ignore
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    // Use isSecureContext for a more robust check that handles localhost and other secure-by-default origins.
    if (!SpeechRecognitionAPI || !window.isSecureContext) {
      console.warn("SpeechRecognition API not supported or context is not secure.");
      setMicSupportStatus('unsupported');
      return;
    }

    setMicSupportStatus('supported');

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true; // Crucial for live feedback
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscriptRef.current += event.results[i][0].transcript + ' ';
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      setInput(finalTranscriptRef.current + interimTranscript);
    };

    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => {
        setIsRecording(false);
        textareaRef.current?.focus();
    };
    recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
            setMicSupportStatus('denied');
        }
        setIsRecording(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognitionRef.current?.stop();
    };
  }, []);


  const handleSend = () => {
    if ((input.trim() || stagedFiles.length > 0) && !isLoading && !disabled) {
      onSendMessage(input.trim());
      setInput('');
      // Staged files are cleared in the parent component after sending
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  const handleSelectTool = (tool: Tool) => {
    onSelectTool(tool);
    setIsToolsMenuOpen(false);
  }

  const handleSelectPersonality = (personality: Personality) => {
    onSelectPersonality(personality);
    setIsPersonalityMenuOpen(false);
  }

  const handleMicClick = () => {
    if (micSupportStatus !== 'supported' || !recognitionRef.current) return;

    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      finalTranscriptRef.current = input.trim() ? input.trim() + ' ' : '';
      try {
        recognitionRef.current.start();
      } catch(e) {
        console.error("Could not start recognition:", e);
      }
    }
  };

  const handleAddFileClick = () => {
    fileInputRef.current?.click();
    setIsAddMenuOpen(false);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
        processFiles(files)
            .then(newFiles => {
                setStagedFiles(prev => [...prev, ...newFiles]);
            })
            .catch(error => {
                console.error("Error reading files:", error);
                alert("There was an error reading one or more files. Please try again.");
            });
    }

    if (event.target) {
        event.target.value = '';
    }
  };
  
  const handlePaste = (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
        const items = event.clipboardData.items;
        const imageFiles: File[] = [];

        for (let i = 0; i < items.length; i++) {
            if (items[i].kind === 'file' && items[i].type.startsWith('image/')) {
                const file = items[i].getAsFile();
                if (file) {
                    imageFiles.push(file);
                }
            }
        }

        if (imageFiles.length > 0) {
            event.preventDefault(); // Prevent pasting text if an image is found
            processFiles(imageFiles)
                .then(newFiles => {
                    setStagedFiles(prev => [...prev, ...newFiles]);
                })
                .catch(error => {
                    console.error("Error processing pasted files:", error);
                    alert("There was an error processing one or more pasted images.");
                });
        }
    };

  const removeStagedFile = (indexToRemove: number) => {
      setStagedFiles(prev => prev.filter((_, index) => index !== indexToRemove));
  };


  const placeholderText = disabled 
    ? "Please start a new chat or select one." 
    : activeTool 
      ? `Ask me to ${activeTool.toLowerCase()}...` 
      : isRecording
        ? "Listening..."
        : "Ask anything, or paste an image...";

  const getMicTooltip = () => {
    switch (micSupportStatus) {
        case 'unsupported':
            return "Voice input is not available in this browser or requires a secure (HTTPS) connection.";
        case 'denied':
            return "Microphone access was denied. Please check your browser settings.";
        case 'supported':
            return isRecording ? "Stop recording" : "Start recording";
        default:
            return "Checking microphone support...";
    }
  };

  return (
    <div className="px-6 pb-6 pt-4 bg-primary">
        {stagedFiles.length > 0 && (
            <div className="mb-2 p-2 bg-secondary/50 rounded-lg border border-gray-700/60">
                <p className="text-xs text-text-secondary mb-2 px-1">Attachments</p>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 max-h-40 overflow-y-auto pr-1">
                    {stagedFiles.map((file, index) => (
                        <StagedFilePreview key={`${file.name}-${index}`} file={file} onRemove={() => removeStagedFile(index)} />
                    ))}
                </div>
            </div>
        )}
        {(activeTool || activePersonality !== Personality.DEFAULT) && (
            <div className="flex items-center justify-between flex-wrap gap-2 bg-secondary/50 text-sm text-text-secondary px-3 py-1.5 mb-2 rounded-lg border border-gray-700/60">
                <div className="flex items-center gap-4">
                    {activeTool && (
                        <div className="flex items-center gap-2">
                            <span>Tool: <span className="font-semibold text-text-primary">{activeTool}</span></span>
                             <button 
                                onClick={() => onSelectTool(null)}
                                className="p-1 rounded-full hover:bg-gray-600"
                                aria-label="Clear active tool"
                            >
                                <XIcon className="w-3 h-3" />
                            </button>
                        </div>
                    )}
                    {activePersonality && activePersonality !== Personality.DEFAULT && (
                         <div className="flex items-center gap-2">
                            <span>Personality: <span className="font-semibold text-text-primary">{activePersonality}</span></span>
                            <button 
                                onClick={() => onSelectPersonality(Personality.DEFAULT)}
                                className="p-1 rounded-full hover:bg-gray-600"
                                aria-label="Reset to default personality"
                            >
                                <XIcon className="w-3 h-3" />
                            </button>
                         </div>
                    )}
                </div>
            </div>
        )}
      <div className="flex items-start gap-3">
        {user?.picture && (
            <img src={user.picture} alt="Your avatar" className="w-10 h-10 rounded-full mt-1.5 shrink-0" />
        )}
        <div className={`flex-1 relative flex items-end bg-secondary p-2 rounded-xl border border-gray-700/60 ${!disabled && 'focus-within:border-accent'} transition-colors duration-200 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
          <div className="flex items-center self-end p-2 gap-0.5">
              <div className="relative" ref={addMenuRef}>
                  <button 
                      onClick={() => setIsAddMenuOpen(p => !p)}
                      className="p-1.5 rounded-lg text-text-secondary hover:bg-gray-700/60 hover:text-text-primary" 
                      disabled={disabled}
                      aria-label="Add files and connect apps"
                      title="Add files and connect apps"
                  >
                      <PlusIcon className="w-5 h-5" />
                  </button>
                  {isAddMenuOpen && <AddMenu 
                    onAddFile={handleAddFileClick} 
                    isGoogleDriveConnected={!!googleAccessToken}
                    onConnectGoogleDrive={onConnectDrive}
                   />}
              </div>
              <div className="relative" ref={toolsMenuRef}>
                  <button 
                      onClick={() => setIsToolsMenuOpen(p => !p)}
                      className="p-1.5 rounded-lg text-text-secondary hover:bg-gray-700/60 hover:text-text-primary disabled:opacity-50"
                      disabled={disabled}
                      aria-label="Tools"
                      title="Tools"
                  >
                      <ToolsIcon className="w-5 h-5" />
                  </button>
                  {isToolsMenuOpen && <ToolsMenu onSelect={handleSelectTool} />}
              </div>
              <div className="relative" ref={personalityMenuRef}>
                  <button 
                      onClick={() => setIsPersonalityMenuOpen(p => !p)}
                      className="p-1.5 rounded-lg text-text-secondary hover:bg-gray-700/60 hover:text-text-primary disabled:opacity-50"
                      disabled={disabled}
                      aria-label="Select Personality"
                      title="Select Personality"
                  >
                      <TheaterMasksIcon className="w-5 h-5" />
                  </button>
                  {isPersonalityMenuOpen && <PersonalityMenu onSelect={handleSelectPersonality} />}
              </div>
              <Link
                  to="/promptdj"
                  className={`p-1.5 rounded-lg text-text-secondary hover:bg-gray-700/60 hover:text-text-primary ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
                  aria-disabled={disabled}
                  onClick={(e) => { if (disabled) e.preventDefault(); }}
                  aria-label="Open PromptDJ"
                  title="Open PromptDJ"
              >
                  <PromptDJIcon className="w-5 h-5" />
              </Link>
          </div>

          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder={placeholderText}
            rows={1}
            className="w-full bg-transparent resize-none outline-none text-text-primary placeholder:text-text-secondary pl-2 pr-24 pt-3 pb-2 self-end max-h-40"
            disabled={isLoading || disabled}
          />
          <input 
              type="file"
              multiple 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden"
              accept="image/*,audio/*,video/*,application/pdf,text/*,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.rtf,.json,.xml,.md,.py,.js,.ts,.html,.css,.java,.c,.cpp,.cs,.go,.php,.rb,.swift,.kt"
          />
          <button
            onClick={handleMicClick}
            disabled={isLoading || disabled || micSupportStatus !== 'supported'}
            className={`absolute right-14 bottom-3 p-2 rounded-lg text-text-secondary hover:text-text-primary disabled:opacity-50 transition-colors ${isRecording ? 'text-red-500 animate-pulse' : ''}`}
            aria-label={getMicTooltip()}
            title={getMicTooltip()}
          >
              <MicrophoneIcon className="w-5 h-5" />
          </button>
          <button
            onClick={handleSend}
            disabled={isLoading || (!input.trim() && stagedFiles.length === 0) || disabled}
            className="absolute right-3 bottom-3 p-2 rounded-lg bg-accent text-white disabled:bg-gray-600 disabled:cursor-not-allowed hover:bg-accent-hover transition-colors duration-200"
            aria-label="Send message"
          >
            <SendIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};