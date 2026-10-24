import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Header from './components/Header';
import BottomNavigation from './components/BottomNavigation';
import SearchOverlay from './components/SearchOverlay';

// Redesigned Home Page (Page 1)
const HomePage = lazy(() => import('./pages/HomePage'));

// Existing feature pages
const VideoHome = lazy(() => import('./pages/VideoHome'));
const VideoPlayer = lazy(() => import('./pages/VideoPlayer'));
const VideoUpload = lazy(() => import('./pages/VideoUpload'));
const FollowingFeed = lazy(() => import('./pages/FollowingFeed'));
const ConnectHome = lazy(() => import('./pages/ConnectHome'));
const PeopleDiscovery = lazy(() => import('./pages/PeopleDiscovery'));
const ChatPage = lazy(() => import('./pages/ChatPage'));
const NetworkPage = lazy(() => import('./pages/NetworkPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const WalletPage = lazy(() => import('./pages/WalletPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

// Student Learning & Sessions Routes
const SessionsPage = lazy(() => import('./pages/SessionsPage'));
const LearningRoomPage = lazy(() => import('./pages/LearningRoomPage'));
const LearningRequestsPage = lazy(() => import('./pages/LearningRequestsPage'));
const SkillGapAnalyzerPage = lazy(() => import('./pages/SkillGapAnalyzerPage'));
const CampusCommunityPage = lazy(() => import('./pages/CampusCommunityPage'));

// Loading Fallback
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-10 h-10">
        <div className="absolute inset-0 rounded-full border-2 border-teal-200"></div>
        <div className="absolute inset-0 rounded-full border-2 border-teal-600 border-t-transparent animate-spin"></div>
      </div>
      <p className="text-sm text-slate-400 font-medium">Loading SkillSwap...</p>
    </div>
  </div>
);

function AppContent() {
  const location = useLocation();
  // Check if we are on the Home page to avoid duplicate headers/navigation
  const isHomePage = location.pathname === '/';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 antialiased">
      {/* Global Header (shown on non-Home pages to prevent duplicate navigation) */}
      {!isHomePage && <Header />}

      {/* Search Overlay (global) */}
      <SearchOverlay />

      {/* Main Content */}
      <main className="flex-1 w-full">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Page 1: Redesigned Home Dashboard */}
            <Route path="/" element={<HomePage />} />

            {/* Video Section */}
            <Route path="/videos" element={<VideoHome />} />
            <Route path="/video/:id" element={<VideoPlayer />} />
            <Route path="/upload" element={<VideoUpload />} />
            <Route path="/following" element={<FollowingFeed />} />

            {/* Connect & SkillSwap Section */}
            <Route path="/connect" element={<ConnectHome />} />
            <Route path="/connect/people" element={<PeopleDiscovery />} />
            <Route path="/connect/chat/:userId" element={<ChatPage />} />
            <Route path="/connect/network" element={<NetworkPage />} />

            {/* Student Learning & Sessions Routes */}
            <Route path="/sessions" element={<SessionsPage />} />
            <Route path="/connect/sessions" element={<SessionsPage />} />
            <Route path="/room/:sessionId" element={<LearningRoomPage />} />
            <Route path="/requests" element={<LearningRequestsPage />} />
            <Route path="/connect/requests" element={<LearningRequestsPage />} />
            <Route path="/analyzer" element={<SkillGapAnalyzerPage />} />
            <Route path="/connect/analyzer" element={<SkillGapAnalyzerPage />} />
            <Route path="/campus" element={<CampusCommunityPage />} />
            <Route path="/connect/campus" element={<CampusCommunityPage />} />

            {/* Profile, Wallet, Settings */}
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/wallet" element={<WalletPage />} />
            <Route path="/settings" element={<SettingsPage />} />

            {/* Fallback */}
            <Route path="*" element={
              <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Page Not Found</h2>
                <p className="text-sm text-slate-500 mb-6">The page you are looking for doesn't exist yet.</p>
                <a href="/" className="px-5 py-2.5 rounded-xl bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 transition-colors shadow-sm">
                  Go Home
                </a>
              </div>
            } />
          </Routes>
        </Suspense>
      </main>

      {/* Bottom Navigation (shown on non-Home pages to avoid duplicate navigation) */}
      {!isHomePage && <BottomNavigation />}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </BrowserRouter>
  );
}

export default App;
