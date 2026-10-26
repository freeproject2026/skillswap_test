import React, { useState } from 'react';
import HomeSidebar from '../components/home/HomeSidebar';
import HomeHeader from '../components/home/HomeHeader';
import HeroBanner from '../components/home/HeroBanner';
import QuickActions from '../components/home/QuickActions';
import UpcomingSessionsCard from '../components/home/UpcomingSessionsCard';
import CreditsWalletCard from '../components/home/CreditsWalletCard';
import LearningProgressCard from '../components/home/LearningProgressCard';
import StudentProfileCard from '../components/home/StudentProfileCard';
import RecommendedStudentsCard from '../components/home/RecommendedStudentsCard';
import PopularSkillsCard from '../components/home/PopularSkillsCard';
import CommunityPromoCard from '../components/home/CommunityPromoCard';
import ExploreSkillsSection from '../components/home/ExploreSkillsSection';
import HomeFooter from '../components/home/HomeFooter';
import EditProfileModal from '../components/EditProfileModal';
import DashboardCustomizerModal from '../components/home/DashboardCustomizerModal';
import AuthModal from '../components/auth/AuthModal';
import { useApp } from '../context/AppContext';

export const HomePage = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const {
    currentUser,
    dashboardPrefs,
    dashboardCustomizerOpen,
    setDashboardCustomizerOpen,
    authModalOpen,
    setAuthModalOpen,
    authModalTab
  } = useApp();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors overflow-x-hidden">
      
      {/* 1. Dark Navy Left Sidebar (Fixed on desktop, drawer on mobile) */}
      <HomeSidebar
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
      />

      {/* Main Wrapper with Left Margin for Desktop Sidebar */}
      <div className="flex-1 flex flex-col lg:pl-64 min-w-0 transition-all">
        
        {/* 2. Top Header in Main Content Area */}
        <HomeHeader onMenuClick={() => setMobileSidebarOpen(true)} />

        {/* 3. Center Dashboard + Right Column */}
        <div className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-6">
          
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
            
            {/* Center Main Dashboard Column (8 cols on xl) */}
            <div className="xl:col-span-8 space-y-6 min-w-0">
              
              {/* Main Hero Banner (Customizable) */}
              {dashboardPrefs.hero !== false && <HeroBanner />}

              {/* Quick Actions (Customizable) */}
              {dashboardPrefs.quickActions !== false && <QuickActions />}

              {/* Two-Column Row: Your Credits (Left) + Upcoming Sessions (Right) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 items-start">
                <CreditsWalletCard />
                <UpcomingSessionsCard />
              </div>

              {/* Learning Progress (Customizable) */}
              {dashboardPrefs.learningProgress !== false && <LearningProgressCard />}

              {/* Explore Skills Section (Customizable) */}
              {dashboardPrefs.exploreSkills !== false && <ExploreSkillsSection />}
            </div>

            {/* Right Sidebar Column (4 cols on xl) */}
            <div className="xl:col-span-4 space-y-5 min-w-0">
              
              {/* Student Profile Card (Customizable) */}
              {dashboardPrefs.studentProfile !== false && (
                <StudentProfileCard onEditProfile={() => setEditProfileOpen(true)} />
              )}

              {/* Recommended Students (Customizable) */}
              {dashboardPrefs.recommendedStudents !== false && <RecommendedStudentsCard />}

              {/* Popular Skills on Campus (Customizable) */}
              {dashboardPrefs.popularSkills !== false && <PopularSkillsCard />}

              {/* Community Promotion Card (Customizable) */}
              {dashboardPrefs.communityPromo !== false && <CommunityPromoCard />}
            </div>

          </div>

          {/* 4. Subtle Home Page Footer */}
          <HomeFooter />

        </div>
      </div>

      {/* Edit Profile Modal (Reused existing component) */}
      <EditProfileModal
        isOpen={editProfileOpen}
        onClose={() => setEditProfileOpen(false)}
        currentProfile={currentUser}
        onSaveSuccess={() => setEditProfileOpen(false)}
      />

      {/* Dashboard Section Customizer Modal */}
      <DashboardCustomizerModal
        isOpen={dashboardCustomizerOpen}
        onClose={() => setDashboardCustomizerOpen(false)}
      />

      {/* Authentication & Guest Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialTab={authModalTab}
      />

    </div>
  );
};

export default HomePage;
