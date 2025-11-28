
export type Language = 'vi' | 'en';
export type Theme = 'light' | 'dark';

export enum AgentType {
  DASHBOARD = 'DASHBOARD',
  RECRUITMENT = 'RECRUITMENT',
  JOB_POST = 'JOB_POST',
  CV_FILTER = 'CV_FILTER',
  CHATBOT = 'CHATBOT',
  ONBOARDING = 'ONBOARDING',
  SETTINGS = 'SETTINGS',
  TOOLS = 'TOOLS',
  PROFILE = 'PROFILE'
}

export interface JDData {
  title: string;
  content: string;
}

export interface JDAnalysis {
  summary: string;
  skills: string[];
  experience: string;
  salary: string;
}

export interface CVData {
  id: string;
  name: string;
  content: string;
  score?: number;
  analysis?: string;
  status?: 'pass' | 'fail' | 'review';
  skillsMatch?: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface OnboardingTask {
  id: string;
  task: string;
  status: 'pending' | 'completed';
  assignee: string;
  dueDate: string;
}

export interface SentimentResult {
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  score: number;
  summary: string;
  actionItems: string[];
}

export interface MarketData {
  role: string;
  salaryRange: string;
  sources: { title: string; uri: string }[];
  marketTrend: string;
}

export interface AppState {
  language: Language;
  theme: Theme;
  activeView: AgentType;
  notifications: string[];
}