import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Coffee, BookOpen, Dumbbell, BusFront, MapPin, Compass, Navigation, Clock, ShieldCheck } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

interface Landmark {
  id: string;
  name: string;
  category: 'study' | 'food' | 'fitness' | 'transit';
  desc: string;
  walkMinutes: number;
  openHours: string;
  lat: number;
  lng: number;
  highlights: string[];
}

const CAMPUS_LANDMARKS: Landmark[] = [
  {
    id: 'balme-lib',
    name: 'Balme Library & 24/7 Study Hub',
    category: 'study',
    desc: 'The central academic research repository with air-conditioned quiet rooms, digital journals, and backup generators.',
    walkMinutes: 4,
    openHours: '24 Hours (Exams) · 8am - 10pm',
    lat: 5.6515,
    lng: -0.1878,
    highlights: ['AC Carrels', 'High-speed Eduroam', 'Print/Scan Station'],
  },
  {
    id: 'student-union',
    name: 'Central Student Union & Food Pavilion',
    category: 'food',
    desc: 'Main campus eatery pavilion serving hot Ghanaian dishes, jollof, smoothies, breakfast pastries, and coffee.',
    walkMinutes: 3,
    openHours: '7:00 AM – 10:30 PM',
    lat: 5.6502,
    lng: -0.1860,
    highlights: ['Local & Continental', 'Mobile Money & POS', 'Outdoor Seating'],
  },
  {
    id: 'night-market',
    name: 'Legon Night Market',
    category: 'food',
    desc: 'Bustling student culinary hotspot for evening waakye, kelewele, fried yam, indomie, and fresh fruit juices.',
    walkMinutes: 7,
    openHours: '5:00 PM – 1:00 AM',
    lat: 5.6475,
    lng: -0.1895,
    highlights: ['Late Night Dining', 'Budget Friendly', 'Student Atmosphere'],
  },
  {
    id: 'sports-complex',
    name: 'UG Sports Stadium & Olympic Gym',
    category: 'fitness',
    desc: 'Newly renovated Olympic-standard track, indoor gym, swimming pool, basketball, and tennis courts.',
    walkMinutes: 9,
    openHours: '6:00 AM – 9:00 PM',
    lat: 5.6440,
    lng: -0.1845,
    highlights: ['Weights & Cardio', 'Swimming Pool', 'Running Track'],
  },
  {
    id: 'shuttle-terminal',
    name: 'Main Gate Shuttle Station & Trotro Terminal',
    category: 'transit',
    desc: 'Direct intra-campus shuttle buses to Pent, Evandy, TF, Commonwealth, and Legon Hall, plus Madina & Circle trotros.',
    walkMinutes: 5,
    openHours: '5:30 AM – 11:30 PM',
    lat: 5.6535,
    lng: -0.1830,
    highlights: ['Campus Shuttles (GH₵3)', 'Taxis on Standby', 'Safe drop zone'],
  },
  {
    id: 'law-faculty-quad',
    name: 'Law Faculty & Graduate Quad',
    category: 'study',
    desc: 'Quiet shaded outdoor pavilion with power sockets, tree canopy, and peaceful study atmosphere.',
    walkMinutes: 6,
    openHours: 'Open Access',
    lat: 5.6528,
    lng: -0.1898,
    highlights: ['Outdoor Sockets', 'Tree Shade', 'Quiet Zone'],
  },
];

const categoryIcons = {
  study: BookOpen,
  food: Coffee,
  fitness: Dumbbell,
  transit: BusFront,
};

