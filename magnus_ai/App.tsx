

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { GoogleGenAI, Type, Content } from '@google/genai';
import { Sidebar } from './components/Sidebar';
import { ChatWindow } from './components/ChatWindow';
import { ChatInput } from './components/ChatInput';
import { CustomizeModal } from './components/CustomizeModal';
import { StudyModal } from './components/StudyModal';
import { SettingsModal } from './components/SettingsModal';
import { LandingPage } from './components/LandingPage';
import { HelpFAQModal } from './components/HelpFAQModal';
import { ChallengeModal } from './components/ChallengeModal';
import { DrivePicker } from './components/DrivePicker';
import { PromptDjPage } from './components/PromptDjPage';
import { CompilerPage } from './components/CompilerPage';
import { type ChatMessage, MessageRole, type AgenticWorkflowState, type ChatSession, type User, type CustomizationSettings, Tool, type StudyGuide, type ChatFile, type TTSSettings, type WorkflowStep, Personality, UserGoal, AgentRole, type MultiAgentState, Action, type Challenge, ChallengeStatus, ChallengeType, UserStats, CompilerInfo } from './types';
import { GEMINI_API_KEY, GOOGLE_CLIENT_ID, GOOGLE_MAPS_API_KEY, GOOGLE_APPS_SCRIPT_URL } from './config';

declare const google: any; // Declare google for Google Identity Services


/**
 * Filters and maps the chat history to a format compatible with the Gemini API.
 * It removes messages that don't have text content or files, which could cause API errors.
 * @param history The array of ChatMessage objects.
 * @returns An array of Content objects for the API.
 */
const buildApiHistory = (history: ChatMessage[], files: ChatFile[] = []): Content[] => {
  const apiHistory = history
    .filter(msg => (msg.content && msg.content.trim() !== '') || (msg.files && msg.files.length > 0))
    .map(msg => ({
      role: msg.role === MessageRole.USER ? 'user' : 'model',
      parts: [
        ...(msg.content ? [{ text: msg.content }] : []),
        ...(msg.files ? msg.files.map(f => ({
          inlineData: {
            data: f.url.split(",")[1],
            mimeType: f.type,
          }
        })) : [])
      ]
    }));

    // If there are staged files, add them to the last user message part
    if (files.length > 0 && apiHistory.length > 0) {
        const lastMessage = apiHistory[apiHistory.length - 1];
        if (lastMessage.role === 'user') {
            lastMessage.parts.push(...files.map(f => ({
                inlineData: {
                    data: f.url.split(",")[1],
                    mimeType: f.type,
                }
            })));
        }
    }

    return apiHistory;
};


/**
 * Checks if a user's prompt is a general video search request.
 * @param prompt The user's input message.
 * @returns `true` if the intent is to search for videos, otherwise `false`.
 */
const isVideoSearchIntent = (prompt: string): boolean => {
    const p = prompt.toLowerCase().trim();
    if (p.startsWith('how') || p.startsWith('what is')) return false;

    const searchKeywords = ['search for', 'find', 'show me', 'search'];
    const videoKeywords = ['video', 'videos', 'clip', 'clips', 'trailer', 'movie trailer', 'youtube videos', 'youtube clips'];

    // Rule: "search for videos", "find trailer" etc.
    if (searchKeywords.some(sk => p.includes(sk)) && videoKeywords.some(vk => p.includes(vk))) {
        return true;
    }

    // Rule: "youtube search for..."
    if (p.includes('youtube') && (p.includes('search') || p.includes('find'))) {
        return true;
    }
    
    // Rule: "videos of..." or "trailer for..."
    if (videoKeywords.some(vk => p.startsWith(vk + ' of') || p.startsWith(vk + ' about') || p.startsWith(vk + ' for'))) {
        return true;
    }
    
    // Rule: "[movie name] trailer"
    if (p.endsWith('trailer')) {
        return true;
    }

    return false;
};


/**
 * Checks if the user's prompt is likely a music generation request.
 * @param prompt The user's input message.
 * @returns `true` if the intent is likely to generate music, otherwise `false`.
 */
const isMusicGenerationIntent = (prompt: string): boolean => {
    const p = prompt.toLowerCase().trim();
    if (p.startsWith('how do you') || p.startsWith('what is the') || p.startsWith('can you explain')) {
        return false;
    }
    const musicPrefixes = [
        'create a song', 'make a song', 'generate a song', 'compose a piece',
        'write a song', 'a song about', 'music that sounds like', 'a melody for',
        'a track for', 'an instrumental of'
    ];
    if (musicPrefixes.some(prefix => p.startsWith(prefix))) {
        return true;
    }
    const createKeywords = ['create', 'generate', 'make', 'design', 'produce', 'compose', 'write'];
    const musicKeywords = ['music', 'song', 'track', 'melody', 'instrumental', 'beat', 'jingle', 'tune'];
    const hasCreateKeyword = createKeywords.some(ck => p.includes(ck));
    const hasMusicKeyword = musicKeywords.some(ik => p.includes(ik));
    return hasCreateKeyword && hasMusicKeyword;
};

/**
 * Checks if a user's prompt is a request to play a specific song/video.
 * @param prompt The user's input message.
 * @returns `true` if the intent is to play music or a video, otherwise `false`.
 */
const isMediaPlaybackIntent = (prompt: string): boolean => {
    const p = prompt.toLowerCase().trim();
    const playbackKeywords = ['play', 'listen to', 'put on', 'stream', 'find me the song'];
    const youtubeKeywords = ['on youtube', 'youtube'];

    if (playbackKeywords.some(kw => p.startsWith(kw))) {
        // Avoid collision with "create a song"
        if (p.startsWith('create a song')) return false;
        // Avoid collision with general searches
        if (isVideoSearchIntent(prompt)) return false;
        return true;
    }
    
    if (youtubeKeywords.some(kw => p.includes(kw))) {
        if (!p.startsWith('how') && !p.startsWith('what') && !p.startsWith('can you') && !isVideoSearchIntent(prompt)) {
            return true;
        }
    }
    return false;
};


/**
 * Checks if the user's prompt is likely a translation request.
 * @param prompt The user's input message.
 * @returns An object with the text and language if it's a translation intent, otherwise `null`.
 */
const isTranslationIntent = (prompt: string): { text: string; language: string } | null => {
    const p = prompt.toLowerCase().trim();
    // A list of common languages to avoid false positives.
    const supportedLanguages = 'japanese|chinese|french|spanish|german|korean|italian|portuguese|russian|arabic|hindi|dutch|swedish|turkish|polish';
    
    // Matches "text in language"
    const regex1 = new RegExp(`^(.*?)\\s+in\\s+(${supportedLanguages})$`, 'i');
    let match = p.match(regex1);
    if (match && match[1] && match[2]) {
        // Avoid matching general questions, e.g. "what is the capital in Japan"
        const questionWords = ['what', 'who', 'where', 'when', 'why', 'how', 'which', 'is there'];
        if (!questionWords.some(word => match[1].startsWith(word))) {
            return { text: match[1].trim(), language: match[2].trim() };
        }
    }

    // Matches "translate/say 'text' to/in language"
    const regex2 = new RegExp(`^(?:translate|say|how\\s+to\\s+say)\\s+['"]?(.*?)['"]?\\s+(?:to|in)\\s+(${supportedLanguages})$`, 'i');
    match = p.match(regex2);
    if (match && match[1] && match[2]) {
        return { text: match[1].trim(), language: match[2].trim() };
    }

    return null;
};

/**
 * Strips markdown from a string to prepare it for Text-to-Speech.
 * This prevents the voice from reading out symbols like asterisks or backticks.
 * @param text The raw markdown text.
 * @returns A plain text string suitable for speech synthesis.
 */
