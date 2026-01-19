
import { AlumniProfile, ActivityImage } from '../types';

const STORAGE_KEY = 'alumni_db_v2';

export const mockFirebase = {
  getAllProfiles: (): AlumniProfile[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  getProfileById: (id: string): AlumniProfile | null => {
    const profiles = mockFirebase.getAllProfiles();
    return profiles.find(p => p.id === id) || null;
  },

  saveProfile: (profile: AlumniProfile) => {
    const profiles = mockFirebase.getAllProfiles();
    const index = profiles.findIndex(p => p.id === profile.id);
    if (index > -1) {
      profiles[index] = profile;
    } else {
      profiles.push(profile);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
  },

  getCurrentUser: (): AlumniProfile | null => {
    const currentId = sessionStorage.getItem('current_user_id');
    if (!currentId) return null;
    return mockFirebase.getProfileById(currentId);
  },

  setCurrentUser: (id: string) => {
    sessionStorage.setItem('current_user_id', id);
  },

  clearSession: () => {
    sessionStorage.removeItem('current_user_id');
  },

  // ฟังก์ชันอัปเดตรูปโปรไฟล์
  updateAvatar: (userId: string, imageUrl: string) => {
    const profile = mockFirebase.getProfileById(userId);
    if (profile) {
      profile.profileImageUrl = imageUrl;
      mockFirebase.saveProfile(profile);
      return profile;
    }
    return null;
  },

  // ฟังก์ชันเพิ่มรูปกิจกรรมเข้าคลังภาพ
  addActivityImage: (userId: string, image: ActivityImage) => {
    const profile = mockFirebase.getProfileById(userId);
    if (profile) {
      if (!profile.gallery) profile.gallery = [];
      profile.gallery = [image, ...profile.gallery];
      mockFirebase.saveProfile(profile);
      return profile;
    }
    return null;
  },

  // ฟังก์ชันลบรูปกิจกรรม
  deleteActivityImage: (userId: string, imageId: string) => {
    const profile = mockFirebase.getProfileById(userId);
    if (profile) {
      profile.gallery = profile.gallery.filter(img => img.id !== imageId);
      mockFirebase.saveProfile(profile);
      return profile;
    }
    return null;
  }
};

// services/mockFirebase.ts

export const users = [
  { id: 1, verified: true, employed: true },
  { id: 2, verified: true, employed: false },
  { id: 3, verified: true, employed: true },
  { id: 4, verified: false, employed: false },
];

export const sessions = [
  { id: 1, active: true },
  { id: 2, active: true },
  { id: 3, active: false },
];

export const partners = [
  { id: 1 },
  { id: 2 },
  { id: 3 },
  { id: 4 },
];

export function getDashboardStats() {
  const verifiedUsers = users.filter(u => u.verified);
  const employedUsers = verifiedUsers.filter(u => u.employed);

  return {
    totalVerified: verifiedUsers.length,
    employmentRate: verifiedUsers.length
      ? ((employedUsers.length / verifiedUsers.length) * 100).toFixed(1)
      : "0",
    activeSessions: sessions.filter(s => s.active).length,
    partners: partners.length,
  };
}


