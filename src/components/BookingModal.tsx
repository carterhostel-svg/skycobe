import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, CheckCircle2, ShieldCheck, MapPin, Award, ArrowRight, Copy } from 'lucide-react';
import { ExtendedProperty } from '../data';
import { useAppContext } from '../context/AppContext';
import { formatPrice } from '../lib/formatPrice';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: ExtendedProperty | null;
  initialRoomType?: string;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  property,
}) => {
  const { addBooking, showToast } = useAppContext();
  const navigate = useNavigate();

  const [selectedTierIndex, setSelectedTierIndex] = useState(0);
  const [semester, setSemester] = useState('First Semester (Academic Year 2026/2027)');
  const [roommatePref, setRoommatePref] = useState<'match' | 'friend' | 'single'>('match');
  const [friendId, setFriendId] = useState('');
  const [studentName, setStudentName] = useState('Alex Owusu');
  const [studentId, setStudentId] = useState('10984721');
  const [studentPhone, setStudentPhone] = useState('+233 55 123 4567');
  const [submitting, setSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<any>(null);

  if (!isOpen || !property) return null;

  const roomTiers = property.roomTiers || [
    { type: '1-in-a-room', label: '1 in a Room (En-Suite)', pricePerSem: property.priceNum * 1.4, availableCount: 2, hasAc: true, hasBath: 'Private' },
    { type: '2-in-a-room', label: '2 in a Room (Standard)', pricePerSem: property.priceNum, availableCount: 4, hasAc: true, hasBath: 'Private' },
    { type: '4-in-a-room', label: '4 in a Room (Budget)', pricePerSem: property.priceNum * 0.65, availableCount: 8, hasAc: false, hasBath: 'Shared' },
  ];

  const activeTier = roomTiers[selectedTierIndex] || roomTiers[0];
  const rentPrice = Math.round(activeTier.pricePerSem);
  const utilityDeposit = 350;
  const maintenanceFee = 150;
  const totalAmount = rentPrice + utilityDeposit + maintenanceFee;

  const handleConfirmReservation = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    setTimeout(() => {
      const newBooking = addBooking({
        propertyId: property.id,
        propertyName: property.name,
        propertyLoc: property.loc,
        propertyImg: property.img,
        roomType: activeTier.label,
        semester,
        totalPrice: totalAmount,
        depositPaid: 2000,
        studentName,
        studentId,
        studentPhone,
        status: 'Confirmed',
        checkInDate: '28 Aug 2026',
      });

      setSubmitting(false);
      setConfirmedBooking(newBooking);
      showToast(`Room reserved successfully at ${property.name}!`);
    }, 600);
  };

  const handleCopyCode = (code: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code);
      showToast('Booking voucher code copied!');
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/65 backdrop-blur-md overflow-y-auto">
      <div 
        className="relative w-full max-w-xl bg-[var(--color-modal-bg)] rounded-[2.5rem] shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200 text-[var(--color-modal-text)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 sm:px-8 py-5 bg-[var(--color-modal-header)]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ccff00]" />
            <span className="text-[13px] font-medium text-[var(--color-modal-subtext)]">
              Direct Hostel Room Allocation
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[var(--color-modal-inset)] flex items-center justify-center text-[var(--color-modal-subtext)] hover:text-[var(--color-modal-text)] transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {confirmedBooking ? (
          <div className="p-6 sm:p-8 flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-500/15 text-[#15803d] dark:text-emerald-400 flex items-center justify-center mb-4">
              <CheckCircle2 size={32} />
            </div>

            <span className="text-[12px] font-medium text-[#15803d] dark:text-emerald-400">
              Room Allocation Locked
            </span>
            <h2 className="text-[22px] font-semibold text-[var(--color-modal-text)] mt-1 mb-2 tracking-[-0.015em]">
              Reservation Confirmed
            </h2>
            <p className="text-[13px] text-[var(--color-modal-subtext)] max-w-md mb-6 leading-relaxed">
              Your room at <strong className="font-semibold text-[var(--color-modal-text)]">{property.name}</strong> is reserved for {semester}. Your room key voucher has been generated.
            </p>

            <div className="w-full bg-[var(--color-modal-inset)] rounded-2xl p-5 mb-6 text-left">
              <div className="flex items-center justify-between pb-3">
                <div>
                  <span className="text-[12px] font-normal text-[var(--color-modal-subtext)]">Booking Reference</span>
                  <div className="text-[15px] font-semibold text-[var(--color-modal-text)] flex items-center gap-2 mt-0.5 tabular-nums">
                    <span>{confirmedBooking.bookingRef}</span>
                    <button
                      type="button"
                      onClick={() => handleCopyCode(confirmedBooking.bookingRef)}
                      className="text-[var(--color-modal-accent)] hover:opacity-80 cursor-pointer"
                      title="Copy code"
                    >
                      <Copy size={13} />
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[12px] font-normal text-[var(--color-modal-subtext)]">Check-in</span>
                  <div className="text-[13px] font-medium text-[var(--color-modal-text)] mt-0.5 tabular-nums">{confirmedBooking.checkInDate}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 py-3 bg-[var(--color-modal-bg)] px-4 rounded-xl text-[13px] my-2">
                <div>
                  <span className="text-[11px] text-[var(--color-modal-subtext)] block">Student Name</span>
                  <span className="font-medium text-[var(--color-modal-text)]">{studentName} ({studentId})</span>
                </div>
                <div>
                  <span className="text-[11px] text-[var(--color-modal-subtext)] block">Room Configuration</span>
                  <span className="font-medium text-[var(--color-modal-text)]">{activeTier.label}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div>
                  <span className="text-[11px] text-[var(--color-modal-subtext)] block">Total Semester Fee</span>
                  <span className="text-[16px] font-semibold text-[var(--color-modal-accent)] tabular-nums">{formatPrice(totalAmount, '')}</span>
                </div>
                <span className="px-3 py-1 rounded-full text-[11px] font-medium bg-emerald-500/15 text-[#15803d] dark:text-emerald-400">
                  Confirmed
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate('/profile');
                }}
                className="flex-1 py-3.5 px-5 rounded-full bg-[#ccff00] text-[#111315] text-[13px] font-semibold flex items-center justify-center gap-2 hover:bg-[#b8e600] transition cursor-pointer shadow-md"
              >
                <span>View in My Bookings</span>
                <ArrowRight size={14} className="text-[#111315]" />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="py-3 px-5 rounded-full bg-[var(--color-modal-inset)] text-[13px] font-medium text-[var(--color-modal-subtext)] hover:text-[var(--color-modal-text)] cursor-pointer"
              >
                Continue Browsing
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleConfirmReservation} className="p-6 sm:p-8 flex flex-col gap-5">
            
            <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-[var(--color-modal-inset)]">
              <img
                src={property.img}
                alt={property.name}
                className="w-14 h-14 rounded-xl object-cover shrink-0"
              />
              <div className="min-w-0 flex-1">
                <h3 className="text-[15px] font-semibold text-[var(--color-modal-text)] truncate">
                  {property.name}
                </h3>
                <p className="text-[12px] text-[var(--color-modal-subtext)] flex items-center gap-1 mt-0.5 truncate">
                  <MapPin size={12} className="shrink-0 text-[var(--color-modal-accent)]" />
                  <span>{property.loc}</span>
                </p>
                <div className="flex items-center gap-3 mt-1 text-[11px]">
                  <span className="text-[#15803d] dark:text-emerald-400 font-medium flex items-center gap-1">
                    <ShieldCheck size={12} /> Verified Direct
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label className="text-[12px] font-medium text-[var(--color-modal-subtext)] mb-2 block">
                1. Select Room Occupancy Tier
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {roomTiers.map((tier, idx) => {
                  const isSelected = selectedTierIndex === idx;
                  return (
                    <button
                      key={tier.type}
                      type="button"
                      onClick={() => setSelectedTierIndex(idx)}
                      className={`p-3.5 rounded-2xl text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-[var(--color-island-bg)] text-white ring-2 ring-[#ccff00] shadow-md'
                          : 'bg-[var(--color-modal-inset)] hover:bg-[var(--color-modal-inset-hover)] text-[var(--color-modal-text)]'
                      }`}
                    >
                      <div>
                        <div className={`text-[13px] font-semibold ${isSelected ? 'text-white' : 'text-[var(--color-modal-text)]'}`}>
                          {tier.type === '1-in-a-room' ? '1 in a Room' : tier.type === '2-in-a-room' ? '2 in a Room' : '4 in a Room'}
                        </div>
                        <div className={`text-[11px] mt-0.5 ${isSelected ? 'text-slate-300' : 'text-[var(--color-modal-subtext)]'}`}>
                          {tier.hasBath} Bath · {tier.hasAc ? 'AC' : 'Fan'}
                        </div>
                      </div>
                      <div className={`mt-2 text-[13px] font-semibold tabular-nums ${isSelected ? 'text-[#ccff00]' : 'text-[var(--color-modal-text)]'}`}>
                        {formatPrice(tier.pricePerSem, '')}
                        <span className={`text-[10px] font-normal ${isSelected ? 'text-slate-300' : 'text-[var(--color-modal-subtext)]'}`}>/sem</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-[12px] font-medium text-[var(--color-modal-subtext)] mb-2 block">
                2. Academic Semester Duration
              </label>
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-[var(--color-modal-inset)] text-[13px] font-medium text-[var(--color-modal-text)] outline-none cursor-pointer"
              >
                <option value="First Semester (Academic Year 2026/2027)">First Semester (Academic Year 2026/2027)</option>
                <option value="Second Semester (Academic Year 2026/2027)">Second Semester (Academic Year 2026/2027)</option>
                <option value="Full Academic Year (2026/2027)">Full Academic Year (Both Semesters)</option>
              </select>
            </div>

            <div>
              <label className="text-[12px] font-medium text-[var(--color-modal-subtext)] mb-2 block">
                3. Roommate Preference
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setRoommatePref('match')}
                  className={`py-2.5 px-3 rounded-xl text-center text-[12px] font-semibold cursor-pointer transition-all ${
                    roommatePref === 'match'
                      ? 'bg-[#ccff00] text-[#111315] shadow-sm'
                      : 'bg-[var(--color-modal-inset)] text-[var(--color-modal-subtext)] hover:text-[var(--color-modal-text)] hover:bg-[var(--color-modal-inset-hover)]'
                  }`}
                >
                  Auto-Match
                </button>
                <button
                  type="button"
                  onClick={() => setRoommatePref('friend')}
                  className={`py-2.5 px-3 rounded-xl text-center text-[12px] font-semibold cursor-pointer transition-all ${
                    roommatePref === 'friend'
                      ? 'bg-[#ccff00] text-[#111315] shadow-sm'
                      : 'bg-[var(--color-modal-inset)] text-[var(--color-modal-subtext)] hover:text-[var(--color-modal-text)] hover:bg-[var(--color-modal-inset-hover)]'
                  }`}
                >
                  Pair Friend
                </button>
                <button
                  type="button"
                  onClick={() => setRoommatePref('single')}
                  className={`py-2.5 px-3 rounded-xl text-center text-[12px] font-semibold cursor-pointer transition-all ${
                    roommatePref === 'single'
                      ? 'bg-[#ccff00] text-[#111315] shadow-sm'
                      : 'bg-[var(--color-modal-inset)] text-[var(--color-modal-subtext)] hover:text-[var(--color-modal-text)] hover:bg-[var(--color-modal-inset-hover)]'
                  }`}
                >
                  Solo Room
                </button>
              </div>

              {roommatePref === 'friend' && (
                <div className="mt-2.5">
                  <input
                    type="text"
                    placeholder="Enter friend's Student ID (e.g., 10984890)"
                    value={friendId}
                    onChange={(e) => setFriendId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[var(--color-modal-inset)] text-[13px] text-[var(--color-modal-text)] placeholder-[var(--color-text-disabled)] outline-none"
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[12px] font-normal text-[var(--color-modal-subtext)] mb-1 block">Student Name & ID</label>
                <input
                  type="text"
                  value={`${studentName} (${studentId})`}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[var(--color-modal-inset)] text-[13px] font-medium text-[var(--color-modal-text)] outline-none"
                />
              </div>
              <div>
                <label className="text-[12px] font-normal text-[var(--color-modal-subtext)] mb-1 block">Phone / WhatsApp</label>
                <input
                  type="text"
                  value={studentPhone}
                  onChange={(e) => setStudentPhone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[var(--color-modal-inset)] text-[13px] font-medium text-[var(--color-modal-text)] outline-none tabular-nums"
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--color-modal-inset)] text-[13px] flex flex-col gap-1.5">
              <div className="flex justify-between text-[var(--color-modal-subtext)]">
                <span>Semester Accommodation Fee</span>
                <span className="font-medium text-[var(--color-modal-text)] tabular-nums">{formatPrice(rentPrice, '')}</span>
              </div>
              <div className="flex justify-between text-[var(--color-modal-subtext)]">
                <span>Standby Generator & Water Deposit</span>
                <span className="font-medium text-[var(--color-modal-text)] tabular-nums">GH₵350</span>
              </div>
              <div className="flex justify-between text-[var(--color-modal-subtext)]">
                <span>Hostel Maintenance & Security Levy</span>
                <span className="font-medium text-[var(--color-modal-text)] tabular-nums">GH₵150</span>
              </div>
              <div className="flex justify-between pt-2 font-semibold text-[14px] text-[var(--color-modal-text)]">
                <span>Total Semester Due</span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#181b1f] text-[#ccff00] font-semibold tabular-nums">{formatPrice(totalAmount, '')}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-1/3 py-3.5 rounded-full bg-[var(--color-modal-inset)] text-[13px] font-medium text-[var(--color-modal-subtext)] hover:text-[var(--color-modal-text)] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-4 rounded-full bg-[#ccff00] text-[#111315] text-[13px] font-semibold hover:bg-[#b8e600] transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                ) : (
                  <>
                    <Award size={15} />
                    <span>Confirm & Lock Room</span>
                  </>
                )}
              </button>
            </div>

          </form>
        )}
      </div>
    </div>
  );
};
