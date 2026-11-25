import React, { useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AppProvider, useAppContext } from "./context/AppContext";
import { AppShell } from "./components/layout/AppShell";
import { Home } from "./pages/Home";
import { Explore } from "./pages/Explore";
import { Details } from "./pages/Details";
import { Saved } from "./pages/Saved";
import { Profile } from "./pages/Profile";
import { SignUp } from "./pages/SignUp";
import { VirtualTour } from "./pages/VirtualTour";
import { EditProfile } from "./pages/EditProfile";
import { Toast } from "./components/Toast";
import { Toaster } from "sonner";
import { ErrorBoundary } from "./ErrorBoundary";
import { AuthCallback } from "./components/AuthCallback";

const AppContent: React.FC = () => {
  const { user, profileLoading } = useAppContext();
  const location = useLocation();

  useEffect(() => {
    // Scroll to top on route change
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div
      className="w-full min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)] flex flex-col font-sans transition-colors duration-200"
    >
      <Toaster 
        position="top-center" 
        theme="dark" 
        toastOptions={{ 
          style: { 
            background: '#1e2126', 
            color: '#f4f6f8', 
            border: 'none',
            boxShadow: '0 10px 30px rgba(0,0,0,0.28)'
          } 
        }} 
      />
      <Toast />

      <Routes>
        {/* Core Hostel Finding & Booking Views */}
        <Route
          path="/"
          element={
            <AppShell>
              <Home />
            </AppShell>
          }
        />
        <Route
          path="/explore"
          element={
            <AppShell>
              <Explore />
            </AppShell>
          }
        />
        <Route
          path="/saved"
          element={
            <AppShell>
              <Saved />
            </AppShell>
          }
        />
        <Route
          path="/profile"
          element={
            <AppShell>
              <Profile />
            </AppShell>
          }
        />
        <Route
          path="/details"
          element={
            <AppShell>
              <Details />
            </AppShell>
          }
        />
        <Route
          path="/property/:id"
          element={
            <AppShell>
              <Details />
            </AppShell>
          }
        />
        <Route
          path="/virtual-tour"
          element={
            <AppShell>
              <VirtualTour />
            </AppShell>
          }
        />

        {/* Auth / Account Routes */}
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path="/login" element={<SignUp />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* Redirect all old extraneous routes cleanly into core hostel views */}
        <Route path="/opportunities" element={<Navigate to="/" replace />} />
        <Route path="/manager/*" element={<Navigate to="/profile" replace />} />
        <Route path="/campus-guide" element={<Navigate to="/explore" replace />} />
        <Route path="/price-alerts" element={<Navigate to="/saved" replace />} />
        <Route path="/referrals" element={<Navigate to="/profile" replace />} />
        <Route path="/notifications" element={<Navigate to="/profile" replace />} />
        <Route path="/messages" element={<Navigate to="/profile" replace />} />
        <Route path="/settings" element={<Navigate to="/profile" replace />} />
        <Route path="/support" element={<Navigate to="/profile" replace />} />
        <Route path="/student/dashboard" element={<Navigate to="/" replace />} />
        <Route path="/see-all/*" element={<Navigate to="/" replace />} />
        <Route path="/landing" element={<Navigate to="/" replace />} />

        {/* Catch-all fallback */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <ErrorBoundary>
          <AppContent />
        </ErrorBoundary>
      </AppProvider>
    </BrowserRouter>
  );
}
