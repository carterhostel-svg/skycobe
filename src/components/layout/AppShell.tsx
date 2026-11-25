import React from 'react';
import { useLocation } from 'react-router-dom';
import { Navigation } from './Navigation';

export function AppShell({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const isFullViewportMap = pathname === '/explore';

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)] flex flex-col font-sans selection:bg-[#ccff00] selection:text-[#111315] transition-colors duration-200">
      <div className="flex flex-1 w-full">
        <Navigation />
        <main
          className={
            isFullViewportMap
              ? 'flex-1 w-full h-dvh overflow-hidden'
              : 'flex-1 w-full pb-28'
          }
        >
          {children}
        </main>
      </div>
    </div>
  );
}
