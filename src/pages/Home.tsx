import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  SlidersHorizontal, 
  Bell, 
  Sparkles, 
  Compass, 
  ShieldCheck, 
  Zap, 
  Droplets, 
  Filter,
  X,
  Building2,
  CheckCircle2,
  Star,
  Sun,
  Moon
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { ExtendedProperty } from '../data';
import { HostelCard } from '../components/HostelCard';
import { BookingModal } from '../components/BookingModal';

const CATEGORIES = [
  { id: 'all', label: 'All Hostels' },
  { id: 'legon', label: 'Legon' },
  { id: 'ayeduase', label: 'Ayeduase' },
  { id: 'cape-coast', label: 'Cape Coast' },
  { id: 'madina', label: 'Madina' },
];

export const Home: React.FC = () => {
  const { properties, savedProperties, toggleSave, setSelectedPropertyId, showToast } = useAppContext();
  const { resolved, toggle } = useTheme();
  const navigate = useNavigate();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  
  // Advanced filters
  const [maxBudget, setMaxBudget] = useState<number>(9000);
  const [maxWalkingMin, setMaxWalkingMin] = useState<number>(15);
  const [requireGenerator, setRequireGenerator] = useState(false);
  const [requireAc, setRequireAc] = useState(false);
  const [sortBy, setSortBy] = useState<'recommended' | 'price-asc' | 'price-desc' | 'walk-time'>('recommended');

  // Booking Modal State
  const [modalProperty, setModalProperty] = useState<ExtendedProperty | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Cast properties
  const extendedProperties = properties as ExtendedProperty[];

  // Filtered Hostels
  const filteredProperties = useMemo(() => {
    let list = [...extendedProperties];

    // Simple Location Filter
    if (activeCategory === 'legon') {
      list = list.filter((p) => p.loc.toLowerCase().includes('legon'));
    } else if (activeCategory === 'ayeduase') {
      list = list.filter((p) => p.loc.toLowerCase().includes('ayeduase') || p.loc.toLowerCase().includes('knust'));
    } else if (activeCategory === 'cape-coast') {
      list = list.filter((p) => p.loc.toLowerCase().includes('cape coast') || p.loc.toLowerCase().includes('ucc'));
    } else if (activeCategory === 'madina') {
      list = list.filter((p) => p.loc.toLowerCase().includes('madina') || p.loc.toLowerCase().includes('upsa'));
    }

    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.loc.toLowerCase().includes(q)
      );
    }

    // Advanced Budget Filter
    list = list.filter((p) => p.priceNum <= maxBudget);

    // Walking Time Filter
    if (maxWalkingMin < 15) {
      list = list.filter((p) => (p.walkingMin || 6) <= maxWalkingMin);
    }

    // Generator & AC
    if (requireGenerator) {
      list = list.filter((p) => p.tags?.includes('gen'));
    }
    if (requireAc) {
      list = list.filter((p) => p.tags?.includes('ac') || p.roomTiers?.some((t) => t.hasAc));
    }

    // Sorting
    if (sortBy === 'price-asc') {
      list.sort((a, b) => a.priceNum - b.priceNum);
    } else if (sortBy === 'price-desc') {
      list.sort((a, b) => b.priceNum - a.priceNum);
    } else if (sortBy === 'walk-time') {
      list.sort((a, b) => (a.walkingMin || 10) - (b.walkingMin || 10));
    }

    return list;
  }, [
    extendedProperties,
    activeCategory,
    searchQuery,
    maxBudget,
    maxWalkingMin,
    requireGenerator,
    requireAc,
    sortBy,
  ]);

  const handleOpenReserve = (property: ExtendedProperty) => {
    setModalProperty(property);
    setIsModalOpen(true);
  };

  const handleViewDetails = (id: number | string) => {
    setSelectedPropertyId(id);
    navigate('/details');
  };

  return (
    <div className="w-full min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-4 pb-32 flex flex-col gap-6">

        <div className="flex items-center justify-between pt-1">
          <div 
            onClick={() => navigate('/profile')}
            className="flex items-center gap-3.5 cursor-pointer group"
          >
            <div className="relative">
              <img
                src="/src/assets/images/student_alex_avatar_1793064702975.jpg"
                alt="Alex Owusu"
                className="w-12 h-12 rounded-full object-cover transition-opacity group-hover:opacity-90 shadow-sm"
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#ccff00]" />
            </div>
            <div className="flex flex-col">
              <span className="text-[12px] text-[var(--color-text-secondary)] font-normal leading-tight">Hi Alex</span>
              <span className="text-[18px] font-semibold text-[var(--color-text-primary)] tracking-[-0.015em] leading-snug group-hover:opacity-75 transition-opacity">
                Welcome Back
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const nextLabel = resolved === 'dark' ? 'Light theme' : 'Ash theme';
                toggle();
                showToast(`Switched to ${nextLabel}`);
              }}
              className="w-11 h-11 rounded-full bg-[var(--color-surface)] flex items-center justify-center text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] transition-all cursor-pointer shadow-[var(--shadow-widget-val)]"
              aria-label={resolved === 'dark' ? 'Switch to Light theme' : 'Switch to Ash theme'}
              title={resolved === 'dark' ? 'Switch to Light theme' : 'Switch to Ash theme'}
            >
              {resolved === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="relative w-11 h-11 rounded-full bg-[var(--color-surface)] flex items-center justify-center text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] transition-all cursor-pointer shadow-[var(--shadow-widget-val)]"
              aria-label="Notifications"
            >
              <Bell size={18} className="text-[var(--color-text-primary)]" />
              <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 rounded-full bg-[#f43f5e]" />
            </button>
          </div>
        </div>

        <div className="relative flex items-center gap-3">
          <div className="flex-1 flex items-center gap-3 px-5 py-3.5 rounded-full bg-[var(--color-surface)] focus-within:bg-[var(--color-elevated)] transition-all shadow-[var(--shadow-widget-val)]">
            <Search size={19} className="text-[var(--color-text-secondary)] shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search hostels, university or area..."
              className="w-full bg-transparent text-[15px] text-[var(--color-text-primary)] placeholder-[var(--color-text-disabled)] outline-none font-normal"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] p-1 text-[13px] cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setShowFilterDrawer(!showFilterDrawer)}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0 ${
              showFilterDrawer
                ? 'bg-[#ccff00] text-[#111315] shadow-md'
                : 'bg-[var(--color-surface)] text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] shadow-[var(--shadow-widget-val)]'
            }`}
            aria-label="Filter Options"
          >
            <SlidersHorizontal size={18} />
          </button>
        </div>

        {showFilterDrawer && (
          <div className="p-6 rounded-[2rem] bg-[var(--color-surface)] animate-fadeIn flex flex-col gap-5 shadow-[var(--shadow-card-val)]">
            <div className="flex items-center justify-between">
              <span className="text-[15px] font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
                <Filter size={15} className="text-[var(--color-text-primary)]" />
                <span>Refine Search & Rates</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  setMaxBudget(9000);
                  setMaxWalkingMin(15);
                  setRequireGenerator(false);
                  setRequireAc(false);
                }}
                className="text-[13px] font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition cursor-pointer"
              >
                Reset All
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-[14px]">
                  <span className="text-[var(--color-text-secondary)] font-normal">Max Budget</span>
                  <span className="text-[15px] text-[var(--color-text-primary)] font-semibold tabular-nums">GH₵ {maxBudget.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="2000"
                  max="12000"
                  step="500"
                  value={maxBudget}
                  onChange={(e) => setMaxBudget(Number(e.target.value))}
                  className="w-full accent-[#181b1f] cursor-pointer"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-[14px]">
                  <span className="text-[var(--color-text-secondary)] font-normal">Max Walk</span>
                  <span className="text-[15px] text-[var(--color-text-primary)] font-semibold tabular-nums">{maxWalkingMin} mins</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="20"
                  step="1"
                  value={maxWalkingMin}
                  onChange={(e) => setMaxWalkingMin(Number(e.target.value))}
                  className="w-full accent-[#181b1f] cursor-pointer"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-1">
              <button
                type="button"
                onClick={() => setRequireGenerator(!requireGenerator)}
                className={`relative py-2 text-[15px] transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                  requireGenerator
                    ? 'text-[var(--color-text-primary)] font-semibold'
                    : 'text-[var(--color-text-secondary)] font-normal hover:text-[var(--color-text-primary)]'
                }`}
              >
                <Zap size={15} />
                <span>Standby Generator</span>
                {requireGenerator && (
                  <span className="absolute bottom-0 left-0 right-0 h-[3px] rounded-full bg-[var(--color-accent-bar)]" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setRequireAc(!requireAc)}
                className={`relative py-2 text-[15px] transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                  requireAc
                    ? 'text-[var(--color-text-primary)] font-semibold'
                    : 'text-[var(--color-text-secondary)] font-normal hover:text-[var(--color-text-primary)]'
                }`}
              >
                <span>Air Conditioned</span>
                {requireAc && (
                  <span className="absolute bottom-0 left-0 right-0 h-[3px] rounded-full bg-[var(--color-accent-bar)]" />
                )}
              </button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="flex items-center gap-6 sm:gap-8 pb-1">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`relative py-2.5 text-[16px] sm:text-[17px] whitespace-nowrap shrink-0 transition-colors duration-200 cursor-pointer flex items-center ${
                    isActive
                      ? 'text-[var(--color-text-primary)] font-semibold'
                      : 'text-[var(--color-text-secondary)] font-normal hover:text-[var(--color-text-primary)]'
                  }`}
                >
                  <span>{cat.label}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[3px] rounded-full bg-[var(--color-accent-bar)]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div id="popular-hostels-section" className="flex items-center justify-between pt-2">
          <div className="flex items-baseline gap-2">
            <h2 className="text-[20px] sm:text-[22px] font-semibold text-[var(--color-text-primary)] tracking-[-0.015em]">
              Popular Hostels
            </h2>
            <span className="text-[13px] font-medium text-[var(--color-text-secondary)] tabular-nums">
              ({filteredProperties.length})
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              setActiveCategory('all');
              setSearchQuery('');
            }}
            className="text-[13px] sm:text-[14px] font-semibold text-[var(--color-text-primary)] hover:underline cursor-pointer"
          >
            View All
          </button>
        </div>

        {filteredProperties.length === 0 ? (
          <div className="py-16 text-center rounded-[2.5rem] bg-[var(--color-surface)] p-8 flex flex-col items-center shadow-[var(--shadow-card-val)]">
            <Building2 size={40} className="text-[var(--color-text-secondary)] mb-3" />
            <h3 className="text-[18px] font-semibold text-[var(--color-text-primary)]">No hostels matched your filters</h3>
            <p className="text-[14px] text-[var(--color-text-secondary)] max-w-sm mt-1">
              Try expanding your search query, increasing your budget, or clearing university filter.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('all');
                setMaxBudget(9000);
                setMaxWalkingMin(15);
              }}
              className="mt-4 px-5 py-2.5 rounded-full bg-[#ccff00] hover:bg-[#b8e600] text-[#111315] font-semibold text-[13px] cursor-pointer shadow-md"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-8 sm:gap-10">
            {filteredProperties.map((property, idx) => (
              <HostelCard
                key={property.id}
                property={property}
                featured={idx === 0}
                isSaved={savedProperties.includes(property.id)}
                onToggleSave={toggleSave}
                onReserve={handleOpenReserve}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        )}

      </div>

      {/* ── DIRECT BOOKING MODAL ────────────────────────────────────────── */}
      {isModalOpen && modalProperty && (
        <BookingModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          property={modalProperty}
        />
      )}
    </div>
  );
};
