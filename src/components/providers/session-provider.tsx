"use client";

import * as React from "react";
import { api } from "@/lib/api";
import type { AuthSession, SignUpInput, User } from "@/lib/types";

type SessionStatus = "loading" | "authenticated" | "unauthenticated";

interface SessionContextValue {
  user: User | null;
  status: SessionStatus;
  refresh: () => Promise<User | null>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (input: SignUpInput) => Promise<void>;
  signOut: () => Promise<void>;
}

const SessionContext = React.createContext<SessionContextValue | null>(null);

function normalizeSession(session: AuthSession | null): AuthSession | null {
  if (!session?.user) return null;
  return {
    ...session,
    user: {
      ...session.user,
      id: session.user.id || session.user._id || "",
      role: session.user.role ?? "customer",
    },
  };
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [status, setStatus] = React.useState<SessionStatus>("loading");

  const refresh = React.useCallback(async () => {
    try {
      const session = normalizeSession(await api.auth.getSession());
      setUser(session?.user ?? null);
      setStatus(session ? "authenticated" : "unauthenticated");
      return session?.user ?? null;
    } catch {
      setUser(null);
      setStatus("unauthenticated");
      return null;
    }
  }, []);

  React.useEffect(() => {
    let active = true;

    api.auth
      .getSession()
      .then((session) => {
        if (!active) return;
        const normalized = normalizeSession(session);
        setUser(normalized?.user ?? null);
        setStatus(normalized ? "authenticated" : "unauthenticated");
      })
      .catch(() => {
        if (!active) return;
        setUser(null);
        setStatus("unauthenticated");
      });

    return () => {
      active = false;
    };
  }, []);

  const signIn = React.useCallback(
    async (email: string, password: string) => {
      await api.auth.signIn({ email, password });
      const nextUser = await refresh();
      if (!nextUser) {
        throw new Error("Signed in, but the session could not be loaded.");
      }
    },
    [refresh],
  );

  const signUp = React.useCallback(
    async (input: SignUpInput) => {
      await api.auth.signUp(input);
      const nextUser = await refresh();
      if (!nextUser) {
        throw new Error("Account created, but the session could not be loaded.");
      }
    },
    [refresh],
  );

  const signOut = React.useCallback(async () => {
    try {
      await api.auth.signOut();
    } finally {
      setUser(null);
      setStatus("unauthenticated");
    }
  }, []);

  const value = React.useMemo(
    () => ({ user, status, refresh, signIn, signUp, signOut }),
    [user, status, refresh, signIn, signUp, signOut],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession(): SessionContextValue {
  const context = React.useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}