const stripMarkdownForTTS = (text: string): string => {
  if (!text) return '';
  let spokenText = text;

  // Replace code blocks with a spoken preamble.
  spokenText = spokenText.replace(/```[^\n]*\n([\s\S]+?)\n```/g, (match, code) => {
    return `\n. Here is a code block: \n ${code} \n`;
  });

  // Handle bold and italics by removing the asterisks
  spokenText = spokenText.replace(/\*\*(.*?)\*\*|\*(.*?)\*/g, (match, p1, p2) => p1 || p2);
  
  // Handle list items by replacing the marker with a verbal cue
  spokenText = spokenText.replace(/^\s*[-*]\s+/gm, ' - ');

  // Remove any remaining backticks from inline code
  spokenText = spokenText.replace(/`/g, "");

  return spokenText;
};

// Helper to decode JWT
function jwt_decode<T>(token: string): T | null {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
}

/**
 * Extracts a YouTube video ID from a URL.
 * @param url The URL to parse.
 * @returns The video ID if found, otherwise `null`.
 */
const getYouTubeVideoIdFromUrl = (url: string): string | null => {
    const p = url.trim();
    // This regex should handle youtu.be, youtube.com/watch, youtube.com/embed, etc.
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = p.match(regExp);
    if (match && match[2].length === 11) {
        return match[2];
    }
    return null;
};

const defaultCustomizationSettings: CustomizationSettings = {
    nickname: '',
    profession: '',
    traits: '',
    interests: '',
    longTermMemory: '',
    goals: [],
};

const defaultUserStats: UserStats = {
    points: 0,
    streak: 0,
    lastChallengeCompletedDate: '',
}

const App: React.FC = () => {
  const ai = useMemo(() => {
    if (!GEMINI_API_KEY || GEMINI_API_KEY.includes('PASTE_YOUR')) {
      // Don't throw an error here, the configuration screen will handle it.
      return null;
    }
    try {
      return new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    } catch (e) {
      console.error("Failed to initialize GoogleGenAI. Check your API key.", e);
      return null;
    }
  }, []);

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isChallengeModalOpen, setIsChallengeModalOpen] = useState(false);
  const [isDrivePickerOpen, setIsDrivePickerOpen] = useState(false);
  const [isDrivePickerPending, setIsDrivePickerPending] = useState(false);
  const [stagedFiles, setStagedFiles] = useState<ChatFile[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [activeChallenge, setActiveChallenge] = useState<Challenge | null>(null);
  const [userStats, setUserStats] = useState<UserStats>(defaultUserStats);
  const [customizationSettings, setCustomizationSettings] = useState<CustomizationSettings | null>(null);
  const [ttsSettings, setTtsSettings] = useState<TTSSettings>({ voiceURI: null, rate: 1, pitch: 1 });
  const [ttsVoices, setTtsVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [areVoicesLoaded, setAreVoicesLoaded] = useState(false);
  const [activeTool, setActiveTool] = useState<Tool | null>(null);
  const [isStudyModalOpen, setIsStudyModalOpen] = useState(false);
  const [isPromptDjOpen, setIsPromptDjOpen] = useState(false);
  const [isCompilerOpen, setIsCompilerOpen] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<Action | null>(null);
  const tokenClient = useRef<any | null>(null);

  const getStorageKey = useCallback((base: string) => {
    return user ? `${base}_${user.id}` : `${base}_guest`;
  }, [user]);

  const loadDataForUser = useCallback((targetUser: User | null) => {
    const sessionsKey = targetUser ? `chatSessions_${targetUser.id}` : 'chatSessions_guest';
    const activeIdKey = targetUser ? `activeSessionId_${targetUser.id}` : 'activeSessionId_guest';
    const settingsKey = targetUser ? `customizationSettings_${targetUser.id}` : null;
    const ttsKey = getStorageKey('ttsSettings');
    const challengesKey = getStorageKey('challenges');
    const userStatsKey = getStorageKey('userStats');

    const savedSessionsRaw = localStorage.getItem(sessionsKey);
    if (savedSessionsRaw) {
      try {
        let savedSessions = JSON.parse(savedSessionsRaw);
        if (Array.isArray(savedSessions) && savedSessions.length > 0) {
            savedSessions = savedSessions.map((session: any) => ({
                ...session,
                activePersonality: session.activePersonality || Personality.DEFAULT,
            }));
          setSessions(savedSessions);
          setActiveSessionId(localStorage.getItem(activeIdKey) || savedSessions[0].id);
        } else {
            throw new Error("No sessions found");
        }
      } catch(e) { 
        console.error("Failed to parse sessions from localStorage, starting new.", e); 
        const newSession: ChatSession = { id: `session-${Date.now()}`, title: 'New Chat', history: [], activePersonality: Personality.DEFAULT };
        setSessions([newSession]);
        setActiveSessionId(newSession.id);
      }
    } else {
      const newSession: ChatSession = { id: `session-${Date.now()}`, title: 'New Chat', history: [], activePersonality: Personality.DEFAULT };
      setSessions([newSession]);
      setActiveSessionId(newSession.id);
    }
    
    if (settingsKey) {
        const savedSettingsRaw = localStorage.getItem(settingsKey);
        if (savedSettingsRaw) {
            const parsed = JSON.parse(savedSettingsRaw);
            setCustomizationSettings({ ...defaultCustomizationSettings, ...parsed });
        } else {
            setCustomizationSettings(defaultCustomizationSettings);
        }
    } else {
        setCustomizationSettings(defaultCustomizationSettings);
    }
    
    const savedTtsRaw = localStorage.getItem(ttsKey);
    if (savedTtsRaw) {
        setTtsSettings(JSON.parse(savedTtsRaw));
    } else {
        setTtsSettings({ voiceURI: null, rate: 1, pitch: 1 });
    }

    const savedChallengesRaw = localStorage.getItem(challengesKey);
    if (savedChallengesRaw) {
        setChallenges(JSON.parse(savedChallengesRaw));
    } else {
        setChallenges([]);
    }

    const savedStatsRaw = localStorage.getItem(userStatsKey);
    if (savedStatsRaw) {
        setUserStats(JSON.parse(savedStatsRaw));
    } else {
        setUserStats(defaultUserStats);
    }

  }, [getStorageKey]);

  // Effect to load initial user from storage and then load their data
  useEffect(() => {
    const savedUserRaw = localStorage.getItem('user');
    const initialUser = savedUserRaw ? JSON.parse(savedUserRaw) as User : null;
    setUser(initialUser);
    setIsInitializing(false);
  }, []);

  useEffect(() => {
      if (!isInitializing) {
        loadDataForUser(user);
      }
  }, [user, isInitializing, loadDataForUser]);

  // Effect to initialize Google Sign-In, runs only once on mount.
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID.includes('PASTE_YOUR') || typeof google === 'undefined') {
      console.warn("Google Client ID is not configured or GSI script failed to load. Sign-In will be disabled.");
      return;
    }

    const handleUserLogin = (userData: { sub: string; name: string; email: string; picture: string; }) => {
        if (!userData) return;
        const newUser: User = { id: userData.sub, name: userData.name, email: userData.email, picture: userData.picture };
        
        const guestSessionsRaw = localStorage.getItem('chatSessions_guest');
        const userSessionsKey = `chatSessions_${newUser.id}`;
        const userSessionsRaw = localStorage.getItem(userSessionsKey);
        if (guestSessionsRaw && !userSessionsRaw) {
          localStorage.setItem(userSessionsKey, guestSessionsRaw);
          localStorage.removeItem('chatSessions_guest');
          const guestActiveId = localStorage.getItem('activeSessionId_guest');
          if (guestActiveId) {
            localStorage.setItem(`activeSessionId_${newUser.id}`, guestActiveId);
            localStorage.removeItem('activeSessionId_guest');
          }
        }
        localStorage.setItem('user', JSON.stringify(newUser));
        setUser(newUser);
    }

    // Initialize One-Tap client for automatic sign-in
    google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (response: any) => {
        const userData = jwt_decode<{ sub: string; name: string; email: string; picture: string; }>(response.credential);
        if (userData) {
          handleUserLogin(userData);
        }
      },
    });

    // Initialize OAuth2 token client for the robust pop-up flow on button click
    tokenClient.current = google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/drive.readonly',
        callback: async (tokenResponse: any) => {
            if (tokenResponse && tokenResponse.access_token) {
                setAccessToken(tokenResponse.access_token);
                try {
                    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                        headers: { 'Authorization': `Bearer ${tokenResponse.access_token}` },
                    });
                    if (!userInfoResponse.ok) {
                        throw new Error(`Failed to fetch user info: ${userInfoResponse.statusText}`);
                    }
                    const userInfo = await userInfoResponse.json();
                    handleUserLogin(userInfo);
                } catch (error) {
                    console.error("Error fetching user info:", error);
                }
            }
        },
    });

    // Automatically prompt for One-Tap sign in if the user isn't logged in.
    const savedUserRaw = localStorage.getItem('user');
    if (!savedUserRaw) {
        google.accounts.id.prompt();
    }
  }, []);

  // New, more robust voice loading. Runs only once on mount.
  useEffect(() => {
    if (!('speechSynthesis' in window)) {
        console.warn("Speech Synthesis not supported by this browser.");
        return;
    }

    let voicePollInterval: number;

    const populateVoiceList = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        if (availableVoices.length > 0) {
            setTtsVoices(availableVoices);
            setAreVoicesLoaded(true);
            // Cleanup timers and listeners
            if (voicePollInterval) clearInterval(voicePollInterval);
            window.speechSynthesis.onvoiceschanged = null;
            return true;
        }
        return false;
    };
    
    // Try immediately
    if (populateVoiceList()) {
        return;
    }
    
    // If not available, set up event listener
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = populateVoiceList;
    }

    // As a fallback, poll every 100ms
    voicePollInterval = window.setInterval(() => {
      populateVoiceList();
    }, 100);

    // Cleanup function to be safe
    return () => {
        clearInterval(voicePollInterval);
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.onvoiceschanged = null;
        }
    };
  }, []);

  // This effect now ONLY handles setting a default voice once they are loaded.
  useEffect(() => {
    if (!areVoicesLoaded) return;

    setTtsSettings(currentSettings => {
        // Only set default if one isn't already set by the user
        if (currentSettings.voiceURI === null && ttsVoices.length > 0) {
            const englishVoices = ttsVoices.filter(v => v.lang.startsWith('en'));
            const highQualityKeywords = ['google', 'microsoft', 'apple', 'natural', 'enhanced', 'zira', 'david'];

            const findBestVoice = (voiceList: SpeechSynthesisVoice[]) => {
                for (const keyword of highQualityKeywords) {
                    const found = voiceList.find(v => v.name.toLowerCase().includes(keyword));
                    if (found) return found;
                }
                return voiceList.find(v => v.default) || voiceList[0] || null;
            };

            const bestEnglishVoice = findBestVoice(englishVoices);
            const bestOverallVoice = findBestVoice(ttsVoices);
            const defaultVoice = bestEnglishVoice || bestOverallVoice;

            if (defaultVoice) {
                const newSettings = { ...currentSettings, voiceURI: defaultVoice.voiceURI };
                const settingsKey = getStorageKey('ttsSettings');
                localStorage.setItem(settingsKey, JSON.stringify(newSettings));
                return newSettings;
            }
        }
        return currentSettings;
    });
  }, [areVoicesLoaded, ttsVoices, getStorageKey]);

  const handleNewChat = useCallback(() => {
    const newSession: ChatSession = {
      id: `session-${Date.now()}`,
      title: 'New Chat',
      history: [],
      activePersonality: Personality.DEFAULT,
    };
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setActiveTool(null);
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('user');
    setAccessToken(null);
    if (typeof google !== 'undefined' && google.accounts) {
      google.accounts.id.disableAutoSelect();
    }
    setUser(null);
  }, []);

  // Effect to handle tools that open modals
  useEffect(() => {
    if (activeTool === Tool.STUDY) {
        setIsStudyModalOpen(true);
        setActiveTool(null);
    }
  }, [activeTool]);

  useEffect(() => {
    if (isInitializing) return;
    const sessionsKey = getStorageKey('chatSessions');
    const activeIdKey = getStorageKey('activeSessionId');
    const challengesKey = getStorageKey('challenges');
    const userStatsKey = getStorageKey('userStats');
    
    if (sessions.length > 0) {
      localStorage.setItem(sessionsKey, JSON.stringify(sessions));
      if (activeSessionId) {
        localStorage.setItem(activeIdKey, activeSessionId);
      }
    } else {
      localStorage.removeItem(sessionsKey);
      localStorage.removeItem(activeIdKey);
    }

    if(challenges.length > 0) {
      localStorage.setItem(challengesKey, JSON.stringify(challenges));
    }
    
    localStorage.setItem(userStatsKey, JSON.stringify(userStats));

  }, [sessions, activeSessionId, challenges, userStats, getStorageKey, isInitializing]);
  
  const handleLogin = useCallback(() => {
    if (tokenClient.current) {
        // Trigger the more robust pop-up sign-in flow
        tokenClient.current.requestAccessToken();
    } else {
        console.error("Google Token Client not initialized. Cannot trigger login.");
    }
  }, []);

  const handleSelectChat = useCallback((sessionId: string) => {
    setActiveSessionId(sessionId);
    setActiveTool(null);
  }, []);

  const handleDeleteChat = useCallback((sessionIdToDelete: string) => {
    setSessions(prev => {
      const updatedSessions = prev.filter(s => s.id !== sessionIdToDelete);
      if (updatedSessions.length === 0) {
        const newSession: ChatSession = { id: `session-${Date.now()}`, title: 'New Chat', history: [], activePersonality: Personality.DEFAULT };
        setActiveSessionId(newSession.id);
        return [newSession];
      } else if (activeSessionId === sessionIdToDelete) {
        setActiveSessionId(updatedSessions[0].id);
      }
      return updatedSessions;
    });
  }, [activeSessionId]);
  
  const handleSaveCustomization = (newSettings: CustomizationSettings) => {
    setCustomizationSettings(newSettings);
    if(user) {
        localStorage.setItem(`customizationSettings_${user.id}`, JSON.stringify(newSettings));
    }
    setIsCustomizeModalOpen(false);
  }

  const handleSaveSettings = (newSettings: TTSSettings) => {
    setTtsSettings(newSettings);
    const settingsKey = getStorageKey('ttsSettings');
    localStorage.setItem(settingsKey, JSON.stringify(newSettings));
    setIsSettingsModalOpen(false);
  };

  const handleSelectPersonality = useCallback((personality: Personality) => {
    if (!activeSessionId) return;
    setSessions(prev => prev.map(s => 
        s.id === activeSessionId ? { ...s, activePersonality: personality } : s
    ));
  }, [activeSessionId]);

  const handleSendSupportQuery = async (queryData: { name: string; email: string; query: string; }) => {
      if (!GOOGLE_APPS_SCRIPT_URL || GOOGLE_APPS_SCRIPT_URL.includes('PASTE_YOUR')) {
          console.error("Google Apps Script URL is not configured. Cannot send support query.");
          throw new Error("Support form is not configured by the site owner.");
      }
      
      try {
          const formData = new FormData();
          formData.append('name', queryData.name);
          formData.append('email', queryData.email);
          formData.append('query', queryData.query);

          const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
              method: 'POST',
              mode: 'cors',
              body: formData, // Sending as FormData is more robust for Apps Script
          });

          if (!response.ok) {
             const errorText = await response.text();
             throw new Error(`Network response was not ok: ${response.statusText} - ${errorText}`);
          }
          
          const result = await response.json();
          if (result.status !== 'success') {
              throw new Error(`Script reported an error: ${result.message}`);
          }
          
          console.log("Support query sent successfully via Google Apps Script.");

      } catch (error) {
          console.error("Failed to send support query:", error);
          // Re-throw the error so the UI can catch it and show a message
          throw error;
      }
  };

  const getSystemInstruction = useCallback(() => {
    const activeSession = sessions.find(s => s.id === activeSessionId);
    const personality = activeSession?.activePersonality || Personality.DEFAULT;
    
    const personalityInstructions = {
        [Personality.DEFAULT]: (customizationSettings?.traits ? `Your personality is: ${customizationSettings.traits}.` : "You are Magnus AI, a helpful and professional AI assistant."),
        [Personality.FORMAL_ADVISOR]: 'You are a Formal Advisor. Your tone is professional, objective, and analytical. You provide structured, data-driven advice and avoid casual language or humor.',
        [Personality.FRIENDLY_MENTOR]: 'You are a Friendly Mentor. Your tone is warm, encouraging, and supportive. You use positive language, offer guidance like a patient teacher, and build rapport with the user.',
        [Personality.CODING_WIZARD]: 'You are a Coding Wizard. You are an expert programmer who is passionate and slightly eccentric about code. You provide efficient, clean code solutions and explain them with clever analogies. You might use some light-hearted coding jargon.',
        [Personality.COMEDIAN]: 'You are a Comedian. Your goal is to be witty and humorous, but still helpful. You crack jokes, use puns, and have a playful and entertaining personality. Keep it light and fun, but make sure the core answer is still accurate.'
    };

    const corePersonaParts = [
        personalityInstructions[personality],
        "You must dynamically adapt your tone based on the user's language. If they seem frustrated, be more patient. If they are excited, share their enthusiasm. Mirror their style subtly to create a better rapport."
    ];

    if (customizationSettings && customizationSettings.longTermMemory) {
        corePersonaParts.push(
            '**CORE MEMORY (CRITICAL):** You have the following long-term memories about the user and their context. You MUST remember and use this information in all responses to provide a personalized, continuous experience.',
            customizationSettings.longTermMemory,
            'Refer to this memory to understand projects, preferences, and recurring goals.'
        );
    }

    if (customizationSettings && user) {
        corePersonaParts.push('The user you are talking to has provided the following information about themselves:');
        if (customizationSettings.nickname) corePersonaParts.push(`- They like to be called ${customizationSettings.nickname}.`);
        else corePersonaParts.push(`- Their name is ${user.name}.`);
        if (customizationSettings.profession) corePersonaParts.push(`- Their profession is ${customizationSettings.profession}.`);
        if (customizationSettings.interests) corePersonaParts.push(`- Their interests include: ${customizationSettings.interests}.`);
        corePersonaParts.push('Keep this information in mind to provide a more tailored and relevant conversation.');
    }

    const activeGoals = customizationSettings?.goals?.filter(g => !g.completed);
    if (activeGoals && activeGoals.length > 0) {
        const goalDescriptions = activeGoals.map(g => `- ${g.description}`).join('\n');
        corePersonaParts.push(
            'CRITICAL: The user has the following active goals. Be a proactive assistant in helping them achieve these goals.',
            goalDescriptions,
            "If the user's message is relevant to any of these goals, provide encouragement, track their progress, or offer specific help. Occasionally, if the conversation is neutral, you can proactively and gently check in on one of their goals."
        );
    }
    
    const corePersonaInstruction = corePersonaParts.filter(Boolean).join('\n');
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const now = new Date();

    const isAgenticToolActive = activeTool === Tool.DEEP_RESEARCH || activeTool === Tool.THINK_LONGER;
    if (isAgenticToolActive) {
        let agenticBaseInstruction = "You are an agentic AI that follows a strict workflow to answer user requests. Your process is inspired by the Agentic RAG (Retrieval-Augmented Generation) workflow. You must think step-by-step and output your thought process using specific tags.";
        if (activeTool === Tool.DEEP_RESEARCH) agenticBaseInstruction = "You are a deep research assistant following a strict Agentic RAG workflow. Provide comprehensive, detailed, and well-structured answers.";
        if (activeTool === Tool.THINK_LONGER) agenticBaseInstruction = "You are a thoughtful AI following a strict Agentic RAG workflow. Take your time to think, reason, and provide a more considered and nuanced response.";
        
        const workflowInstruction = `Your workflow has 4 steps: PERCEIVE, REASON, ACT, and LEARN. The user wants the final summary to be in the order: Learn, Act, Reason, Perceive. You must output your process for each step inside the corresponding tags, in the generation order of PERCEIVE, REASON, ACT, and LEARN.
        1. [PERCEIVE]: Deconstruct the user's query.
        2. [REASON]: Create a plan to answer the query.
        3. [ACT]: Execute the plan and present retrieved information.
        4. [LEARN]: Synthesize all information into a final, concise answer for the user.`;

        return [corePersonaInstruction, agenticBaseInstruction, workflowInstruction].join('\n\n');
    }

    const standardToolInstructions = [
        corePersonaInstruction,
        `**Code Generation (CRITICAL):** When asked to write code, you MUST populate the 'codeBlock' object in your JSON response. The main 'response' field should contain a brief intro. The 'codeBlock' must have: 'language', 'code', 'explanation', and 'simulatedOutput'. Failure to do this for a code request is a failure to follow instructions.`,
        `**Location Awareness (CRITICAL):** If the query is unambiguously about a real-world location, you MUST populate the 'location' object in your JSON response with 'name', 'address', 'latitude', and 'longitude'. Omit otherwise.`,
        `**Automated Task Execution (CRITICAL):**
You can draft and propose actions like sending emails or scheduling meetings. Follow this logic strictly:

1.  **Analyze the Request:** Identify the user's intent (e.g., 'send_email' or 'schedule_meeting') and extract all available parameters.

2.  **Disambiguate Intent (VERY IMPORTANT):**
    - If the user's primary goal is to **send an email**, you MUST set the action 'type' to \`'send_email'\`. Do NOT set it to \`'schedule_meeting'\` even if the email content mentions a meeting.
    - If the user's primary goal is to **schedule a meeting** on their calendar, you MUST set the action 'type' to \`'schedule_meeting'\`.

3.  **Drafting (Proactive Assistance):** If the user's intent is to send an email, you MUST act as a proactive assistant.
    -   **If the user provides a recipient and a topic (but no body):** You MUST write a professional, concise email body yourself based on the topic. You MUST also infer a suitable subject line. A subject line is **MANDATORY**. Do not generate an action for an email without a subject.
    -   **Use all available information** to create the most complete and helpful draft possible.

4.  **Parameter Validation (CRITICAL):**
    -   **Recipient Email (\`to\`):** You MUST extract the full, valid email address of the recipient. A valid email address contains an "@" symbol and a domain (e.g., 'person@example.com'). Do NOT use just a name or an incomplete address. If you cannot find a valid email address in the user's request, you MUST ask the user for it and MUST NOT generate a \`send_email\` action.

5.  **Generating a Correct Response:**
    -   **If you have drafted a complete email (with a valid recipient email, a mandatory subject, and a body):** You must perform two tasks at the same time:
        1.  In the \`response\` field, show the user the draft you've written so they can review it.
        2.  In the \`actions\` array, create a \`send_email\` action and **CRITICALLY, you must copy the valid recipient's email, the subject, and the body from your draft into the corresponding \`parameters\` fields (\`to\`, \`subject\`, \`body\`).**
    -   **If you are missing any required information** (like a valid recipient's email or a clear topic for the subject): Do not generate an action. Instead, just ask the user for the missing information in the \`response\` field.

6.  **EXAMPLE OF A PERFECT RESPONSE:**
    User says: "email saaiabhishikth@gmail.com about our project"
    Your JSON output **MUST** look like this:
    \`\`\`json
    {
      "response": "Here is a draft for Saai Abhishikth:\\nTo: saaiabhishikth@gmail.com\\nSubject: Collaboration on Magnus AI App...",
      "language": "en-US",
      "actions": [
        {
          "type": "send_email",
          "description": "Send an email to saaiabhishikth@gmail.com about the project.",
          "parameters": {
            "to": "saaiabhishikth@gmail.com",
            "subject": "Collaboration on Magnus AI App",
            "body": "Hi Saai Abhishikth,\\n\\nI'm writing to you to discuss a potential collaboration on the Magnus AI App..."
          }
        }
      ]
    }
    \`\`\`
`,
        `**Date & Time Parsing Rules (VERY IMPORTANT for Meetings):**
        1.  **Context:** The current date is **${now.toDateString()}**. The user's timezone is **${userTimezone}**.
        2.  **Format:** All times MUST be in the full ISO 8601 format (e.g., '2025-08-08T11:00:00-07:00'). You MUST determine the correct timezone offset based on the user's timezone (${userTimezone}) and the specified date (to account for Daylight Saving Time).
        3.  **Accuracy:**
            - If a specific date is given (e.g., "August 8th, 2025", "08/08/2025"), you MUST use that exact date.
            - If a relative date is given (e.g., "tomorrow", "next Friday"), calculate it based on the current date provided above.
            - If a year is not specified, assume the current year (${now.getFullYear()}) unless it would mean scheduling in the past, in which case assume the next year.
        4.  **Duration:** The end time should be 30 or 60 minutes after the start time, unless the user specifies a different duration.
        5.  **Google Meet:** Do NOT generate a Google Meet link yourself. The system will handle creating one.`,
    ];

    return standardToolInstructions.join('\n\n');
  }, [customizationSettings, user, activeTool, sessions, activeSessionId]);


  const findLocationOnMap = async (prompt: string, history: ChatMessage[]) => {
    if (!ai) return;
    const activeSession = sessions.find(s => s.id === activeSessionId);
    if (!activeSession) return;
    
    try {
        const generationSystemInstruction = `You are a location-finding specialist. The user's request is a query to find a location. 
        Your primary task is to identify this specific real-world location from the user's message.
        You MUST generate a helpful text description about that location.
        You MUST also provide the precise location details (name, address, latitude, and longitude) in the JSON response.
        Failure to provide the 'location' object is a failure of your primary function.`;
        
        const fullHistoryForApi = buildApiHistory(history);

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: fullHistoryForApi,
            config: {
                systemInstruction: generationSystemInstruction,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        response: { type: Type.STRING, description: "A helpful description of the location." },
                        language: { type: Type.STRING, description: "BCP-47 language code of the response." },
                        location: {
                            type: Type.OBJECT,
                            description: "The precise details of the identified location. This field is mandatory.",
                            properties: {
                                name: { type: Type.STRING },
                                address: { type: Type.STRING },
                                latitude: { type: Type.NUMBER },
                                longitude: { type: Type.NUMBER },
                            },
                            required: ["name", "address", "latitude", "longitude"]
                        }
                    },
                    required: ["response", "language", "location"]
                }
            }
        });

        const jsonText = response.text.trim();
        const parsedResponse = JSON.parse(jsonText);

        const modelMessage: ChatMessage = {
            id: `msg-${Date.now()}-map`,
            role: MessageRole.MODEL,
            content: parsedResponse.response,
            language: parsedResponse.language,
            locationInfo: parsedResponse.location,
        };
        
        setSessions(prev => prev.map(s =>
            s.id === activeSessionId ? { ...s, history: [...s.history, modelMessage] } : s
        ));
    } catch (e: any) {
        console.error("Map search error:", e);
        const errorMessage: ChatMessage = {
            id: `msg-${Date.now()}-error`,
            role: MessageRole.MODEL,
            content: `I'm sorry, I couldn't find that location. The mapping service might be unavailable or the location could not be determined. Please try being more specific.\n\n**Error:** ${e.message}`,
            language: 'en-US',
        };
        setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, history: [...s.history, errorMessage] } : s));
    }
  };


  const generateResponse = async (history: ChatMessage[]) => {
    if (!ai) return;
    const activeSession = sessions.find(s => s.id === activeSessionId);
    if (!activeSession) return;

    const fullHistoryForApi = buildApiHistory(history, stagedFiles);
    if (fullHistoryForApi.length === 0) {
        console.warn("Filtered history is empty, skipping API call.");
        return;
    }

    const historyHasFiles = history.some(m => m.files && m.files.length > 0) || stagedFiles.length > 0;
    
    if (historyHasFiles) {
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: fullHistoryForApi,
            });

            const modelMessage: ChatMessage = {
                id: `msg-${Date.now()}-model`,
                role: MessageRole.MODEL,
                content: response.text,
            };

            setSessions(prev => prev.map(s =>
                s.id === activeSessionId
                    ? { ...s, history: [...s.history, modelMessage] }
                    : s
            ));
        } catch (e: any) {
            console.error("Multimodal response error:", e);
            const errorMessage: ChatMessage = {
                id: `msg-${Date.now()}-error`,
                role: MessageRole.MODEL,
                content: `I'm sorry, I couldn't process your request. Error: ${e.message}`,
                language: 'en-US',
            };
            setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, history: [...s.history, errorMessage] } : s));
        }
        return;
    }

    const isAgenticToolActive = activeTool === Tool.THINK_LONGER || activeTool === Tool.DEEP_RESEARCH;
    const systemInstruction = getSystemInstruction();

    if (isAgenticToolActive) {
        // --- Agentic workflow logic for specific tools ---
        const responseSchema = {
            type: Type.OBJECT,
            properties: {
                perceive: { type: Type.STRING },
                reason: { type: Type.STRING },
                act: { type: Type.STRING },
                learn: { type: Type.STRING }
            },
            required: ["perceive", "reason", "act", "learn"]
        };

        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: fullHistoryForApi,
                config: {
                    systemInstruction: systemInstruction,
                    responseMimeType: "application/json",
                    responseSchema: responseSchema,
                    ...(activeTool === Tool.THINK_LONGER && { thinkingConfig: { thinkingBudget: 500 } }),
                },
            });
            
            const jsonText = response.text.trim();
            const parsedResponse = JSON.parse(jsonText);

            const learnStep: WorkflowStep = { active: false, done: true, content: parsedResponse.learn };
            const actStep: WorkflowStep = { active: false, done: true, content: parsedResponse.act };
            const reasonStep: WorkflowStep = { active: false, done: true, content: parsedResponse.reason };
            const perceiveStep: WorkflowStep = { active: false, done: true, content: parsedResponse.perceive };

            const workflowMessage: ChatMessage = {
                id: `msg-${Date.now()}-workflow`,
                role: MessageRole.MODEL,
                workflowState: { learn: learnStep, act: actStep, reason: reasonStep, perceive: perceiveStep }
            };

            setSessions(prev => prev.map(s =>
                s.id === activeSessionId
                    ? { ...s, history: [...s.history, workflowMessage] }
                    : s
            ));
        } catch (e: any) {
            console.error("Agentic workflow response error:", e);
            const errorMessage: ChatMessage = {
                id: `msg-${Date.now()}-error`,
                role: MessageRole.MODEL,
                content: `I'm sorry, I encountered an error trying to process your request with the agentic workflow. Error: ${e.message}`,
                language: 'en-US',
            };
            setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, history: [...s.history, errorMessage] } : s));
        }
    } else {
        // --- Standard text/code/action generation logic ---
        try {
            const responseSchemaProperties: any = {
                response: { type: Type.STRING, description: "The assistant's response to the user." },
                language: { type: Type.STRING, description: "The BCP-47 language code of the response (e.g., 'en-US', 'fr-FR')." },
                location: {
                    type: Type.OBJECT,
                    description: "If the query is about a mappable location, provide its details here. Omit otherwise.",
                    properties: {
                        name: { type: Type.STRING },
                        address: { type: Type.STRING },
                        latitude: { type: Type.NUMBER },
                        longitude: { type: Type.NUMBER },
                    }
                },
                codeBlock: {
                    type: Type.OBJECT,
                    description: "If the user's request is to write code, provide the details here. Omit otherwise.",
                    properties: {
                        language: { type: Type.STRING, description: "The programming language (e.g., 'python', 'javascript')." },
                        code: { type: Type.STRING, description: "The generated code snippet." },
                        explanation: { type: Type.STRING, description: "A brief explanation of the code." },
                        simulatedOutput: { type: Type.STRING, description: "The simulated terminal output when the code is run." }
                    },
                    required: ["language", "code", "explanation", "simulatedOutput"]
                },
                actions: {
                    type: Type.ARRAY,
                    description: "A list of automated tasks the AI can perform. Omit if no actions are possible.",
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            type: { type: Type.STRING, enum: ['send_email', 'schedule_meeting', 'fetch_report'] },
                            description: { type: Type.STRING, description: "A user-friendly description of the action." },
                            parameters: {
                                type: Type.OBJECT,
                                description: "Parameters for the action. Fill only the relevant fields for the action type.",
                                properties: {
                                    to: { type: Type.STRING, description: "Recipient's email address." },
                                    subject: { type: Type.STRING, description: "Subject of the email." },
                                    body: { type: Type.STRING, description: "Body of the email." },
                                    summary: { type: Type.STRING, description: "Title or summary of the meeting." },
                                    description: { type: Type.STRING, description: "Detailed description or agenda for the meeting." },
                                    start_time: { type: Type.STRING, description: "Start time in ISO 8601 format." },
                                    end_time: { type: Type.STRING, description: "End time in ISO 8601 format." },
                                    attendees: {
                                        type: Type.ARRAY,
                                        description: "A list of attendee email addresses.",
                                        items: { type: Type.STRING }
                                    },
                                }
                            }
                        },
                        required: ["type", "description", "parameters"]
                    }
                }
            };

            const config: { 
                systemInstruction?: string;
                responseMimeType?: string;
                responseSchema?: any;
            } = {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: responseSchemaProperties,
                    required: ["response", "language"]
                }
            };
            
            if (systemInstruction) {
                config.systemInstruction = systemInstruction;
            }
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: fullHistoryForApi,
                config,
            });

            const modelMessage: ChatMessage = {
                id: `msg-${Date.now()}-model`,
                role: MessageRole.MODEL,
            };

            try {
                const jsonText = response.text.trim();
                const parsedResponse = JSON.parse(jsonText);
                modelMessage.content = parsedResponse.response;
                modelMessage.language = parsedResponse.language;
                if (parsedResponse.location) {
                    modelMessage.locationInfo = parsedResponse.location;
                }
                if (parsedResponse.codeBlock) {
                    modelMessage.compilerInfo = parsedResponse.codeBlock;
                }
                if (parsedResponse.actions && Array.isArray(parsedResponse.actions)) {
                    modelMessage.actions = parsedResponse.actions;
                }
            } catch (parseError) {
                console.warn("Could not parse JSON response from standard chat. Raw response:", response.text, "Parse error:", parseError);
                modelMessage.content = "I'm sorry, I encountered an issue and couldn't format the response correctly. This can sometimes happen with requests that involve external tools. Please try rephrasing your query, or use a specific tool like 'Web Search' if applicable.";
                modelMessage.language = 'en-US';
            }

            setSessions(prev => prev.map(s =>
                s.id === activeSessionId
                    ? { ...s, history: [...s.history, modelMessage] }
                    : s
            ));
        } catch (e: any) {
            console.error("Standard response error:", e);
            const errorMessage: ChatMessage = {
                id: `msg-${Date.now()}-error`,
                role: MessageRole.MODEL,
                content: `I'm sorry, I couldn't process your request. Error: ${e.message}`,
                language: 'en-US',
            };
            setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, history: [...s.history, errorMessage] } : s));
        }
    }
  };

  const generateWebSearchResponse = async (prompt: string, history: ChatMessage[]) => {
      if (!ai) return;
      const activeSession = sessions.find(s => s.id === activeSessionId);
      if (!activeSession) return;
      
      try {
          const fullHistoryForApi = buildApiHistory(history, stagedFiles);
          const response = await ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: fullHistoryForApi,
              config: {
                  tools: [{ googleSearch: {} }],
              },
          });
          
          const responseText = response.text;
          let detectedLanguage = 'en-US';

          if (responseText) {
              try {
                  const langDetectionResponse = await ai.models.generateContent({
                      model: 'gemini-2.5-flash',
                      contents: `Detect the BCP-47 language code for the following text. Respond with only the code, e.g., "en-US".\n\nText: "${responseText}"`,
                  });
                  detectedLanguage = langDetectionResponse.text.trim() || 'en-US';
              } catch (langError) {
                  console.error("Language detection failed, falling back to default.", langError);
              }
          }

          const modelMessage: ChatMessage = {
              id: `msg-${Date.now()}-model`,
              role: MessageRole.MODEL,
              content: responseText,
              language: detectedLanguage,
              groundingSources: response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
                  uri: chunk.web?.uri,
                  title: chunk.web?.title
              })) || [],
          };
          setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, history: [...s.history, modelMessage] } : s));

      } catch (e: any) {
          console.error("Web search error:", e);
          const errorMessage: ChatMessage = {
              id: `msg-${Date.now()}-error`,
              role: MessageRole.MODEL,
              content: `I'm sorry, I encountered an error during the web search. Error: ${e.message}`,
              language: 'en-US',
          };
          setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, history: [...s.history, errorMessage] } : s));
      }
  };

  const generateTranslationResponse = async (text: string, language: string) => {
    if (!ai) return;
    const activeSession = sessions.find(s => s.id === activeSessionId);
    if (!activeSession) return;

    try {
        const prompt = `Translate "${text}" into ${language}. Also provide the phonetic transcription in English letters (like Romaji for Japanese or Pinyin for Chinese).`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        translation: { type: Type.STRING, description: "The translated text in the target language." },
                        phonetic: { type: Type.STRING, description: "The phonetic spelling of the translation." },
                        languageCode: { type: Type.STRING, description: "The BCP-47 language code for the translation (e.g., 'ja-JP', 'zh-CN')." }
                    },
                    required: ["translation", "phonetic", "languageCode"]
                }
            }
        });

        const jsonText = response.text.trim();
        const parsedResponse = JSON.parse(jsonText);

        const modelMessage: ChatMessage = {
            id: `msg-${Date.now()}-model`,
            role: MessageRole.MODEL,
            content: `${parsedResponse.translation} (${parsedResponse.phonetic})`,
            language: parsedResponse.languageCode,
        };

        setSessions(prev => prev.map(s =>
            s.id === activeSessionId
                ? { ...s, history: [...s.history, modelMessage] }
                : s
        ));

    } catch (e: any) {
        console.error("Translation error:", e);
        const errorMessage: ChatMessage = {
            id: `msg-${Date.now()}-error`,
            role: MessageRole.MODEL,
            content: `I'm sorry, I couldn't process the translation request. Error: ${e.message}`,
            language: 'en-US',
        };
        setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, history: [...s.history, errorMessage] } : s));
    }
  };
  
  const generateStudyGuide = async (topic: string) => {
    if (!ai) return;
    setIsStudyModalOpen(false);
    setIsLoading(true);

    const activeSession = sessions.find(s => s.id === activeSessionId);
    if (!activeSession) { 
        setIsLoading(false); 
        return; 
    }

    const userMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: MessageRole.USER,
        content: `Create a study guide for: ${topic}`,
    };
    
    const updatedHistory = [...activeSession.history, userMessage];
    const updatedSession = { ...activeSession, history: updatedHistory };
    setSessions(sessions.map(s => s.id === activeSessionId ? updatedSession : s));
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Generate a comprehensive study guide on the topic: "${topic}". The study guide should include a summary of the topic, a list of key concepts with their explanations, a few practice questions to test understanding, and a list of links or resources for further reading.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        topic: { type: Type.STRING },
                        summary: { type: Type.STRING },
                        keyConcepts: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    concept: { type: Type.STRING },
                                    explanation: { type: Type.STRING },
                                }
                            }
                        },
                        practiceQuestions: { type: Type.ARRAY, items: { type: Type.STRING } },
                        furtherReading: { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                    required: ["topic", "summary", "keyConcepts", "practiceQuestions", "furtherReading"]
                },
            },
        });

        const jsonText = response.text.trim();
        const studyGuideData = JSON.parse(jsonText);
        
        const modelMessage: ChatMessage = {
            id: `msg-${Date.now()}-studyguide`,
            role: MessageRole.MODEL,
            studyGuide: studyGuideData,
        };
        
        const finalHistory = [...updatedHistory, modelMessage];
        if (updatedSession.title === 'New Chat') {
            updatedSession.title = `Study: ${topic}`;
        }
        updatedSession.history = finalHistory;
        setSessions(sessions.map(s => s.id === activeSessionId ? updatedSession : s));

    } catch(e: any) {
        console.error("Study guide generation error", e);
        const errorMessage: ChatMessage = {
            id: `msg-${Date.now()}-error`,
            role: MessageRole.MODEL,
            content: `Sorry, I couldn't generate the study guide. Error: ${e.message}`,
            language: 'en-US',
        };
        const historyWithError = [...updatedHistory, errorMessage];
        const sessionWithError = { ...updatedSession, history: historyWithError };
        setSessions(sessions.map(s => s.id === activeSessionId ? sessionWithError : s));
    } finally {
        setIsLoading(false);
    }
  };

  const generateMusic = async (prompt: string) => {
    if (!ai) return;
    const activeSession = sessions.find(s => s.id === activeSessionId);
    if (!activeSession) return;
    
    try {
        const generationPrompt = `The user wants you to create music based on this prompt: "${prompt}".

You are a creative music AI. Since you cannot generate audio directly, your task is to generate a detailed CONCEPT for a song that a developer can use to programmatically generate a simple audio loop. This concept must include:
1.  A creative and fitting song title.
2.  An artist name (be creative, e.g., 'Magnus AI & The Agents', 'Silicon Symphony', 'Ghost in the Machine').
3.  A detailed description of the song's mood, style, instrumentation, and overall feel.
4.  A tempo in BPM (beats per minute), as a number.
5.  A single mood keyword from the following list: 'upbeat', 'somber', 'ethereal', 'driving', 'mellow'.
6.  Crucially, you must also find exactly 3 real, existing songs on YouTube that closely match the user's request. For each song, provide its title and its full, correct YouTube URL.`;
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: generationPrompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        artist: { type: Type.STRING },
                        description: { type: Type.STRING },
                        tempo: { type: Type.INTEGER, description: "The tempo in beats per minute." },
                        mood: { type: Type.STRING, enum: ['upbeat', 'somber', 'ethereal', 'driving', 'mellow'] },
                        youtubeLinks: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    title: { type: Type.STRING },
                                    url: { type: Type.STRING, description: "The full YouTube URL." },
                                }
                            }
                        }
                    },
                    required: ["title", "artist", "description", "tempo", "mood", "youtubeLinks"]
                },
            },
        });
        
        const jsonText = response.text.trim();
        const musicData = JSON.parse(jsonText);
        
        const modelMessage: ChatMessage = {
            id: `msg-${Date.now()}-music`,
            role: MessageRole.MODEL,
            music: musicData,
        };
        
        setSessions(prev => prev.map(s =>
            s.id === activeSessionId
                ? { ...s, history: [...s.history, modelMessage] }
                : s
        ));
    } catch (e: any) {
        console.error("Music generation error:", e);
        const errorMessage: ChatMessage = {
            id: `msg-${Date.now()}-error`,
            role: MessageRole.MODEL,
            content: `I'm sorry, I encountered an error creating the music concept. Error: ${e.message}`,
            language: 'en-US',
        };
        setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, history: [...s.history, errorMessage] } : s));
    }
  };
  
  const searchYouTubeVideos = async (prompt: string, history: ChatMessage[]) => {
    if (!ai) return;
    const activeSession = sessions.find(s => s.id === activeSessionId);
    if (!activeSession) return;

    try {
        const generationPrompt = `A user is searching for a video to play in an app based on the query: "${prompt}".
Your goal is to find up to 5 relevant, playable videos from YouTube.
The most critical rule is that the videos **must be embeddable**. If a video has embedding disabled, it will show an error to the user. Your primary goal is to avoid this error.
To achieve this:
1.  **Prioritize Official Sources that Allow Embedding:** Favor official artist channels, movie studio channels, and trusted media outlets that have a history of allowing embedding.
2.  **Be Cautious with Major Labels:** Be aware that some major music labels (like Sony Music, Universal Music Group, Times Music) sometimes restrict embedding on their newest or most popular videos. If you select a video from such a channel, be extra certain it's embeddable. Older videos or official lyric videos are often safer bets than official music videos.
3.  **No Private or Restricted Content:** Absolutely do not include links to videos that are private, deleted, have age restrictions, or are known to be blocked in certain regions.
4.  **Validate Output:** For each video, provide its official title, a brief (1-2 sentence) description, its full YouTube URL, and its 11-character video ID.

Return a JSON array of the video objects. If you cannot find any embeddable videos, return an empty array.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: generationPrompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING },
                            description: { type: Type.STRING, description: "A brief, 1-2 sentence description of the video." },
                            url: { type: Type.STRING, description: "The full YouTube URL." },
                            videoId: { type: Type.STRING, description: "The 11-character YouTube video ID." }
                        },
                        required: ["title", "description", "url", "videoId"]
                    }
                }
            }
        });

        const jsonText = response.text.trim();
        const searchResults = JSON.parse(jsonText);

        const modelMessage: ChatMessage = {
            id: `msg-${Date.now()}-yt-search`,
            role: MessageRole.MODEL,
            youtubeSearchQuery: prompt,
            youtubeSearchResults: searchResults,
            language: 'en-US',
        };

        setSessions(prev => prev.map(s =>
            s.id === activeSessionId
                ? { ...s, history: [...s.history, modelMessage] }
                : s
        ));

    } catch (e: any) {
        console.error("YouTube search error:", e);
        const errorMessage: ChatMessage = {
            id: `msg-${Date.now()}-error`,
            role: MessageRole.MODEL,
            content: `I'm sorry, I couldn't complete the video search. There might be an issue with the search service. Please try again later.\n\n**Error:** ${e.message}`,
            language: 'en-US',
        };
        setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, history: [...s.history, errorMessage] } : s));
    }
  };


  const playYouTubeVideo = async (prompt: string, history: ChatMessage[]) => {
      if (!ai) return;
      const activeSession = sessions.find(s => s.id === activeSessionId);
      if (!activeSession) return;
      
      try {
          const generationPrompt = `A user wants to play a specific video in-app. Their request is: "${prompt}".
Your task is to find the single most relevant, official video on YouTube that is **guaranteed to be embeddable**.
An unembeddable video will cause an error. Avoiding this is your highest priority.
Follow these rules:
1.  **Verify Embeddability:** The video MUST be publicly accessible and allow embedding. Prioritize channels known for this, like official artist channels (especially lyric videos), VEVO, or movie studios.
2.  **Avoid Risky Channels:** Be extremely cautious with videos from major record labels that often disable embedding. If you must use one, prefer older content or lyric videos over brand new music videos.
3.  **Find the Best Match:** The video should be the most official and relevant version of the requested content.
4.  **Strictly Validate ID:** Return the video's 11-character YouTube video ID, its official title, and the name of the artist or channel. The video ID must be exactly 11 characters.
Do not return a result if you cannot find a reliably embeddable video.`;
          
          const response = await ai.models.generateContent({
              model: "gemini-2.5-flash",
              contents: generationPrompt,
              config: {
                  responseMimeType: "application/json",
                  responseSchema: {
                      type: Type.OBJECT,
                      properties: {
                          videoId: { type: Type.STRING, description: "The 11-character YouTube video ID." },
                          songTitle: { type: Type.STRING, description: "The official title of the video found." },
                          artistName: { type: Type.STRING, description: "The main artist or channel of the video found." },
                      },
                      required: ["videoId", "songTitle", "artistName"]
                  },
              },
          });
          
          const jsonText = response.text.trim();
          const { videoId, songTitle, artistName } = JSON.parse(jsonText);

          // Client-side validation for the video ID format.
          if (!videoId || typeof videoId !== 'string' || !/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
              throw new Error(`The model returned an invalid YouTube video ID format: "${videoId}"`);
          }
          
          const modelMessage: ChatMessage = {
              id: `msg-${Date.now()}-youtube`,
              role: MessageRole.MODEL,
              content: `Found: **${songTitle}** by **${artistName}**. Click the card to play.`,
              language: 'en-US',
              youtubeVideoId: videoId,
              youtubeSongTitle: songTitle,
              youtubeArtistName: artistName,
          };
          
          setSessions(prev => prev.map(s =>
              s.id === activeSessionId
                  ? { ...s, history: [...s.history, modelMessage] }
                  : s
          ));
      } catch (e: any) {
          console.error("YouTube playback error:", e);
          const errorMessage: ChatMessage = {
              id: `msg-${Date.now()}-error`,
              role: MessageRole.MODEL,
              content: `I'm sorry, I couldn't find a playable video for that request. There might be an issue with the underlying search service. Please try being more specific with the song title and artist.\n\n**Error:** ${e.message}`,
              language: 'en-US',
          };
          setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, history: [...s.history, errorMessage] } : s));
      }
  };

  const playYouTubeVideoById = async (videoId: string, history: ChatMessage[]) => {
    if (!ai) return;
    const activeSession = sessions.find(s => s.id === activeSessionId);
    if (!activeSession) return;

    try {
        const generationPrompt = `The user has provided a YouTube video ID: "${videoId}".
        Your task is to find the official song title and artist name for this video ID.
        If it's not a song, use the video title and the channel name as the 'artist'.
        Respond with a JSON object containing the YouTube Video ID, the video's title, and the artist/channel name.`;
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: generationPrompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        videoId: { type: Type.STRING, description: "The YouTube video ID provided." },
                        songTitle: { type: Type.STRING, description: "The title of the video found." },
                        artistName: { type: Type.STRING, description: "The main artist or channel of the video found." },
                    },
                    required: ["videoId", "songTitle", "artistName"]
                },
            },
        });
        
        const jsonText = response.text.trim();
        const { songTitle, artistName } = JSON.parse(jsonText);
        
        const modelMessage: ChatMessage = {
            id: `msg-${Date.now()}-youtube`,
            role: MessageRole.MODEL,
            content: `Now playing the video you linked. Click the card to play.`,
            language: 'en-US',
            youtubeVideoId: videoId,
            youtubeSongTitle: songTitle,
            youtubeArtistName: artistName,
        };
        
        setSessions(prev => prev.map(s =>
            s.id === activeSessionId ? { ...s, history: [...s.history, modelMessage] }
            : s
        ));
    } catch (e: any) {
        console.error("YouTube playback by ID error:", e);
        const errorMessage: ChatMessage = {
            id: `msg-${Date.now()}-error`,
            role: MessageRole.MODEL,
            content: `I'm sorry, I couldn't get the details for that YouTube link. Error: ${e.message}`,
            language: 'en-US',
        };
        setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, history: [...s.history, errorMessage] } : s));
    }
  };

  const runMultiAgentCollaboration = async (prompt: string, history: ChatMessage[]) => {
        if (!ai) return;
        const activeSession = sessions.find(s => s.id === activeSessionId);
        if (!activeSession) return;

        const initialMessage: ChatMessage = {
            id: `msg-${Date.now()}-multiagent`,
            role: MessageRole.MODEL,
            multiAgentState: {
                originalQuery: prompt,
                plan: "The team is assessing the query and creating a plan...",
                agentExecutions: [],
                finalResponse: ''
            }
        };
        
        // Add message to history right away
        const userMessageHistory = history.slice(-1).map(h => ({id: `user-${Date.now()}`, role: MessageRole.USER, content: h.content, files: h.files}));
        const updatedHistoryWithPlaceholder = [...activeSession.history, ...userMessageHistory, initialMessage];
        const updatedSessionWithPlaceholder = { ...activeSession, history: updatedHistoryWithPlaceholder };
        setSessions(sessions.map(s => s.id === activeSessionId ? updatedSessionWithPlaceholder : s));
        
        const updateMultiAgentMessage = (updater: (prevState: MultiAgentState) => MultiAgentState) => {
            setSessions(prev => prev.map(s => {
                if (s.id !== activeSessionId) return s;
                const newHistory = [...s.history];
                const lastMessage = newHistory[newHistory.length - 1];
                if (lastMessage && lastMessage.id === initialMessage.id && lastMessage.multiAgentState) {
                    lastMessage.multiAgentState = updater(lastMessage.multiAgentState);
                }
                return { ...s, history: newHistory };
            }));
        };

        try {
            // Step 1: Planner Agent
            const planResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `User query: "${prompt}".
                You are a project manager. Your job is to break down the user's query into a sequence of tasks for a team of expert AI agents.
                The available agent roles are: ${Object.values(AgentRole).join(', ')}.
                Provide a high-level plan and then a list of tasks with the most appropriate agent for each. The final agent must be a Synthesizer.`,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            plan: { type: Type.STRING, description: "A high-level plan for the team." },
                            tasks: {
                                type: Type.ARRAY,
                                description: "The list of tasks for the agents.",
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        role: { type: Type.STRING, enum: Object.values(AgentRole) },
                                        task: { type: Type.STRING, description: "The specific task for this agent." }
                                    },
                                    required: ["role", "task"]
                                }
                            }
                        },
                        required: ["plan", "tasks"]
                    }
                }
            });
            const planData = JSON.parse(planResponse.text.trim());

            updateMultiAgentMessage(prev => ({
                ...prev,
                plan: planData.plan,
                agentExecutions: planData.tasks.map((t: any) => ({
                    role: t.role,
                    task: t.task,
                    output: '',
                    isComplete: false
                }))
            }));
            
            let agentOutputs: { role: AgentRole; output: string }[] = [];

            // Step 2: Execute Agent Tasks
            for (let i = 0; i < planData.tasks.length; i++) {
                const { role, task } = planData.tasks[i];
                
                const agentSystemInstruction = `You are the ${role}, an expert in your field.
                Your current task is: "${task}".
                Here are the results from previous agents you can use as context:
                ${agentOutputs.map(o => `- ${o.role}'s output: ${o.output}`).join('\n')}
                
                Focus ONLY on your assigned task and provide a concise, expert response.`;

                const agentResponse = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: `Original user query for context: "${prompt}"\nExecute your task.`,
                    config: { systemInstruction: agentSystemInstruction }
                });
                
                const output = agentResponse.text;
                agentOutputs.push({ role, output });

                updateMultiAgentMessage(prev => {
                    const newExecutions = [...prev.agentExecutions];
                    newExecutions[i].output = output;
                    newExecutions[i].isComplete = true;
                    return { ...prev, agentExecutions: newExecutions };
                });
            }
            
            const finalAgentOutput = agentOutputs.find(o => o.role === AgentRole.SYNTHESIZER)?.output || agentOutputs[agentOutputs.length - 1].output;
            updateMultiAgentMessage(prev => ({
                ...prev,
                finalResponse: finalAgentOutput
            }));

        } catch (e: any) {
            console.error("Multi-agent collaboration error:", e);
            updateMultiAgentMessage(prev => ({
                ...prev,
                finalResponse: `An error occurred during the collaboration: ${e.message}`
            }));
        }
    };


  const sendMessage = async (prompt: string) => {
    if (!ai) {
        alert("AI Service not initialized. Ensure the Gemini API key is configured correctly in config.ts.");
        return;
    };
    const activeSession = sessions.find(s => s.id === activeSessionId);
    if (!activeSession) return;
    
    setIsLoading(true);

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: MessageRole.USER,
      content: prompt,
      files: stagedFiles.length > 0 ? stagedFiles : undefined,
    };
    
    // Optimistically update UI
    const updatedHistory = [...activeSession.history, userMessage];
    const updatedSession = { ...activeSession, history: updatedHistory };
    
    // For Multi-agent, we don't add the user message again inside the function
    if (activeTool !== Tool.TEAM_OF_EXPERTS) {
        setSessions(sessions.map(s => s.id === activeSessionId ? updatedSession : s));
    }
    
    // Auto-title new chats
    if (activeSession.history.length === 0 && prompt) {
        const titlePrompt = `Create a very short, concise title (4 words max) for the following user query: "${prompt}"`;
        ai.models.generateContent({ model: "gemini-2.5-flash", contents: titlePrompt })
            .then(response => {
                const newTitle = response.text.replace(/"/g, '').trim();
                setSessions(prev => prev.map(s =>
                    s.id === activeSessionId ? { ...s, title: newTitle } : s
                ));
            })
            .catch(e => console.error("Title generation failed", e));
    }
    
    try {
        const videoIdFromUrl = getYouTubeVideoIdFromUrl(prompt);
        const translationIntent = isTranslationIntent(prompt);
        const videoSearchIntent = isVideoSearchIntent(prompt);
        const musicGenerationIntent = isMusicGenerationIntent(prompt);
        const musicPlaybackIntent = isMediaPlaybackIntent(prompt);

        if (activeTool === Tool.TEAM_OF_EXPERTS) {
            await runMultiAgentCollaboration(prompt, updatedHistory);
        } else if (videoIdFromUrl && !activeTool) {
             await playYouTubeVideoById(videoIdFromUrl, updatedHistory);
        } else if ((musicPlaybackIntent || videoSearchIntent) && !activeTool) {
             await searchYouTubeVideos(prompt, updatedHistory);
        } else if (translationIntent && !activeTool) {
             await generateTranslationResponse(translationIntent.text, translationIntent.language);
        } else if (activeTool === Tool.WEB_SEARCH) {
             await generateWebSearchResponse(prompt, updatedHistory);
        } else if (activeTool === Tool.MUSIC || musicGenerationIntent) {
            await generateMusic(prompt);
        } else if (activeTool === Tool.MAP) {
            await findLocationOnMap(prompt, updatedHistory);
        } else {
             await generateResponse(updatedHistory);
        }
    } catch(e) {
        console.error("Main message sending pipeline error: ", e);
        const errorMessage: ChatMessage = {
            id: `msg-${Date.now()}-error-critical`,
            role: MessageRole.MODEL,
            content: "A critical error occurred while trying to generate a response. Please check the console for details.",
            language: 'en-US',
        };
        const historyWithError = [...updatedHistory, errorMessage];
        const sessionWithError = { ...updatedSession, history: historyWithError };
        setSessions(sessions.map(s => s.id === activeSessionId ? sessionWithError : s));
    } finally {
      setIsLoading(false);
      setStagedFiles([]);
      // Reset tool after one use for most tools
      if (activeTool && activeTool !== Tool.STUDY) {
        setActiveTool(null);
      }
    }
  };

  const sendEmail = useCallback(async (params: Record<string, any>) => {
    if (!accessToken) {
        throw new Error("Authentication token is missing. Please re-authenticate.");
    }
    if (!user) {
        throw new Error("User information is not available.");
    }

    const isValidEmail = (email: any): email is string =>
        typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!isValidEmail(params.to)) {
        // The model should have validated this, but we check again as a safeguard.
        throw new Error(`Gmail API error: Invalid "To" header. The recipient must be a valid email address.`);
    }

    // RFC 2822 formatted email.
    const emailLines = [
        `From: "${user.name}" <${user.email}>`,
        `To: ${params.to}`,
        `Subject: ${params.subject || 'No Subject'}`,
        'Content-Type: text/plain; charset=utf-8',
        'MIME-Version: 1.0',
        '', // empty line separator
        params.body || '',
    ];
    const email = emailLines.join('\r\n');
    
    // Base64Url encode the email
    const utf8SafeEmail = unescape(encodeURIComponent(email));
    const base64urlEmail = btoa(utf8SafeEmail)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            raw: base64urlEmail,
        }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error("Gmail API Error:", errorData);
        throw new Error(`Gmail API error: ${errorData.error.message}`);
    }
    
    const sentMessage = await response.json();
    alert(`Email sent successfully to ${params.to}!`);
    return sentMessage;
}, [accessToken, user]);


  const scheduleGoogleMeet = useCallback(async (params: Record<string, any>, actionDescription: string) => {
    if (!accessToken) {
        throw new Error("Authentication token is missing. This indicates a logic error.");
    }
    // Added validation to prevent calendar API errors
    if (!params.start_time || !params.end_time || typeof params.start_time !== 'string' || typeof params.end_time !== 'string') {
        throw new Error("Could not schedule meeting: The AI did not provide a valid start and end time for the event.");
    }

    const event = {
        summary: params.summary || 'Meeting',
        description: params.description || `Meeting scheduled by Magnus AI based on the request: "${actionDescription}"`,
        start: {
            dateTime: params.start_time,
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        end: {
            dateTime: params.end_time,
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        attendees: params.attendees?.map((email: string) => ({ email })) || [],
        conferenceData: {
            createRequest: {
                requestId: `magnus-ai-${Date.now()}`,
                conferenceSolutionKey: {
                    type: 'hangoutsMeet'
                }
            }
        },
    };

    const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error("Google Calendar API Error:", errorData);
        throw new Error(`Google Calendar API error: ${errorData.error.message}`);
    }

    const createdEvent = await response.json();
    alert(`Meeting scheduled! "${createdEvent.summary}" is on your Google Calendar. Meet link: ${createdEvent.hangoutLink}`);
    return createdEvent;
}, [accessToken]);

const executeAction = useCallback(async (action: Action) => {
    if (!accessToken) {
        setPendingAction(action);
        tokenClient.current?.requestAccessToken();
        return;
    }

    try {
        if (action.type === 'schedule_meeting') {
            await scheduleGoogleMeet(action.parameters, action.description);
        } else if (action.type === 'send_email') {
            await sendEmail(action.parameters);
        } else {
            alert(`Action type "${action.type}" is not supported.`);
        }
    } catch (error: any) {
        console.error("Failed to execute action:", error);
        alert(`Action failed: ${error.message}`);
    }
}, [accessToken, scheduleGoogleMeet, sendEmail]);

useEffect(() => {
    if (accessToken && pendingAction) {
        const actionToExecute = pendingAction;
        setPendingAction(null); // Clear before executing to prevent loops
        executeAction(actionToExecute);
    }
}, [accessToken, pendingAction, executeAction]);

    const handleConnectDrive = () => {
        if (accessToken) {
            setIsDrivePickerOpen(true);
        } else {
            // If no token, set a flag and request one.
            // The useEffect below will handle opening the picker once the token is acquired.
            setIsDrivePickerPending(true);
            tokenClient.current?.requestAccessToken();
        }
    };

    useEffect(() => {
        // This effect runs when an access token is acquired AND a drive connection was pending.
        if (accessToken && isDrivePickerPending) {
            setIsDrivePickerPending(false); // Reset the pending flag
            setIsDrivePickerOpen(true);     // Now open the picker
        }
    }, [accessToken, isDrivePickerPending]);

    const handleOpenChallengeModal = async () => {
        if (!ai) return;

        const mostRecentChallenge = challenges.length > 0 ? challenges.sort((a,b) => b.generatedAt - a.generatedAt)[0] : null;
        const today = new Date().toDateString();

        if (mostRecentChallenge && new Date(mostRecentChallenge.generatedAt).toDateString() === today) {
            setActiveChallenge(mostRecentChallenge);
            setIsChallengeModalOpen(true);
        } else {
            setIsLoading(true);
            setIsChallengeModalOpen(true);
            try {
                const challengeTypeValues = Object.values(ChallengeType);
                const randomType = challengeTypeValues[Math.floor(Math.random() * challengeTypeValues.length)];

                const generationPrompt = `Generate a new daily challenge for a user. The challenge should be unique, engaging, and appropriate for a general audience. The type of challenge MUST be '${randomType}'. Today's date is ${new Date().toLocaleDateString()}.
                You MUST provide the following fields in your JSON response:
                - title: A short, catchy title for the challenge.
                - description: A clear description of the challenge task.
                - hint: A subtle hint to help the user if they are stuck. The hint should not give away the answer directly.
                - correctAnswer: The specific, correct answer to the challenge. For creative writing, this could be a sample high-quality answer.`;

                const response = await ai.models.generateContent({
                    model: "gemini-2.5-flash",
                    contents: generationPrompt,
                    config: {
                        responseMimeType: "application/json",
                        responseSchema: {
                            type: Type.OBJECT,
                            properties: {
                                type: { type: Type.STRING, enum: challengeTypeValues },
                                title: { type: Type.STRING },
                                description: { type: Type.STRING },
                                hint: { type: Type.STRING },
                                correctAnswer: { type: Type.STRING },
                            },
                            required: ["type", "title", "description", "hint", "correctAnswer"]
                        }
                    }
                });
                
                const jsonText = response.text.trim();
                const newChallengeData = JSON.parse(jsonText);
                const newChallenge: Challenge = {
                    id: `challenge-${Date.now()}`,
                    ...newChallengeData,
                    status: ChallengeStatus.ACTIVE,
                    generatedAt: Date.now()
                };

                setChallenges(prev => [...prev, newChallenge]);
                setActiveChallenge(newChallenge);

            } catch (error: any) {
                console.error("Failed to generate challenge:", error);
                alert(`Could not generate a new challenge: ${error.message}`);
                setIsChallengeModalOpen(false);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleChallengeSubmit = async (submission: string) => {
        if (!ai || !activeChallenge) return;
        setIsLoading(true);

        try {
            const prompt = `A user has submitted an answer to a challenge. Your task is to evaluate their submission fairly and provide encouraging, constructive feedback.

            **Challenge Details:**
            - Title: "${activeChallenge.title}"
            - Description: "${activeChallenge.description}"
            - Correct Answer: "${activeChallenge.correctAnswer}"

            **User's Submission:**
            "${submission}"

            **Your Instructions:**
            1.  **Compare** the "User's Submission" with the "Correct Answer".
            2.  **Decide the Status**:
                - If the submission is correct or a reasonably good attempt (especially for creative tasks), set the status to 'completed'.
                - If the submission is incorrect, set the status to 'failed'.
            3.  **Generate Feedback**:
                - If the status is 'completed', provide positive and encouraging feedback.
                - **If the status is 'failed', you MUST do two things in your feedback:**
                    a. Clearly explain **why** the user's answer is incorrect.
                    b. Provide the **correct answer** so the user can learn from it.
            4.  **Return a JSON object** with your feedback and the final status.`;

            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            feedback: { type: Type.STRING, description: "Your evaluation and feedback for the user." },
                            status: { type: Type.STRING, enum: [ChallengeStatus.COMPLETED, ChallengeStatus.FAILED] }
                        },
                        required: ["feedback", "status"]
                    }
                }
            });

            const jsonText = response.text.trim();
            const result = JSON.parse(jsonText);

            const updatedChallenge: Challenge = {
                ...activeChallenge,
                userSubmission: submission,
                feedback: result.feedback,
                status: result.status
            };

            if(result.status === ChallengeStatus.COMPLETED) {
                setUserStats(prev => {
                    const today = new Date();
                    const yesterday = new Date();
                    yesterday.setDate(today.getDate() - 1);
                    const todayStr = today.toDateString();
                    const yesterdayStr = yesterday.toDateString();

                    // Don't award points/streak if already completed a challenge today
                    if (prev.lastChallengeCompletedDate === todayStr) {
                        return prev;
                    }

                    const newStreak = prev.lastChallengeCompletedDate === yesterdayStr ? prev.streak + 1 : 1;
                    
                    return {
                        points: prev.points + 1,
                        streak: newStreak,
                        lastChallengeCompletedDate: todayStr
                    };
                });
            }

            setChallenges(prev => prev.map(c => c.id === activeChallenge.id ? updatedChallenge : c));
            setActiveChallenge(updatedChallenge);

        } catch (error: any) {
            console.error("Failed to evaluate challenge submission:", error);
            alert(`Could not evaluate your submission: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };
  
  const handleReadAloud = (message: ChatMessage) => {
      if (!('speechSynthesis' in window) || !message.content) return;
      
      const tts = window.speechSynthesis;
      
      if (speakingMessageId === message.id) {
          tts.cancel();
          setSpeakingMessageId(null);
          utteranceRef.current = null;
      } else {
          tts.cancel(); // Stop any previous speech
          const textToSpeak = stripMarkdownForTTS(message.content);
          const utterance = new SpeechSynthesisUtterance(textToSpeak);
          
          if (ttsSettings.voiceURI) {
              const selectedVoice = ttsVoices.find(v => v.voiceURI === ttsSettings.voiceURI);
              if (selectedVoice) utterance.voice = selectedVoice;
          }
          if (message.language) {
             utterance.lang = message.language;
          }
          utterance.rate = ttsSettings.rate;
          utterance.pitch = ttsSettings.pitch;
          
          utterance.onend = () => {
              setSpeakingMessageId(null);
              utteranceRef.current = null;
          };
          
          utteranceRef.current = utterance;
          setSpeakingMessageId(message.id);
          tts.speak(utterance);
      }
  };
  
  const isConfigured = 
    GEMINI_API_KEY && !GEMINI_API_KEY.includes('PASTE_YOUR') &&
    GOOGLE_MAPS_API_KEY && !GOOGLE_MAPS_API_KEY.includes('PASTE_YOUR') &&
    GOOGLE_CLIENT_ID && !GOOGLE_CLIENT_ID.includes('PASTE_YOUR');

  const activeSession = useMemo(() => sessions.find(s => s.id === activeSessionId), [sessions, activeSessionId]);

  if (isPromptDjOpen) {
    return <PromptDjPage onClose={() => setIsPromptDjOpen(false)} />;
  }

  if (isCompilerOpen) {
    return <CompilerPage ai={ai} onClose={() => setIsCompilerOpen(false)} />;
  }

  if (!isConfigured) {
    return (
        <div className="bg-primary h-screen w-screen flex items-center justify-center text-center p-8">
            <div className="w-full max-w-lg bg-secondary p-8 rounded-xl border border-gray-700/50">
                <h1 className="text-2xl font-bold text-red-500 mb-4">Configuration Missing</h1>
                <p className="text-text-secondary mb-6">
                    Please open the <code>config.ts</code> file and add your Gemini API Key, Google Maps API Key, and Google Client ID.
                </p>
                <div className="bg-primary text-left p-4 rounded-lg text-sm text-text-primary overflow-x-auto">
                    <pre className="whitespace-pre-wrap">
                        <code>
                            {`// config.ts

export const GEMINI_API_KEY = "YOUR_GEMINI_KEY";
export const GOOGLE_MAPS_API_KEY = "YOUR_MAPS_KEY";
export const GOOGLE_CLIENT_ID = "YOUR_CLIENT_ID";`}
                        </code>
                    </pre>
                </div>
            </div>
        </div>
    );
  }

  if (isInitializing) {
    return (
        <div className="bg-primary h-screen w-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-accent"></div>
        </div>
    );
  }

  if (!user) {
      return <LandingPage onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen w-full bg-primary text-text-primary">
        <>
            <Sidebar
                onNewChat={handleNewChat}
                sessions={sessions}
                activeSessionId={activeSessionId}
                onSelectChat={handleSelectChat}
                onDeleteChat={handleDeleteChat}
                disabled={isLoading || !activeSessionId}
                user={user}
                userStats={userStats}
                onLogin={handleLogin}
                onLogout={handleLogout}
                onOpenCustomizeModal={() => setIsCustomizeModalOpen(true)}
                onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
                onOpenHelpModal={() => setIsHelpModalOpen(true)}
                onOpenChallengeModal={handleOpenChallengeModal}
                onOpenCompiler={() => setIsCompilerOpen(true)}
            />
            <main className="flex-1 flex flex-col h-screen">
                <ChatWindow
                chatHistory={activeSession?.history || []}
                isLoading={isLoading}
                onReadAloud={handleReadAloud}
                speakingMessageId={speakingMessageId}
                mapsApiKey={GOOGLE_MAPS_API_KEY}
                user={user}
                onExecuteAction={executeAction}
                />
                <ChatInput
                onSendMessage={sendMessage}
                isLoading={isLoading}
                disabled={!activeSessionId || !ai}
                activeTool={activeTool}
                onSelectTool={setActiveTool}
                user={user}
                activePersonality={activeSession?.activePersonality || null}
                onSelectPersonality={handleSelectPersonality}
                stagedFiles={stagedFiles}
                setStagedFiles={setStagedFiles}
                googleAccessToken={accessToken}
                onConnectDrive={handleConnectDrive}
                onOpenPromptDj={() => setIsPromptDjOpen(true)}
                />
            </main>
            <CustomizeModal 
                isOpen={isCustomizeModalOpen}
                onClose={() => setIsCustomizeModalOpen(false)}
                onSave={handleSaveCustomization}
                initialSettings={customizationSettings}
            />
            <SettingsModal
                isOpen={isSettingsModalOpen}
                onClose={() => setIsSettingsModalOpen(false)}
                onSave={handleSaveSettings}
                initialSettings={ttsSettings}
                voices={ttsVoices}
            />
            <HelpFAQModal
                isOpen={isHelpModalOpen}
                onClose={() => setIsHelpModalOpen(false)}
                onSendQuery={handleSendSupportQuery}
                user={user}
            />
            <StudyModal
                isOpen={isStudyModalOpen}
                onClose={() => setIsStudyModalOpen(false)}
                onGenerate={generateStudyGuide}
            />
            <ChallengeModal
                isOpen={isChallengeModalOpen}
                onClose={() => setIsChallengeModalOpen(false)}
                challenge={activeChallenge}
                onSubmit={handleChallengeSubmit}
                isLoading={isLoading}
            />
            {isDrivePickerOpen && (
                <DrivePicker
                    isOpen={isDrivePickerOpen}
                    onClose={() => setIsDrivePickerOpen(false)}
                    onFilesReady={(files) => setStagedFiles(prev => [...prev, ...files])}
                    setIsLoading={setIsLoading}
                    apiKey={GEMINI_API_KEY}
                    accessToken={accessToken}
                />
            )}
        </>
    </div>
  );
};

export default App;