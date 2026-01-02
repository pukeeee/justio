/**
 * Authentication Context Provider
 * Provides authentication state to all components
 */

"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { createBrowserClient } from "@/shared/supabase/client";
import type { User } from "@supabase/supabase-js";
import type {
  UserRole,
  Workspace,
  WorkspaceUser,
} from "@/shared/lib/validations/schemas";

// ============================================================================
// TYPES
// ============================================================================

interface AuthContextType {
  user: User | null;
  workspace: Workspace | null;
  workspaceUser: WorkspaceUser | null;
  role: UserRole | null;
  loading: boolean;
  refreshWorkspace: () => Promise<void>;
}

// ============================================================================
// CONTEXT
// ============================================================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================================================
// PROVIDER
// ============================================================================

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [workspaceUser, setWorkspaceUser] = useState<WorkspaceUser | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  const supabase = createBrowserClient();

  const fetchWorkspace = async (userId: string) => {
    try {
      const { data: workspaceUserData, error } = await supabase
        .from("workspace_users")
        .select("*, workspaces(*)")
        .eq("user_id", userId)
        .eq("status", "active")
        .single();

      if (error) throw error;

      setWorkspaceUser(workspaceUserData as any);
      setWorkspace((workspaceUserData as any).workspaces);
    } catch (error) {
      console.error("Error fetching workspace:", error);
      setWorkspace(null);
      setWorkspaceUser(null);
    }
  };

  useEffect(() => {
    // Get initial session
    const initAuth = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        setUser(user);

        if (user) {
          await fetchWorkspace(user.id);
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);

      if (session?.user) {
        await fetchWorkspace(session.user.id);
      } else {
        setWorkspace(null);
        setWorkspaceUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const refreshWorkspace = async () => {
    if (user) {
      await fetchWorkspace(user.id);
    }
  };

  const value: AuthContextType = {
    user,
    workspace,
    workspaceUser,
    role: workspaceUser?.role ?? null,
    loading,
    refreshWorkspace,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Hook to access authentication context
 */
export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return context;
}
