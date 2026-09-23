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
  Layers3,
  Navigation,
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
            'border-emerald-200 bg-emerald-50 text-emerald-700',
        };

      case 'suspicious':
        return {
          label: 'Needs Review',
          icon: AlertTriangle,
          className:
            'border-rose-200 bg-rose-50 text-rose-700',
        };

      case 'repair_in_progress':
      case 'repair_claimed':
        return {
          label: 'Under Repair',
          icon: Clock3,
          className:
            'border-amber-200 bg-amber-50 text-amber-700',
        };

      default:
        return {
          label: 'Reported',
          icon: MapPin,
          className:
            'border-blue-200 bg-blue-50 text-blue-700',
        };
    }
  };

  const verifiedCount = complaints.filter(
    (c) => c.status === 'verified'
  ).length;

  const repairCount = complaints.filter(
    (c) =>
      c.status === 'repair_in_progress' ||
      c.status === 'repair_claimed'
  ).length;

  const reviewCount = complaints.filter(
    (c) => c.status === 'suspicious'
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* PAGE HEADER */}
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="relative px-6 py-7 sm:px-8 sm:py-9">
            <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-blue-100/60 blur-3xl" />

            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

              <div className="max-w-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-blue-700">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500" />
                    Live Infrastructure Map
                  </span>

                  <span className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-[11px] font-bold text-emerald-700">
                    {complaints.length} Reports
                  </span>
                </div>

                <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                  Live City Map
                </h1>

                <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">
                  Explore reported road issues by location and inspect
                  their current status, severity and verification details.
                </p>
              </div>

              <button
                onClick={() => onNavigate('report')}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
              >
                Report a Road Issue
                <ArrowUpRight className="h-4 w-4" />
              </button>

            </div>
          </div>
        </section>

        {/* QUICK STATS */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-50 p-2.5">
                <MapPin className="h-4 w-4 text-blue-600" />
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Reported
                </p>

                <p className="mt-0.5 text-xl font-black text-slate-900">
                  {complaints.length}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-amber-50 p-2.5">
                <Clock3 className="h-4 w-4 text-amber-600" />
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Under Repair
                </p>

                <p className="mt-0.5 text-xl font-black text-slate-900">
                  {repairCount}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-emerald-50 p-2.5">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Verified
                </p>

                <p className="mt-0.5 text-xl font-black text-slate-900">
                  {verifiedCount}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-rose-50 p-2.5">
                <AlertTriangle className="h-4 w-4 text-rose-600" />
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Needs Review
                </p>

                <p className="mt-0.5 text-xl font-black text-slate-900">
                  {reviewCount}
                </p>
              </div>
            </div>
          </div>

        </section>

        {/* MAP + DETAILS */}
        <section className="grid gap-6 lg:grid-cols-12">

          {/* MAP */}
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm lg:col-span-8">

            <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50">
                  <Layers3 className="h-4 w-4 text-blue-600" />
                </div>

                <div>
                  <h2 className="text-sm font-black text-slate-900">
                    Road Issue Map
                  </h2>

                  <p className="mt-0.5 text-[11px] text-slate-400">
                    Select a marker to inspect a report
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1.5 text-[10px] font-bold text-emerald-700">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                  Live Data
                </span>

                <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[10px] font-bold text-slate-500">
                  {complaints.length} markers
                </span>
              </div>

            </div>

            <div className="h-[520px] sm:h-[620px]">
              <RealLeafletMap
                complaints={complaints}
                selectedComplaintId={selectedComplaint?.id}
                onSelectComplaint={(c) =>
                  setSelectedComplaint(c)
                }
                className="h-full"
              />
            </div>

            {/* MAP LEGEND */}
            <div className="flex flex-wrap items-center gap-4 border-t border-slate-100 px-5 py-3.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Status
              </span>

              <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                Reported
              </div>

              <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                Under Repair
              </div>

              <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Verified
              </div>

              <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500">
                <span className="h-2 w-2 rounded-full bg-rose-500" />
                Needs Review
              </div>
            </div>
          </div>

          {/* SIDE PANEL */}
          <div className="space-y-4 lg:col-span-4">

            {selectedComplaint ? (
              <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

                {/* SELECTED REPORT HEADER */}
                <div className="border-b border-slate-100 p-5">
                  <div className="flex items-start justify-between gap-3">

                    <div className="min-w-0">
                      <span className="font-mono text-[10px] font-bold text-blue-600">
                        {selectedComplaint.id}
                      </span>

                      <h2 className="mt-1 truncate text-lg font-black text-slate-900">
                        {selectedComplaint.location.road}
                      </h2>

                      <p className="mt-1 text-xs text-slate-400">
                        {selectedComplaint.location.city}
                      </p>
                    </div>

                    {(() => {
                      const badge = getStatusBadge(
                        selectedComplaint.status
                      );

                      const Icon = badge.icon;

                      return (
                        <span
                          className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[10px] font-bold uppercase ${badge.className}`}
                        >
                          <Icon className="h-3 w-3" />
                          {badge.label}
                        </span>
                      );
                    })()}

                  </div>
                </div>

                {/* IMAGE */}
                <div className="aspect-video bg-slate-100">
                  <img
                    src={selectedComplaint.beforeImage}
                    alt={selectedComplaint.description}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="p-5">

                  {/* LOCATION */}
                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <div className="flex gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                        <MapPin className="h-4 w-4 text-blue-600" />
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs font-black text-slate-800">
                          {selectedComplaint.location.area ||
                            selectedComplaint.location.city}
                        </p>

                        <p className="mt-1 text-[11px] leading-5 text-slate-500">
                          {selectedComplaint.location.formattedAddress}
                        </p>

                        <div className="mt-2 flex items-center gap-1.5 font-mono text-[9px] text-slate-400">
                          <Navigation className="h-3 w-3" />
                          {selectedComplaint.location.latitude.toFixed(5)},
                          {' '}
                          {selectedComplaint.location.longitude.toFixed(5)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* HAZARD */}
                  <div className="mt-4 rounded-2xl border border-slate-100 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Hazard Assessment
                        </p>

                        <p className="mt-1 text-xs font-bold text-slate-700">
                          {selectedComplaint.severity}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-2xl font-black text-blue-600">
                          {selectedComplaint.hazardScore}
                        </p>

                        <p className="text-[9px] font-bold uppercase text-slate-400">
                          / 100
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-blue-600 transition-all"
                        style={{
                          width: `${selectedComplaint.hazardScore}%`,
                        }}
                      />
                    </div>

                    {selectedComplaint.confidence && (
                      <div className="mt-3 flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">
                          AI Confidence
                        </span>

                        <span className="font-bold text-blue-600">
                          {selectedComplaint.confidence}%
                        </span>
                      </div>
                    )}
                  </div>

                  {/* DESCRIPTION */}
                  <div className="mt-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Report Description
                    </p>

                    <p className="mt-2 text-xs leading-5 text-slate-600">
                      {selectedComplaint.description}
                    </p>
                  </div>

                  {/* META */}
                  <div className="mt-4 grid grid-cols-2 gap-2">

                    <div className="rounded-xl bg-slate-50 p-3">
                      <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">
                        Department
                      </span>

                      <span className="mt-1 block truncate text-[11px] font-bold text-slate-700">
                        {selectedComplaint.department}
                      </span>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-3">
                      <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">
                        Reported
                      </span>

                      <span className="mt-1 block text-[11px] font-bold text-slate-700">
                        {new Date(
                          selectedComplaint.createdAt
                        ).toLocaleDateString()}
                      </span>
                    </div>

                  </div>

                  {/* VERIFICATION */}
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
                      Inspect Verification
                      <ExternalLink className="h-3.5 w-3.5" />
                    </button>
                  )}

                </div>
              </section>
            ) : (
              <section className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50">
                  <Compass className="h-6 w-6 text-blue-500" />
                </div>

                <h3 className="mt-4 text-sm font-black text-slate-900">
                  Select a map marker
                </h3>

                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Choose a road issue on the map to view its
                  location, severity and verification information.
                </p>
              </section>
            )}

            {/* INCIDENT LIST */}
            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">
                    Reported Issues
                  </h3>

                  <p className="mt-0.5 text-[10px] text-slate-400">
                    Select an incident to inspect
                  </p>
                </div>

                <span className="rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-500">
                  {complaints.length}
                </span>
              </div>

              <div className="max-h-72 space-y-2 overflow-y-auto p-3">
                {complaints.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <MapPin className="mx-auto h-6 w-6 text-slate-300" />

                    <p className="mt-2 text-xs font-semibold text-slate-500">
                      No reports available
                    </p>
                  </div>
                ) : (
                  complaints.map((c) => (
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
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[9px] font-bold text-blue-600">
                            {c.id}
                          </span>

                          <span className="truncate text-[9px] text-slate-400">
                            {c.status.replaceAll('_', ' ')}
                          </span>
                        </div>

                        <p className="mt-1 truncate text-xs font-bold text-slate-800">
                          {c.location.road}
                        </p>

                        <p className="mt-0.5 truncate text-[10px] text-slate-400">
                          {c.location.city}
                        </p>
                      </div>

                      <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
                    </button>
                  ))
                )}
              </div>

            </section>

          </div>
        </section>

        {/* BOTTOM CTA */}
        <section className="rounded-3xl border border-blue-100 bg-blue-50 p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-white p-2.5 shadow-sm">
                <MapPin className="h-5 w-5 text-blue-600" />
              </div>

              <div>
                <h3 className="text-sm font-black text-blue-900">
                  Found a road issue?
                </h3>

                <p className="mt-1 text-xs leading-5 text-blue-700/70">
                  Report it with its location and help build a more
                  complete picture of road conditions.
                </p>
              </div>
            </div>

            <button
              onClick={() => onNavigate('report')}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-blue-700"
            >
              Report Issue
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>

          </div>
        </section>

      </div>
    </div>
  );
};
