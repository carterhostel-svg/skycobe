import { supabase } from "../lib/supabase";
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { AppState, ViewState, Property, HostelBooking } from '../types';
import { PROPERTIES as INITIAL_PROPERTIES } from '../data';
import type { UserProfile, UserRole } from '../types/roles';
import { isOwner } from '../types/roles';

interface AppContextType extends AppState, ViewState {
  properties: Property[];
  addCustomProperty: (property: Property) => void;
  updateCustomProperty: (id: number | string, updates: Partial<Property>) => void;
  removeCustomProperty: (id: number | string) => void;
  toggleSave: (id: number | string) => void;
  setActiveFilter: (filter: string) => void;
  exploreSearchQuery: string;
  setExploreSearchQuery: (query: string) => void;
  setCurrentView: (view: 'home' | 'explore' | 'details' | 'saved' | 'profile' | 'signup' | 'virtual-tour' | 'price-alerts' | 'manager-dashboard') => void;
  setSelectedPropertyId: (id: number | string | null) => void;
  toastMessage: string | null;
  clearToast: () => void;
  showToast: (msg: string) => void;
  isFullscreen: boolean;
  user: any;
  toggleFullscreen: () => void;
  exitFullscreen: () => void;
  
  // Student Hostel Bookings
  bookings: HostelBooking[];
  addBooking: (booking: Omit<HostelBooking, 'id' | 'bookedAt' | 'bookingRef' | 'status'> & { status?: 'Confirmed' | 'Pending Review' | 'Checked In' }) => HostelBooking;
  cancelBooking: (id: string) => void;
  
  // Payment & Referral additions
  hasPaidOpportunityHub: boolean;
  setHasPaidOpportunityHub: (val: boolean) => void;
  earnedCredits: number;
  setEarnedCredits: React.Dispatch<React.SetStateAction<number>>;
  earnedCash: number;
  setEarnedCash: React.Dispatch<React.SetStateAction<number>>;
  referralCode: string;
  referees: { name: string; status: string; date: string; amount?: number }[];
  
