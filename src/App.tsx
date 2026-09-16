import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ComplaintsProvider } from './context/ComplaintsContext';
import { Navbar, NavView } from './components/Navbar';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { UserProfileModal } from './components/UserProfileModal';
import { Toast } from './components/Toast';
import { ShieldAlert, Building2, Lock, ArrowRight } from 'lucide-react';
import { LandingView } from './views/LandingView';
import { DashboardView } from './views/DashboardView';
import { ReportFlowView } from './views/ReportFlowView';
import { MyComplaintsView } from './views/MyComplaintsView';
import { LiveMapView } from './views/LiveMapView';
import { VerificationCenterView } from './views/VerificationCenterView';
import { MunicipalAdminView } from './views/MunicipalAdminView';
import { AccountabilityView } from './views/AccountabilityView';
import { Complaint } from './types';

const MainAppContent: React.FC = () => {
  const { user, openAuthModal } = useAuth();
  const [currentView, setCurrentView] = useState<NavView>('landing');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedComplaintForVerification, setSelectedComplaintForVerification] = useState<string | null>(null);
  const isAuthority = user?.role === 'authority' || user?.role === 'municipal_officer' || user?.role === 'admin';
  const handleNavigate = (view: NavView) => { setCurrentView(view); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const handleSelectComplaintForVerification = (complaint: Complaint) => { setSelectedComplaintForVerification(complaint.id); setCurrentView('verification'); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  return <div className="flex min-h-screen flex-col bg-[#0B0F17] text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950">
    <Navbar currentView={currentView} onNavigate={handleNavigate} onOpenProfile={() => setIsProfileModalOpen(true)} />
    <main className="flex-1">
      {currentView === 'landing' && <LandingView onNavigate={handleNavigate} />}
      {currentView === 'dashboard' && <DashboardView onNavigate={handleNavigate} onSelectComplaintForVerification={handleSelectComplaintForVerification} />}
      {currentView === 'report' && <ReportFlowView onNavigate={handleNavigate} />}
      {currentView === 'my-complaints' && <MyComplaintsView onNavigate={handleNavigate} onSelectComplaintForVerification={handleSelectComplaintForVerification} />}
      {currentView === 'map' && <LiveMapView onNavigate={handleNavigate} onSelectComplaintForVerification={handleSelectComplaintForVerification} />}
      {currentView === 'verification' && <VerificationCenterView onNavigate={handleNavigate} selectedComplaintId={selectedComplaintForVerification} />}
      {currentView === 'admin' && (isAuthority ? <MunicipalAdminView onNavigate={handleNavigate} onSelectComplaintForVerification={handleSelectComplaintForVerification} /> :
        <div className="min-h-[80vh] flex items-center justify-center p-4"><div className="w-full max-w-lg rounded-2xl border border-amber-500/30 bg-slate-950/90 p-8 text-center shadow-2xl">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-400"><ShieldAlert className="h-8 w-8" /></div>
          <span className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-300"><Lock className="h-3 w-3" />Restricted Official Hub</span>
          <h2 className="text-2xl font-black text-white">Verified Municipal Account Required</h2>
          <p className="mt-2 text-xs leading-relaxed text-slate-400">Authority controls are available only to accounts provisioned with a municipal authority role. Citizen accounts cannot self-register for official access.</p>
          <div className="mt-5 rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-left text-xs text-slate-400"><div className="font-semibold text-slate-300">Secure access</div><p className="mt-1">Use the authorized municipal account issued by your system administrator.</p></div>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-center"><button onClick={() => openAuthModal('login', 'authority')} className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-bold text-slate-950 hover:bg-amber-400"><Building2 className="h-4 w-4" />Sign In as Authority</button><button onClick={() => handleNavigate('dashboard')} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-xs font-semibold"><span>Return to Citizen Portal</span><ArrowRight className="h-3.5 w-3.5" /></button></div></div></div>)}
      {currentView === 'accountability' && <AccountabilityView onNavigate={handleNavigate} />}
    </main>
    <Footer onNavigate={handleNavigate} />
    <AuthModal />
    <UserProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} onNavigateToMyComplaints={() => { setIsProfileModalOpen(false); handleNavigate('my-complaints'); }} onNavigateToAuthority={() => { setIsProfileModalOpen(false); handleNavigate('admin'); }} />
    <Toast />
  </div>;
};

export default function App() { return <AuthProvider><ComplaintsProvider><MainAppContent /></ComplaintsProvider></AuthProvider>; }