const getCategoryMarkerIcon = (category: string) => {
  const colorMap: Record<string, string> = {
    study: '#0d9488',
    food: '#d97706',
    fitness: '#2563eb',
    transit: '#475569',
  };
  const color = colorMap[category] || '#0d9488';

  return new L.DivIcon({
    className: 'custom-campus-marker',
    html: `
      <div style="background-color: ${color}; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; border: 2.5px solid white; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.25);">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M12 2a10 10 0 0 0-10 10c0 5.25 10 12 10 12s10-6.75 10-12a10 10 0 0 0-10-10z"></path>
        </svg>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

export const CampusGuide: React.FC = () => {
  const { showToast } = useAppContext();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedLandmark, setSelectedLandmark] = useState<Landmark | null>(CAMPUS_LANDMARKS[0]);

  const filteredLandmarks = CAMPUS_LANDMARKS.filter(
    (l) => activeCategory === 'all' || l.category === activeCategory
  );

  return (
    <div className="w-full flex-1 flex flex-col bg-[var(--color-bg)] font-sans">
      {/* Header Bar */}
      <div className="border-b border-[var(--color-border)] bg-[var(--color-surface)] sticky top-16 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-semibold tracking-wider uppercase text-[var(--color-accent)]">
                  University of Ghana · Legon Campus
                </span>
                <span className="text-slate-300">·</span>
                <span className="text-[11px] text-[var(--color-text-secondary)] font-medium">
                  Verified Student Guide
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-[var(--color-heading)] tracking-tight">
                Campus Living & Hotspots
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
                <ShieldCheck size={14} />
                <span>Verified by Student Reps</span>
              </span>
            </div>
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-2 mt-4 pb-1 overflow-x-auto hide-scrollbar">
            {[
              { id: 'all', label: 'All Hotspots', icon: Compass },
              { id: 'study', label: 'Study & Libraries', icon: BookOpen },
              { id: 'food', label: 'Food & Cafes', icon: Coffee },
              { id: 'fitness', label: 'Sports & Gyms', icon: Dumbbell },
              { id: 'transit', label: 'Shuttles & Transit', icon: BusFront },
            ].map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 text-white'
                      : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:border-slate-400'
                  }`}
                >
                  <Icon size={14} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Dual-Pane Content */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex-1 flex flex-col lg:flex-row gap-6">
        {/* Left Column: Landmark List */}
        <div className="w-full lg:w-[420px] shrink-0 flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs font-semibold text-[var(--color-text-secondary)] px-1">
            <span>Points of Interest ({filteredLandmarks.length})</span>
            <span>Sorted by Proximity</span>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[750px] pr-1">
            {filteredLandmarks.map((landmark) => {
              const Icon = categoryIcons[landmark.category];
              const isSelected = selectedLandmark?.id === landmark.id;

              return (
                <div
                  key={landmark.id}
                  onClick={() => setSelectedLandmark(landmark)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer bg-[var(--color-surface)] ${
                    isSelected
                      ? 'border-[var(--color-accent)] ring-1 ring-[var(--color-accent)]/20 shadow-sm'
                      : 'border-[var(--color-border)] hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                        landmark.category === 'study'
                          ? 'bg-teal-50 text-teal-700'
                          : landmark.category === 'food'
                          ? 'bg-amber-50 text-amber-700'
                          : landmark.category === 'fitness'
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      <Icon size={18} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-[var(--color-heading)] truncate">
                          {landmark.name}
                        </h3>
                        <span className="text-[11px] font-semibold text-[var(--color-accent)] shrink-0 ml-2">
                          ~{landmark.walkMinutes} min walk
                        </span>
                      </div>

                      <p className="text-xs text-[var(--color-text-secondary)] line-clamp-2 mt-1">
                        {landmark.desc}
                      </p>

                      <div className="flex items-center gap-3 mt-3 text-[11px] text-[var(--color-text-secondary)]">
                        <span className="flex items-center gap-1 font-medium">
                          <Clock size={12} />
                          {landmark.openHours}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1 mt-2.5">
                        {landmark.highlights.map((h, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] bg-[var(--color-bg)] border border-[var(--color-border)] px-1.5 py-0.5 rounded text-[var(--color-text-secondary)] font-medium"
                          >
                            {h}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Live Campus Map & Focused Detail */}
        <div className="flex-1 flex flex-col gap-4 min-h-[500px]">
          <div className="flex-1 rounded-2xl overflow-hidden border border-[var(--color-border)] shadow-sm bg-slate-100 relative min-h-[420px]">
            <MapContainer
              center={selectedLandmark ? [selectedLandmark.lat, selectedLandmark.lng] : [5.65083, -0.18694]}
              zoom={15}
              style={{ width: '100%', height: '100%', minHeight: '420px' }}
              zoomControl={true}
            >
              <TileLayer
                url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&scale=2"
                attribution="Google Maps"
                maxZoom={20}
              />
              {filteredLandmarks.map((landmark) => (
                <Marker
                  key={landmark.id}
                  position={[landmark.lat, landmark.lng]}
                  icon={getCategoryMarkerIcon(landmark.category)}
                  eventHandlers={{
                    click: () => setSelectedLandmark(landmark),
                  }}
                >
                  <Popup>
                    <div className="p-1 font-sans">
                      <strong className="text-xs font-bold text-slate-900 block">{landmark.name}</strong>
                      <p className="text-[11px] text-slate-600 mt-0.5">{landmark.desc}</p>
                      <span className="text-[10px] text-teal-700 font-bold block mt-1">~{landmark.walkMinutes} min walk from residences</span>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          {/* Selected Landmark Quick Action Card */}
          {selectedLandmark && (
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-accent)]">
                  Selected Hotspot
                </span>
                <h4 className="text-base font-bold text-[var(--color-heading)] mt-0.5">
                  {selectedLandmark.name}
                </h4>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  {selectedLandmark.openHours} · Near University of Ghana Central Campus
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => showToast(`Walking route calculated: ~${selectedLandmark.walkMinutes} minutes`)}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg bg-[var(--color-button)] text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <Navigation size={14} />
                  <span>Get Walking Route</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
