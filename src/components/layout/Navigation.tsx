import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Compass, Heart, User } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

export function Navigation() {
  const { savedProperties, bookings } = useAppContext();

  const navItems = [
    { path: '/', label: 'Home', icon: Home, end: true },
    { path: '/explore', label: 'Explore', icon: Compass },
    { path: '/saved', label: 'Saved', icon: Heart, count: savedProperties.length },
    { path: '/profile', label: 'Profile', icon: User, count: bookings.length },
  ];

  return (
    <div className="fixed bottom-5 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
      {/* ── Mockup-matched Floating Capsule Dock (Pure Borderless Ash) ── */}
      <nav 
        aria-label="Main Navigation"
        className="flex items-center gap-3 sm:gap-4 px-3.5 py-2.5 rounded-full bg-[#1e2126]/95 backdrop-blur-2xl shadow-[0_14px_40px_rgba(0,0,0,0.32)]"
      >
        {navItems.map((item) => (
          <NavLink
            key={item.path + item.label}
            to={item.path}
            end={item.end}
            className={({ isActive }) =>
              `relative transition-all duration-300 flex items-center justify-center cursor-pointer ${
                isActive
                  ? 'w-11 h-11 rounded-full bg-[#ccff00] text-black shadow-md scale-105'
                  : 'w-10 h-10 rounded-full text-slate-300 hover:text-white hover:bg-white/10'
              }`
            }
          >
            {({ isActive }) => (
              <div className="relative flex items-center justify-center">
                <item.icon
                  size={isActive ? 20 : 19}
                  strokeWidth={isActive ? 2.5 : 2}
                  className={isActive ? 'text-black' : 'text-slate-300 group-hover:text-white'}
                />

                {Boolean(!isActive && item.count && item.count > 0) && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-[16px] px-1 flex items-center justify-center text-[10px] font-semibold tabular-nums rounded-full bg-[#ccff00] text-[#111315] shadow-sm">
                    {item.count}
                  </span>
                )}
              </div>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
