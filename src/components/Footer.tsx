import React from 'react';
import { ShieldCheck, Cpu, MapPin, ExternalLink, Terminal } from 'lucide-react';
import { NavView } from './Navbar';

interface FooterProps {
  onNavigate: (view: NavView) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="border-t border-slate-800/80 bg-[#070A0F] text-slate-400 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-cyan-500 to-teal-400 text-slate-950 font-bold text-xs">
                RS
              </div>
              <span className="text-base font-black tracking-tight text-white">
                ROAD<span className="text-cyan-400">SETU</span> AI
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              GovTech Smart City Infrastructure Integrity & Repair Verification Engine.
            </p>
            <p className="font-mono text-xs text-cyan-400">
              “Report it. Track it. Verify it.”
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Platform Modules
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('dashboard')}
                  className="hover:text-cyan-300 transition-colors"
                >
                  Citizen Dashboard
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('report')}
                  className="hover:text-cyan-300 transition-colors"
                >
                  Report Pothole Wizard
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('map')}
                  className="hover:text-cyan-300 transition-colors"
                >
                  Live City Map
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('verification')}
                  className="hover:text-cyan-300 transition-colors"
                >
                  AI Verification Center
                </button>
              </li>
            </ul>
          </div>

          {/* Governance & Admin */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Civic Accountability
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('accountability')}
                  className="hover:text-cyan-300 transition-colors"
                >
                  Public Transparency Index
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('admin')}
                  className="hover:text-cyan-300 transition-colors"
                >
                  Municipal Command Center
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('how-it-works')}
                  className="hover:text-cyan-300 transition-colors"
                >
                  AI Parallax Methodology
                </button>
              </li>
            </ul>
          </div>

          {/* Telemetry Status */}
          <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-3 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-semibold flex items-center space-x-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Smart City Node Online</span>
              </span>
              <span className="font-mono text-[10px] text-emerald-400">99.98% SLA</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Active GIS nodes covering Thane, Mumbai MMR & Smart Corridor corridors.
            </p>
            <div className="pt-1 text-[10px] font-mono text-slate-500 flex items-center justify-between">
              <span>Reverse Geocoding: Active</span>
              <span>RTK Delta: &lt;1.5m</span>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-900 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© 2026 RoadSetu AI. National Smart City Infrastructure Initiative.</p>
          <div className="mt-2 sm:mt-0 flex items-center space-x-4">
            <span className="flex items-center space-x-1 text-slate-400">
              <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
              <span>Zero-Fraud Repair Clearance</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
