
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  codeSnippet?: string;
}

export interface CodeAnalysis {
  bugs: string[];
  suggestions: string[];
  explanation: string;
}

// Added missing AppRoute enum
export enum AppRoute {
  HOME = 'HOME',
  DIRECTORY = 'DIRECTORY',
  GUIDE = 'GUIDE',
  LOGIN = 'LOGIN',
  PROFILE = 'PROFILE',
  EDIT_PROFILE = 'EDIT_PROFILE',
  PUBLIC_VIEW = 'PUBLIC_VIEW'
}

// Added missing UserRole type
export type UserRole = 'ADMIN' | 'STAFF' | 'TEACHER' | 'STUDENT';

// Added missing ActivityImage interface
export interface ActivityImage {
  id: string;
  url: string;
  caption: string;
  date: string;
}

// Added missing AlumniProfile interface
export interface AlumniProfile {
  id: string;
  fullName: string;
  studentId: string;
  email: string;
  phone: string;
  currentStatus: string;
  role: UserRole;
  profileImageUrl?: string;
  company?: string;
  position?: string;
  bio?: string;
  gallery: ActivityImage[];
}
