import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CalendarCheck, 
  ShieldCheck, 
  MapPin, 
  Moon, 
  Sun, 
  Monitor, 
  QrCode, 
  Copy, 
  Trash2, 
  Heart, 
  Compass, 
  Phone, 
  X,
  Sliders,
  CheckCircle2
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useTheme, type ThemeMode } from '../context/ThemeContext';
import { formatPrice } from '../lib/formatPrice';
import { HostelBooking } from '../types';

export const Profile: React.FC = () => {
  const { bookings, cancelBooking, savedProperties, showToast } = useAppContext();
  const { resolved, setMode } = useTheme();
  const navigate = useNavigate();

  const [activeVoucher, setActiveVoucher] = useState<HostelBooking | null>(null);

  // Student Profile Info
  const student = {
    name: 'Alex Owusu',
    id: '10984721',
    email: 'alex.owusu@ug.edu.gh',
    phone: '+233 55 123 4567',
    university: 'University of Ghana, Legon',
    department: 'Department of Computer Science',
    level: 'Level 300',
    avatar: '/src/assets/images/student_alex_avatar_1793064702975.jpg',
    cover: '/src/assets/images/campus_quad_cover_1793064715898.jpg',
  };

  const handleCopy = (text: string, label: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      showToast(`${label} copied to clipboard!`);
    }
  };

  const handleCancelReservation = (bookingId: string, propertyName: string) => {
    if (window.confirm(`Are you sure you want to cancel your reservation at ${propertyName}?`)) {
      cancelBooking(bookingId);
      showToast(`Reservation at ${propertyName} cancelled.`);
      if (activeVoucher?.id === bookingId) setActiveVoucher(null);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)] font-sans pb-32">
      
      <div className="relative w-full h-48 sm:h-60 bg-[var(--color-surface-2)] overflow-hidden">
        <img
          src={student.cover}
          alt="Campus Quad"
          className="w-full h-full object-cover brightness-[0.82]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg)] via-[var(--color-bg)]/55 to-transparent pointer-events-none" />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-20 relative z-10 w-full flex flex-col gap-8">
        
        <div className="bg-[var(--color-surface)] rounded-[2.5rem] p-6 sm:p-8 shadow-[var(--shadow-card-val)] flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden shrink-0 shadow-md bg-[var(--color-surface-2)]">
              <img
                src={student.avatar}
                alt={student.name}
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-[#ccff00]" title="Active Student" />
            </div>

            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-[22px] sm:text-[24px] font-semibold text-[var(--color-text-primary)] tracking-[-0.015em]">
                  {student.name}
                </h1>
                <span className="text-[12px] text-[#15803d] font-medium flex items-center gap-1">
                  <ShieldCheck size={14} /> Verified Student
                </span>
              </div>

              <p className="text-[13px] font-medium text-[var(--color-text-primary)] mt-1">
                {student.department} · {student.level}
              </p>
              <p className="text-[12px] text-[var(--color-text-secondary)] mt-0.5 tabular-nums">
                {student.university} · ID: <span className="text-[var(--color-text-primary)] font-medium">{student.id}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/saved')}
              className="px-5 py-3 rounded-full bg-[var(--color-surface-2)] text-[13px] font-semibold text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] transition-colors cursor-pointer flex items-center gap-2 shadow-sm"
            >
              <Heart size={14} className="text-rose-500 fill-rose-500" />
              <span className="tabular-nums">Saved ({savedProperties.length})</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-6 py-3 rounded-full bg-[#ccff00] text-[#111315] text-[13px] font-semibold hover:bg-[#b8e600] transition-all cursor-pointer shadow-md flex items-center gap-2"
            >
              <Compass size={15} className="text-[#111315]" />
              <span>Browse Hostels</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-6">
            
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-2">
                <CalendarCheck size={18} className="text-[var(--color-text-primary)]" />
                <h2 className="text-[18px] sm:text-[20px] font-semibold text-[var(--color-text-primary)] tracking-[-0.01em]">
                  My Hostel Reservations
                </h2>
              </div>
              <span className="text-[13px] font-medium text-[var(--color-text-secondary)] tabular-nums">
                {bookings.length} {bookings.length === 1 ? 'allocation' : 'allocations'}
              </span>
            </div>

            {bookings.length > 0 ? (
              <div className="space-y-5">
                {bookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="bg-[var(--color-surface)] rounded-[2rem] p-5 sm:p-6 shadow-[var(--shadow-card-val)] flex flex-col sm:flex-row gap-5"
                  >
                    <div className="relative w-full sm:w-44 h-36 rounded-2xl overflow-hidden shrink-0 bg-[var(--color-surface-2)]">
                      <img
                        src={booking.propertyImg}
                        alt={booking.propertyName}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-2.5 left-2.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-[#ccff00] text-[#111315]">
                        {booking.status}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="text-[16px] sm:text-[18px] font-semibold text-[var(--color-text-primary)] leading-snug">
                              {booking.propertyName}
                            </h3>
                            <p className="text-[13px] text-[var(--color-text-secondary)] flex items-center gap-1 mt-0.5">
                              <MapPin size={13} className="text-[var(--color-text-primary)] shrink-0" />
                              <span className="truncate">{booking.propertyLoc}</span>
                            </p>
                          </div>

                          <div className="text-right">
                            <span className="text-[11px] text-[var(--color-text-secondary)] block">Ref Code</span>
                            <div className="text-[13px] font-semibold text-[var(--color-text-primary)] tabular-nums">
                              {booking.bookingRef}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mt-4 py-3 bg-[var(--color-surface-2)] rounded-xl px-4 text-[13px]">
                          <div>
                            <span className="text-[12px] text-[var(--color-text-secondary)] block">Room</span>
                            <span className="font-medium text-[var(--color-text-primary)] truncate block mt-0.5">{booking.roomType}</span>
                          </div>
                          <div>
                            <span className="text-[12px] text-[var(--color-text-secondary)] block">Term</span>
                            <span className="font-medium text-[var(--color-text-primary)] truncate block mt-0.5">{booking.semester}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-3 mt-4 pt-1">
                        <div>
                          <span className="text-[12px] text-[var(--color-text-secondary)] block">Semester Rent</span>
                          <span className="text-[17px] font-semibold text-[var(--color-text-primary)] tabular-nums">
                            {formatPrice(booking.totalPrice, '')}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleCancelReservation(booking.id, booking.propertyName)}
                            className="p-2.5 rounded-full text-[#b91c1c] hover:bg-red-600/10 transition-colors cursor-pointer"
                            title="Cancel reservation"
                          >
                            <Trash2 size={16} />
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => setActiveVoucher(booking)}
                            className="px-4 py-2 rounded-full bg-[var(--color-island-bg)] hover:bg-[var(--color-island-hover)] text-[13px] font-semibold text-[#ccff00] transition-colors cursor-pointer flex items-center gap-2 shadow-sm"
                          >
                            <QrCode size={14} className="text-[#ccff00]" />
                            <span>Room Voucher</span>
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 rounded-[2rem] bg-[var(--color-surface)] text-center flex flex-col items-center justify-center gap-3 shadow-[var(--shadow-card-val)]">
                <CalendarCheck size={32} className="text-[var(--color-text-secondary)]" />
                <h3 className="text-[16px] font-semibold text-[var(--color-text-primary)]">No active room bookings</h3>
                <p className="text-[13px] text-[var(--color-text-secondary)] max-w-sm leading-relaxed">
                  You have not reserved a hostel room for Academic Year 2026/2027 yet. Find a verified residence to lock in your semester allocation.
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="mt-2 px-5 py-2.5 rounded-full bg-[#ccff00] hover:bg-[#b8e600] text-[#111315] text-[13px] font-semibold cursor-pointer shadow-md"
                >
                  Find Hostels Now
                </button>
              </div>
            )}

            <div className="bg-[var(--color-surface)] rounded-[2rem] p-6 shadow-[var(--shadow-card-val)] space-y-4">
              <div className="flex items-center justify-between pb-1">
                <div className="flex items-center gap-2">
                  <Sliders size={16} className="text-[var(--color-text-primary)]" />
                  <h3 className="text-[16px] font-semibold text-[var(--color-text-primary)]">
                    Roommate & Living Preferences
                  </h3>
                </div>
                <span className="text-[12px] font-medium text-[#15803d]">
                  Profile Active
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[13px]">
                <div className="p-4 rounded-2xl bg-[var(--color-surface-2)]">
                  <span className="text-[12px] font-normal text-[var(--color-text-secondary)] block">Study Habits</span>
                  <p className="font-medium text-[var(--color-text-primary)] mt-1">Quiet study in room · Late night reviews</p>
                </div>
                <div className="p-4 rounded-2xl bg-[var(--color-surface-2)]">
                  <span className="text-[12px] font-normal text-[var(--color-text-secondary)] block">Sleep Schedule</span>
                  <p className="font-medium text-[var(--color-text-primary)] mt-1 tabular-nums">12:00 AM – 7:30 AM</p>
                </div>
                <div className="p-4 rounded-2xl bg-[var(--color-surface-2)]">
                  <span className="text-[12px] font-normal text-[var(--color-text-secondary)] block">AC / Temperature</span>
                  <p className="font-medium text-[var(--color-text-primary)] mt-1">Prefers AC on during night sleep</p>
                </div>
                <div className="p-4 rounded-2xl bg-[var(--color-surface-2)]">
                  <span className="text-[12px] font-normal text-[var(--color-text-secondary)] block">Cleaning Rota</span>
                  <p className="font-medium text-[var(--color-text-primary)] mt-1">Weekly alternating rota with roommate</p>
                </div>
              </div>
            </div>

          </div>

          <div className="space-y-6">
            
            <div className="bg-[var(--color-surface)] rounded-[2rem] p-6 shadow-[var(--shadow-card-val)] space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-[15px] font-semibold text-[var(--color-text-primary)]">
                  Appearance
                </h3>
                <span className="text-[12px] font-medium text-[var(--color-text-secondary)]">
                  {resolved === 'light' ? 'Light' : 'Ash'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-[var(--color-surface-2)]" role="radiogroup" aria-label="App theme">
                <button
                  type="button"
                  role="radio"
                  aria-checked={resolved === 'light'}
                  onClick={() => {
                    setMode('light');
                    showToast('Light theme activated');
                  }}
                  className={`py-2.5 px-3 rounded-xl text-[13px] font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    resolved === 'light'
                      ? 'bg-[#ccff00] text-[#111315] shadow-sm'
                      : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                  }`}
                >
                  <Sun size={15} />
                  <span>Light</span>
                </button>
                <button
                  type="button"
                  role="radio"
                  aria-checked={resolved === 'dark'}
                  onClick={() => {
                    setMode('dark');
                    showToast('Ash theme activated');
                  }}
                  className={`py-2.5 px-3 rounded-xl text-[13px] font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    resolved === 'dark'
                      ? 'bg-[#ccff00] text-[#111315] shadow-sm'
                      : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                  }`}
                >
                  <Moon size={15} />
                  <span>Ash</span>
                </button>
              </div>
            </div>

            <div className="bg-[var(--color-surface)] rounded-[2rem] p-6 shadow-[var(--shadow-card-val)] space-y-4">
              <h3 className="text-[15px] font-semibold text-[var(--color-text-primary)]">
                Student Verification Dossier
              </h3>

              <div className="space-y-3.5 text-[14px]">
                <div>
                  <span className="text-[12px] text-[var(--color-text-secondary)] block mb-0.5">Institution</span>
                  <span className="font-medium text-[var(--color-text-primary)]">{student.university}</span>
                </div>
                <div>
                  <span className="text-[12px] text-[var(--color-text-secondary)] block mb-0.5">Student ID Number</span>
                  <span className="font-medium text-[var(--color-text-primary)] tabular-nums">{student.id}</span>
                </div>
                <div>
                  <span className="text-[12px] text-[var(--color-text-secondary)] block mb-0.5">Institutional Email</span>
                  <span className="font-medium text-[var(--color-text-primary)]">{student.email}</span>
                </div>
                <div>
                  <span className="text-[12px] text-[var(--color-text-secondary)] block mb-0.5">Primary Contact</span>
                  <span className="font-medium text-[var(--color-text-primary)] tabular-nums">{student.phone}</span>
                </div>
              </div>
            </div>

            <div className="bg-[var(--color-surface)] rounded-[2rem] p-6 shadow-[var(--shadow-card-val)] space-y-3 text-[13px] text-[var(--color-text-secondary)]">
              <div className="flex items-center gap-2 font-semibold text-[15px] text-[var(--color-text-primary)]">
                <Phone size={15} className="text-[var(--color-text-primary)]" />
                <span>Accommodation Warden Helpline</span>
              </div>
              <p className="leading-relaxed text-[var(--color-text-secondary)] text-[13px]">
                Need to verify room keys, report maintenance, or discuss semester payment installments? Contact the student housing desk:
              </p>
              <div className="pt-1 font-semibold text-[var(--color-text-primary)] text-[16px] tabular-nums">
                +233 30 294 8810
              </div>
            </div>

          </div>

        </div>

      </div>

      {activeVoucher && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div 
            className="relative w-full max-w-md bg-[var(--color-modal-bg)] rounded-[2.5rem] shadow-2xl p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4">
              <div>
                <span className="text-[12px] font-medium text-[#15803d] dark:text-emerald-400">
                  Verified Allocation
                </span>
                <h3 className="text-[20px] font-semibold text-[var(--color-modal-text)] tracking-[-0.01em]">
                  Student Room Voucher
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveVoucher(null)}
                className="w-9 h-9 rounded-full bg-[var(--color-modal-inset)] flex items-center justify-center text-[var(--color-modal-subtext)] hover:text-[var(--color-modal-text)] cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="py-4 flex flex-col items-center text-center">
              <div className="p-4 bg-white rounded-2xl shadow-md mb-4">
                <div className="w-36 h-36 bg-[#181b1f] p-2 rounded-xl flex items-center justify-center text-white">
                  <QrCode size={110} />
                </div>
              </div>

              <span className="text-[12px] text-[var(--color-modal-subtext)]">Voucher Code</span>
              <div className="inline-flex items-center gap-2 mt-1.5 px-4 py-1.5 rounded-full bg-[#181b1f] text-[#ccff00] text-[20px] font-semibold tabular-nums">
                <span>{activeVoucher.bookingRef}</span>
                <button
                  type="button"
                  onClick={() => handleCopy(activeVoucher.bookingRef, 'Voucher code')}
                  className="text-white hover:text-[#ccff00] cursor-pointer"
                  title="Copy code"
                >
                  <Copy size={16} />
                </button>
              </div>

              <div className="w-full mt-6 p-4 rounded-2xl bg-[var(--color-modal-inset)] text-left text-[13px] space-y-2.5">
                <div className="flex justify-between gap-3">
                  <span className="text-[var(--color-modal-subtext)]">Hostel</span>
                  <span className="font-semibold text-[var(--color-modal-text)] text-right">{activeVoucher.propertyName}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-[var(--color-modal-subtext)]">Room</span>
                  <span className="font-medium text-[var(--color-modal-text)] text-right">{activeVoucher.roomType}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-[var(--color-modal-subtext)]">Student</span>
                  <span className="font-medium text-[var(--color-modal-text)] text-right tabular-nums">{activeVoucher.studentName} ({activeVoucher.studentId})</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-[var(--color-modal-subtext)]">Check-in</span>
                  <span className="font-medium text-[var(--color-modal-text)] text-right tabular-nums">{activeVoucher.checkInDate}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveVoucher(null)}
              className="w-full py-4 rounded-full bg-[#ccff00] text-[#111315] text-[14px] font-semibold hover:bg-[#b8e600] transition-colors cursor-pointer shadow-md mt-2"
            >
              Close Voucher
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
