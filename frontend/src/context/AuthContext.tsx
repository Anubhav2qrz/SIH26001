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
  state?: string;
  district?: string;
  department?: string;
  has_selected_region?: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile;
  loading: boolean;
  isConfigured: boolean;
  needsRegionSelection: boolean;
  setNeedsRegionSelection: (val: boolean) => void;
  updateRegion: (state: string, district: string) => Promise<{ error: Error | null }>;
  setRole: (role: AppRole) => void;
  switchDemoUser: (role: AppRole) => void;
  signInWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUpWithEmail: (email: string, password: string, name: string, role: AppRole) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
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
  const [needsRegionSelection, setNeedsRegionSelection] = useState(false);

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
        const hasRegion = Boolean(metadata.has_selected_region);
        setProfile({
          id: session.user.id,
          email: session.user.email || "",
          name: metadata.name || session.user.email?.split("@")[0] || "Officer",
          role: (metadata.role as AppRole) || "CITIZEN",
          state: metadata.state || "Meghalaya",
          district: metadata.district || "East Khasi Hills",
          has_selected_region: hasRegion,
        });
        if (!hasRegion) {
          setNeedsRegionSelection(true);
        }
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
        const hasRegion = Boolean(metadata.has_selected_region);
        setProfile({
          id: session.user.id,
          email: session.user.email || "",
          name: metadata.name || session.user.email?.split("@")[0] || "Officer",
          role: (metadata.role as AppRole) || "CITIZEN",
          state: metadata.state || "Meghalaya",
          district: metadata.district || "East Khasi Hills",
          has_selected_region: hasRegion,
        });
        if (!hasRegion) {
          setNeedsRegionSelection(true);
        }
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

  const signInWithGoogle = async () => {
    if (!isSupabaseConfigured) {
      switchDemoUser("CITIZEN");
      return { error: null };
    }

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: typeof window !== "undefined" ? `${window.location.origin}/` : undefined,
        queryParams: {
          prompt: "select_account",
          access_type: "offline",
        },
      },
    });

    if (error) {
      return { error: new Error(error.message) };
    }

    if (data?.url && typeof window !== "undefined") {
      window.location.href = data.url;
    }

    return { error: null };
  };

  const updateRegion = async (state: string, district: string) => {
    if (isSupabaseConfigured && user) {
      const { error } = await supabase.auth.updateUser({
        data: {
          state,
          district,
          has_selected_region: true,
        },
      });
      if (error) {
        return { error: new Error(error.message) };
      }
    }

    setProfile((prev) => ({
      ...prev,
      state,
      district,
      has_selected_region: true,
    }));
    setNeedsRegionSelection(false);
    return { error: null };
  };

  const signOut = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setSession(null);
    setNeedsRegionSelection(false);
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
        needsRegionSelection,
        setNeedsRegionSelection,
        updateRegion,
        setRole,
        switchDemoUser,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
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
