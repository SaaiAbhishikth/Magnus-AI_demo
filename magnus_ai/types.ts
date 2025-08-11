


export enum MessageRole {
  USER = 'user',
  MODEL = 'model',
  SYSTEM = 'system',
}

export enum Tool {
  STUDY = 'Study and learn',
  MUSIC = 'Create music',
  THINK_LONGER = 'Think longer',
  DEEP_RESEARCH = 'Deep research',
  WEB_SEARCH = 'Web search',
  MAP = 'Find on map',
  TEAM_OF_EXPERTS = 'Team of Experts',
  AUTOMATED_TASKS = 'Automated Tasks',
}

export enum Personality {
  DEFAULT = 'Default',
  FORMAL_ADVISOR = 'Formal Advisor',
  FRIENDLY_MENTOR = 'Friendly Mentor',
  CODING_WIZARD = 'Coding Wizard',
  COMEDIAN = 'Comedian',
}

export enum AgentRole {
  PLANNER = 'Planner',
  RESEARCHER = 'Researcher',
  CODER = 'Coder',
  DESIGNER = 'Designer',
  SYNTHESIZER = 'Synthesizer',
}

export enum ChallengeType {
  QUIZ = 'quiz',
  PUZZLE = 'puzzle',
  CREATIVE_WRITING = 'creative_writing',
}

export enum ChallengeStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export interface Challenge {
  id: string;
  type: ChallengeType;
  title: string;
  description: string;
  status: ChallengeStatus;
  hint: string;
  correctAnswer: string;
  userSubmission?: string;
  feedback?: string;
  generatedAt: number; // Unix timestamp
}

export interface WorkflowStep {
  active: boolean;
  done: boolean;
  content: string;
}

export interface AgenticWorkflowState {
  perceive?: WorkflowStep;
  reason?: WorkflowStep;
  act?: WorkflowStep;
  learn?: WorkflowStep;
}

export interface StudyGuide {
  topic: string;
  summary: string;
  keyConcepts: Array<{
    concept: string;
    explanation: string;
  }>;
  practiceQuestions: string[];
  furtherReading: string[];
}

export interface ChatFile {
  name: string;
  type: string;
  size: number;
  url: string; // This will be a data URL
}

export interface YouTubeLink {
  title: string;
  url: string;
}

export interface YouTubeSearchResult {
  title: string;
  description: string;
  url: string;
  videoId: string;
}

export interface Music {
  title: string;
  artist: string;
  description: string;
  youtubeLinks: YouTubeLink[];
  tempo: number; // Beats per minute
  mood: 'upbeat' | 'somber' | 'ethereal' | 'driving' | 'mellow';
}

export interface LocationInfo {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

export interface CompilerInfo {
  language: string;
  code: string;
  explanation: string;
  simulatedOutput: string;
}

export interface SubAgentExecution {
  role: AgentRole;
  task: string;
  output: string;
  isComplete: boolean;
}

export interface MultiAgentState {
  originalQuery: string;
  plan: string;
  agentExecutions: SubAgentExecution[];
  finalResponse: string;
}

export interface Action {
    type: 'send_email' | 'schedule_meeting' | 'fetch_report';
    description: string;
    parameters: Record<string, any>;
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content?: string;
  language?: string;
  workflowState?: AgenticWorkflowState;
  files?: ChatFile[];
  groundingSources?: Array<{ uri: string; title: string }>;
  studyGuide?: StudyGuide;
  music?: Music;
  youtubeVideoId?: string;
  youtubeSongTitle?: string;
  youtubeArtistName?: string;
  youtubeSearchResults?: YouTubeSearchResult[];
  youtubeSearchQuery?: string;
  locationInfo?: LocationInfo;
  compilerInfo?: CompilerInfo;
  multiAgentState?: MultiAgentState;
  actions?: Action[];
}

export interface ChatSession {
  id: string;
  title: string;
  history: ChatMessage[];
  activePersonality: Personality;
}

export interface User {
  id:string;
  name: string;
  email: string;
  picture: string;
}

export interface UserGoal {
  id: string;
  description: string;
  completed: boolean;
}

export interface CustomizationSettings {
  nickname: string;
  profession: string;
  traits: string;
  interests: string;
  longTermMemory: string;
  goals: UserGoal[];
}

export interface UserStats {
  points: number;
  streak: number;
  lastChallengeCompletedDate: string; // YYYY-MM-DD
}

export interface TTSSettings {
  voiceURI: string | null;
  rate: number;
  pitch: number;
}