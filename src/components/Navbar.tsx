import React, { useState } from 'react';
import {
  Compass,
  FilePlus,
  BarChart3,
  CheckCircle,
  HelpCircle,
  User,
  LogOut,
  ChevronDown,
  Menu,
  X,
  FileText,
  Building2,
  Bell,
  Check,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useComplaints } from '../context/ComplaintsContext';

export type NavView =
  | 'landing'
  | 'dashboard'
  | 'report'
  | 'my-complaints'
  | 'map'
  | 'verification'
  | 'admin'
  | 'accountability'
  | 'how-it-works';

interface NavbarProps {
  currentView: NavView;
  onNavigate: (view: NavView) => void;
  onOpenProfile: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onOpenProfile,
}) => {
  const { user, logout, openAuthModal, switchRole } = useAuth();
  const { notifications, unreadNotificationCount, markNotificationAsRead } = useComplaints();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const handleNavClick = (view: NavView) => {
    onNavigate(view);
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
    setNotificationsOpen(false);
  };

  const isAuthority =
    user?.role === 'authority' ||
    user?.role === 'municipal_officer' ||
    user?.role === 'admin';

  const navItems = isAuthority
    ? [
        { id: 'admin' as NavView, label: 'Authority Hub', icon: Building2, highlight: true },
        { id: 'verification' as NavView, label: 'Verification Center', icon: CheckCircle },
        { id: 'map' as NavView, label: 'Jurisdiction Map', icon: Compass },
        { id: 'dashboard' as NavView, label: 'Citizen Feed', icon: BarChart3 },
        { id: 'accountability' as NavView, label: 'Public Audit', icon: BarChart3 },
      ]
    : [
        { id: 'dashboard' as NavView, label: 'Citizen Portal', icon: BarChart3 },
        { id: 'report' as NavView, label: 'Report Defect', icon: FilePlus, highlight: true },
        { id: 'my-complaints' as NavView, label: 'My Reports', icon: FileText, authRequired: true },
        { id: 'map' as NavView, label: 'Live City Map', icon: Compass },
        { id: 'verification' as NavView, label: 'Verification Center', icon: CheckCircle },
        { id: 'accountability' as NavView, label: 'Public Audit', icon: BarChart3 },
        { id: 'how-it-works' as NavView, label: 'How It Works', icon: HelpCircle },
      ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-cyan-500/15 bg-[#0B0F17]/90 backdrop-blur-xl transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <button
          onClick={() => handleNavClick(user ? 'dashboard' : 'landing')}
          className="group flex items-center space-x-3 text-left focus:outline-none"
        >
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 via-teal-500 to-emerald-400 p-0.5 shadow-md shadow-cyan-500/20 transition-transform group-hover:scale-105">
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-[#0B0F17]">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-cyan-400"
              >
                <path
                  d="M3 17C6 11 18 11 21 17"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
                <path
                  d="M7 14.5V19M12 12V19M17 14.5V19"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <circle cx="12" cy="7" r="2.5" fill="#06B6D4" />
                <path
                  d="M7 14.5L12 7L17 14.5"
                  stroke="#10B981"
                  strokeWidth="1.2"
                  strokeDasharray="2 2"
                />
              </svg>
            </div>
          </div>

          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-base font-black tracking-tight text-white sm:text-lg">
                ROAD<span className="text-cyan-400">SETU</span>
              </span>
              <span className="rounded bg-cyan-500/10 px-1.5 py-0.5 text-[10px] font-bold text-cyan-400 border border-cyan-500/30">
                AI
              </span>
            </div>
            <p className="hidden text-[10px] font-medium text-slate-400 sm:block leading-none">
              Civic Road Infrastructure Platform
            </p>
          </div>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center space-x-1">
          {navItems.map((item) => {
            if (item.authRequired && !user) return null;
            const Icon = item.icon;
            const isActive = currentView === item.id;

            if (item.highlight) {
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`relative flex items-center space-x-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30 ring-1 ring-cyan-300'
                      : 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/25'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex items-center space-x-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-slate-800 text-cyan-400 font-semibold'
                    : 'text-slate-300 hover:bg-slate-850 hover:text-white'
                }`}
              >
                <Icon className="h-3.5 w-3.5 text-slate-400" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Section: Notifications + User Auth / Profile */}
        <div className="flex items-center space-x-3">
          {user ? (
            <>
              {/* Notification Bell */}
              <div className="relative">
                <button
                  onClick={() => {
                    setNotificationsOpen(!notificationsOpen);
                    setProfileDropdownOpen(false);
                  }}
                  className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:border-cyan-500/40 hover:text-white transition-colors"
                >
                  <Bell className="h-4 w-4" />
                  {unreadNotificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm">
                      {unreadNotificationCount}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown */}
                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-800 bg-slate-950 p-3 shadow-2xl backdrop-blur-xl z-50">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                      <span className="text-xs font-bold text-white">Civic Notifications</span>
                      <span className="text-[10px] text-slate-400">{notifications.length} updates</span>
                    </div>

                    <div className="max-h-64 overflow-y-auto space-y-2">
                      {notifications.length === 0 ? (
                        <p className="text-xs text-slate-500 py-4 text-center">
                          No notifications yet.
                        </p>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            className={`p-2.5 rounded-xl border transition-colors ${
                              n.read
                                ? 'border-slate-800/60 bg-slate-900/40 text-slate-400'
                                : 'border-cyan-500/30 bg-cyan-950/20 text-slate-200'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <span className="font-semibold text-xs text-white block">
                                {n.title}
                              </span>
                              {!n.read && (
                                <button
                                  onClick={() => markNotificationAsRead(n.id)}
                                  className="text-[10px] text-cyan-400 hover:underline flex items-center space-x-0.5"
                                >
                                  <Check className="h-3 w-3" />
                                  <span>Read</span>
                                </button>
                              )}
                            </div>
                            <p className="text-[11px] mt-0.5 leading-relaxed">{n.message}</p>
                            <span className="text-[9px] text-slate-500 block mt-1">
                              {new Date(n.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Profile Pill & Dropdown */}
              <div className="relative">
                <button
                  onClick={() => {
                    setProfileDropdownOpen(!profileDropdownOpen);
                    setNotificationsOpen(false);
                  }}
                  className="flex items-center space-x-2 rounded-xl border border-slate-700 bg-slate-900/90 py-1.5 px-3 text-xs text-slate-200 shadow hover:border-cyan-500/50 hover:bg-slate-800 transition-all"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-400 font-bold">
                    {user.displayName.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-semibold max-w-[120px] truncate">
                    {user.displayName}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-800 bg-slate-950 p-2 shadow-2xl backdrop-blur-xl z-50 divide-y divide-slate-800/80">
                    <div className="px-3 py-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white truncate max-w-[130px]">
                          {user.displayName}
                        </span>
                        <span
                          className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                            isAuthority
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                          }`}
                        >
                          {isAuthority ? 'Authority' : 'Citizen'}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 truncate mt-0.5">
                        {user.email}
                      </div>
                      <div className="mt-1 flex items-center space-x-1 text-[10px] text-emerald-400 font-mono">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                        <span>UID: {user.uid.slice(0, 8)}...</span>
                      </div>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          onOpenProfile();
                        }}
                        className="flex w-full items-center space-x-2 rounded-lg px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white"
                      >
                        <User className="h-3.5 w-3.5 text-cyan-400" />
                        <span>Account Profile ({isAuthority ? 'Authority' : 'Citizen'})</span>
                      </button>

                      {isAuthority ? (
                        <button
                          onClick={() => handleNavClick('admin')}
                          className="flex w-full items-center space-x-2 rounded-lg px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white"
                        >
                          <Building2 className="h-3.5 w-3.5 text-amber-400" />
                          <span>Authority Hub</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleNavClick('my-complaints')}
                          className="flex w-full items-center space-x-2 rounded-lg px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white"
                        >
                          <FileText className="h-3.5 w-3.5 text-slate-400" />
                          <span>My Reports</span>
                        </button>
                      )}
                    </div>

                    <div className="pt-1">
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          logout();
                        }}
                        className="flex w-full items-center space-x-2 rounded-lg px-3 py-2 text-xs text-rose-400 hover:bg-rose-950/40"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => openAuthModal('login', 'citizen')}
                className="flex items-center space-x-1.5 rounded-xl bg-cyan-500 px-3 py-1.5 sm:px-4 sm:py-2 text-xs font-bold text-slate-950 shadow-md shadow-cyan-500/20 hover:bg-cyan-400 transition-colors"
              >
                <User className="h-3.5 w-3.5" />
                <span>Citizen Sign In</span>
              </button>
              <button
                onClick={() => openAuthModal('login', 'authority')}
                className="hidden sm:flex items-center space-x-1.5 rounded-xl border border-amber-500/40 bg-amber-950/30 px-3 py-2 text-xs font-bold text-amber-300 hover:bg-amber-900/40 transition-colors"
              >
                <Building2 className="h-3.5 w-3.5" />
                <span>Authority Hub</span>
              </button>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:text-white lg:hidden"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="border-t border-slate-800 bg-[#0B0F17] px-4 py-4 lg:hidden divide-y divide-slate-800">
          <div className="space-y-1 pb-3">
            {navItems.map((item) => {
              if (item.authRequired && !user) return null;
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex w-full items-center space-x-2.5 rounded-xl px-3 py-2 text-xs font-medium ${
                    isActive
                      ? 'bg-cyan-500/10 text-cyan-400 font-bold border border-cyan-500/30'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {!user && (
            <div className="pt-3">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openAuthModal('login');
                }}
                className="w-full rounded-xl bg-cyan-500 py-2.5 text-center text-xs font-bold text-slate-950 shadow hover:bg-cyan-400"
              >
                Sign In to Citizen Portal
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
