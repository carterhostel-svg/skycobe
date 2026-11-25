import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Compass, Trash2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { ExtendedProperty } from '../data';
import { HostelCard } from '../components/HostelCard';
import { BookingModal } from '../components/BookingModal';

export const Saved: React.FC = () => {
  const { savedProperties, toggleSave, properties, setSelectedPropertyId, showToast } = useAppContext();
  const navigate = useNavigate();

  const [modalProperty, setModalProperty] = useState<ExtendedProperty | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const extendedProperties = properties as ExtendedProperty[];
  const savedList = extendedProperties.filter((h) => savedProperties.includes(h.id));

  const handleOpenReserve = (property: ExtendedProperty) => {
    setModalProperty(property);
    setIsModalOpen(true);
  };

  const handleViewDetails = (id: number | string) => {
    setSelectedPropertyId(id);
    navigate('/details');
  };

  const handleClearAll = () => {
    savedProperties.forEach((id) => toggleSave(id));
    showToast('Saved list cleared');
  };

  return (
    <div className="w-full min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)] font-sans">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-6 pb-36 flex flex-col gap-8">
        
        <div className="flex items-center justify-between pb-2">
          <div>
            <span className="text-[12px] font-medium text-[var(--color-text-secondary)] block mb-0.5">
              Shortlist
            </span>
            <div className="flex items-baseline gap-2">
              <h1 className="text-[22px] sm:text-[24px] font-semibold text-[var(--color-text-primary)] tracking-[-0.015em]">
                Saved Hostels
              </h1>
              {savedList.length > 0 && (
                <span className="text-[13px] font-medium text-[var(--color-text-secondary)] tabular-nums">
                  ({savedList.length})
                </span>
              )}
            </div>
          </div>

          {savedList.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="px-4 py-2 text-[13px] font-medium text-[#b91c1c] hover:text-[#991b1b] hover:bg-red-600/10 rounded-full transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Trash2 size={14} />
              <span>Clear</span>
            </button>
          )}
        </div>

        {savedList.length > 0 ? (
          <div className="flex flex-col gap-8 sm:gap-10">
            {savedList.map((property) => (
              <HostelCard
                key={property.id}
                property={property}
                isSaved={true}
                onToggleSave={toggleSave}
                onReserve={handleOpenReserve}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center rounded-[2.5rem] bg-[var(--color-surface)] p-8 flex flex-col items-center shadow-[var(--shadow-card-val)]">
            <div className="w-16 h-16 rounded-full bg-[var(--color-surface-2)] flex items-center justify-center text-[var(--color-text-primary)] mb-4">
              <Heart size={26} className="text-[var(--color-text-primary)]" />
            </div>
            <h2 className="text-[18px] font-semibold text-[var(--color-text-primary)]">No saved hostels yet</h2>
            <p className="text-[14px] text-[var(--color-text-secondary)] max-w-sm mt-2 leading-relaxed">
              Browse student hostels across Legon, Ayeduase, and Cape Coast and tap the heart icon to shortlist.
            </p>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="mt-6 px-6 py-3 rounded-full bg-[#ccff00] hover:bg-[#b8e600] text-[#111315] font-semibold text-[14px] transition cursor-pointer flex items-center gap-2 shadow-md"
            >
              <Compass size={16} />
              <span>Explore Hostels</span>
            </button>
          </div>
        )}

      </div>

      {/* Direct Booking Modal */}
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
