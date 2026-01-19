
export type UserRole = 'ADMIN' | 'STAFF' | 'TEACHER' | 'STUDENT';

export interface ActivityImage {
  id: string;
  url: string;
  caption: string;
  date: string;
}

export interface AlumniProfile {
  id: string;
  fullName: string;
  studentId: string;
  email: string;
  phone: string;
  currentStatus: string;
  company?: string;
  position?: string;
  profileImageUrl?: string;
  bio?: string;
  role: UserRole;
  gallery: ActivityImage[];
}

export enum AppRoute {
  HOME = 'HOME',
  DIRECTORY = 'DIRECTORY',
  LOGIN = 'LOGIN',
  PROFILE = 'PROFILE',
  EDIT_PROFILE = 'EDIT_PROFILE',
  PUBLIC_VIEW = 'PUBLIC_VIEW',
  GUIDE = 'GUIDE'
}

export type DashboardStats = {
  totalVerified: number;
  employmentRate: string;
  activeSessions: number;
  partners: number;
};
