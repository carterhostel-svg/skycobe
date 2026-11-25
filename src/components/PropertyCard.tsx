import React from 'react';
import { Heart, Star, MapPin, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Property } from '../types';
import { useRecentlyViewed } from '../hooks/useRecentlyViewed';
import { formatPrice } from '../lib/formatPrice';
import { formatSimpleLocation } from './HostelCard';

interface PropertyCardProps {
  property: Property;
  isSaved: boolean;
  onToggleSave: (id: number | string) => void;
  onClick: () => void;
  layout?: 'responsive' | 'compact' | 'explore-list' | 'full-width-clean';
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  isSaved,
  onToggleSave,
  onClick,
  layout = 'responsive',
}) => {
  const { recordView } = useRecentlyViewed();

  const handleCardClick = () => {
    recordView({
      id: property.id.toString(),
      name: property.name,
      image_url: property.img,
      location: property.loc,
      price: property.priceNum,
      viewedAt: Date.now(),
    });
    onClick();
  };

  if (layout === 'explore-list') {
    return (
      <div
        onClick={handleCardClick}
        className="group flex w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-2.5 gap-3.5 transition-all duration-200 hover:border-[var(--color-border-strong)] hover:shadow-sm cursor-pointer"
      >
        <div className="w-28 sm:w-32 h-24 shrink-0 relative rounded-xl overflow-hidden bg-slate-100">
          <img
            src={property.img}
            alt={property.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave(property.id);
            }}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/40 backdrop-blur-xs flex items-center justify-center text-white hover:bg-black/60 transition-colors"
            aria-label="Save hostel"
          >
            <Heart
              size={13}
              className={isSaved ? 'fill-red-500 text-red-500' : 'text-white'}
            />
          </button>
        </div>

        <div className="flex-1 flex flex-col justify-between py-0.5 min-w-0">
          <div>
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-[var(--color-text-primary)] truncate group-hover:text-[var(--color-accent)] transition-colors">
                {property.name}
              </h3>
              <div className="flex items-center gap-1 text-xs font-semibold text-[var(--color-text-primary)] shrink-0">
                <Star size={12} className="text-amber-500 fill-amber-500" />
                <span className="tabular-nums">{property.rating}</span>
              </div>
            </div>

            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider truncate mt-1">
              {formatSimpleLocation(property.loc)}
            </p>
          </div>

          <div className="flex items-baseline justify-between mt-2 pt-1 border-t border-[var(--color-border-subtle)]">
            <div className="text-sm font-bold text-[var(--color-text-primary)] tabular-nums">
              {formatPrice(property.priceNum, property.pricing_tag || '/sem')}
            </div>
            <span className="text-[11px] font-medium text-[var(--color-accent)]">
              {property.avail.includes('Available') ? 'Verified' : property.avail}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Standard Responsive Grid Card
  return (
    <div
      onClick={handleCardClick}
      className="group flex flex-col bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-[var(--color-border-strong)] cursor-pointer"
    >
      {/* Visual Image Container (65-70% visual presence) */}
      <div className="w-full aspect-[4/3] relative overflow-hidden bg-slate-100">
        <img
          src={property.img}
          alt={property.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Top Badges / Save Button */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          {property.avail.includes('Available') ? (
            <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-[var(--color-accent)] shadow-xs pointer-events-auto">
              Verified
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-[var(--color-text-secondary)] shadow-xs pointer-events-auto">
              {property.avail}
            </span>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave(property.id);
            }}
            className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-xs flex items-center justify-center text-white hover:bg-black/60 transition-colors pointer-events-auto cursor-pointer"
            aria-label={isSaved ? 'Remove from saved' : 'Save to favorites'}
          >
            <Heart
              size={15}
              className={isSaved ? 'fill-red-500 text-red-500' : 'text-white'}
            />
          </button>
        </div>

        {/* Subtle photo count */}
        {property.images && property.images.length > 1 && (
          <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded text-[10px] font-medium bg-black/60 text-white backdrop-blur-xs">
            1/{property.images.length}
          </div>
        )}
      </div>

      {/* Card Content & Metadata */}
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div>
          {/* Title and Rating */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-base font-bold text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] transition-colors leading-snug">
              {property.name}
            </h3>
            <div className="flex items-center gap-1 text-xs font-bold text-[var(--color-text-primary)] shrink-0 pt-0.5">
              <Star size={13} className="text-amber-500 fill-amber-500" />
              <span className="tabular-nums">{property.rating}</span>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold uppercase tracking-wider mt-1.5">
            <MapPin size={13} className="shrink-0 text-[#ccff00]" />
            <span className="truncate">{formatSimpleLocation(property.loc)}</span>
          </div>

          {/* Clean Unboxed Metadata: Amenities & Features */}
          <div className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)] mt-3">
            {property.tags.includes('wifi') && (
              <>
                <span>Fast Wi-Fi</span>
                <span aria-hidden="true" className="text-[var(--color-border-strong)]">·</span>
              </>
            )}
            {property.tags.includes('gen') && (
              <>
                <span>Generator</span>
                <span aria-hidden="true" className="text-[var(--color-border-strong)]">·</span>
              </>
            )}
            {property.tags.includes('ac') ? (
              <span>Air Conditioned</span>
            ) : (
              <span>24/7 Security</span>
            )}
          </div>
        </div>

        {/* Price Baseline */}
        <div className="flex items-baseline justify-between mt-4 pt-3 border-t border-[var(--color-border-subtle)]">
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-extrabold text-[var(--color-text-primary)] tabular-nums">
              {formatPrice(property.priceNum, '')}
            </span>
            <span className="text-xs font-medium text-[var(--color-text-secondary)]">
              {property.pricing_tag || '/ semester'}
            </span>
          </div>

          <span className="text-xs font-semibold text-[var(--color-accent)] group-hover:underline">
            View Details
          </span>
        </div>
      </div>
    </div>
  );
};
