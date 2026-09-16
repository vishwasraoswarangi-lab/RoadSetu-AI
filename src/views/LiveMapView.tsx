import React, { useState } from 'react';
import {
  Compass,
  Filter,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldAlert,
  ExternalLink,
  ChevronRight,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import { useComplaints } from '../context/ComplaintsContext';
import { Complaint, ComplaintStatus } from '../types';
import { NavView } from '../components/Navbar';
import { RealLeafletMap } from '../components/RealLeafletMap';

interface LiveMapViewProps {
  onNavigate: (view: NavView) => void;
  onSelectComplaintForVerification?: (complaint: Complaint) => void;
}

export const LiveMapView: React.FC<LiveMapViewProps> = ({
  onNavigate,
  onSelectComplaintForVerification,
}) => {
  const { complaints } = useComplaints();
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(
    complaints[0] || null
  );

  const getStatusBadge = (status: ComplaintStatus) => {
    switch (status) {
      case 'verified':
        return {
          label: 'Verified',
          bg: 'bg-emerald-950/80',
          text: 'text-emerald-400',
          border: 'border-emerald-500/40',
        };
      case 'suspicious':
        return {
          label: 'Suspicious / Alert',
          bg: 'bg-rose-950/80',
          text: 'text-rose-400',
          border: 'border-rose-500/40',
        };
      case 'repair_in_progress':
      case 'repair_claimed':
        return {
          label: 'Under Repair',
          bg: 'bg-amber-950/80',
          text: 'text-amber-400',
          border: 'border-amber-500/40',
        };
      default:
        return {
          label: 'Unresolved',
          bg: 'bg-rose-950/60',
          text: 'text-rose-300',
          border: 'border-rose-500/30',
        };
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">
              Real-Time Civic Telemetry
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-1">
            Live City Infrastructure Map
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Real geographic coordinates, OpenStreetMap raster layers, and verified civic defect ledgers worldwide.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => onNavigate('report')}
            className="flex items-center space-x-2 rounded-xl bg-cyan-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-lg shadow-cyan-500/20 hover:bg-cyan-400 transition-colors"
          >
            <span>Report New Defect</span>
            <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main Map + Detail Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Real Interactive Map Component (8 cols on lg) */}
        <div className="lg:col-span-8 h-[600px] sm:h-[680px] w-full">
          <RealLeafletMap
            complaints={complaints}
            selectedComplaintId={selectedComplaint?.id}
            onSelectComplaint={(c) => setSelectedComplaint(c)}
            className="h-full shadow-2xl"
          />
        </div>

        {/* Selected Complaint Details / Live Feed (4 cols on lg) */}
        <div className="lg:col-span-4 space-y-4">
          {selectedComplaint ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur-xl shadow-xl">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono text-cyan-400 block font-bold">
                    {selectedComplaint.id}
                  </span>
                  <h3 className="text-base font-bold text-white mt-1 leading-snug">
                    {selectedComplaint.location.road}
                  </h3>
                </div>
                {(() => {
                  const badge = getStatusBadge(selectedComplaint.status);
                  return (
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${badge.bg} ${badge.text} ${badge.border}`}
                    >
                      {badge.label}
                    </span>
                  );
                })()}
              </div>

              {/* Defect Image Preview */}
              <div className="mt-4 overflow-hidden rounded-xl border border-slate-800 bg-slate-950 aspect-video relative group">
                <img
                  src={selectedComplaint.beforeImage}
                  alt={selectedComplaint.description}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute bottom-2 left-2 rounded-lg bg-black/70 px-2 py-0.5 text-[10px] font-mono text-slate-300 backdrop-blur-sm">
                  Defect Image Captured
                </div>
              </div>

              {/* Defect Details */}
              <div className="mt-4 space-y-2.5 text-xs">
                <div className="flex items-start space-x-2 text-slate-300">
                  <MapPin className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-white block">
                      {selectedComplaint.location.area || selectedComplaint.location.city}
                    </span>
                    <span className="text-slate-400 text-[11px] block mt-0.5">
                      {selectedComplaint.location.formattedAddress}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 block mt-0.5">
                      Coordinates: {selectedComplaint.location.latitude.toFixed(5)},{' '}
                      {selectedComplaint.location.longitude.toFixed(5)}
                    </span>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[11px] text-slate-400 font-medium">
                      AI Hazard Assessment
                    </span>
                    <span className="font-bold text-amber-400">
                      {selectedComplaint.hazardScore}/100
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-full"
                      style={{ width: `${selectedComplaint.hazardScore}%` }}
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Severity Level:</span>
                    <span className="font-semibold text-white">
                      {selectedComplaint.severity}
                    </span>
                  </div>
                  {selectedComplaint.confidence && (
                    <div className="mt-1 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Vision Confidence:</span>
                      <span className="font-semibold text-cyan-400">
                        {selectedComplaint.confidence}%
                      </span>
                    </div>
                  )}
                </div>

                <p className="text-slate-300 text-xs italic bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/50">
                  "{selectedComplaint.description}"
                </p>

                <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                  <div className="rounded-lg bg-slate-950/40 p-2 border border-slate-800/40">
                    <span className="text-slate-500 block">Department</span>
                    <span className="font-medium text-slate-200 line-clamp-1">
                      {selectedComplaint.department}
                    </span>
                  </div>
                  <div className="rounded-lg bg-slate-950/40 p-2 border border-slate-800/40">
                    <span className="text-slate-500 block">Reported Date</span>
                    <span className="font-medium text-slate-200">
                      {new Date(selectedComplaint.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="mt-5 space-y-2">
                {onSelectComplaintForVerification && (
                  <button
                    onClick={() => {
                      onSelectComplaintForVerification(selectedComplaint);
                      onNavigate('verification');
                    }}
                    className="flex w-full items-center justify-center space-x-2 rounded-xl bg-cyan-500/20 py-2.5 px-4 text-xs font-bold text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 transition-colors"
                  >
                    <span>Audit Cryptographic Verification</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 text-center text-slate-400">
              <Compass className="h-8 w-8 mx-auto text-slate-600 mb-2" />
              <p className="text-xs">Select any marker on the map to inspect defect ledger details.</p>
            </div>
          )}

          {/* Quick List of Active Complaints */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Nearby Active Incidents ({complaints.length})
            </h4>
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {complaints.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedComplaint(c)}
                  className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between ${
                    selectedComplaint?.id === c.id
                      ? 'border-cyan-500/50 bg-cyan-950/30'
                      : 'border-slate-800/80 bg-slate-950/40 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-[10px] font-mono text-cyan-400 font-bold">
                        {c.id}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {c.severity}
                      </span>
                    </div>
                    <div className="text-xs font-medium text-white truncate">
                      {c.location.road}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-500 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
