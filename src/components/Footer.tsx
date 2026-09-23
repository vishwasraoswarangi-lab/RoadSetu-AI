import React from 'react';
import {
  ShieldCheck,
  ArrowRight,
  Map,
  FilePlus2,
  BadgeCheck,
  BarChart3,
  Building2,
} from 'lucide-react';
import { NavView } from './Navbar';

interface FooterProps {
  onNavigate: (view: NavView) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="border-t border-slate-200 bg-white text-slate-600">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">

        {/* Main Footer */}
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">

          {/* Brand */}
          <div className="lg:col-span-1">
            <button
              onClick={() => onNavigate('landing')}
              className="flex items-center gap-3"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-sm font-black text-white shadow-sm">
                RS
              </div>

              <div className="text-left">
                <div className="text-base font-black tracking-tight text-slate-900">
                  ROAD<span className="text-blue-600">SETU</span>
                </div>

                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Civic Infrastructure
                </div>
              </div>
            </button>

            <p className="mt-5 max-w-xs text-sm leading-6 text-slate-500">
              A smart civic platform for reporting, tracking and
              verifying road infrastructure issues.
            </p>

            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
              Platform Online
            </div>
          </div>

          {/* Platform */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
              Platform
            </h3>

            <div className="mt-4 space-y-3">

              <button
                onClick={() => onNavigate('dashboard')}
                className="group flex items-center gap-2 text-sm transition hover:text-blue-600"
              >
                <BarChart3 className="h-4 w-4 text-slate-400 group-hover:text-blue-600" />
                Citizen Dashboard
              </button>

              <button
                onClick={() => onNavigate('report')}
                className="group flex items-center gap-2 text-sm transition hover:text-blue-600"
              >
                <FilePlus2 className="h-4 w-4 text-slate-400 group-hover:text-blue-600" />
                Report an Issue
              </button>

              <button
                onClick={() => onNavigate('map')}
                className="group flex items-center gap-2 text-sm transition hover:text-blue-600"
              >
                <Map className="h-4 w-4 text-slate-400 group-hover:text-blue-600" />
                Live City Map
              </button>

              <button
                onClick={() => onNavigate('my-complaints')}
                className="group flex items-center gap-2 text-sm transition hover:text-blue-600"
              >
                <BadgeCheck className="h-4 w-4 text-slate-400 group-hover:text-blue-600" />
                My Complaints
              </button>
            </div>
          </div>

          {/* Transparency */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
              Transparency
            </h3>

            <div className="mt-4 space-y-3">

              <button
                onClick={() => onNavigate('verification')}
                className="group flex items-center gap-2 text-sm transition hover:text-blue-600"
              >
                <ShieldCheck className="h-4 w-4 text-slate-400 group-hover:text-blue-600" />
                Verification Center
              </button>

              <button
                onClick={() => onNavigate('accountability')}
                className="group flex items-center gap-2 text-sm transition hover:text-blue-600"
              >
                <BarChart3 className="h-4 w-4 text-slate-400 group-hover:text-blue-600" />
                Public Accountability
              </button>

              <button
                onClick={() => onNavigate('admin')}
                className="group flex items-center gap-2 text-sm transition hover:text-blue-600"
              >
                <Building2 className="h-4 w-4 text-slate-400 group-hover:text-blue-600" />
                Municipal Portal
              </button>
            </div>
          </div>

          {/* System Card */}
          <div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">

              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100">
                  <ShieldCheck className="h-4 w-4 text-blue-600" />
                </div>

                <div>
                  <p className="text-xs font-black text-slate-900">
                    RoadSetu AI
                  </p>

                  <p className="text-[10px] text-slate-400">
                    Infrastructure integrity
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-2.5 text-xs">

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">
                    System Status
                  </span>

                  <span className="flex items-center gap-1.5 font-bold text-emerald-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Operational
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">
                    Verification
                  </span>

                  <span className="font-bold text-slate-700">
                    Active
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">
                    Coverage
                  </span>

                  <span className="font-bold text-slate-700">
                    Civic Roads
                  </span>
                </div>

              </div>

              <button
                onClick={() => onNavigate('accountability')}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-blue-700"
              >
                View Accountability
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 flex flex-col gap-4 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <p className="text-xs font-semibold text-slate-600">
              © 2026 RoadSetu AI
            </p>

            <p className="mt-1 text-[11px] text-slate-400">
              Report it. Track it. Verify it.
            </p>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            Verified civic infrastructure platform
          </div>

        </div>
      </div>
    </footer>
  );
};
