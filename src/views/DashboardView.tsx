import React from 'react';
import {
  FilePlus,
  Compass,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  MapPin,
  ExternalLink,
  Layers,
  Calendar,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useComplaints } from '../context/ComplaintsContext';
import { NavView } from '../components/Navbar';
import { Complaint } from '../types';

interface DashboardViewProps {
  onNavigate: (view: NavView) => void;
  onSelectComplaintForVerification?: (complaint: Complaint) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onSelectComplaintForVerification,
}) => {
  const { user } = useAuth();
  const { userComplaints, stats } = useComplaints();

  const unresolvedCount = userComplaints.filter(
    (c) => c.status === 'reported' || c.status === 'ai_analyzed'
  ).length;
  const underRepairCount = userComplaints.filter(
    (c) => c.status === 'repair_in_progress' || c.status === 'repair_claimed'
  ).length;
  const verifiedCount = userComplaints.filter((c) => c.status === 'verified').length;

  return (
    <div className="min-h-screen bg-[#0B0F17] p-4 sm:p-6 lg:p-8 text-slate-100">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Welcome Header */}
        <div className="rounded-2xl border border-cyan-500/25 bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/40 p-6 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400">
                  Citizen Portal • Active Session
                </span>
              </div>
              <h1 className="mt-1 text-2xl sm:text-3xl font-black text-white">
                Welcome back, {user?.displayName || 'Citizen'}
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-slate-400">
                Track your submitted road complaints, monitor municipal SLA timers, and inspect AI repair verifications.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => onNavigate('report')}
                className="inline-flex items-center space-x-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 px-5 py-2.5 text-xs font-bold text-slate-950 shadow-lg shadow-cyan-500/20 hover:brightness-110"
              >
                <FilePlus className="h-4 w-4" />
                <span>Report New Pothole</span>
              </button>

              <button
                onClick={() => onNavigate('map')}
                className="inline-flex items-center space-x-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:text-white"
              >
                <Compass className="h-4 w-4 text-cyan-400" />
                <span>Live City Map</span>
              </button>
            </div>
          </div>
        </div>

        {/* Authority Role Quick Banner */}
        {(user?.role === 'municipal_officer' || user?.role === 'admin') && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl border border-amber-500/40 bg-amber-950/25 p-4 shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-amber-300">
                  Municipal Authority Portal Available
                </div>
                <p className="text-xs text-slate-300">
                  You are authenticated with Authority privileges. Access the Authority Hub to triage reports, dispatch jetpatcher crews, and approve verified contractor payouts.
                </p>
              </div>
            </div>

            <button
              onClick={() => onNavigate('admin')}
              className="flex items-center space-x-1.5 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 shadow hover:bg-amber-400 transition-all shrink-0"
            >
              <span>Open Authority Hub</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* User Stats Grid */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Reports Filed
            </span>
            <div className="mt-2 font-mono text-3xl font-bold text-white">
              {userComplaints.length}
            </div>
            <p className="mt-1 text-[11px] text-cyan-400">Submitted by your account</p>
          </div>

          <div className="rounded-2xl border border-rose-500/20 bg-slate-900/60 p-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Awaiting Repair
            </span>
            <div className="mt-2 font-mono text-3xl font-bold text-rose-400">
              {unresolvedCount}
            </div>
            <p className="mt-1 text-[11px] text-rose-400/80">Pending municipal dispatch</p>
          </div>

          <div className="rounded-2xl border border-amber-500/20 bg-slate-900/60 p-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              In Repair
            </span>
            <div className="mt-2 font-mono text-3xl font-bold text-amber-300">
              {underRepairCount}
            </div>
            <p className="mt-1 text-[11px] text-amber-400/80">Asphalt crew on site</p>
          </div>

          <div className="rounded-2xl border border-emerald-500/20 bg-slate-900/60 p-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Verified & Closed
            </span>
            <div className="mt-2 font-mono text-3xl font-bold text-emerald-400">
              {verifiedCount}
            </div>
            <p className="mt-1 text-[11px] text-emerald-400/80">AI parallax certified</p>
          </div>
        </div>

        {/* Recent Submissions List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <span>Your Active Road Reports</span>
              <span className="rounded-full bg-cyan-500/10 px-2.5 py-0.5 text-xs font-mono font-bold text-cyan-300">
                {userComplaints.length}
              </span>
            </h2>
            <button
              onClick={() => onNavigate('my-complaints')}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
            >
              <span>View All</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {userComplaints.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 p-8 text-center">
              <MapPin className="mx-auto h-8 w-8 text-slate-500 mb-2" />
              <h3 className="text-base font-bold text-white">No personal complaints filed yet</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 mb-4">
                You haven&apos;t reported any road defects under this account. Submit a new report with photos and GPS, or browse community reports on the live map.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => onNavigate('report')}
                  className="rounded-xl bg-cyan-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-400 shadow"
                >
                  Report Road Defect
                </button>
                <button
                  onClick={() => onNavigate('map')}
                  className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white"
                >
                  Explore Live Map
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userComplaints.map((c) => (
                <div
                  key={c.id}
                  className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg hover:border-cyan-500/40 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <span className="font-mono text-xs font-bold text-cyan-400">{c.id}</span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase border ${
                          c.status === 'verified'
                            ? 'border-emerald-500/40 bg-emerald-950/60 text-emerald-300'
                            : c.status === 'suspicious'
                            ? 'border-rose-500/40 bg-rose-950/60 text-rose-300'
                            : 'border-amber-500/40 bg-amber-950/60 text-amber-300'
                        }`}
                      >
                        {c.status.replace('_', ' ')}
                      </span>
                    </div>

                    {/* HUMAN-READABLE LOCATION DISPLAY */}
                    <div className="mt-3">
                      <div className="flex items-center space-x-1.5 text-xs text-slate-400 font-medium">
                        <MapPin className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                        <span className="text-slate-100 font-bold">{c.location.road}</span>
                      </div>
                      {c.location.landmark && (
                        <p className="text-xs text-cyan-300/90 pl-5">{c.location.landmark}</p>
                      )}
                      <p className="text-xs text-slate-400 pl-5">
                        {c.location.city}, {c.location.state}
                      </p>
                    </div>

                    <p className="mt-3 text-xs text-slate-300 line-clamp-2">{c.description}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                    <div className="text-[11px] text-slate-500 font-mono">
                      Hazard: <span className="text-rose-400 font-bold">{c.hazardScore}/100</span>
                    </div>

                    <button
                      onClick={() => {
                        if (onSelectComplaintForVerification) {
                          onSelectComplaintForVerification(c);
                        }
                        onNavigate('verification');
                      }}
                      className="inline-flex items-center space-x-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300"
                    >
                      <span>Inspect AI Verification</span>
                      <ExternalLink className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
