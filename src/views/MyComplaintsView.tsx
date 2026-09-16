import React, { useState } from 'react';
import {
  FileText,
  Search,
  Filter,
  MapPin,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Plus,
  ArrowRight,
} from 'lucide-react';
import { useComplaints } from '../context/ComplaintsContext';
import { useAuth } from '../context/AuthContext';
import { NavView } from '../components/Navbar';
import { Complaint, ComplaintStatus } from '../types';

interface MyComplaintsViewProps {
  onNavigate: (view: NavView) => void;
  onSelectComplaintForVerification?: (complaint: Complaint) => void;
}

export const MyComplaintsView: React.FC<MyComplaintsViewProps> = ({
  onNavigate,
  onSelectComplaintForVerification,
}) => {
  const { user } = useAuth();
  const { userComplaints } = useComplaints();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | ComplaintStatus>('all');

  const filtered = userComplaints.filter((c) => {
    const matchesSearch =
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.location.road.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.location.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = filterStatus === 'all' || c.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-[#0B0F17] p-4 sm:p-6 lg:p-8 text-slate-100">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center space-x-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
              <FileText className="h-4 w-4" />
              <span>Citizen Ledger</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
              My Submitted Complaints
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Review real-time municipal triage status and cryptographic repair verification records.
            </p>
          </div>

          <button
            onClick={() => onNavigate('report')}
            className="inline-flex items-center space-x-2 rounded-xl bg-cyan-500 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-md hover:bg-cyan-400"
          >
            <Plus className="h-4 w-4" />
            <span>Report Another Pothole</span>
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID, road or description..."
              className="w-full rounded-xl border border-slate-700 bg-slate-900 py-2 pl-9 pr-3 text-xs text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
            {[
              { id: 'all', label: 'All' },
              { id: 'reported', label: 'Pending' },
              { id: 'repair_in_progress', label: 'In Repair' },
              { id: 'verified', label: 'Verified' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterStatus(tab.id as 'all' | ComplaintStatus)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  filterStatus === tab.id
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                    : 'border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Complaints Cards List */}
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center text-slate-400">
            <p className="text-sm">No complaints found matching your criteria.</p>
            <button
              onClick={() => onNavigate('report')}
              className="mt-4 inline-flex items-center space-x-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300"
            >
              <span>Submit a new pothole report</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((c) => (
              <div
                key={c.id}
                className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg hover:border-cyan-500/30 transition-all flex flex-col md:flex-row gap-5 items-start justify-between"
              >
                {/* Defect Photo Thumbnail */}
                <div className="relative h-32 w-full md:w-48 shrink-0 overflow-hidden rounded-xl border border-slate-800">
                  <img
                    src={c.beforeImage}
                    alt="Defect evidence"
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute bottom-1.5 left-1.5 rounded bg-slate-950/80 px-2 py-0.5 text-[9px] font-mono text-cyan-300">
                    Hazard: {c.hazardScore}/100
                  </div>
                </div>

                {/* Details Column */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
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
                    <span className="text-[11px] text-slate-500 font-mono">
                      Priority: {c.priority}
                    </span>
                  </div>

                  {/* HUMAN-READABLE LOCATION */}
                  <div>
                    <div className="flex items-center space-x-1.5 text-xs text-slate-300 font-bold">
                      <MapPin className="h-3.5 w-3.5 text-cyan-400" />
                      <span>{c.location.road}</span>
                    </div>
                    {c.location.landmark && (
                      <p className="text-xs text-cyan-300/90 pl-5">{c.location.landmark}</p>
                    )}
                    <p className="text-xs text-slate-400 pl-5">
                      {c.location.city}, {c.location.state}
                    </p>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-2">{c.description}</p>

                  <div className="flex flex-wrap gap-4 text-[11px] text-slate-400 pt-1">
                    <span>Department: <strong className="text-slate-300">{c.department}</strong></span>
                    <span>SLA: <strong className="text-amber-300">{c.estimatedRepairDays} Days</strong></span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col space-y-2 w-full md:w-auto shrink-0 pt-2 md:pt-0">
                  <button
                    onClick={() => {
                      if (onSelectComplaintForVerification) {
                        onSelectComplaintForVerification(c);
                      }
                      onNavigate('verification');
                    }}
                    className="rounded-xl bg-cyan-500/20 border border-cyan-500/40 px-4 py-2 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/30 flex items-center justify-center space-x-1.5"
                  >
                    <span>Inspect AI Verification</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </button>

                  <button
                    onClick={() => onNavigate('map')}
                    className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-medium text-slate-300 hover:text-white flex items-center justify-center space-x-1"
                  >
                    <span>View on Map</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
