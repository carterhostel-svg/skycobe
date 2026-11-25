import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapContainer,
  TileLayer,
  Marker,
  Circle,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import {
  Search,
  SlidersHorizontal,
  Plus,
  Minus,
  LocateFixed,
  List,
  X,
  ChevronLeft,
  ChevronRight,
  Heart,
  Layers,
  Footprints,
  Sun,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Building2,
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { ExtendedProperty } from '../data';
import { BookingModal } from '../components/BookingModal';
import { formatPrice } from '../lib/formatPrice';
import { formatSimpleLocation } from '../components/HostelCard';
import {
  CAMPUS_OPTIONS,
  CAMPUS_LANDMARKS,
  CampusKey,
  MapLandmark,
  createHostelPricePin,
  createLandmarkTeardropIcon,
} from '../lib/mapConfig';

const CARTO_VOYAGER_URL =
  'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
const OSM_FALLBACK_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

// Bridges React state and Leaflet imperatively without fighting user drag/zoom
const MapBridge: React.FC<{
  center: [number, number];
  zoom: number;
  flyNonce: number;
  mapRef: React.MutableRefObject<L.Map | null>;
}> = ({ center, zoom, flyNonce, mapRef }) => {
  const map = useMap();

  useEffect(() => {
    mapRef.current = map;
  }, [map, mapRef]);

  useEffect(() => {
    if (flyNonce === 0) return;
    map.flyTo(center, zoom, { duration: 0.9, easeLinearity: 0.25 });
  }, [flyNonce, center, zoom, map]);

  // Ensure Leaflet recalculates tile bounds cleanly when sidebar or viewport resizes
  useEffect(() => {
    const timer = window.setTimeout(() => {
      map.invalidateSize();
    }, 180);
    return () => window.clearTimeout(timer);
  }, [map]);

  return null;
};

export const Explore: React.FC = () => {
  const {
    properties,
    savedProperties,
    toggleSave,
    setSelectedPropertyId,
    showToast,
  } = useAppContext();
  const { resolved, toggle: toggleTheme } = useTheme();
  const navigate = useNavigate();

  const extendedProperties = properties as ExtendedProperty[];

  // Map viewport & layers state
  const [selectedCampus, setSelectedCampus] = useState<CampusKey>('all');
  const [mapCenter, setMapCenter] = useState<[number, number]>(
    CAMPUS_OPTIONS[0].center
  );
  const [mapZoom, setMapZoom] = useState<number>(CAMPUS_OPTIONS[0].zoom);
  const [flyNonce, setFlyNonce] = useState(0);
  const [useFallbackTiles, setUseFallbackTiles] = useState(false);
  const tileErrorCountRef = useRef(0);
  const mapRef = useRef<L.Map | null>(null);

  // Layer & UI visibility state
  const [showLandmarks, setShowLandmarks] = useState(true);
  const [showWalkRings, setShowWalkRings] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileListOpen, setIsMobileListOpen] = useState(false);
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  // Filter & selection state
  const [searchQuery, setSearchQuery] = useState('');
  const [maxBudget, setMaxBudget] = useState<number>(9500);
  const [maxWalkMin, setMaxWalkMin] = useState<number>(15);
  const [selectedHostelId, setSelectedHostelId] = useState<number | string>(
    extendedProperties[0]?.id ?? 1
  );
  const [activeLandmark, setActiveLandmark] = useState<MapLandmark | null>(null);

  // Booking modal state
  const [bookingHostel, setBookingHostel] = useState<ExtendedProperty | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Filter hostels by campus, budget, walking distance, and search query
  const visibleHostels = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return extendedProperties.filter((p) => {
      const loc = p.loc.toLowerCase();
      const name = p.name.toLowerCase();

      const matchesCampus =
        selectedCampus === 'all' ||
        (selectedCampus === 'ug' &&
          (loc.includes('legon') || loc.includes('atomic'))) ||
        (selectedCampus === 'upsa' &&
          (loc.includes('upsa') || loc.includes('madina'))) ||
        (selectedCampus === 'knust' &&
          (loc.includes('knust') ||
            loc.includes('kumasi') ||
            loc.includes('ayeduase'))) ||
        (selectedCampus === 'ucc' &&
          (loc.includes('ucc') || loc.includes('cape coast')));

      const matchesSearch =
        !q || name.includes(q) || loc.includes(q);

      const matchesBudget = p.priceNum <= maxBudget;
      const matchesWalk =
        maxWalkMin >= 15 || (p.walkingMin ?? 6) <= maxWalkMin;

      return matchesCampus && matchesSearch && matchesBudget && matchesWalk;
    });
  }, [extendedProperties, selectedCampus, searchQuery, maxBudget, maxWalkMin]);

  // Visible campus teardrop POIs
  const visibleLandmarks = useMemo(() => {
    if (!showLandmarks) return [];
    if (selectedCampus === 'all') {
      return CAMPUS_LANDMARKS.filter(
        (lm) => lm.campus === 'ug' || lm.campus === 'upsa'
      );
    }
    return CAMPUS_LANDMARKS.filter((lm) => lm.campus === selectedCampus);
  }, [showLandmarks, selectedCampus]);

  const selectedHostel = useMemo(() => {
    return (
      visibleHostels.find((p) => p.id === selectedHostelId) ||
      visibleHostels[0] ||
      extendedProperties.find((p) => p.id === selectedHostelId) ||
      null
    );
  }, [visibleHostels, selectedHostelId, extendedProperties]);

  const currentCampusConfig =
    CAMPUS_OPTIONS.find((c) => c.id === selectedCampus) || CAMPUS_OPTIONS[0];

  // Center coordinates used for subtle walking radius rings
  const ringCenters = useMemo(() => {
    if (selectedCampus === 'all') {
      return [
        CAMPUS_OPTIONS.find((c) => c.id === 'ug')!.center,
        CAMPUS_OPTIONS.find((c) => c.id === 'upsa')!.center,
      ];
    }
    return [currentCampusConfig.center];
  }, [selectedCampus, currentCampusConfig]);

  const handleCampusChange = (campusKey: CampusKey) => {
    setSelectedCampus(campusKey);
    setActiveLandmark(null);
    const target =
      CAMPUS_OPTIONS.find((c) => c.id === campusKey) || CAMPUS_OPTIONS[0];
    setMapCenter(target.center);
    setMapZoom(target.zoom);
    setFlyNonce((n) => n + 1);

    const match = extendedProperties.find((p) => {
      if (campusKey === 'all') return true;
      const loc = p.loc.toLowerCase();
      if (campusKey === 'ug') return loc.includes('legon');
      if (campusKey === 'upsa') return loc.includes('madina') || loc.includes('upsa');
      if (campusKey === 'knust') return loc.includes('ayeduase') || loc.includes('knust');
      if (campusKey === 'ucc') return loc.includes('cape coast') || loc.includes('ucc');
      return true;
    });
    if (match) setSelectedHostelId(match.id);
  };

  const handleSelectHostel = (
    property: ExtendedProperty,
    zoomLevel = 16
  ) => {
    setActiveLandmark(null);
    setSelectedHostelId(property.id);
    setMapCenter([property.lat, property.lng]);
    setMapZoom(zoomLevel);
    setFlyNonce((n) => n + 1);

    const cardEl = cardRefs.current[String(property.id)];
    cardEl?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  const handleSelectLandmark = (landmark: MapLandmark) => {
    setActiveLandmark(landmark);
    setMapCenter([landmark.lat, landmark.lng]);
    setMapZoom(16);
    setFlyNonce((n) => n + 1);
  };

  const handleCycleHostel = (dir: -1 | 1) => {
    if (visibleHostels.length === 0) return;
    const currentIndex = visibleHostels.findIndex(
      (h) => h.id === selectedHostel?.id
    );
    const nextIndex =
      currentIndex === -1
        ? 0
        : (currentIndex + dir + visibleHostels.length) % visibleHostels.length;
    handleSelectHostel(visibleHostels[nextIndex], 15);
  };

  const handleZoomIn = () => mapRef.current?.zoomIn();
  const handleZoomOut = () => mapRef.current?.zoomOut();

  const handleRecenter = () => {
    setActiveLandmark(null);
    setMapCenter(currentCampusConfig.center);
    setMapZoom(currentCampusConfig.zoom);
    setFlyNonce((n) => n + 1);
  };

  const handleOpenBooking = (property: ExtendedProperty) => {
    setBookingHostel(property);
    setIsBookingOpen(true);
  };

  const handleOpenDetails = (id: number | string) => {
    setSelectedPropertyId(id);
    navigate('/details');
  };

  // Update map viewport cleanly when sidebar toggles
  useEffect(() => {
    const timer = window.setTimeout(() => {
      mapRef.current?.invalidateSize();
    }, 240);
    return () => window.clearTimeout(timer);
  }, [isSidebarOpen]);

  return (
    <div className="relative w-full h-dvh overflow-hidden bg-[#f1f3f4] select-none">
      {/* ── 1. FULL-BLEED INTERACTIVE DAYLIGHT MAP CANVAS ─────────────────── */}
      <div className="absolute inset-0 z-0 isolate">
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          zoomControl={false}
          className="w-full h-full skycobe-map-container"
        >
          <MapBridge
            center={mapCenter}
            zoom={mapZoom}
            flyNonce={flyNonce}
            mapRef={mapRef}
          />

          <TileLayer
            key={useFallbackTiles ? 'osm-fallback' : 'carto-voyager'}
            url={useFallbackTiles ? OSM_FALLBACK_URL : CARTO_VOYAGER_URL}
            className={
              useFallbackTiles
                ? 'skycobe-osm-fallback'
                : 'skycobe-daylight-tiles'
            }
            attribution={
              useFallbackTiles
                ? '&copy; OpenStreetMap'
                : '&copy; OpenStreetMap &copy; CARTO'
            }
            eventHandlers={{
              tileerror: () => {
                tileErrorCountRef.current += 1;
                if (tileErrorCountRef.current >= 3 && !useFallbackTiles) {
                  setUseFallbackTiles(true);
                }
              },
            }}
          />

          {/* Subtle Campus Walking Proximity Rings */}
          {showWalkRings &&
            ringCenters.map((centerCoord, idx) => (
              <React.Fragment key={`ring-${idx}`}>
                <Circle
                  center={centerCoord}
                  radius={500}
                  pathOptions={{
                    color: '#5f7d9e',
                    fillColor: '#7c98be',
                    fillOpacity: 0.045,
                    weight: 1.25,
                    dashArray: '4, 5',
                  }}
                />
                <Circle
                  center={centerCoord}
                  radius={1000}
                  pathOptions={{
                    color: '#94a3b8',
                    fillColor: '#94a3b8',
                    fillOpacity: 0.02,
                    weight: 1,
                    dashArray: '6, 6',
                  }}
                />
              </React.Fragment>
            ))}

          {/* Screenshot-Matched Colored Teardrop POI Landmarks */}
          {visibleLandmarks.map((landmark) => {
            const isActive = activeLandmark?.id === landmark.id;
            return (
              <Marker
                key={landmark.id}
                position={[landmark.lat, landmark.lng]}
                icon={createLandmarkTeardropIcon(landmark, isActive)}
                zIndexOffset={isActive ? 750 : 250}
                eventHandlers={{
                  click: () => handleSelectLandmark(landmark),
                }}
              />
            );
          })}

          {/* Crisp Price Capsule Markers for Hostels */}
          {visibleHostels.map((property) => {
            const isSelected = selectedHostel?.id === property.id;
            return (
              <Marker
                key={property.id}
                position={[property.lat, property.lng]}
                icon={createHostelPricePin(property.priceNum, isSelected)}
                zIndexOffset={isSelected ? 1000 : 500}
                eventHandlers={{
                  click: () => handleSelectHostel(property, 16),
                }}
              />
            );
          })}
        </MapContainer>
      </div>

      {/* ── 2. DESKTOP FLOATING SIDEBAR EXPLORER (lg+) ────────────────────── */}
      {isSidebarOpen ? (
        <aside className="hidden lg:flex flex-col absolute top-4 left-4 bottom-5 w-[356px] xl:w-[392px] z-20 rounded-[28px] bg-[var(--color-surface)]/95 backdrop-blur-xl shadow-[0_18px_48px_rgba(17,19,21,0.14)] overflow-hidden">
          {/* Header & Controls */}
          <div className="p-4 pb-3 space-y-3 shrink-0">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <h1 className="text-[18px] font-semibold text-[var(--color-text-primary)] tracking-[-0.015em] leading-tight">
                  Campus Map
                </h1>
                <p className="text-[12px] text-[var(--color-text-secondary)] truncate mt-0.5 tabular-nums">
                  {visibleHostels.length} verified hostels · {currentCampusConfig.label}
                </p>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    const nextLabel =
                      resolved === 'dark' ? 'Light theme' : 'Ash theme';
                    toggleTheme();
                    showToast(`Switched to ${nextLabel}`);
                  }}
                  aria-label="Toggle theme"
                  className="w-9 h-9 rounded-full bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text-primary)] flex items-center justify-center transition cursor-pointer"
                >
                  {resolved === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                </button>
                <button
                  type="button"
                  onClick={() => setIsSidebarOpen(false)}
                  aria-label="Collapse hostel panel"
                  title="Expand full map"
                  className="w-9 h-9 rounded-full bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text-primary)] flex items-center justify-center transition cursor-pointer"
                >
                  <PanelLeftClose size={16} />
                </button>
              </div>
            </div>

            {/* Search & Quick Filter Trigger */}
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center gap-2.5 px-3.5 py-2.5 rounded-full bg-[var(--color-surface-2)]">
                <Search
                  size={15}
                  className="text-[var(--color-text-secondary)] shrink-0"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search hostel or area..."
                  className="w-full bg-transparent text-[13px] text-[var(--color-text-primary)] placeholder-[var(--color-text-disabled)] outline-none"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear search"
                    className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => setShowFilterPanel((v) => !v)}
                aria-label="Filter hostels"
                className={`w-10 h-10 rounded-full flex items-center justify-center transition cursor-pointer shrink-0 ${
                  showFilterPanel
                    ? 'bg-[#ccff00] text-[#111315] shadow-sm'
                    : 'bg-[var(--color-surface-2)] text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)]'
                }`}
              >
                <SlidersHorizontal size={16} />
              </button>
            </div>

            {/* Unboxed Horizontal Campus Filter Tabs */}
            <div className="overflow-x-auto scrollbar-hide -mx-1 px-1">
              <div className="flex items-center gap-5">
                {CAMPUS_OPTIONS.map((campus) => {
                  const isActive = selectedCampus === campus.id;
                  return (
                    <button
                      key={campus.id}
                      type="button"
                      onClick={() => handleCampusChange(campus.id)}
                      className={`relative py-2 text-[14px] whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                        isActive
                          ? 'text-[var(--color-text-primary)] font-semibold'
                          : 'text-[var(--color-text-secondary)] font-normal hover:text-[var(--color-text-primary)]'
                      }`}
                    >
                      <span>{campus.label}</span>
                      {isActive && (
                        <span className="absolute bottom-0 left-0 right-0 h-[3px] rounded-full bg-[var(--color-accent-bar)]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Expandable Inline Filters */}
            {showFilterPanel && (
              <div className="p-3.5 rounded-2xl bg-[var(--color-surface-2)] space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-[12px]">
                    <span className="text-[var(--color-text-secondary)]">
                      Max Semester Rate
                    </span>
                    <span className="font-semibold text-[var(--color-text-primary)] tabular-nums">
                      GH₵ {maxBudget.toLocaleString()}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={2500}
                    max={9500}
                    step={500}
                    value={maxBudget}
                    onChange={(e) => setMaxBudget(Number(e.target.value))}
                    className="w-full accent-[#181b1f] cursor-pointer"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-[12px]">
                    <span className="text-[var(--color-text-secondary)]">
                      Max Walk to Campus
                    </span>
                    <span className="font-semibold text-[var(--color-text-primary)] tabular-nums">
                      {maxWalkMin >= 15 ? 'Any' : `${maxWalkMin} mins`}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={3}
                    max={15}
                    step={1}
                    value={maxWalkMin}
                    onChange={(e) => setMaxWalkMin(Number(e.target.value))}
                    className="w-full accent-[#181b1f] cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Scrollable Hostel Feed */}
          <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-2.5">
            {visibleHostels.length === 0 ? (
              <div className="py-12 px-4 text-center flex flex-col items-center">
                <Building2
                  size={32}
                  className="text-[var(--color-text-secondary)] mb-2.5"
                />
                <p className="text-[14px] font-semibold text-[var(--color-text-primary)]">
                  No hostels match these filters
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCampus('all');
                    setSearchQuery('');
                    setMaxBudget(9500);
                    setMaxWalkMin(15);
                  }}
                  className="mt-3 px-4 py-2 rounded-full bg-[#ccff00] text-[#111315] text-[12px] font-semibold cursor-pointer"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              visibleHostels.map((property) => {
                const isSelected = selectedHostel?.id === property.id;
                const isSaved = savedProperties.includes(property.id);
                return (
                  <div
                    key={property.id}
                    ref={(el) => {
                      cardRefs.current[String(property.id)] = el;
                    }}
                    onClick={() => handleSelectHostel(property, 16)}
                    className={`p-3 rounded-[20px] transition-all cursor-pointer flex gap-3 ${
                      isSelected
                        ? 'bg-[var(--color-island-bg)] text-white shadow-md'
                        : 'bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text-primary)]'
                    }`}
                  >
                    <div className="relative w-20 h-20 rounded-2xl overflow-hidden shrink-0 bg-[#1e2126]">
                      <img
                        src={property.img}
                        alt={property.name}
                        className="w-full h-full object-cover object-center"
                      />
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h3
                            className={`text-[14px] font-semibold leading-snug line-clamp-1 ${
                              isSelected
                                ? 'text-white'
                                : 'text-[var(--color-text-primary)]'
                            }`}
                          >
                            {property.name}
                          </h3>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSave(property.id);
                            }}
                            aria-label="Save hostel"
                            className="shrink-0 p-1 -m-1 cursor-pointer"
                          >
                            <Heart
                              size={15}
                              className={
                                isSaved
                                  ? 'fill-rose-500 text-rose-500'
                                  : isSelected
                                  ? 'text-slate-300'
                                  : 'text-[var(--color-text-secondary)]'
                              }
                            />
                          </button>
                        </div>
                        <p
                          className={`text-[12px] truncate mt-0.5 tabular-nums ${
                            isSelected
                              ? 'text-slate-300'
                              : 'text-[var(--color-text-secondary)]'
                          }`}
                        >
                          {formatSimpleLocation(property.loc)} ·{' '}
                          {property.walkingMin || 5} min walk
                        </p>
                      </div>

                      <div className="flex items-center justify-between gap-2 mt-2">
                        <span
                          className={`text-[14px] font-semibold tabular-nums ${
                            isSelected
                              ? 'text-[#ccff00]'
                              : 'text-[var(--color-text-primary)]'
                          }`}
                        >
                          {formatPrice(property.priceNum, '/sem')}
                        </span>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenDetails(property.id);
                            }}
                            className={`px-2.5 py-1.5 rounded-full text-[11px] font-semibold transition cursor-pointer whitespace-nowrap ${
                              isSelected
                                ? 'bg-white/10 text-white hover:bg-white/20'
                                : 'bg-[var(--color-surface)] text-[var(--color-text-primary)] hover:opacity-85'
                            }`}
                          >
                            Details
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenBooking(property);
                            }}
                            className="px-3 py-1.5 rounded-full bg-[#ccff00] hover:bg-[#b8e600] text-[#111315] text-[11px] font-semibold transition cursor-pointer whitespace-nowrap"
                          >
                            Book
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </aside>
      ) : (
        <button
          type="button"
          onClick={() => setIsSidebarOpen(true)}
          aria-label="Open hostel list"
          className="hidden lg:flex items-center gap-2 absolute top-4 left-4 z-20 px-4 py-2.5 rounded-full bg-white/95 backdrop-blur-md text-[#111315] text-[13px] font-semibold shadow-[0_6px_20px_rgba(17,19,21,0.14)] hover:bg-white transition cursor-pointer"
        >
          <PanelLeftOpen size={16} />
          <span>Hostels ({visibleHostels.length})</span>
        </button>
      )}

      {/* ── 3. MOBILE TOP FLOATING SEARCH & CAMPUS STRIP (< lg) ───────────── */}
      <div className="lg:hidden absolute top-3 left-3 right-3 z-20 flex flex-col gap-2 pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="flex-1 flex items-center gap-2.5 px-4 h-11 rounded-full bg-white/95 backdrop-blur-md shadow-[0_6px_22px_rgba(17,19,21,0.14)]">
            <Search size={16} className="text-[#5f6368] shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search campus or hostel..."
              className="w-full bg-transparent text-[14px] text-[#111315] placeholder-[#6b7280] outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
                className="text-[#5f6368] p-1 cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsMobileListOpen(true)}
            className="h-11 px-4 rounded-full bg-[#111315] text-white text-[13px] font-semibold shadow-[0_6px_22px_rgba(17,19,21,0.2)] flex items-center gap-1.5 shrink-0 cursor-pointer whitespace-nowrap"
          >
            <List size={15} className="text-[#ccff00]" />
            <span className="tabular-nums">List ({visibleHostels.length})</span>
          </button>
        </div>

        {/* Mobile Unboxed Campus Selector Strip */}
        <div className="pointer-events-auto overflow-x-auto scrollbar-hide rounded-2xl bg-white/90 backdrop-blur-md px-3.5 shadow-[0_4px_16px_rgba(17,19,21,0.08)]">
          <div className="flex items-center gap-5">
            {CAMPUS_OPTIONS.map((campus) => {
              const isActive = selectedCampus === campus.id;
              return (
                <button
                  key={campus.id}
                  type="button"
                  onClick={() => handleCampusChange(campus.id)}
                  className={`relative py-2.5 text-[14px] whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                    isActive
                      ? 'text-[#111315] font-semibold'
                      : 'text-[#5f6368] font-normal'
                  }`}
                >
                  <span>{campus.label}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[3px] rounded-full bg-[#a8d800]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── 4. TOP-RIGHT / RIGHT-EDGE GOOGLE-STYLE MAP CONTROLS ────────────── */}
      <div className="absolute right-3 sm:right-4 top-28 lg:top-4 z-20 flex flex-col items-end gap-2">
        {/* Layer & Ring Toggles */}
        <div className="flex items-center gap-1.5 p-1 rounded-full bg-white/95 backdrop-blur-md shadow-[0_6px_20px_rgba(17,19,21,0.14)]">
          <button
            type="button"
            onClick={() => setShowLandmarks((v) => !v)}
            title={showLandmarks ? 'Hide campus landmarks' : 'Show campus landmarks'}
            aria-label="Toggle campus landmarks"
            className={`h-9 px-3 rounded-full text-[12px] font-semibold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
              showLandmarks
                ? 'bg-[#111315] text-white'
                : 'text-[#3c4043] hover:bg-[#f1f3f4]'
            }`}
          >
            <Layers size={14} className={showLandmarks ? 'text-[#ccff00]' : ''} />
            <span className="hidden sm:inline">Places</span>
          </button>

          <button
            type="button"
            onClick={() => setShowWalkRings((v) => !v)}
            title={showWalkRings ? 'Hide walking distance rings' : 'Show walking distance rings'}
            aria-label="Toggle walking distance rings"
            className={`h-9 px-3 rounded-full text-[12px] font-semibold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
              showWalkRings
                ? 'bg-[#111315] text-white'
                : 'text-[#3c4043] hover:bg-[#f1f3f4]'
            }`}
          >
            <Footprints
              size={14}
              className={showWalkRings ? 'text-[#ccff00]' : ''}
            />
            <span className="hidden sm:inline">Walk Zone</span>
          </button>
        </div>

        {/* Compact Zoom Stack + Recenter */}
        <div className="flex flex-col rounded-2xl bg-white/95 backdrop-blur-md shadow-[0_6px_20px_rgba(17,19,21,0.14)] overflow-hidden">
          <button
            type="button"
            onClick={handleZoomIn}
            aria-label="Zoom in"
            className="w-11 h-11 flex items-center justify-center text-[#3c4043] hover:bg-[#f1f3f4] transition cursor-pointer"
          >
            <Plus size={18} />
          </button>
          <div className="h-px bg-black/5 mx-2" />
          <button
            type="button"
            onClick={handleZoomOut}
            aria-label="Zoom out"
            className="w-11 h-11 flex items-center justify-center text-[#3c4043] hover:bg-[#f1f3f4] transition cursor-pointer"
          >
            <Minus size={18} />
          </button>
          <div className="h-px bg-black/5 mx-2" />
          <button
            type="button"
            onClick={handleRecenter}
            aria-label="Recenter campus view"
            title="Recenter map"
            className="w-11 h-11 flex items-center justify-center text-[#1a73e8] hover:bg-[#f1f3f4] transition cursor-pointer"
          >
            <LocateFixed size={17} />
          </button>
        </div>
      </div>

      {/* ── 5. ACTIVE LANDMARK INFO PILL (IF CLICKED) ──────────────────────── */}
      {activeLandmark && (
        <div className="hidden lg:flex items-center justify-between gap-3 absolute bottom-5 right-5 z-20 w-[330px] rounded-[24px] bg-white/96 backdrop-blur-xl p-4 shadow-[0_14px_38px_rgba(17,19,21,0.18)]">
          <div className="min-w-0">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-[#5f6368]">
              {activeLandmark.category}
            </span>
            <h3 className="text-[15px] font-semibold text-[#111315] truncate">
              {activeLandmark.name}
            </h3>
            <p className="text-[12px] text-[#5f6368] truncate">
              {activeLandmark.subtitle}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setActiveLandmark(null)}
            aria-label="Close landmark info"
            className="w-8 h-8 rounded-full bg-[#f1f3f4] text-[#111315] flex items-center justify-center shrink-0 cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* ── 6. DESKTOP BOTTOM-RIGHT SPOTLIGHT CARD (CLEARS NAV DOCK) ────────── */}
      {!activeLandmark && selectedHostel && (
        <div className="hidden lg:flex items-center justify-between gap-3 absolute bottom-5 right-5 z-20 w-[336px] rounded-[24px] bg-[#181b1f]/96 backdrop-blur-xl p-3.5 shadow-[0_16px_42px_rgba(17,19,21,0.28)]">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={selectedHostel.img}
              alt={selectedHostel.name}
              className="w-12 h-12 rounded-2xl object-cover shrink-0"
            />
            <div className="min-w-0">
              <span className="text-[11px] text-slate-300 block truncate tabular-nums">
                {formatSimpleLocation(selectedHostel.loc)} ·{' '}
                {selectedHostel.walkingMin || 5}m walk
              </span>
              <h4 className="text-[14px] font-semibold text-white truncate">
                {selectedHostel.name}
              </h4>
              <span className="text-[13px] font-semibold text-[#ccff00] tabular-nums">
                {formatPrice(selectedHostel.priceNum, '/sem')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => handleOpenDetails(selectedHostel.id)}
              className="px-3 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-[12px] font-semibold transition cursor-pointer"
            >
              View
            </button>
            <button
              type="button"
              onClick={() => handleOpenBooking(selectedHostel)}
              className="px-3.5 py-2 rounded-full bg-[#ccff00] hover:bg-[#b8e600] text-[#111315] text-[12px] font-semibold transition cursor-pointer"
            >
              Book
            </button>
          </div>
        </div>
      )}

      {/* ── 7. MOBILE BOTTOM PEEK CARD (SITS CLEANLY ABOVE NAV DOCK) ────────── */}
      {activeLandmark ? (
        <div className="lg:hidden absolute bottom-[88px] left-3 right-3 z-20">
          <div className="rounded-[24px] bg-white/96 backdrop-blur-xl p-4 shadow-[0_14px_36px_rgba(17,19,21,0.2)] flex items-center justify-between gap-3">
            <div className="min-w-0">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-[#5f6368]">
                {activeLandmark.category}
              </span>
              <h4 className="text-[15px] font-semibold text-[#111315] truncate">
                {activeLandmark.name}
              </h4>
              <p className="text-[12px] text-[#5f6368] truncate">
                {activeLandmark.subtitle}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveLandmark(null)}
              aria-label="Close landmark info"
              className="w-10 h-10 rounded-full bg-[#f1f3f4] text-[#111315] flex items-center justify-center shrink-0 cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      ) : selectedHostel ? (
        <div className="lg:hidden absolute bottom-[88px] left-3 right-3 z-20">
          <div className="rounded-[24px] bg-[#181b1f]/96 backdrop-blur-xl p-3.5 shadow-[0_14px_36px_rgba(17,19,21,0.28)] flex items-center justify-between gap-2.5">
            {visibleHostels.length > 1 && (
              <button
                type="button"
                onClick={() => handleCycleHostel(-1)}
                aria-label="Previous hostel"
                className="w-9 h-9 rounded-full bg-white/10 text-white flex items-center justify-center shrink-0 cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>
            )}

            <div
              onClick={() => handleOpenDetails(selectedHostel.id)}
              className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
            >
              <img
                src={selectedHostel.img}
                alt={selectedHostel.name}
                className="w-12 h-12 rounded-2xl object-cover shrink-0"
              />
              <div className="min-w-0">
                <span className="text-[11px] text-slate-300 block truncate tabular-nums">
                  {formatSimpleLocation(selectedHostel.loc)} ·{' '}
                  {selectedHostel.walkingMin || 5} min walk
                </span>
                <h4 className="text-[14px] font-semibold text-white truncate">
                  {selectedHostel.name}
                </h4>
                <span className="text-[13px] font-semibold text-[#ccff00] tabular-nums">
                  {formatPrice(selectedHostel.priceNum, '/sem')}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => handleOpenBooking(selectedHostel)}
                className="px-4 py-2.5 rounded-full bg-[#ccff00] hover:bg-[#b8e600] text-[#111315] text-[12px] font-semibold transition cursor-pointer whitespace-nowrap"
              >
                Book
              </button>
              {visibleHostels.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleCycleHostel(1)}
                  aria-label="Next hostel"
                  className="w-9 h-9 rounded-full bg-white/10 text-white flex items-center justify-center shrink-0 cursor-pointer"
                >
                  <ChevronRight size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {/* ── 8. MOBILE EXPANDABLE HOSTEL LIST SHEET ─────────────────────────── */}
      {isMobileListOpen && (
        <div className="lg:hidden fixed inset-0 z-[60] flex flex-col justify-end bg-black/45 backdrop-blur-[2px]">
          <div
            className="flex-1"
            onClick={() => setIsMobileListOpen(false)}
          />
          <div className="bg-[var(--color-surface)] rounded-t-[28px] max-h-[82dvh] flex flex-col shadow-[0_-12px_40px_rgba(0,0,0,0.22)]">
            <div className="pt-3 pb-2 px-5 flex items-center justify-between shrink-0">
              <div className="flex flex-col">
                <h2 className="text-[17px] font-semibold text-[var(--color-text-primary)]">
                  Hostels near {currentCampusConfig.label}
                </h2>
                <span className="text-[12px] text-[var(--color-text-secondary)] tabular-nums">
                  {visibleHostels.length} results
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileListOpen(false)}
                aria-label="Close list"
                className="w-9 h-9 rounded-full bg-[var(--color-surface-2)] text-[var(--color-text-primary)] flex items-center justify-center cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-4 pb-24 overflow-y-auto space-y-2.5">
              {visibleHostels.map((property) => {
                const isSelected = selectedHostel?.id === property.id;
                return (
                  <div
                    key={property.id}
                    onClick={() => {
                      handleSelectHostel(property, 16);
                      setIsMobileListOpen(false);
                    }}
                    className={`p-3 rounded-[20px] flex gap-3 cursor-pointer ${
                      isSelected
                        ? 'bg-[var(--color-island-bg)] text-white'
                        : 'bg-[var(--color-surface-2)] text-[var(--color-text-primary)]'
                    }`}
                  >
                    <img
                      src={property.img}
                      alt={property.name}
                      className="w-20 h-20 rounded-2xl object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <h3 className="text-[14px] font-semibold truncate">
                          {property.name}
                        </h3>
                        <p
                          className={`text-[12px] truncate mt-0.5 tabular-nums ${
                            isSelected
                              ? 'text-slate-300'
                              : 'text-[var(--color-text-secondary)]'
                          }`}
                        >
                          {formatSimpleLocation(property.loc)} ·{' '}
                          {property.walkingMin || 5} min walk
                        </p>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span
                          className={`text-[14px] font-semibold tabular-nums ${
                            isSelected
                              ? 'text-[#ccff00]'
                              : 'text-[var(--color-text-primary)]'
                          }`}
                        >
                          {formatPrice(property.priceNum, '/sem')}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsMobileListOpen(false);
                            handleOpenBooking(property);
                          }}
                          className="px-3.5 py-1.5 rounded-full bg-[#ccff00] text-[#111315] text-[12px] font-semibold cursor-pointer"
                        >
                          Book
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── 9. BOOKING MODAL ───────────────────────────────────────────────── */}
      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        property={bookingHostel}
      />
    </div>
  );
};