  // Auth additions
  profile: UserProfile | null;
  profileLoading: boolean;
  updateRole: (role: UserRole, ownerType?: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
  isRoleModalOpen: boolean;
  setIsRoleModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  openRoleModal: () => void;
  isOwner: boolean;
  isStudent: boolean;
  isAccommodationOwner: boolean;
  isPropertyOwnerUser: boolean;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  loginDemoUser: (role?: 'student' | 'manager', name?: string, email?: string) => void;
  togglePersona: () => void;
  persona: 'student' | 'manager';
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [properties, setProperties] = useState<Property[]>(INITIAL_PROPERTIES);
  const [savedProperties, setSavedProperties] = useState<(number | string)[]>([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [exploreSearchQuery, setExploreSearchQuery] = useState('');
  const [currentView, setCurrentView] = useState<'home' | 'explore' | 'details' | 'saved' | 'profile' | 'signup' | 'virtual-tour' | 'price-alerts' | 'manager-dashboard'>('home');
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Student Hostel Bookings State
  const [bookings, setBookings] = useState<HostelBooking[]>(() => {
    try {
      const stored = localStorage.getItem('skycobe_student_bookings');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return [
      {
        id: 'book-1',
        propertyId: 1,
        propertyName: 'Akuafo Hall Annex (Platinum Wing)',
        propertyLoc: 'UG Legon · 3 min walk to Balme Library',
        propertyImg: '/src/assets/images/hero_student_residence_haven_1793064306511.jpg',
        roomType: '2-in-a-Room Premium En-Suite',
        semester: 'First Semester (Academic Year 2026/2027)',
        totalPrice: 5200,
        depositPaid: 2000,
        studentName: 'Alex Owusu',
        studentId: '10984721',
        studentPhone: '+233 55 123 4567',
        bookedAt: '2026-08-15',
        status: 'Confirmed',
        bookingRef: 'HAV-UG-8821',
        checkInDate: '28 Aug 2026',
      }
    ];
  });

  const addBooking = (bookingData: Omit<HostelBooking, 'id' | 'bookedAt' | 'bookingRef' | 'status'> & { status?: 'Confirmed' | 'Pending Review' | 'Checked In' }): HostelBooking => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const newBooking: HostelBooking = {
      ...bookingData,
      id: `book-${Date.now()}`,
      bookedAt: new Date().toISOString().split('T')[0],
      bookingRef: `HAV-UG-${randomNum}`,
      status: bookingData.status || 'Confirmed',
    };
    setBookings((prev) => {
      const updated = [newBooking, ...prev];
      try {
        localStorage.setItem('skycobe_student_bookings', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    return newBooking;
  };

  const cancelBooking = (id: string) => {
    setBookings((prev) => {
      const updated = prev.filter((b) => b.id !== id);
      try {
        localStorage.setItem('skycobe_student_bookings', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };
  
  const [user, setUser] = useState<any | null | undefined>(undefined);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

  const openRoleModal = () => setIsRoleModalOpen(true);

  // Payment & Referral states (unlocked by default for preview exploration)
  const [hasPaidOpportunityHub, setHasPaidOpportunityHubState] = useState(true);
  const [earnedCredits, setEarnedCredits] = useState(150);
  const [earnedCash, setEarnedCash] = useState(75);
  const [referralCode, setReferralCode] = useState('HAVEN-ALEX24');
  const [referees, setReferees] = useState<{ name: string; status: string; date: string; amount?: number }[]>([
    { name: 'Kofi Mensah (UG)', status: 'Booked Room', date: '2 days ago', amount: 50 },
    { name: 'Esi Frimpong (KNUST)', status: 'Verified Account', date: '1 week ago', amount: 25 },
  ]);

  const setHasPaidOpportunityHub = (val: boolean) => {
    setHasPaidOpportunityHubState(val);
    if (user) {
      localStorage.setItem(`paid_opp_hub_${user.id}`, val ? 'true' : 'false');
    }
  };

  const fetchProfile = async (userId: string) => {
    setProfileLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (!error && data) {
        const localRole = localStorage.getItem(`skycobe_role_${userId}`) as UserRole;
        const metaRole = (user?.user_metadata?.role || user?.user_metadata?.account_type) as UserRole;
        const managerRoles = ['manager', 'accommodation_owner', 'property_owner'];
        const resolvedRole = (localRole && managerRoles.includes(localRole))
          ? localRole
          : (metaRole && managerRoles.includes(metaRole))
            ? metaRole
            : (data.role || 'student');

        setProfile({
          ...data,
          role: resolvedRole,
          account_type: resolvedRole,
        } as UserProfile);
      } else {
        // If profile doesn't exist yet (e.g. freshly signed up with Google OAuth)
        const pendingRole = (localStorage.getItem('signupRole') as UserRole) || 'student';
        const pendingOwnerType = localStorage.getItem('signupOwnerType') || null;
        const newProfile: any = {
          id: userId,
          role: pendingRole,
          account_type: pendingRole,
          owner_type: pendingOwnerType as any,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        const { data: inserted, error: insertError } = await supabase
          .from('profiles')
          .insert(newProfile)
          .select()
          .single();

        if (!insertError && inserted) {
          setProfile(inserted as UserProfile);
        } else {
          setProfile({
            id: userId,
            role: pendingRole,
            owner_type: pendingOwnerType as any,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          } as UserProfile);
        }
        localStorage.removeItem('signupRole');
        localStorage.removeItem('signupOwnerType');
      }
    } catch (err) {
      console.warn("Failed to fetch profile", err);
    }
    setProfileLoading(false);
  };

  const syncUserData = (userObj: any) => {
    const code = userObj.id.substring(0, 8).toUpperCase();
    setHasPaidOpportunityHubState(localStorage.getItem(`paid_opp_hub_${userObj.id}`) === 'true');
    setReferralCode(code);
    setEarnedCredits(Number(localStorage.getItem(`credits_${userObj.id}`) || '0'));
    setEarnedCash(
      Number(localStorage.getItem(`cash_${userObj.id}`) || '0') +
      Number(localStorage.getItem(`cash_by_code_${code}`) || '0')
    );
    let baselineRefs: any[] = [];
    let codeRefs: any[] = [];
    try {
      const v1 = localStorage.getItem(`referees_${userObj.id}`);
      if (v1 && v1 !== 'undefined') {
        const parsed = JSON.parse(v1);
        if (Array.isArray(parsed)) baselineRefs = parsed;
      }
    } catch(e) {}
    try {
      const v2 = localStorage.getItem(`referees_by_code_${code}`);
      if (v2 && v2 !== 'undefined') {
        const parsed = JSON.parse(v2);
        if (Array.isArray(parsed)) codeRefs = parsed;
      }
    } catch(e) {}

    const uniqueRefs = [...baselineRefs, ...codeRefs].filter((value, index, self) =>
       index === self.findIndex((t) => t?.name === value?.name)
    );
    setReferees(uniqueRefs);
  };

  useEffect(() => {
    let isMounted = true;
    const hasAuthCode = window.location.search.includes('code=');
    const hasAuthToken = window.location.hash.includes('access_token=');
    const hasAuthError = window.location.search.includes('error=') || window.location.hash.includes('error=');
    const isAuthRedirect = hasAuthCode || hasAuthToken || hasAuthError;

    if (hasAuthError) {
      const params = new URLSearchParams(window.location.search);
      const desc = params.get('error_description') || 'Authentication failed';
      console.error('Auth error in URL:', desc);
      setUser(null);
      setProfile(null);
      setProfileLoading(false);
      return;
    }

    if (isAuthRedirect) {
      setProfileLoading(true);
    }

    const handleUserSession = async (userObj: any) => {
      if (!isMounted) return;
      setUser(userObj);
      await fetchProfile(userObj.id);
      if (!isMounted) return;
      syncUserData(userObj);

      // Clean authentication query/hash from the browser URL now that the session is safely established
      if (typeof window !== 'undefined') {
        const hasCodeOrToken = window.location.search.includes('code=') || window.location.hash.includes('access_token=');
        if (hasCodeOrToken && window.history.replaceState) {
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }
    };

    // 1. Listen for Supabase auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;

      if (session?.user) {
        await handleUserSession(session.user);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
        setProfileLoading(false);
      } else if (event === 'INITIAL_SESSION') {
        // If there's an auth code or token in the URL, wait for code exchange to complete
        const urlHasCode = window.location.search.includes('code=') || window.location.hash.includes('access_token=');
        if (!urlHasCode) {
          setUser(null);
          setProfile(null);
          setProfileLoading(false);
        }
      }
    });

    // 2. Check current session / complete exchange
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await handleUserSession(session.user);
          return;
        }
      } catch (err) {
        console.warn("Failed to get session", err);
      }

      // If code in URL and detectSessionInUrl hasn't completed, attempt exchange
      if (hasAuthCode) {
        const code = new URLSearchParams(window.location.search).get('code');
        if (code) {
          try {
            const { data, error } = await supabase.auth.exchangeCodeForSession(code);
            if (!error && data?.session?.user) {
              await handleUserSession(data.session.user);
              return;
            }
          } catch (e) {
            // Might have already been exchanged by Supabase listener; check session again
            try {
              const { data: { session } } = await supabase.auth.getSession();
              if (session?.user) {
                await handleUserSession(session.user);
                return;
              }
            } catch (ignore) {}
          }
        }
      }

      // Check for local demo user session
      const storedDemo = localStorage.getItem('skycobe_demo_user');
      if (storedDemo) {
        try {
          const parsed = JSON.parse(storedDemo);
          if (parsed?.id) {
            await handleUserSession(parsed);
            return;
          }
        } catch (e) {}
      }

      // Auto-initialize seamless student persona so every UI and feature is immediately visible
      const activePersona = (localStorage.getItem('skycobe_active_persona') as 'student' | 'manager') || 'student';
      const defaultUser = {
        id: activePersona === 'manager' ? 'demo-manager-id-01' : 'demo-student-id-01',
        email: activePersona === 'manager' ? 'kofi.mensah@haven.edu.gh' : 'alex.owusu@st.ug.edu.gh',
        user_metadata: {
          first_name: activePersona === 'manager' ? 'Kofi' : 'Alex',
          last_name: activePersona === 'manager' ? 'Mensah' : 'Owusu',
          full_name: activePersona === 'manager' ? 'Kofi Mensah' : 'Alex Owusu',
          account_type: activePersona,
          role: activePersona,
          university: 'University of Ghana, Legon',
          level: '300',
        }
      };
      if (isMounted) {
        await handleUserSession(defaultUser);
        setProfileLoading(false);
      }
    };

    initAuth();

    // Safety timeout: if after 5 seconds still profileLoading with pending code, reset loading safely
    const safetyTimeout = setTimeout(() => {
      if (!isMounted) return;
      setProfileLoading((loading) => {
        if (loading) {
          setUser((u: any) => (u !== undefined ? u : null));
          return false;
        }
        return loading;
      });
    }, 5000);

    return () => {
      isMounted = false;
      clearTimeout(safetyTimeout);
      subscription.unsubscribe();
    };
  }, []);

  // Sync earned credits/cash with local storage manually for mock
  useEffect(() => {
    if (user) {
      localStorage.setItem(`credits_${user.id}`, earnedCredits.toString());
      localStorage.setItem(`cash_${user.id}`, earnedCash.toString());
      localStorage.setItem(`referees_${user.id}`, JSON.stringify(referees));
    }
  }, [earnedCredits, earnedCash, referees, user]);

  const updateRole = async (role: UserRole, ownerType?: string) => {
    if (!user) return;
    const resolvedOwnerType = ownerType ?? (role === 'accommodation_owner' ? 'accommodation_owner' : null);

    // 1. Immediately cache in localStorage
    localStorage.setItem(`skycobe_role_${user.id}`, role);
    localStorage.setItem(`skycobe_onboarding_${user.id}`, 'done');

    // 2. Immediately update React state so UI updates instantaneously
    setProfile(prev => ({
      ...(prev || {
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
        created_at: new Date().toISOString(),
        avatar_url: user.user_metadata?.avatar_url || null,
        cover_url: null,
      }),
      role,
      account_type: role,
      owner_type: resolvedOwnerType as any,
      onboarding_completed: true,
      updated_at: new Date().toISOString(),
    } as UserProfile));

    // 3. Update Supabase Auth metadata
    try {
      await supabase.auth.updateUser({
        data: {
          role,
          account_type: role,
          owner_type: resolvedOwnerType,
          onboarding_completed: true,
        }
      });
    } catch (e) {
      console.warn("auth updateUser caught:", e);
    }

    // 4. Update Supabase database profiles table
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          role,
          account_type: role,
          owner_type: resolvedOwnerType,
          onboarding_completed: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        console.warn("Notice: full profile update failed, trying fallback:", error.message);
        // Fallback in case account_type or onboarding_completed column doesn't exist yet
        await supabase
          .from('profiles')
          .update({
            role,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id);
      }
    } catch (e) {
      console.warn("Profiles update caught:", e);
    }
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  const isOwnerUser = isOwner(profile?.role);
  const isStudentUser = profile?.role === 'student';
  const isAccommodationOwner = profile?.role === 'accommodation_owner';
  const isPropertyOwnerUser = profile?.role === 'property_owner';

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const { data, error } = await supabase.from("hostels").select("*, rooms(*)");
        if (error) throw error;
        
        if (data && data.length > 0) {
          const dbProperties = data.map(h => ({
            id: h.id, 
            name: h.name,
            loc: h.location || h.digital_address || "Accra",
            lat: h.lat || (5.6000 + (h.name.length * 0.001)),
            lng: h.lng || (-0.1900 + (h.name.length * 0.001)),
            panoramas: h.image_360_url ? [h.image_360_url] : [],
            images: [h.image_url, ...(h.rooms?.map((r: any) => r.image_url).filter(Boolean) || [])],
            amenities: h.amenities || [],
            policies: h.policies || "",
            rooms: h.rooms || [],
            videoTour: h.video_url,
            price: h.rooms && h.rooms.length > 0 ? `GH₵${h.rooms[0].price}` : "GH₵5,000",
            priceNum: h.rooms && h.rooms.length > 0 ? h.rooms[0].price : 5000,
            pricing_tag: h.rooms && h.rooms.length > 0 && h.rooms[0].pricing_tag ? h.rooms[0].pricing_tag : '/sem',
            rating: 0.0,
            reviews: 0,
            tags: h.amenities ? h.amenities.slice(0, 3) : [],
            category: "standard",
            avail: "Available",
            img: h.image_url || "/src/assets/images/hero_student_residence_haven_1793064306511.jpg",
            desc: h.description,
            dbId: h.id,
            manager_id: h.manager_id
          }));
          
          setProperties(prev => [...prev.filter(p => !dbProperties.find(d => d.name === p.name)), ...dbProperties]);
        }
      } catch (err) {
        console.warn("Error fetching properties, using local fallback data", err);
      }
    };
    
    fetchProperties();
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    // Auto fullscreen on first interaction
    const firstInteraction = () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch((err) => {
          console.warn(`Error attempting to enable fullscreen: ${err.message}`);
        });
      }
      document.removeEventListener('click', firstInteraction);
      document.removeEventListener('touchstart', firstInteraction);
    };

    document.addEventListener('click', firstInteraction);
    document.addEventListener('touchstart', firstInteraction);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('click', firstInteraction);
      document.removeEventListener('touchstart', firstInteraction);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.warn(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen().catch(err => console.warn(err));
    }
  };

  const exitFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(err => console.warn(err));
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  const addCustomProperty = (property: Property) => setProperties(prev => [...prev, property]);
  const updateCustomProperty = (id: number | string, updates: Partial<Property>) => {
    setProperties(prev => prev.map(h => h.id === id ? { ...h, ...updates } : h));
  };
  const removeCustomProperty = (id: number | string) => {
    setProperties(prev => prev.filter(h => h.id !== id && h.dbId !== id));
  };

  const toggleSave = (id: number | string) => {
    setSavedProperties((prev) =>
      prev.includes(id) ? prev.filter((propertyId) => propertyId !== id) : [...prev, id]
    );
  };

  const clearToast = () => setToastMessage(null);
  const showToast = (msg: string) => setToastMessage(msg);

  const loginDemoUser = (role: 'student' | 'manager' = 'student', name?: string, email?: string) => {
    const isHost = role === 'manager';
    const demoUser = {
      id: isHost ? 'demo-manager-id-01' : 'demo-student-id-01',
      email: email || (isHost ? 'manager@skycobe.com' : 'student@skycobe.com'),
      user_metadata: {
        first_name: name ? name.split(' ')[0] : isHost ? 'Kofi' : 'Alex',
        last_name: name ? name.split(' ').slice(1).join(' ') || 'User' : isHost ? 'Mensah' : 'Owusu',
        full_name: name || (isHost ? 'Kofi Mensah' : 'Alex Owusu'),
        account_type: role,
        role: role,
        university: 'University of Ghana, Legon',
        level: '300',
      }
    };
    localStorage.setItem('skycobe_demo_user', JSON.stringify(demoUser));
    localStorage.setItem(`skycobe_role_${demoUser.id}`, role);
    localStorage.setItem(`skycobe_onboarding_${demoUser.id}`, 'done');
    setUser(demoUser);
    setProfile({
      id: demoUser.id,
      role: role,
      account_type: role,
      first_name: demoUser.user_metadata.first_name,
      last_name: demoUser.user_metadata.last_name,
      full_name: demoUser.user_metadata.full_name,
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      cover_url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as UserProfile);
    syncUserData(demoUser);
    setProfileLoading(false);
  };

  const persona: 'student' | 'manager' = (profile?.role === 'manager' || profile?.role === 'accommodation_owner' || profile?.role === 'property_owner') ? 'manager' : 'student';

  const togglePersona = () => {
    const nextRole = persona === 'student' ? 'manager' : 'student';
    localStorage.setItem('skycobe_active_persona', nextRole);
    loginDemoUser(nextRole);
    showToast(nextRole === 'manager' ? 'Switched to Landlord / Manager Portal' : 'Switched to Student Discovery View');
  };

  return (
    <AppContext.Provider
      value={{
        properties,
        addCustomProperty,
        updateCustomProperty,
        removeCustomProperty,
        savedProperties,
        activeFilter,
        exploreSearchQuery,
        setExploreSearchQuery,
        currentView,
        selectedPropertyId,
        toggleSave,
        setActiveFilter,
        setCurrentView,
        setSelectedPropertyId,
        toastMessage,
        clearToast,
        showToast,
        isFullscreen,
        toggleFullscreen,
        user,
        exitFullscreen,
        profile,
        profileLoading,
        updateRole,
        refreshProfile,
        isRoleModalOpen,
        setIsRoleModalOpen,
        openRoleModal,
        isOwner: isOwnerUser,
        isStudent: isStudentUser,
        isAccommodationOwner,
        isPropertyOwnerUser,
        isSidebarOpen,
        toggleSidebar,
        hasPaidOpportunityHub,
        setHasPaidOpportunityHub,
        earnedCredits,
        setEarnedCredits,
        earnedCash,
        setEarnedCash,
        referralCode,
        referees,
        loginDemoUser,
        togglePersona,
        persona,
        bookings,
        addBooking,
        cancelBooking,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
