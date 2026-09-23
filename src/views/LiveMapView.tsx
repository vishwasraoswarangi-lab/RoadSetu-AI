import React, { useState } from 'react';
import {
  Compass,
  MapPin,
  ExternalLink,
  ChevronRight,
  ArrowUpRight,
  ShieldCheck,
  AlertTriangle,
  Clock3,
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

  const [selectedComplaint, setSelectedComplaint] =
    useState<Complaint | null>(complaints[0] || null);

  const getStatusBadge = (status: ComplaintStatus) => {
    switch (status) {
      case 'verified':
        return {
          label: 'Verified',
          icon: ShieldCheck,
          className:
            'bg-emerald-50 text-emerald-700 border-emerald-200',
        };

      case 'suspicious':
        return {
          label: 'Needs Review',
          icon: AlertTriangle,
          className:
            'bg-rose-50 text-rose-700 border-rose-200',
        };

      case 'repair_in_progress':
      case 'repair_claimed':
        return {
          label: 'Under Repair',
          icon: Clock3,
          className:
            'bg-amber-50 text-amber-700 border-amber-200',
        };

      default:
        return {
          label: 'Unresolved',
          icon: Clock3,
          className:
            'bg-blue-50 text-blue-700 border-blue-200',
        };
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* Header */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-blue-600">
                <span className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />
                Live Infrastructure
              </div>

              <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                Live City Map
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Explore reported road defects, inspect their locations,
                and view real-time complaint and verification information.
              </p>
            </div>

            <button
              onClick={() => onNavigate('report')}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
            >
              Report New Defect
              <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
        </section>

        {/* Map */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">

          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm lg:col-span-8">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Road Defect Map
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  {complaints.length} reported incidents
                </p>
              </div>

              <div className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
                Live
              </div>
            </div>

            <div className="h-[560px] sm:h-[650px]">
              <RealLeafletMap
                complaints={complaints}
                selectedComplaintId={selectedComplaint?.id}
                onSelectComplaint={(c) => setSelectedComplaint(c)}
                className="h-full"
              />
            </div>
          </section>

          {/* Details */}
          <div className="space-y-4 lg:col-span-4">

            {selectedComplaint ? (
              <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">

                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="font-mono text-xs font-bold text-blue-600">
                      {selectedComplaint.id}
                    </span>

                    <h3 className="mt-1 text-lg font-black text-slate-900">
                      {selectedComplaint.location.road}
                    </h3>
                  </div>

                  {(() => {
                    const badge = getStatusBadge(
                      selectedComplaint.status
                    );
                    const Icon = badge.icon;

                    return (
                      <span
                        className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase ${badge.className}`}
                      >
                        <Icon className="h-3 w-3" />
                        {badge.label}
                      </span>
                    );
                  })()}
                </div>

                {/* Image */}
                <div className="mt-5 aspect-video overflow-hidden rounded-2xl bg-slate-100">
                  <img
                    src={selectedComplaint.beforeImage}
                    alt={selectedComplaint.description}
                    className="h-full w-full object-cover"
                  />
                </div>

                {/* Location */}
                <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                  <div className="flex gap-3">
                    <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />

                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        {selectedComplaint.location.area ||
                          selectedComplaint.location.city}
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        {selectedComplaint.location.formattedAddress}
                      </p>

                      <p className="mt-2 font-mono text-[10px] text-slate-400">
                        {selectedComplaint.location.latitude.toFixed(5)},{' '}
                        {selectedComplaint.location.longitude.toFixed(5)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* AI score */}
                <div className="mt-4 rounded-2xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-600">
                      AI Hazard Assessment
                    </span>

                    <span className="text-sm font-black text-blue-600">
                      {selectedComplaint.hazardScore}/100
                    </span>
                  </div>

                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-blue-600"
                      style={{
                        width: `${selectedComplaint.hazardScore}%`,
                      }}
                    />
                  </div>

                  <div className="mt-3 flex justify-between text-xs">
                    <span className="text-slate-500">
                      Severity
                    </span>

                    <strong className="text-slate-800">
                      {selectedComplaint.severity}
                    </strong>
                  </div>

                  {selectedComplaint.confidence && (
                    <div className="mt-2 flex justify-between text-xs">
                      <span className="text-slate-500">
                        AI Confidence
                      </span>

                      <strong className="text-blue-600">
                        {selectedComplaint.confidence}%
                      </strong>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="mt-4">
                  <p className="text-sm leading-6 text-slate-600">
                    {selectedComplaint.description}
                  </p>
                </div>

                {/* Meta */}
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className="rounded-xl bg-slate-50 p-3">
                    <span className="block text-[10px] uppercase tracking-wide text-slate-400">
                      Department
                    </span>

                    <span className="mt-1 block truncate text-xs font-bold text-slate-700">
                      {selectedComplaint.department}
                    </span>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-3">
                    <span className="block text-[10px] uppercase tracking-wide text-slate-400">
                      Reported
                    </span>

                    <span className="mt-1 block text-xs font-bold text-slate-700">
                      {new Date(
                        selectedComplaint.createdAt
                      ).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {onSelectComplaintForVerification && (
                  <button
                    onClick={() => {
                      onSelectComplaintForVerification(
                        selectedComplaint
                      );
                      onNavigate('verification');
                    }}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-xs font-bold text-white transition hover:bg-blue-700"
                  >
                    Inspect AI Verification
                    <ExternalLink className="h-3.5 w-3.5" />
                  </button>
                )}
              </section>
            ) : (
              <section className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                <Compass className="mx-auto h-9 w-9 text-slate-300" />

                <h3 className="mt-4 text-sm font-bold text-slate-900">
                  Select a map marker
                </h3>

                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Choose an incident to inspect its location,
                  severity and verification information.
                </p>
              </section>
            )}

            {/* Active incidents */}
            <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Active Incidents
                </h3>

                <span className="rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-500">
                  {complaints.length}
                </span>
              </div>

              <div className="max-h-64 space-y-2 overflow-y-auto">
                {complaints.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedComplaint(c)}
                    className={`flex w-full items-center justify-between rounded-xl border p-3 text-left transition ${
                      selectedComplaint?.id === c.id
                        ? 'border-blue-200 bg-blue-50'
                        : 'border-slate-100 bg-slate-50 hover:border-slate-200 hover:bg-white'
                    }`}
                  >
                    <div className="min-w-0">
                      <span className="font-mono text-[10px] font-bold text-blue-600">
                        {c.id}
                      </span>

                      <p className="mt-0.5 truncate text-xs font-bold text-slate-800">
                        {c.location.road}
                      </p>

                      <p className="mt-0.5 text-[10px] text-slate-400">
                        {c.severity}
                      </p>
                    </div>

                    <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
                  </button>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};
