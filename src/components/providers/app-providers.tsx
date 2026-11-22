"use client";

import { SessionProvider } from "./session-provider";
import { ToastProvider } from "./toast-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ToastProvider>{children}</ToastProvider>
    </SessionProvider>
  );
}
