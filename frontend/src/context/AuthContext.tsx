"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export type AppRole = "AUTHORITY" | "ADMIN" | "FIELD_OFFICER" | "CITIZEN";

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: AppRole;
  district?: string;
  department?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile;
  loading: boolean;
  isConfigured: boolean;
  setRole: (role: AppRole) => void;
  switchDemoUser: (role: AppRole) => void;
  signInWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUpWithEmail: (email: string, password: string, name: string, role: AppRole) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const DEMO_PROFILES: Record<AppRole, UserProfile> = {
  AUTHORITY: {
    id: "auth-sdma-01",
    email: "director.sdma@meghalaya.gov.in",
    name: "Dr. T. Sangma",
    role: "AUTHORITY",
    district: "East Khasi Hills",
    department: "State Disaster Management Authority",
  },
  ADMIN: {
    id: "admin-ekh-01",
    email: "dc.shillong@nic.in",
    name: "District Magistrate (EKH)",
    role: "ADMIN",
    district: "East Khasi Hills",
    department: "District Administration",
  },
  FIELD_OFFICER: {
    id: "field-sohra-01",
    email: "fo.sohra@sdma.gov.in",
    name: "Officer R. Khongwir",
    role: "FIELD_OFFICER",
    district: "East Khasi Hills (Sohra)",
    department: "Emergency Response & Field Survey",
  },
  CITIZEN: {
    id: "citizen-01",
    email: "citizen@meghalaya.org",
    name: "Local Resident",
    role: "CITIZEN",
    district: "Cherrapunji",
    department: "Community Member",
  },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile>(DEMO_PROFILES.AUTHORITY);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        const metadata = session.user.user_metadata || {};
        setProfile({
          id: session.user.id,
          email: session.user.email || "",
          name: metadata.name || session.user.email?.split("@")[0] || "Officer",
          role: (metadata.role as AppRole) || "CITIZEN",
          district: metadata.district || "East Khasi Hills",
        });
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        const metadata = session.user.user_metadata || {};
        setProfile({
          id: session.user.id,
          email: session.user.email || "",
          name: metadata.name || session.user.email?.split("@")[0] || "Officer",
          role: (metadata.role as AppRole) || "CITIZEN",
          district: metadata.district || "East Khasi Hills",
        });
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const setRole = (role: AppRole) => {
    setProfile((prev) => ({ ...prev, role }));
  };

  const switchDemoUser = (role: AppRole) => {
    setProfile(DEMO_PROFILES[role]);
  };

  const signInWithEmail = async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      const matchedRole: AppRole = email.includes("sdma")
        ? "AUTHORITY"
        : email.includes("field")
        ? "FIELD_OFFICER"
        : "CITIZEN";
      switchDemoUser(matchedRole);
      return { error: null };
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error ? new Error(error.message) : null };
  };

  const signUpWithEmail = async (
    email: string,
    password: string,
    name: string,
    role: AppRole
  ) => {
    if (!isSupabaseConfigured) {
      setProfile({
        id: `user-${Date.now()}`,
        email,
        name,
        role,
        district: "East Khasi Hills",
      });
      return { error: null };
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role },
      },
    });
    return { error: error ? new Error(error.message) : null };
  };

  const signOut = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setSession(null);
    setProfile(DEMO_PROFILES.CITIZEN);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        isConfigured: isSupabaseConfigured,
        setRole,
        switchDemoUser,
        signInWithEmail,
        signUpWithEmail,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
