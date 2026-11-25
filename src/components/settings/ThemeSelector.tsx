import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme, type ThemeMode } from '../../context/ThemeContext';
import { cn } from '../../lib/utils';
import React from 'react';

const OPTIONS: { mode: ThemeMode; label: string; icon: React.ReactNode }[] = [
  { mode: 'light',  label: 'Light',  icon: <Sun  size={16} /> },
  { mode: 'dark',   label: 'Ash',    icon: <Moon size={16} /> },
  { mode: 'system', label: 'System', icon: <Monitor size={16} /> },
];

export function ThemeSelector() {
  const { mode, setMode } = useTheme();

  return (
    <div className="flex flex-col gap-2">
      <p className="text-[13px] font-medium"
         style={{ color: 'var(--color-text-secondary)' }}>
        Appearance
      </p>

      <div
        className="flex rounded-2xl p-1 gap-1"
        style={{ backgroundColor: 'var(--color-surface-2)' }}
        role="radiogroup"
        aria-label="Choose app appearance"
      >
        {OPTIONS.map((opt) => {
          const isActive = mode === opt.mode;
          return (
            <button
              key={opt.mode}
              type="button"
              role="radio"
              aria-checked={isActive}
              onClick={() => setMode(opt.mode)}
              className={cn(
                'flex-1 flex items-center justify-center gap-2',
                'h-9 rounded-xl text-[13px] font-semibold cursor-pointer',
                'transition-all duration-200 active:scale-95',
                'focus:outline-none',
              )}
              style={
                isActive
                  ? {
                      backgroundColor: '#ccff00',
                      color: '#111315',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                    }
                  : {
                      backgroundColor: 'transparent',
                      color: 'var(--color-text-secondary)',
                    }
              }
            >
              {opt.icon}
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>

      {mode === 'system' && (
        <p className="text-[12px]" style={{ color: 'var(--color-text-secondary)' }}>
          Follows your device's display settings automatically.
        </p>
      )}
    </div>
  );
}
