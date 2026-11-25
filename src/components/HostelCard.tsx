import React, { useRef } from 'react';
import { ExtendedProperty } from '../data';
import { formatPrice } from '../lib/formatPrice';
import { VaporFavoriteButton } from './VaporFavoriteButton';

interface HostelCardProps {
  property: ExtendedProperty;
  isSaved: boolean;
  onToggleSave: (id: number | string) => void;
  onReserve: (property: ExtendedProperty) => void;
  onViewDetails: (id: number | string) => void;
  featured?: boolean;
}

// Clean simple location display helper
export const formatSimpleLocation = (rawLoc?: string): string => {
  if (!rawLoc) return 'Legon';
  const lower = rawLoc.toLowerCase();
  if (lower.includes('legon')) return 'Legon';
  if (lower.includes('ayeduase') || lower.includes('knust') || lower.includes('kumasi')) return 'Ayeduase';
  if (lower.includes('cape coast') || lower.includes('ucc')) return 'Cape Coast';
  if (lower.includes('madina') || lower.includes('upsa')) return 'Madina';
  return rawLoc.split('·')[0].split(',')[0].trim();
};

export const HostelCard: React.FC<HostelCardProps> = ({
  property,
  isSaved,
  onToggleSave,
  onReserve,
  onViewDetails,
}) => {
  const images = property.images && property.images.length > 0 ? property.images : [property.img];
  const primaryImage = images[0] || property.img;
  const simpleLoc = formatSimpleLocation(property.loc);
  const cardImgRef = useRef<HTMLImageElement | null>(null);

  return (
    <div 
      onClick={() => onViewDetails(property.id)}
      className="group relative w-full rounded-[2.5rem] bg-[#1e2126] transition-all duration-300 overflow-hidden shadow-[0_14px_38px_rgba(0,0,0,0.22)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.32)] cursor-pointer"
    >
      <div className="relative w-full h-[390px] sm:h-[430px] overflow-hidden">
        <img
          ref={cardImgRef}
          src={primaryImage}
          alt={property.name}
          loading="lazy"
          crossOrigin={primaryImage?.startsWith('http') ? 'anonymous' : undefined}
          className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-[#111315]/95 via-[#111315]/55 to-transparent pointer-events-none" />

        <div className="absolute top-6 right-6 z-10">
          <VaporFavoriteButton
            isSaved={isSaved}
            size="lg"
            tone="overlay"
            backgroundImageRef={cardImgRef}
            ariaLabel={isSaved ? 'Remove hostel from saved' : 'Save hostel'}
            onToggle={(e) => {
              e.stopPropagation();
              onToggleSave(property.id);
            }}
          />
        </div>

        <div className="absolute bottom-6 left-6 right-6 flex flex-col gap-3.5 z-10">
          <div className="space-y-1">
            <span className="text-[13px] sm:text-[14px] font-medium text-slate-300 block">
              {simpleLoc}
            </span>

            <h3 className="text-[21px] sm:text-[23px] font-semibold text-white tracking-[-0.015em] leading-snug group-hover:text-[#ccff00] transition-colors line-clamp-2">
              {property.name}
            </h3>
          </div>

          <div className="flex items-center justify-between gap-4 pt-0.5">
            <div className="flex items-baseline gap-1.5 min-w-0">
              <span className="text-[19px] sm:text-[21px] font-semibold text-[#ccff00] tabular-nums whitespace-nowrap">
                {formatPrice(property.priceNum, '')}
              </span>
              <span className="text-[13px] text-slate-300 font-normal whitespace-nowrap">/ semester</span>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onReserve(property);
              }}
              className="shrink-0 px-7 py-3.5 sm:px-8 sm:py-3.5 rounded-full bg-[#ccff00] hover:bg-[#b8e600] text-[#111315] font-semibold text-[14px] sm:text-[15px] tracking-normal transition-all duration-200 transform hover:scale-[1.03] active:scale-95 shadow-md cursor-pointer whitespace-nowrap"
            >
              Book Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
