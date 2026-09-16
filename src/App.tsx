import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ComplaintsProvider, useComplaints } from './context/ComplaintsContext';
import { Navbar, NavView } from './components/Navbar';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { UserProfileModal } from './components/UserProfileModal';
import { Toast } from './components/Toast';
import { ShieldAlert, Building2, Lock, ArrowRight } from 'lucide-react';

import { LandingView } from './views/LandingView';
import { DashboardView } from './views/DashboardView';
import { ReportPotholeView } from './views/ReportPotholeView';
import { MyComplaintsView } from './views/MyComplaintsView';
import { LiveMapView } from './views/LiveMapView';
import { VerificationCenterView } from './views/VerificationCenterView';
import { MunicipalAdminView } from './views/MunicipalAdminView';
import { AccountabilityView } from './views/AccountabilityView';
import { HowItWorksView } from './views/HowItWorksView';
import { Complaint } from './types';

const MainAppContent: React.FC = () => {
  const { user, openAuthModal } = useAuth();
  const [currentView, setCurrentView] = useState<NavView>('landing');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [selectedComplaintForVerification, setSelectedComplaintForVerification] = useState<string | null>(
    null
  );

  const isAuthority =
    user?.role === 'authority' ||
    user?.role === 'municipal_officer' ||
    user?.role === 'admin';

  const handleNavigate = (view: NavView) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectComplaintForVerification = (complaint: Complaint) => {
    setSelectedComplaintForVerification(complaint.id);
    setCurrentView('verification');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#0B0F17] text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Sticky GovTech Glass Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenProfile={() => setIsProfileModalOpen(true)}
      />

      {/* Main View Container */}
      <main className="flex-1">
        {currentView === 'landing' && (
          <LandingView onNavigate={handleNavigate} />
        )}

        {currentView === 'dashboard' && (
          <DashboardView
            onNavigate={handleNavigate}
            onSelectComplaintForVerification={handleSelectComplaintForVerification}
          />
        )}

        {currentView === 'report' && (
          <ReportPotholeView onNavigate={handleNavigate} />
        )}

        {currentView === 'my-complaints' && (
          <MyComplaintsView
            onNavigate={handleNavigate}
            onSelectComplaintForVerification={handleSelectComplaintForVerification}
          />
        )}

        {currentView === 'map' && (
          <LiveMapView
            onNavigate={handleNavigate}
            onSelectComplaintForVerification={handleSelectComplaintForVerification}
          />
        )}

        {currentView === 'verification' && (
          <VerificationCenterView
            onNavigate={handleNavigate}
            selectedComplaintId={selectedComplaintForVerification}
          />
        )}

        {currentView === 'admin' && (
          isAuthority ? (
            <MunicipalAdminView
              onNavigate={handleNavigate}
              onSelectComplaintForVerification={handleSelectComplaintForVerification}
            />
          ) : (
            <div className="min-h-[80vh] flex items-center justify-center p-4 sm:p-6">
              <div className="w-full max-w-lg rounded-2xl border border-amber-500/30 bg-slate-950/90 p-6 sm:p-8 shadow-2xl text-center space-y-5">
                <div className="h-16 w-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
                  <ShieldAlert className="h-8 w-8 text-amber-400" />
                </div>
                <div>
                  <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/10 text-amber-300 border border-amber-500/30 mb-2">
                    <Lock className="h-3 w-3" />
                    <span>Restricted Official Hub</span>
                  </span>
                  <h2 className="text-2xl font-black text-white">Municipal Officer Credentials Required</h2>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    The Authority Hub is restricted to verified municipal engineers and administrative officers for triage, contractor dispatching, and escrow disbursement. Citizens cannot access authority controls without valid municipal credentials.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-left text-xs space-y-2">
                  <div className="font-semibold text-slate-300">Quick Test Credentials (Authority):</div>
                  <div className="flex items-center justify-between text-slate-400 font-mono text-[11px]">
                    <span>Official ID:</span>
                    <span className="text-amber-300">rajesh.kadam@roadsetu.gov.in</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400 font-mono text-[11px]">
                    <span>Role:</span>
                    <span className="text-emerald-400">Executive Engineer & Triage Officer</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => openAuthModal('login', 'authority')}
                    className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-bold text-slate-950 hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/20"
                  >
                    <Building2 className="h-4 w-4" />
                    <span>Sign In with Authority Account</span>
                  </button>
                  <button
                    onClick={() => handleNavigate('dashboard')}
                    className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors"
                  >
                    <span>Return to Citizen Portal</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )
        )}

        {currentView === 'accountability' && (
          <AccountabilityView onNavigate={handleNavigate} />
        )}

        {currentView === 'how-it-works' && (
          <HowItWorksView onNavigate={handleNavigate} />
        )}
      </main>

      {/* Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* Modals & Overlays */}
      <AuthModal />
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onNavigateToMyComplaints={() => {
          setIsProfileModalOpen(false);
          handleNavigate('my-complaints');
        }}
        onNavigateToAuthority={() => {
          setIsProfileModalOpen(false);
          handleNavigate('admin');
        }}
      />
      <Toast />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <ComplaintsProvider>
        <MainAppContent />
      </ComplaintsProvider>
    </AuthProvider>
  );
}
