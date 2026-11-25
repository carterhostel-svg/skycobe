import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { Pannellum } from "pannellum-react";
import {
  ChevronLeft,
  Phone,
  ShieldCheck,
  Star,
  MapPin,
  Clock,
  Wifi,
  Wind,
  Zap,
  Droplets,
  Share2,
  CheckCircle2,
  Users,
  Eye,
  Check,
  Copy
} from "lucide-react";
import { useAppContext } from "../context/AppContext";
import { supabase } from "../lib/supabase";
import { formatPrice } from "../lib/formatPrice";
import { BookingModal } from "../components/BookingModal";
import { ExtendedProperty } from "../data";
import { formatSimpleLocation } from "../components/HostelCard";
import { VaporFavoriteButton } from "../components/VaporFavoriteButton";

export const Details: React.FC = () => {
  const {
    selectedPropertyId,
    showToast,
    savedProperties,
    toggleSave,
    properties,
    profile,
  } = useAppContext();
  const navigate = useNavigate();

  const property = properties.find((h) => h.id?.toString() === selectedPropertyId?.toString()) || properties[0];

  const [hostProfile, setHostProfile] = useState<any>(null);
  const [copiedGps, setCopiedGps] = useState(false);

  useEffect(() => {
    async function fetchHostProfile() {
      if (!property?.manager_id) return;
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', property.manager_id)
          .single();
        if (data && !error) {
          setHostProfile(data);
        }
      } catch (err) {
        console.error("Failed to fetch host profile", err);
      }
    }
    fetchHostProfile();
  }, [property?.manager_id]);

  const isSaved = savedProperties.includes(property.id);

  // Gallery State
  const allMedia = [...(property.images?.length ? property.images : [property.img]), ...(property.panoramas || [])];
  const [currentImg, setCurrentImg] = useState(0);

  // UI States
  const [activeRoomMode, setActiveRoomMode] = useState<number>(0);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);

  const fallbackRooms = [
    {
      name: "Private Single Studio",
      size: "En-suite Bathroom & Balcony",
      occ: "1 student",
      price: formatPrice(Math.round(property.priceNum * 1.35), ''),
      avail: property.avail || "Available",
      img: property.images?.[0] || property.img,
    },
    {
      name: "2-in-a-Room Standard",
      size: "Shared Bathroom & Study Desk",
      occ: "2 students",
      price: formatPrice(property.priceNum, ''),
      avail: "Available",
      img: property.images?.[1] || property.img,
    },
    {
      name: "4-in-a-Room Shared Flat",
      size: "Spacious Room with Dedicated Wardrobes",
      occ: "4 students",
      price: formatPrice(Math.round(property.priceNum * 0.65), ''),
      avail: "Few spots left",
      img: property.images?.[2] || property.img,
    }
  ];

  const roomsToDisplay = property.roomTiers && property.roomTiers.length > 0 
    ? property.roomTiers.map((r: any, idx: number) => ({
        name: r.label || r.name || `Tier ${idx + 1}`,
        size: r.hasBath === 'Private' ? 'Private Ensuite Bathroom' : 'Shared Clean Bathroom',
        occ: r.type === '1-in-a-room' ? '1 student' : r.type === '2-in-a-room' ? '2 students' : '4 students',
        price: formatPrice(r.pricePerSem || property.priceNum, ''),
        avail: r.availableCount ? `${r.availableCount} rooms left` : "Available",
        img: property.images?.[idx] || property.img,
      }))
    : fallbackRooms;

  const selectedRoom = roomsToDisplay[activeRoomMode] || roomsToDisplay[0];

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast("Hostel link copied to clipboard!");
    }
  };

  const handleCopyGps = () => {
    if (property.gpsCode && navigator.clipboard) {
      navigator.clipboard.writeText(property.gpsCode);
      setCopiedGps(true);
      showToast(`GhanaPost GPS ${property.gpsCode} copied!`);
      setTimeout(() => setCopiedGps(false), 2000);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)]">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-4 pb-36 flex flex-col gap-6">

        <div className="flex items-center justify-between z-20">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-12 h-12 rounded-full bg-[var(--color-surface)] flex items-center justify-center text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] transition cursor-pointer shadow-[var(--shadow-widget-val)]"
            aria-label="Back"
          >
            <ChevronLeft size={22} />
          </button>

          <VaporFavoriteButton
            isSaved={isSaved}
            size="lg"
            tone="surface"
            ariaLabel={isSaved ? "Remove from wishlist" : "Save to wishlist"}
            onToggle={() => toggleSave(property.id)}
          />
        </div>

        <div className="relative w-full h-[340px] sm:h-[400px] rounded-[2.5rem] overflow-hidden bg-[#1e2126] shadow-[0_16px_42px_rgba(0,0,0,0.18)]">
          {currentImg >= (property.images?.length || 1) ? (
            <Pannellum
              width="100%"
              height="100%"
              image={allMedia[currentImg]}
              pitch={10}
              yaw={180}
              hfov={110}
              autoLoad={true}
            />
          ) : (
            <img
              src={allMedia[currentImg]}
              alt={property.name}
              className="w-full h-full object-cover transition-transform duration-500"
            />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-[#141619] via-[#141619]/50 to-transparent pointer-events-none" />

          {currentImg >= (property.images?.length || 1) && (
            <div className="absolute top-4 left-4 px-3.5 py-1.5 rounded-full text-[12px] font-semibold bg-[#ccff00] text-[#111315] shadow-lg">
              360° Interactive View
            </div>
          )}

          <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4 z-10">
            <div className="flex-1 pr-2">
              <span className="text-[13px] font-normal text-slate-300 block mb-0.5">
                {formatSimpleLocation(property.loc)}
              </span>
              <h1 className="text-[22px] sm:text-[26px] font-semibold text-white tracking-[-0.015em] leading-snug drop-shadow-md">
                {property.name}
              </h1>
            </div>

            <div className="text-right shrink-0">
              <div className="text-[22px] sm:text-[26px] font-semibold text-[#ccff00] tracking-[-0.015em] tabular-nums">
                {formatPrice(property.priceNum, '')}
              </div>
              <span className="text-[12px] font-normal text-slate-300 block">/ semester</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {allMedia.slice(0, 3).map((media, idx) => {
            const isPano = idx >= (property.images?.length || 1);
            const isSelected = currentImg === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentImg(idx)}
                className={`relative h-20 rounded-2xl overflow-hidden transition-all cursor-pointer group ${
                  isSelected
                    ? "ring-2 ring-[var(--color-text-primary)] shadow-md scale-[1.02]"
                    : "opacity-80 hover:opacity-100 hover:scale-[1.01]"
                }`}
              >
                <img
                  src={media}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                {isPano && (
                  <span className="absolute inset-0 bg-[#141619]/60 flex items-center justify-center text-[11px] font-medium text-white">
                    360° View
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-[var(--color-surface)] rounded-2xl p-3.5 flex items-center gap-3 shadow-[var(--shadow-widget-val)]">
            <div className="w-8 h-8 rounded-full bg-[#ccff00] text-[#111315] flex items-center justify-center shrink-0">
              <Clock size={16} strokeWidth={2.2} />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[14px] font-semibold text-[var(--color-text-primary)] truncate tabular-nums">
                {property.walkingMin ? `${property.walkingMin} mins` : '6-10 min'}
              </span>
              <span className="text-[12px] text-[var(--color-text-secondary)] font-normal truncate">Duration</span>
            </div>
          </div>

          <div className="bg-[var(--color-surface)] rounded-2xl p-3.5 flex items-center gap-3 shadow-[var(--shadow-widget-val)]">
            <div className="w-8 h-8 rounded-full bg-[#ccff00] text-[#111315] flex items-center justify-center shrink-0">
              <MapPin size={16} strokeWidth={2.2} />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[14px] font-semibold text-[var(--color-text-primary)] truncate tabular-nums">
                {property.walkingMin ? `${property.walkingMin * 60}m` : '350m'}
              </span>
              <span className="text-[12px] text-[var(--color-text-secondary)] font-normal truncate">Distance</span>
            </div>
          </div>

          <div className="bg-[var(--color-surface)] rounded-2xl p-3.5 flex items-center gap-3 shadow-[var(--shadow-widget-val)]">
            <div className="w-8 h-8 rounded-full bg-[#ccff00] text-[#111315] flex items-center justify-center shrink-0">
              <Star size={16} strokeWidth={2.2} className="fill-[#111315]" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[14px] font-semibold text-[var(--color-text-primary)] truncate tabular-nums">
                {property.rating}★
              </span>
              <span className="text-[12px] text-[var(--color-text-secondary)] font-normal truncate">Rating</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          <h2 className="text-[18px] sm:text-[20px] font-semibold text-[var(--color-text-primary)] tracking-[-0.01em]">
            About hostel
          </h2>
          <p className="text-[14px] sm:text-[15px] text-[var(--color-text-secondary)] leading-relaxed font-normal">
            {property.desc || 
              `${property.name} offers premium student accommodation designed for academic focus, comfort, and peace of mind.`}
          </p>

          <div className="flex items-center gap-2 pt-1">
            <span className="inline-flex items-center gap-1.5 text-[#15803d] text-[13px] font-medium">
              <ShieldCheck size={15} />
              <span>Verified Campus Residence</span>
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-2">
          <h3 className="text-[16px] font-semibold text-[var(--color-text-primary)] tracking-[-0.01em]">
            Available Room Tiers
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {roomsToDisplay.map((room: any, idx: number) => {
              const isSelected = activeRoomMode === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveRoomMode(idx)}
                  className={`p-4 rounded-2xl text-left transition-all cursor-pointer flex flex-col justify-between min-h-[110px] ${
                    isSelected
                      ? "bg-[var(--color-island-bg)] text-white shadow-lg ring-2 ring-[#ccff00]"
                      : "bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text-primary)] shadow-[var(--shadow-widget-val)]"
                  }`}
                >
                  <div>
                    <div className={`text-[14px] font-semibold flex items-center justify-between ${isSelected ? 'text-white' : 'text-[var(--color-text-primary)]'}`}>
                      <span>{room.name}</span>
                      {isSelected && <span className="w-2 h-2 rounded-full bg-[#ccff00]" />}
                    </div>
                    <span className={`text-[12px] font-normal block mt-1 ${isSelected ? 'text-slate-300' : 'text-[var(--color-text-secondary)]'}`}>
                      {room.occ} • {room.size}
                    </span>
                  </div>

                  <div className="mt-3 flex items-baseline justify-between">
                    <span className={`text-[15px] font-semibold tabular-nums ${isSelected ? 'text-[#ccff00]' : 'text-[var(--color-text-primary)]'}`}>
                      {room.price}
                    </span>
                    <span className={`text-[11px] font-medium ${isSelected ? 'text-emerald-400' : 'text-[#15803d]'}`}>
                      {room.avail}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[var(--color-surface)] flex flex-col gap-3 shadow-[var(--shadow-widget-val)]">
          <span className="text-[13px] font-medium text-[var(--color-text-secondary)]">
            Included Hostel Amenities
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[13px]">
            <div className="flex items-center gap-2 text-[var(--color-text-primary)] font-medium">
              <span className="w-6 h-6 rounded-full bg-[var(--color-island-bg)] flex items-center justify-center shrink-0">
                <Zap size={13} className="text-[#ccff00]" />
              </span>
              <span>Standby Generator</span>
            </div>
            <div className="flex items-center gap-2 text-[var(--color-text-primary)] font-medium">
              <span className="w-6 h-6 rounded-full bg-[var(--color-island-bg)] flex items-center justify-center shrink-0">
                <Droplets size={13} className="text-sky-400" />
              </span>
              <span>Borehole Water</span>
            </div>
            <div className="flex items-center gap-2 text-[var(--color-text-primary)] font-medium">
              <span className="w-6 h-6 rounded-full bg-[var(--color-island-bg)] flex items-center justify-center shrink-0">
                <Wifi size={13} className="text-indigo-300" />
              </span>
              <span>Wi-Fi Internet</span>
            </div>
            <div className="flex items-center gap-2 text-[var(--color-text-primary)] font-medium">
              <span className="w-6 h-6 rounded-full bg-[var(--color-island-bg)] flex items-center justify-center shrink-0">
                <ShieldCheck size={13} className="text-emerald-400" />
              </span>
              <span>24/7 Security</span>
            </div>
          </div>
        </div>

      </div>

      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[var(--color-header-bg)] backdrop-blur-2xl py-4 px-4 sm:px-6 shadow-[0_-10px_30px_rgba(0,0,0,0.08)]">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button
            type="button"
            onClick={handleShare}
            className="w-14 h-14 rounded-full bg-[var(--color-surface)] flex items-center justify-center text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] transition cursor-pointer shadow-[var(--shadow-widget-val)] shrink-0"
            aria-label="Share property"
            title="Share property"
          >
            <Share2 size={20} className="text-[var(--color-text-primary)]" />
          </button>

          <button
            type="button"
            onClick={() => setBookingModalOpen(true)}
            className="flex-1 py-4 px-6 rounded-full bg-[#ccff00] hover:bg-[#b8e600] text-[#111315] font-semibold text-[15px] tracking-normal transition-all duration-200 transform hover:scale-[1.02] active:scale-98 shadow-[var(--shadow-button)] cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Book Now</span>
          </button>
        </div>
      </div>

      {/* ── BOOKING MODAL ───────────────────────────────────────────────── */}
      {bookingModalOpen && (
        <BookingModal
          isOpen={bookingModalOpen}
          onClose={() => setBookingModalOpen(false)}
          property={property}
        />
      )}

    </div>
  );
};