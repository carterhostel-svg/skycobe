import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Compass, Heart, Sun, Moon, CalendarCheck, ShieldCheck } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';

export const Header: React.FC = () => {
  const { savedProperties, bookings } = useAppContext();
  const { resolved, toggle } = useTheme();
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] w-full bg-[var(--color-header-bg)] backdrop-blur-md border-b border-[var(--color-border)] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
        
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <NavLink 
            to="/" 
            className="flex items-center gap-2.5 group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-[#ccff00] flex items-center justify-center shadow-sm transition-transform group-hover:scale-105">
              <span className="font-black text-base tracking-tighter text-black">H</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-base font-extrabold tracking-tight text-[var(--color-text-primary)] leading-none">
                  HAVEN
                </span>
                <span className="text-[10px] px-1.5 py-0.5 font-bold uppercase rounded bg-[var(--color-accent-muted)] text-[var(--color-accent)]">
                  Hostels
                </span>
              </div>
              <span className="text-[10px] font-medium tracking-wider text-[var(--color-text-secondary)] uppercase mt-0.5">
                Campus Living
              </span>
            </div>
          </NavLink>
        </div>

        {/* Zone 2: Navigation Links (Strictly Hostel Booking & Finding) */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-semibold text-[var(--color-text-secondary)]">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `whitespace-nowrap transition-colors hover:text-[var(--color-text-primary)] ${
                isActive ? 'text-[var(--color-accent)] font-bold' : ''
              }`
            }
          >
            Find Hostels
          </NavLink>

          <NavLink
            to="/explore"
            className={({ isActive }) =>
              `whitespace-nowrap transition-colors hover:text-[var(--color-text-primary)] ${
                isActive ? 'text-[var(--color-accent)] font-bold' : ''
              }`
            }
          >
            Campus Map
          </NavLink>

          <NavLink
            to="/saved"
            className={({ isActive }) =>
              `relative whitespace-nowrap transition-colors hover:text-[var(--color-text-primary)] ${
                isActive ? 'text-[var(--color-accent)] font-bold' : ''
              }`
            }
          >
            Saved Hostels
            {savedProperties.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-[var(--color-accent-muted)] text-[var(--color-accent)]">
                {savedProperties.length}
              </span>
            )}
          </NavLink>

          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `relative whitespace-nowrap transition-colors hover:text-[var(--color-text-primary)] ${
                isActive ? 'text-[var(--color-accent)] font-bold' : ''
              }`
            }
          >
            My Bookings
            {bookings.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                {bookings.length}
              </span>
            )}
          </NavLink>
        </nav>

        {/* Zone 3: Actions & Theme Toggle */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          
          {/* Quick theme mode toggle */}
          <button
            type="button"
            onClick={toggle}
            className="p-2 rounded-xl text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] transition-colors cursor-pointer"
            title="Toggle color mode"
            aria-label="Toggle color mode"
          >
            {resolved === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Direct Reserve Room Action */}
          <button
            type="button"
            onClick={() => navigate('/explore')}
            className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-xs font-bold text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] transition-colors cursor-pointer shadow-xs"
          >
            <Compass size={14} className="text-[var(--color-accent)]" />
            <span>Map Search</span>
          </button>

          {/* Student Profile Quick Access */}
          <NavLink
            to="/profile"
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-2)] transition-colors cursor-pointer"
            title="Student Profile & Bookings"
          >
            <img
              src="/src/assets/images/student_alex_avatar_1793064702975.jpg"
              alt="Alex Owusu"
              className="w-7 h-7 rounded-full object-cover border border-slate-200 dark:border-slate-700"
            />
            <span className="hidden lg:inline text-xs font-bold text-[var(--color-text-primary)] pr-1">
              Alex
            </span>
          </NavLink>
        </div>

      </div>
    </header>
  );
};