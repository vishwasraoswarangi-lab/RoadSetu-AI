import React, { useState } from 'react';
import {
  Compass, FilePlus, BarChart3, CheckCircle, User, LogOut,
  ChevronDown, Menu, X, FileText, Building2, Bell,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useComplaints } from '../context/ComplaintsContext';

export type NavView =
  | 'landing' | 'dashboard' | 'report' | 'my-complaints' | 'map'
  | 'verification' | 'admin' | 'accountability';

interface NavbarProps {
  currentView: NavView;
  onNavigate: (view: NavView) => void;
  onOpenProfile: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate, onOpenProfile }) => {
  const { user, logout, openAuthModal } = useAuth();
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

  const isAuthority = user?.role === 'authority' || user?.role === 'municipal_officer' || user?.role === 'admin';

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
      ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-xl transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        <button
          onClick={() => handleNavClick(user ? 'dashboard' : 'landing')}
          className="group flex items-center space-x-3 text-left focus:outline-none"
        >
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-500 via-blue-400 to-yellow-400 p-0.5 shadow-md shadow-blue-500/20 transition-transform group-hover:scale-105">
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-white">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-blue-500"
              >
                <path
                  d="M3 17C6 11 18 11 21 17"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
                <path
                  d="M5 17L7 13L9 15L12 9L15 14L17 11L19 17"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>

          <div>
            <div className="font-black tracking-tight text-slate-900">
              RoadSetu <span className="text-blue-500">AI</span>
            </div>
            <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500">
              Civic Road Intelligence
            </div>
          </div>
        </button>

        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.map(item => {
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() =>
                  item.authRequired && !user
                    ? openAuthModal('login')
                    : handleNavClick(item.id)
                }
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition ${
                  currentView === item.id
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                } ${
                  item.highlight
                    ? 'ring-1 ring-yellow-300'
                    : ''
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">

          {user && (
            <div className="relative hidden sm:block">
              <button
                onClick={() => setNotificationsOpen(v => !v)}
                className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-blue-600"
              >
                <Bell className="h-5 w-5" />

                {unreadNotificationCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 min-w-4 rounded-full bg-red-500 px-1 text-[9px] font-black text-white">
                    {unreadNotificationCount}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 top-12 z-50 w-80 rounded-xl border border-slate-200 bg-white p-2 shadow-2xl">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-sm text-slate-500">
                      No notifications yet.
                    </div>
                  ) : (
                    notifications.slice(0, 8).map(n => (
                      <button
                        key={n.id}
                        onClick={() => markNotificationAsRead(n.id)}
                        className={`block w-full rounded-lg p-3 text-left hover:bg-slate-50 ${
                          n.read ? 'opacity-60' : ''
                        }`}
                      >
                        <div className="text-sm font-bold text-slate-900">
                          {n.title}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          {n.message}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {user ? (
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(v => !v)}
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-100"
              >
                <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-blue-50 text-blue-600">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                </div>

                <span className="hidden max-w-28 truncate text-xs font-bold text-slate-800 sm:block">
                  {user.displayName}
                </span>

                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 top-12 z-50 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-2xl">
                  <button
                    onClick={onOpenProfile}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <User className="h-4 w-4" />
                    Profile
                  </button>

                  <button
                    onClick={() => logout()}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-500 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => openAuthModal('login')}
              className="rounded-lg bg-blue-500 px-4 py-2 text-xs font-black text-white hover:bg-blue-600"
            >
              Sign in
            </button>
          )}

          <button
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            onClick={() => setMobileMenuOpen(v => !v)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-slate-200 bg-white p-3 lg:hidden">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() =>
                item.authRequired && !user
                  ? openAuthModal('login')
                  : handleNavClick(item.id)
              }
              className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-bold text-slate-700 hover:bg-blue-50"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
};
