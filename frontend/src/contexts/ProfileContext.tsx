"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export interface UserProfile {
  name: string;
  avatar: string; // emoji avatar
  selectedCategories: string[];
  notificationsEnabled: boolean;
  email: string;
  isSubscribed: boolean;
}

const DEFAULT_PROFILE: UserProfile = {
  name: "Guest",
  avatar: "🧑",
  selectedCategories: [],
  notificationsEnabled: true,
  email: "",
  isSubscribed: false,
};

const AVATARS = ["🧑", "👩", "🧔", "👨‍💻", "👩‍💻", "🦊", "🐼", "🤖", "🦄", "🐉"];

interface ProfileContextType {
  profile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => void;
  AVATARS: string[];
  isProfileOpen: boolean;
  setIsProfileOpen: (v: boolean) => void;
}

const ProfileContext = createContext<ProfileContextType | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("ainews_profile");
    if (stored) {
      try { setProfile(JSON.parse(stored)); } catch {}
    }
  }, []);

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile(prev => {
      const updated = { ...prev, ...updates };
      localStorage.setItem("ainews_profile", JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <ProfileContext.Provider value={{ profile, updateProfile, AVATARS, isProfileOpen, setIsProfileOpen }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be used within ProfileProvider");
  return ctx;
}
